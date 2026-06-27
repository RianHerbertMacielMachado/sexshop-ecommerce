import { Request, Response } from 'express'
import { paymentsService } from './payments.service'
import { asyncHandler, AppError } from '../../middleware/error.middleware'
import { validate } from '../../lib/validate'
import { createPaymentMethodSchema, updatePaymentMethodSchema } from './payments.schema'

export const createStripeCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body as { orderId: string }
  if (!orderId) throw new AppError('orderId é obrigatório', 400)
  const result = await paymentsService.createStripeCheckout(orderId, req.user?.id)
  res.json({ success: true, message: 'Sessão Stripe criada', data: result })
})

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string
  if (!signature) {
    res.status(400).json({ success: false, message: 'stripe-signature header ausente' })
    return
  }
  await paymentsService.handleStripeWebhook(req.body as Buffer, signature)
  res.status(200).json({ received: true })
})

export const createPixCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.body as { orderId: string }
  if (!orderId) throw new AppError('orderId é obrigatório', 400)
  const result = await paymentsService.createPixCheckout(orderId, req.user?.id)
  res.json({ success: true, message: 'PIX gerado com sucesso', data: result })
})

export const checkPixStatus = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentsService.checkPixStatus(req.params.orderId)
  res.json({ success: true, message: 'Status do PIX consultado', data: result })
})

export const mercadoPagoWebhook = asyncHandler(async (req: Request, res: Response) => {
  await paymentsService.handleMercadoPagoWebhook(req.body as Record<string, unknown>)
  res.status(200).json({ received: true })
})

export const getPaymentMethods = asyncHandler(async (_req: Request, res: Response) => {
  const methods = await paymentsService.getActiveMethods()
  res.json({ success: true, message: 'Métodos de pagamento listados', data: { methods } })
})

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export const adminListPaymentMethods = asyncHandler(async (_req: Request, res: Response) => {
  const methods = await paymentsService.listAllMethods()
  res.json({ success: true, message: 'Métodos listados', data: { methods } })
})

export const adminCreatePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(createPaymentMethodSchema, req)
  const method = await paymentsService.createMethod(body)
  res.status(201).json({ success: true, message: 'Método criado', data: { method } })
})

export const adminUpdatePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = validate(updatePaymentMethodSchema, req)
  const method = await paymentsService.updateMethod(params.id, body)
  res.json({ success: true, message: 'Método atualizado', data: { method } })
})

export const adminDeletePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  await paymentsService.deleteMethod(req.params.id)
  res.json({ success: true, message: 'Método removido' })
})

export const adminTogglePaymentMethod = asyncHandler(async (req: Request, res: Response) => {
  const method = await paymentsService.toggleMethod(req.params.id)
  res.json({ success: true, message: `Método ${method.isActive ? 'ativado' : 'desativado'}`, data: { method } })
})
