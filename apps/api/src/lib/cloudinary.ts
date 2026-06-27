import { v2 as cloudinary } from 'cloudinary'
import type { UploadApiResponse, UploadApiOptions } from 'cloudinary'
import { env } from './env'
import logger from './logger'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
})

export type UploadFolder =
  | 'products'
  | 'categories'
  | 'banners'
  | 'avatars'
  | 'logos'
  | 'brand'

export interface UploadResult {
  publicId: string
  url: string
  secureUrl: string
  width?: number
  height?: number
  format?: string
  bytes?: number
}

export async function uploadImage(
  file: string | Buffer,
  folder: UploadFolder = 'products',
  options: UploadApiOptions = {}
): Promise<UploadResult> {
  try {
    const uploadOptions: UploadApiOptions = {
      folder: `sexshop/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      ...options,
    }

    let result: UploadApiResponse

    if (Buffer.isBuffer(file)) {
      // ✅ Tipagem correta para upload via stream
      result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, response) => {
            if (error) {
              reject(error)
              return
            }
            if (!response) {
              reject(new Error('Resposta vazia do Cloudinary'))
              return
            }
            resolve(response)
          }
        )
        stream.end(file)
      })
    } else {
      result = await cloudinary.uploader.upload(file, uploadOptions)
    }

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    logger.error('Cloudinary upload error:', error)
    throw new Error('Falha ao fazer upload da imagem')
  }
}

export async function uploadProductImage(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, 'products', {
    transformation: [
      { width: 800, height: 800, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })
}

export async function uploadCategoryImage(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, 'categories', {
    transformation: [
      { width: 400, height: 400, crop: 'fill', gravity: 'center' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })
}

export async function uploadBannerImage(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, 'banners', {
    transformation: [
      { width: 1920, height: 600, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })
}

export async function uploadLogoImage(
  file: string | Buffer
): Promise<UploadResult> {
  return uploadImage(file, 'logos', {
    transformation: [
      { width: 400, height: 200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  })
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    logger.error('Cloudinary delete error:', error)
    throw new Error('Falha ao deletar imagem')
  }
}

export function extractPublicId(url: string): string | null {
  try {
    const parts = url.split('/sexshop/')
    if (parts.length < 2) return null
    return `sexshop/${parts[1].split('.')[0]}`
  } catch {
    return null
  }
}

export async function testCloudinaryConnection(): Promise<boolean> {
  try {
    await cloudinary.api.ping()
    logger.info('Cloudinary conectado com sucesso')
    return true
  } catch (error) {
    logger.error('Erro ao conectar no Cloudinary:', error)
    return false
  }
}

export default cloudinary
