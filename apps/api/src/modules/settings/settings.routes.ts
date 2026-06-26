import { Router } from 'express'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { uploadSingle } from '../../middleware/multer.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import { asyncHandler, AppError } from '../../middleware/error.middleware'
import { settingsService, updateSettingsSchema } from './settings.service'
import { validateBody } from '../../lib/validate'

const router = Router()

router.get('/', asyncHandler(async (_req, res) => {
  const settings = await settingsService.getPublic()
  res.json({ success: true, message: 'Configurações da loja', data: { settings } })
}))

router.get('/admin', authMiddleware, isAdmin, asyncHandler(async (_req, res) => {
  const settings = await settingsService.get()
  res.json({ success: true, message: 'Configurações completas', data: { settings } })
}))

router.put('/admin', authMiddleware, isAdmin, auditLog({ entity: 'SiteSettings', action: 'UPDATE_SETTINGS' }), asyncHandler(async (req, res) => {
  const input = validateBody(updateSettingsSchema, req.body)
  const settings = await settingsService.update(input)
  res.json({ success: true, message: 'Configurações salvas', data: { settings } })
}))

router.post('/admin/logo', authMiddleware, isAdmin, uploadSingle, asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Arquivo de logo é obrigatório', 400)
  const logoUrl = await settingsService.uploadLogo(req.file)
  res.json({ success: true, message: 'Logo atualizada', data: { logoUrl } })
}))

router.post('/admin/favicon', authMiddleware, isAdmin, uploadSingle, asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('Arquivo de favicon é obrigatório', 400)
  const faviconUrl = await settingsService.uploadFavicon(req.file)
  res.json({ success: true, message: 'Favicon atualizado', data: { faviconUrl } })
}))

export { router as settingsRoutes }
