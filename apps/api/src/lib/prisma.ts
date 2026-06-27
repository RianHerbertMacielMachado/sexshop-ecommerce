import { PrismaClient } from '@prisma/client'
import logger from './logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect()
    logger.info('Banco de dados conectado com sucesso')
  } catch (error) {
    logger.error('Erro ao conectar no banco de dados:', error)
    throw error
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect()
    logger.info('Banco de dados desconectado')
  } catch (error) {
    logger.error('Erro ao desconectar banco de dados:', error)
  }
}

export default prisma
