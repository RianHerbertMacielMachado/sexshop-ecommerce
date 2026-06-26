import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import { z } from 'zod'

export const createCouponSchema = z.object({
  code: z.string().min(3).max(50).toUpperCase().trim(),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.number().positive(),
  minOrderValue: z.number().positive().optional().nullable(),
  maxDiscountValue: z.number().positive().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  isActive: z.boolean().default(true),
})

export const updateCouponSchema = createCouponSchema.partial().omit({ code: true })

export type CreateCouponInput = z.infer<typeof createCouponSchema>
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>

export class CouponsService {
  async list() {
    return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } })
  }

  async create(input: CreateCouponInput) {
    const existing = await prisma.coupon.findUnique({ where: { code: input.code } })
    if (existing) throw new AppError('Já existe um cupom com este código', 409)

    return prisma.coupon.create({
      data: {
        code: input.code,
        type: input.type,
        value: input.value,
        minOrderValue: input.minOrderValue ?? null,
        maxDiscountValue: input.maxDiscountValue ?? null,
        maxUses: input.maxUses ?? null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        isActive: input.isActive,
      },
    })
  }

  async update(id: string, input: UpdateCouponInput) {
    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) throw new NotFoundError('Cupom')

    return prisma.coupon.update({
      where: { id },
      data: {
        ...input,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        updatedAt: new Date(),
      },
    })
  }

  async delete(id: string): Promise<void> {
    const coupon = await prisma.coupon.findUnique({ where: { id } })
    if (!coupon) throw new NotFoundError('Cupom')
    await prisma.coupon.delete({ where: { id } })
  }

  async validate(code: string, orderValue: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })

    if (!coupon || !coupon.isActive) {
      return { valid: false, discount: 0, message: 'Cupom inválido ou inativo' }
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return { valid: false, discount: 0, message: 'Cupom expirado' }
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return { valid: false, discount: 0, message: 'Cupom esgotado' }
    }

    if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
      return {
        valid: false,
        discount: 0,
        message: `Pedido mínimo de R$ ${Number(coupon.minOrderValue).toFixed(2)} para usar este cupom`,
      }
    }

    let discount = 0
    if (coupon.type === 'PERCENTAGE') {
      discount = orderValue * (Number(coupon.value) / 100)
      if (coupon.maxDiscountValue) discount = Math.min(discount, Number(coupon.maxDiscountValue))
    } else {
      discount = Math.min(Number(coupon.value), orderValue)
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      message: `Cupom aplicado! Desconto de R$ ${discount.toFixed(2)}`,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
      },
    }
  }
}

export const couponsService = new CouponsService()
