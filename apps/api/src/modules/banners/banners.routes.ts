import { Router } from 'express'
import { BannerPosition } from '@prisma/client'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { uploadFields, uploadSingle } from '../../middleware/multer.middleware'
import { asyncHandler, AppError } from '../../middleware/error.middleware'
import { bannersService, createBannerSchema } from './banners.service'
import { validateBody } from '../../lib/validate'

const router = Router()

router.get('/', asyncHandler(async (req, res) => {
  const position = req.query.position as BannerPosition | undefined
  if (!position) {
    res.status(400).json({ success: false, message: 'position é obrigatório' })
    return
  }
  const banners = await bannersService.listByPosition(position)
  res.json({ success: true, message: 'Banners listados', data: { banners } })
}))

router.get('/admin', authMiddleware, isAdmin, asyncHandler(async (_req, res) => {
  const banners = await bannersService.listAll()
  res.json({ success: true, message: 'Banners listados', data: { banners } })
}))

router.post('/admin', authMiddleware, isAdmin, uploadFields, asyncHandler(async (req, res) => {
  const files = req.files as { image?: Express.Multer.File[]; mobileImage?: Express.Multer.File[] }
  if (!files.image?.[0]) throw new AppError('Imagem é obrigatória', 400)
  const input = validateBody(createBannerSchema, req.body)
  const banner = await bannersService.create(input, files.image[0], files.mobileImage?.[0])
  res.status(201).json({ success: true, message: 'Banner criado', data: { banner } })
}))

router.put('/admin/:id', authMiddleware, isAdmin, uploadSingle, asyncHandler(async (req, res) => {
  const input = validateBody(createBannerSchema.partial(), req.body)
  const banner = await bannersService.update(req.params.id, input, req.file)
  res.json({ success: true, message: 'Banner atualizado', data: { banner } })
}))

router.delete('/admin/:id', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  await bannersService.delete(req.params.id)
  res.json({ success: true, message: 'Banner removido' })
}))

router.patch('/admin/reorder', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  const { ids } = req.body as { ids: string[] }
  await bannersService.reorder(ids)
  res.json({ success: true, message: 'Ordem atualizada' })
}))

export { router as bannerRoutes }
