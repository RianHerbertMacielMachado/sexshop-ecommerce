import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
  guestName: z.string().max(100).optional().nullable(),
})

export type CreateReviewInput = z.infer<typeof createReviewSchema>

async function recalculateProductRating(productId: string): Promise<void> {
  const result = await prisma.review.aggregate({
    where: { productId, isApproved: true },
    _avg: { rating: true },
    _count: { rating: true },
  })

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: result._avg.rating ?? 0,
      reviewCount: result._count.rating,
    },
  })
}

export class ReviewsService {
  async listForProduct(productId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          rating: true,
          comment: true,
          guestName: true,
          adminReply: true,
          createdAt: true,
          user: { select: { id: true, name: true } },
        },
      }),
      prisma.review.count({ where: { productId, isApproved: true } }),
    ])

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async create(productId: string, input: CreateReviewInput, userId?: string): Promise<void> {
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new NotFoundError('Produto')

    if (userId) {
      const hasPurchased = await prisma.orderItem.findFirst({
        where: {
          productId,
          order: { userId, status: 'DELIVERED' },
        },
      })
      if (!hasPurchased) {
        throw new AppError('Você só pode avaliar produtos que comprou e recebeu', 403)
      }

      const existingReview = await prisma.review.findFirst({
        where: { productId, userId },
      })
      if (existingReview) {
        throw new AppError('Você já avaliou este produto', 409)
      }
    }

    await prisma.review.create({
      data: {
        productId,
        userId: userId ?? null,
        guestName: input.guestName ?? null,
        rating: input.rating,
        comment: input.comment ?? null,
        isApproved: false,
      },
    })
  }

  async listAll(filters: { page?: number; limit?: number; isApproved?: boolean; productId?: string }) {
    const { page = 1, limit = 20, isApproved, productId } = filters
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (isApproved !== undefined) where.isApproved = isApproved
    if (productId) where.productId = productId

    const [reviews, total] = await prisma.$transaction([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.review.count({ where }),
    ])

    return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async approve(id: string): Promise<void> {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundError('Avaliação')

    await prisma.review.update({ where: { id }, data: { isApproved: true } })
    await recalculateProductRating(review.productId)
  }

  async reject(id: string): Promise<void> {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundError('Avaliação')

    await prisma.review.update({ where: { id }, data: { isApproved: false } })
    await recalculateProductRating(review.productId)
  }

  async addReply(id: string, adminReply: string): Promise<void> {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundError('Avaliação')
    await prisma.review.update({ where: { id }, data: { adminReply } })
  }

  async delete(id: string): Promise<void> {
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw new NotFoundError('Avaliação')
    await prisma.review.delete({ where: { id } })
    await recalculateProductRating(review.productId)
  }
}

export const reviewsService = new ReviewsService()
