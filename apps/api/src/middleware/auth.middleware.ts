import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../lib/env'
import { prisma } from '../lib/prisma'
import { AppError } from './error.middleware'

export interface JwtPayload {
  sub: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
  iat: number
  exp: number
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        email: string
        role: 'ADMIN' | 'CUSTOMER'
      }
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Token de autenticação não fornecido', 401)
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new AppError('Token de autenticação inválido', 401)
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expirado. Faça login novamente', 401))
    } else if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token inválido', 401))
    } else {
      next(error)
    }
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return next()
  }

  try {
    const token = authHeader.split(' ')[1]
    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
      req.user = { id: decoded.sub, email: decoded.email, role: decoded.role }
    }
  } catch {
    // Token inválido em rota opcional — continua sem user
  }

  next()
}

export function isAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Não autenticado', 401))
  }

  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Acesso restrito a administradores', 403))
  }

  next()
}

export function generateAccessToken(payload: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { sub: payload.id, email: payload.email, role: payload.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  )
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
  )
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string }
}

export async function saveRefreshToken(
  userId: string,
  token: string,
  expiresInDays: number = 7
): Promise<void> {
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  })
}

export async function invalidateRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } })
}

export async function invalidateAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } })
}
