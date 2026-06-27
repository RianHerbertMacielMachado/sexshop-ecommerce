import { z } from 'zod'

export const createPaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Nome obrigatório').max(100),
    type: z.enum(['STRIPE_CARD', 'PIX', 'BOLETO', 'MANUAL'], {
      errorMap: () => ({ message: 'Tipo inválido' }),
    }),
    instructions: z.string().max(500).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    isActive: z.boolean().optional().default(true),
    order: z.number().int().min(0).optional().default(0),
    config: z.record(z.unknown()).optional().nullable(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updatePaymentMethodSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    type: z.enum(['STRIPE_CARD', 'PIX', 'BOLETO', 'MANUAL']).optional(),
    instructions: z.string().max(500).optional().nullable(),
    icon: z.string().max(100).optional().nullable(),
    isActive: z.boolean().optional(),
    order: z.number().int().min(0).optional(),
    config: z.record(z.unknown()).optional().nullable(),
  }),
  query: z.object({}).optional(),
  params: z.object({ id: z.string().cuid() }),
})

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>['body']
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>['body']
