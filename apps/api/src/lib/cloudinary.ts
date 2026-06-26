import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from 'cloudinary'
import { env } from './env'
import { logger } from './logger'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  bytes: number
}

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string,
  options?: Partial<UploadApiOptions>
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
      ],
      ...options,
    }

    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        logger.error('Cloudinary upload error:', error)
        reject(new Error(`Falha no upload: ${error.message}`))
        return
      }
      if (!result) {
        reject(new Error('Upload retornou resultado vazio'))
        return
      }
      resolve({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      })
    })

    uploadStream.end(fileBuffer)
  })
}

export async function uploadProductImage(fileBuffer: Buffer): Promise<UploadResult> {
  return uploadImage(fileBuffer, 'sexshop/products', {
    transformation: [
      { width: 800, height: 800, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
    ],
    eager: [
      { width: 200, height: 200, crop: 'fill', gravity: 'center', quality: 'auto', fetch_format: 'auto' },
    ],
    eager_async: true,
  })
}

export async function uploadCategoryImage(fileBuffer: Buffer): Promise<UploadResult> {
  return uploadImage(fileBuffer, 'sexshop/categories', {
    transformation: [
      { width: 600, height: 400, crop: 'fill', gravity: 'center', quality: 'auto', fetch_format: 'auto' },
    ],
  })
}

export async function uploadLogoImage(fileBuffer: Buffer): Promise<UploadResult> {
  return uploadImage(fileBuffer, 'sexshop/brand', {
    transformation: [{ height: 120, crop: 'scale', quality: 'auto', fetch_format: 'auto' }],
  })
}

export async function uploadBannerImage(fileBuffer: Buffer): Promise<UploadResult> {
  return uploadImage(fileBuffer, 'sexshop/banners', {
    transformation: [
      { width: 1920, height: 600, crop: 'fill', gravity: 'center', quality: 'auto', fetch_format: 'auto' },
    ],
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Falha ao deletar imagem: ${result.result}`)
    }
    logger.info(`Imagem deletada do Cloudinary: ${publicId}`)
  } catch (error) {
    logger.error('Erro ao deletar imagem do Cloudinary:', error)
    throw error
  }
}

export function extractPublicId(cloudinaryUrl: string): string {
  const parts = cloudinaryUrl.split('/')
  const uploadIndex = parts.indexOf('upload')
  if (uploadIndex === -1) return ''
  const afterUpload = parts.slice(uploadIndex + 2)
  const fileWithExt = afterUpload[afterUpload.length - 1]
  const fileName = fileWithExt.split('.')[0]
  afterUpload[afterUpload.length - 1] = fileName
  return afterUpload.join('/')
}

export { cloudinary }
