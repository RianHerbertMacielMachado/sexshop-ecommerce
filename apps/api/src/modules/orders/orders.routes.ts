import { Router } from 'express'
import { authMiddleware, isAdmin, optionalAuth } from '../../middleware/auth.middleware'
import { checkoutRateLimiter } from '../../middleware/rateLimiter.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import * as controller from './orders.controller'

const router = Router()

// Rotas do cliente
router.post('/', optionalAuth, checkoutRateLimiter, controller.createOrder)
router.get('/', authMiddleware, controller.getMyOrders)
router.get('/track/:orderNumber', controller.trackOrder)
router.get('/:id', authMiddleware, controller.getOrderById)

export { router as orderRoutes }
