import { Router } from 'express'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { uploadMultiple } from '../../middleware/multer.middleware'
import { uploadRateLimiter } from '../../middleware/rateLimiter.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import * as controller from './products.controller'

const router = Router()

// Rotas públicas
router.get('/', controller.listProducts)
router.get('/featured', controller.getFeaturedProducts)
router.get('/new-arrivals', controller.getNewArrivals)
router.get('/related/:id', controller.getRelatedProducts)
router.get('/:slug', controller.getProductBySlug)

// Rotas admin
router.post(
  '/',
  authMiddleware,
  isAdmin,
  auditLog({ entity: 'Product' }),
  controller.createProduct
)
router.put(
  '/:id',
  authMiddleware,
  isAdmin,
  auditLog({ entity: 'Product' }),
  controller.updateProduct
)
router.delete(
  '/:id',
  authMiddleware,
  isAdmin,
  auditLog({ entity: 'Product', action: 'DELETE_PRODUCT' }),
  controller.deleteProduct
)
router.post(
  '/:id/images',
  authMiddleware,
  isAdmin,
  uploadRateLimiter,
  uploadMultiple,
  controller.uploadProductImages
)
router.delete('/:id/images', authMiddleware, isAdmin, controller.deleteProductImage)
router.post(
  '/:id/variants',
  authMiddleware,
  isAdmin,
  auditLog({ entity: 'ProductVariant' }),
  controller.createVariant
)
router.put(
  '/:id/variants/:variantId',
  authMiddleware,
  isAdmin,
  auditLog({ entity: 'ProductVariant' }),
  controller.updateVariant
)
router.delete(
  '/:id/variants/:variantId',
  authMiddleware,
  isAdmin,
  auditLog({ entity: 'ProductVariant', action: 'DELETE_VARIANT' }),
  controller.deleteVariant
)

export { router as productRoutes }
