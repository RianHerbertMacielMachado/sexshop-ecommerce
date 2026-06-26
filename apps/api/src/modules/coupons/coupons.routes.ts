import { Router } from 'express'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import { asyncHandler } from '../../middleware/error.middleware'
import { couponsService, createCouponSchema, updateCouponSchema } from './coupons.service'
import { validateBody } from '../../lib/validate'

const router = Router()

router.post('/validate', asyncHandler(async (req, res) => {
  const { code, orderValue } = req.body as { code: string; orderValue: number }
  const result = await couponsService.validate(code, orderValue)
  res.json({ success: true, message: result.message, data: result })
}))

router.get('/admin', authMiddleware, isAdmin, asyncHandler(async (_req, res) => {
  const coupons = await couponsService.list()
  res.json({ success: true, message: 'Cupons listados', data: { coupons } })
}))

router.post('/admin', authMiddleware, isAdmin, auditLog({ entity: 'Coupon' }), asyncHandler(async (req, res) => {
  const input = validateBody(createCouponSchema, req.body)
  const coupon = await couponsService.create(input)
  res.status(201).json({ success: true, message: 'Cupom criado', data: { coupon } })
}))

router.put('/admin/:id', authMiddleware, isAdmin, auditLog({ entity: 'Coupon' }), asyncHandler(async (req, res) => {
  const input = validateBody(updateCouponSchema, req.body)
  const coupon = await couponsService.update(req.params.id, input)
  res.json({ success: true, message: 'Cupom atualizado', data: { coupon } })
}))

router.delete('/admin/:id', authMiddleware, isAdmin, auditLog({ entity: 'Coupon', action: 'DELETE_COUPON' }), asyncHandler(async (req, res) => {
  await couponsService.delete(req.params.id)
  res.json({ success: true, message: 'Cupom removido' })
}))

export { router as couponRoutes }
