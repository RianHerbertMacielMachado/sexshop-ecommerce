import 'dotenv/config'
import './lib/env'

import express, { Application, Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { json, urlencoded, raw } from 'express'

import { env } from './lib/env'
import { logger, httpLogger } from './lib/logger'
import { connectDatabase, disconnectDatabase } from './lib/prisma'
import { verifyMailConnection } from './lib/mailer'

import { publicRateLimiter, authRateLimiter, adminRateLimiter } from './middleware/rateLimiter.middleware'
import { errorHandler, notFoundHandler } from './middleware/error.middleware'

import { authRoutes } from './modules/auth/auth.routes'
import { productRoutes } from './modules/products/products.routes'
import { categoryRoutes } from './modules/categories/categories.routes'
import { orderRoutes } from './modules/orders/orders.routes'
import { paymentRoutes } from './modules/payments/payments.routes'
import { couponRoutes } from './modules/coupons/coupons.routes'
import { shippingRoutes } from './modules/shipping/shipping.routes'
import { reviewRoutes } from './modules/reviews/reviews.routes'
import { bannerRoutes } from './modules/banners/banners.routes'
import { wishlistRoutes } from './modules/wishlist/wishlist.routes'
import { adminRoutes } from './modules/admin/admin.routes'
import { settingsRoutes } from './modules/settings/settings.routes'
import { notificationRoutes } from './modules/notifications/notifications.routes'

const app: Application = express()

// ============================================================
// SECURITY HEADERS
// ============================================================
app.set('trust proxy', 1)

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
)

// ============================================================
// CORS
// ============================================================
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origem não permitida — ${origin}`))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature', 'x-signature', 'x-request-id'],
  })
)

// ============================================================
// BODY PARSERS
// ============================================================

// Raw body para webhook do Stripe (DEVE vir antes do json())
app.use('/api/payments/webhook/stripe', raw({ type: 'application/json' }))

// JSON e URL-encoded para demais rotas
app.use(json({ limit: '10mb' }))
app.use(urlencoded({ extended: true, limit: '10mb' }))

// ============================================================
// HTTP LOGGER
// ============================================================
app.use(httpLogger() as unknown as (req: Request, res: Response, next: NextFunction) => void)

// ============================================================
// RATE LIMITERS GLOBAIS
// ============================================================
app.use('/api/', publicRateLimiter)
app.use('/api/auth', authRateLimiter)
app.use('/api/admin', adminRateLimiter)

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/health', async (_req: Request, res: Response) => {
  try {
    const { prisma } = await import('./lib/prisma')
    await prisma.$queryRaw`SELECT 1`
    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: env.NODE_ENV,
      version: process.env.npm_package_version ?? '1.0.0',
    })
  } catch {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
    })
  }
})

// ============================================================
// ROTAS DA API
// ============================================================
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/shipping', shippingRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/banners', bannerRoutes)
app.use('/api/wishlist', wishlistRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/admin/notifications', notificationRoutes)

// ============================================================
// 404 e ERROR HANDLER
// ============================================================
app.use(notFoundHandler)
app.use(errorHandler)

// ============================================================
// SEED DE DADOS PADRÃO (idempotente — só insere se estiver vazio)
// ============================================================
async function seedDefaultData(): Promise<void> {
  try {
    const { prisma } = await import('./lib/prisma')
    const { PaymentMethodType } = await import('@prisma/client')

    // Métodos de pagamento
    const existingMethods = await prisma.paymentMethod.count()
    if (existingMethods === 0) {
      await prisma.paymentMethod.createMany({
        data: [
          {
            name: 'Cartão de Crédito / Débito',
            type: PaymentMethodType.STRIPE_CARD,
            isActive: true,
            order: 1,
            instructions: 'Pagamento seguro via Stripe. Parcelamento disponível.',
          },
          {
            name: 'PIX',
            type: PaymentMethodType.PIX,
            isActive: true,
            order: 2,
            instructions: 'Pagamento instantâneo via PIX. QR Code gerado automaticamente.',
          },
        ],
      })
      logger.info('✅ Métodos de pagamento padrão criados (PIX + Cartão)')
    }

    // Configurações da loja
    const existingSettings = await prisma.siteSettings.count()
    if (existingSettings === 0) {
      await prisma.siteSettings.create({
        data: { id: 'singleton', storeName: 'Minha Loja' },
      })
      logger.info('✅ Configurações padrão da loja criadas')
    }
  } catch (err) {
    logger.error('⚠️ Erro ao semear dados padrão (não crítico):', err)
  }
}

// ============================================================
// INICIALIZAÇÃO DO SERVIDOR
// ============================================================
async function bootstrap(): Promise<void> {
  try {
    await connectDatabase()
    await verifyMailConnection()
    await seedDefaultData()

    const server = app.listen(env.PORT, () => {
      logger.info(`🚀 API rodando na porta ${env.PORT}`)
      logger.info(`🌍 Ambiente: ${env.NODE_ENV}`)
      logger.info(`🔗 Frontend URL: ${env.FRONTEND_URL}`)
    })

    // ============================================================
    // GRACEFUL SHUTDOWN
    // ============================================================
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`\n📴 Recebido sinal ${signal}. Encerrando servidor graciosamente...`)

      server.close(async () => {
        logger.info('🔌 Servidor HTTP fechado')
        await disconnectDatabase()
        logger.info('✅ Shutdown completo')
        process.exit(0)
      })

      setTimeout(() => {
        logger.error('⏱️ Timeout no graceful shutdown. Forçando saída.')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))

    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error)
      process.exit(1)
    })

    process.on('unhandledRejection', (reason) => {
      logger.error('💥 Unhandled Rejection:', reason)
      process.exit(1)
    })
  } catch (error) {
    logger.error('❌ Falha ao iniciar o servidor:', error)
    process.exit(1)
  }
}

bootstrap()

export { app }
