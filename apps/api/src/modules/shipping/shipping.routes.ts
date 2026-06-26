import { Router } from 'express'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import { asyncHandler } from '../../middleware/error.middleware'
import { shippingService, createShippingZoneSchema } from './shipping.service'
import { validateBody } from '../../lib/validate'

const router = Router()

router.post('/calculate', asyncHandler(async (req, res) => {
  const { zipCode, orderValue } = req.body as { zipCode: string; orderValue?: number }
  const result = await shippingService.calculateShipping(zipCode, orderValue ?? 0)
  res.json({ success: true, message: 'Frete calculado', data: result })
}))

router.get('/cep/:cep', asyncHandler(async (req, res) => {
  const address = await shippingService.getAddressFromCep(req.params.cep)
  res.json({ success: true, message: 'CEP encontrado', data: { address } })
}))

router.get('/admin/zones', authMiddleware, isAdmin, asyncHandler(async (_req, res) => {
  const zones = await shippingService.listZones()
  res.json({ success: true, message: 'Zonas listadas', data: { zones } })
}))

router.post('/admin/zones', authMiddleware, isAdmin, auditLog({ entity: 'ShippingZone' }), asyncHandler(async (req, res) => {
  const input = validateBody(createShippingZoneSchema, req.body)
  const zone = await shippingService.createZone(input)
  res.status(201).json({ success: true, message: 'Zona criada', data: { zone } })
}))

router.put('/admin/zones/:id', authMiddleware, isAdmin, auditLog({ entity: 'ShippingZone' }), asyncHandler(async (req, res) => {
  const zone = await shippingService.updateZone(req.params.id, req.body)
  res.json({ success: true, message: 'Zona atualizada', data: { zone } })
}))

router.delete('/admin/zones/:id', authMiddleware, isAdmin, auditLog({ entity: 'ShippingZone', action: 'DELETE_ZONE' }), asyncHandler(async (req, res) => {
  await shippingService.deleteZone(req.params.id)
  res.json({ success: true, message: 'Zona removida' })
}))

export { router as shippingRoutes }
