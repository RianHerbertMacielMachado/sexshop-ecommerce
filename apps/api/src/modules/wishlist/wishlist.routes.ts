import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { asyncHandler, AppError } from '../../middleware/error.middleware'
import { prisma } from '../../lib/prisma'

const router = Router()

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const wishlist = await prisma.wishlist.findMany({
    where: { userId: req.user!.id },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          comparePrice: true,
          images: true,
          stock: true,
          isActive: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ success: true, message: 'Lista de desejos', data: { wishlist } })
}))

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { productId } = req.body as { productId: string }
  if (!productId) throw new AppError('productId é obrigatório', 400)

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } })
  if (!product) throw new AppError('Produto não encontrado', 404)

  const item = await prisma.wishlist.upsert({
    where: { userId_productId: { userId: req.user!.id, productId } },
    update: {},
    create: { userId: req.user!.id, productId },
  })

  res.status(201).json({ success: true, message: 'Produto adicionado à lista de desejos', data: { item } })
}))

router.delete('/:productId', authMiddleware, asyncHandler(async (req, res) => {
  await prisma.wishlist.deleteMany({
    where: { userId: req.user!.id, productId: req.params.productId },
  })
  res.json({ success: true, message: 'Produto removido da lista de desejos' })
}))

export { router as wishlistRoutes }
