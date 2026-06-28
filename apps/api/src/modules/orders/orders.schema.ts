import { z } from 'zod'

const addressSchema = z.object({
  recipientName: z.string().min(2),
  street: z.string().min(3),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().min(8).max(9),
})

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().cuid(),
          variantId: z.string().cuid().optional(),
          quantity: z.number().int().positive(),
        })
      )
      .min(1),
    shippingAddress: addressSchema,
    shippingZoneId: z.string().cuid(),
    couponCode: z.string().optional(),
    paymentMethod: z.enum(['STRIPE_CARD', 'PIX', 'BOLETO', 'MANUAL', 'STRIPE']),
    isDiscreetPackaging: z.boolean().optional().default(false),
    notes: z.string().optional(),
    guestName: z.string().optional(),
    guestEmail: z.string().email().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ]),
    comment: z.string().optional(),
    trackingCode: z.string().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().cuid(),
  }),
})

export const listOrdersSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(10),
    search: z.string().optional(),
    status: z
      .enum([
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'REFUNDED',
      ])
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minValue: z.coerce.number().optional(),
    maxValue: z.coerce.number().optional(),
  }),
  params: z.object({}).optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body']
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body']
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>['query']
