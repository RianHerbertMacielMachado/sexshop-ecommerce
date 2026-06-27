import { BannerPosition } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { NotFoundError } from '../../middleware/error.middleware'
import { uploadBannerImage, deleteImage, extractPublicId } from '../../lib/cloudinary'
import { z } from 'zod'

export const createBannerSchema = z.object({
  title: z.string().min(1).max(200),
  subtitle: z.string().max(300).optional().nullable(),
  linkUrl: z.string().url().optional().nullable(),
  linkText: z.string().max(100).optional().nullable(),
  position: z.nativeEnum(BannerPosition),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
})

export type CreateBannerInput = z.infer<typeof createBannerSchema>

export class BannersService {
  async listByPosition(position: BannerPosition) {
    const now = new Date()
    return prisma.banner.findMany({
      where: {
        position,
        isActive: true,
        OR: [
          { startsAt: null, endsAt: null },
          { startsAt: { lte: now }, endsAt: null },
          { startsAt: null, endsAt: { gte: now } },
          { startsAt: { lte: now }, endsAt: { gte: now } },
        ],
      },
      orderBy: { order: 'asc' },
    })
  }

  async listAll() {
    return prisma.banner.findMany({ orderBy: [{ position: 'asc' }, { order: 'asc' }] })
  }

  async create(input: CreateBannerInput, imageFile: Express.Multer.File, mobileImageFile?: Express.Multer.File) {
    const imageResult = await uploadBannerImage(imageFile.buffer)
    let mobileImageUrl: string | null = null

    if (mobileImageFile) {
      const mobileResult = await uploadBannerImage(mobileImageFile.buffer)
      mobileImageUrl = mobileResult.url
    }

    return prisma.banner.create({
      data: {
        title: input.title,
        subtitle: input.subtitle ?? null,
        imageUrl: imageResult.url,
        mobileImageUrl,
        linkUrl: input.linkUrl ?? null,
        linkText: input.linkText ?? null,
        position: input.position,
        isActive: input.isActive,
        order: input.order,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
      },
    })
  }

  async update(id: string, input: Partial<CreateBannerInput>, imageFile?: Express.Multer.File) {
    const banner = await prisma.banner.findUnique({ where: { id } })
    if (!banner) throw new NotFoundError('Banner')

    let imageUrl = banner.imageUrl
    if (imageFile) {
      const result = await uploadBannerImage(imageFile.buffer)
      imageUrl = result.url
      const oldPublicId = extractPublicId(banner.imageUrl ?? '')
      if (oldPublicId) await deleteImage(oldPublicId).catch(() => {})
    }

    return prisma.banner.update({
      where: { id },
      data: {
        title: input.title,
        subtitle: input.subtitle,
        imageUrl,
        linkUrl: input.linkUrl,
        linkText: input.linkText,
        position: input.position,
        isActive: input.isActive,
        order: input.order,
        startsAt: input.startsAt ? new Date(input.startsAt) : undefined,
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
      },
    })
  }

  async delete(id: string): Promise<void> {
    const banner = await prisma.banner.findUnique({ where: { id } })
    if (!banner) throw new NotFoundError('Banner')
    const publicId = extractPublicId(banner.imageUrl ?? '')
    if (publicId) await deleteImage(publicId).catch(() => {})
    await prisma.banner.delete({ where: { id } })
  }

  async reorder(ids: string[]): Promise<void> {
    await prisma.$transaction(
      ids.map((id, index) => prisma.banner.update({ where: { id }, data: { order: index } }))
    )
  }
}

export const bannersService = new BannersService()
