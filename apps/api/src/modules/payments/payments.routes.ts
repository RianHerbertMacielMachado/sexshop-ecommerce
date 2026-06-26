import { Router } from 'express'
import { authMiddleware, optionalAuth } from '../../middleware/auth.middleware'
import { checkoutRateLimiter } from '../../middleware/rateLimiter.middleware'
import * as controller from './payments.controller'

const router = Router()

router.get('/methods', controller.getPaymentMethods)
router.post('/checkout/stripe', optionalAuth, checkoutRateLimiter, controller.createStripeCheckout)
router.post('/webhook/stripe', controller.stripeWebhook)
router.post('/checkout/pix', optionalAuth, checkoutRateLimiter, controller.createPixCheckout)
router.get('/pix/status/:orderId', controller.checkPixStatus)
router.post('/webhook/mercadopago', controller.mercadoPagoWebhook)

export { router as paymentRoutes }
