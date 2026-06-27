import { z } from 'zod'

export const createCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).toUpperCase(),
    type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
    value: z.coerce.number().min(0),
    minOrderAmount: z.coerce.number().min(0).optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.coerce.boolean().optional().default(true),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(3).max(50).toUpperCase().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']).optional(),
    value: z.coerce.number().min(0).optional(),
    minOrderAmount: z.coerce.number().min(0).optional(),
    maxUses: z.coerce.number().int().positive().optional(),
    expiresAt: z.string().datetime().optional(),
    isActive: z.coerce.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
})

export const validateCouponSchema = z.object({
  body: z.object({
    code: z.string().min(1),
    orderAmount: z.coerce.number().positive(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export type CreateCouponInput = z.infer<typeof createCouponSchema>['body']
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>['body']
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>['body']
