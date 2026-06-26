import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

declare global {
  var __prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
          ]
        : [
            { emit: 'event', level: 'error' },
          ],
    errorFormat: 'minimal',
  })
}

export const prisma: PrismaClient = global.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV === 'development') {
  global.__prisma = prisma

  ;(prisma as PrismaClient & { $on: Function }).$on('query', (e: { query: string; duration: number }) => {
    if (e.duration > 1000) {
      logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`)
    }
  })
}

;(prisma as PrismaClient & { $on: Function }).$on('error', (e: { message: string }) => {
  logger.error('Prisma error:', { message: e.message })
})

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    logger.info('✅ Banco de dados conectado com sucesso')
  } catch (error) {
    logger.error('❌ Falha ao conectar ao banco de dados:', error)
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect()
  logger.info('🔌 Banco de dados desconectado')
}
