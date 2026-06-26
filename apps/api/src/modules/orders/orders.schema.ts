import { z } from 'zod'

const addressSchema = z.object({
  recipientName: z.string().min(2).max(100),
  street: z.string().min(2).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional().nullable(),
  neighborhood: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (ex: SP)'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  phone: z.string().optional().nullable(),
})

export const createOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().cuid(),
          variantId: z.string().cuid().optional().nullable(),
          quantity: z.number().int().min(1).max(100),
        })
      )
      .min(1, 'Pedido deve ter pelo menos 1 item'),
    shippingAddress: addressSchema,
    couponCode: z.string().optional().nullable(),
    shippingZoneId: z.string().cuid().optional().nullable(),
    isDiscreetPackaging: z.boolean().default(false),
    paymentMethod: z.string().min(1),
    guestEmail: z.string().email().optional().nullable(),
    guestName: z.string().min(2).max(100).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  }),
})

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().cuid() }),
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
    comment: z.string().max(500).optional(),
    trackingCode: z.string().max(100).optional().nullable(),
  }),
})

export const listOrdersSchema = z.object({
  query: z.object({
    page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
    limit: z.string().optional().transform((v) => (v ? Math.min(parseInt(v, 10), 100) : 20)),
    status: z
      .enum(['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
      .optional(),
    search: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minValue: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
    maxValue: z.string().optional().transform((v) => (v ? parseFloat(v) : undefined)),
  }),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body']
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body']
export type ListOrdersQuery = z.infer<typeof listOrdersSchema>['query']
