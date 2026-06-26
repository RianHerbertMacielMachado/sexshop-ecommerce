import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { authRateLimiter } from '../../middleware/rateLimiter.middleware'
import * as authController from './auth.controller'

const router = Router()

router.post('/register', authRateLimiter, authController.register)
router.post('/login', authRateLimiter, authController.login)
router.post('/refresh', authController.refresh)
router.post('/logout', authController.logout)
router.post('/forgot-password', authRateLimiter, authController.forgotPassword)
router.post('/reset-password', authRateLimiter, authController.resetPassword)
router.get('/me', authMiddleware, authController.getMe)
router.put('/me', authMiddleware, authController.updateProfile)

export { router as authRoutes }
