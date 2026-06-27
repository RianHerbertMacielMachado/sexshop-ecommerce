import { Router } from 'express'
import { authMiddleware, isAdmin, optionalAuth } from '../../middleware/auth.middleware'
import { checkoutRateLimiter } from '../../middleware/rateLimiter.middleware'
import * as controller from './payments.controller'

const router = Router()

// Público
router.get('/methods', controller.getPaymentMethods)

// Checkout (usuário logado ou guest)
router.post('/checkout/stripe', optionalAuth, checkoutRateLimiter, controller.createStripeCheckout)
router.post('/webhook/stripe', controller.stripeWebhook)
router.post('/checkout/pix', optionalAuth, checkoutRateLimiter, controller.createPixCheckout)
router.get('/pix/status/:orderId', controller.checkPixStatus)
router.post('/webhook/mercadopago', controller.mercadoPagoWebhook)

// ── Admin CRUD de métodos de pagamento ────────────────────────────────────────
router.get('/admin/methods', authMiddleware, isAdmin, controller.adminListPaymentMethods)
router.post('/admin/methods', authMiddleware, isAdmin, controller.adminCreatePaymentMethod)
router.put('/admin/methods/:id', authMiddleware, isAdmin, controller.adminUpdatePaymentMethod)
router.patch('/admin/methods/:id/toggle', authMiddleware, isAdmin, controller.adminTogglePaymentMethod)
router.delete('/admin/methods/:id', authMiddleware, isAdmin, controller.adminDeletePaymentMethod)

export { router as paymentRoutes }
