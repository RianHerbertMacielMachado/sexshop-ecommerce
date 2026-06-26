import { Router } from 'express'
import { authMiddleware, isAdmin, optionalAuth } from '../../middleware/auth.middleware'
import { asyncHandler } from '../../middleware/error.middleware'
import { reviewsService, createReviewSchema } from './reviews.service'
import { validateBody } from '../../lib/validate'

const router = Router({ mergeParams: true })

router.get('/products/:productId/reviews', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string || '1', 10)
  const limit = parseInt(req.query.limit as string || '10', 10)
  const result = await reviewsService.listForProduct(req.params.productId, page, limit)
  res.json({ success: true, message: 'Avaliações listadas', data: result })
}))

router.post('/products/:productId/reviews', optionalAuth, asyncHandler(async (req, res) => {
  const input = validateBody(createReviewSchema, req.body)
  await reviewsService.create(req.params.productId, input, req.user?.id)
  res.status(201).json({ success: true, message: 'Avaliação enviada para moderação' })
}))

router.get('/admin/reviews', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  const result = await reviewsService.listAll({
    page: parseInt(req.query.page as string || '1', 10),
    limit: parseInt(req.query.limit as string || '20', 10),
    isApproved: req.query.isApproved !== undefined ? req.query.isApproved === 'true' : undefined,
    productId: req.query.productId as string | undefined,
  })
  res.json({ success: true, message: 'Avaliações listadas', data: result })
}))

router.patch('/admin/reviews/:id/approve', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  await reviewsService.approve(req.params.id)
  res.json({ success: true, message: 'Avaliação aprovada' })
}))

router.patch('/admin/reviews/:id/reject', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  await reviewsService.reject(req.params.id)
  res.json({ success: true, message: 'Avaliação rejeitada' })
}))

router.put('/admin/reviews/:id/reply', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  const { adminReply } = req.body as { adminReply: string }
  await reviewsService.addReply(req.params.id, adminReply)
  res.json({ success: true, message: 'Resposta adicionada' })
}))

router.delete('/admin/reviews/:id', authMiddleware, isAdmin, asyncHandler(async (req, res) => {
  await reviewsService.delete(req.params.id)
  res.json({ success: true, message: 'Avaliação removida' })
}))

export { router as reviewRoutes }
