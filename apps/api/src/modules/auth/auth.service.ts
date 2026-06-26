import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../../lib/prisma'
import { env } from '../../lib/env'
import { logger } from '../../lib/logger'
import { AppError } from '../../middleware/error.middleware'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  saveRefreshToken,
  invalidateRefreshToken,
} from '../../middleware/auth.middleware'
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../../lib/mailer'
import type {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from './auth.schema'

const SALT_ROUNDS = 12
const RESET_TOKEN_EXPIRY_HOURS = 1

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SafeUser {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  emailVerified: boolean
  phone: string | null
  cpf: string | null
  birthDate: Date | null
  loyaltyPoints: number
  createdAt: Date
}

function toSafeUser(user: {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  emailVerified: boolean
  phone: string | null
  cpf: string | null
  birthDate: Date | null
  loyaltyPoints: number
  createdAt: Date
}): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    phone: user.phone,
    cpf: user.cpf,
    birthDate: user.birthDate,
    loyaltyPoints: user.loyaltyPoints,
    createdAt: user.createdAt,
  }
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (existingUser) {
      throw new AppError('Este e-mail já está em uso', 409)
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        phone: input.phone ?? null,
        cpf: input.cpf ?? null,
        role: 'CUSTOMER',
      },
    })

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken(user.id)
    await saveRefreshToken(user.id, refreshToken, 7)

    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })

    sendWelcomeEmail(user.email, user.name, settings?.storeName ?? undefined).catch((err: Error) =>
      logger.error('Falha ao enviar e-mail de boas-vindas:', err)
    )

    logger.info(`Novo usuário registrado: ${user.email}`)

    return {
      user: toSafeUser(user),
      tokens: { accessToken, refreshToken },
    }
  }

  async login(input: LoginInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    })

    if (!user) {
      throw new AppError('E-mail ou senha incorretos', 401)
    }

    if (!user.isActive) {
      throw new AppError('Conta desativada. Entre em contato com o suporte', 403)
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password)

    if (!isPasswordValid) {
      throw new AppError('E-mail ou senha incorretos', 401)
    }

    // Remove tokens expirados do usuário
    await prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        expiresAt: { lt: new Date() },
      },
    })

    const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken(user.id)
    await saveRefreshToken(user.id, refreshToken, 7)

    logger.info(`Login realizado: ${user.email}`)

    return {
      user: toSafeUser(user),
      tokens: { accessToken, refreshToken },
    }
  }

  async refreshTokens(oldToken: string): Promise<AuthTokens> {
    let decoded: { sub: string }
    try {
      decoded = verifyRefreshToken(oldToken)
    } catch {
      throw new AppError('Refresh token inválido ou expirado', 401)
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
      include: { user: true },
    })

    if (!storedToken) {
      throw new AppError('Refresh token não encontrado ou já utilizado', 401)
    }

    if (storedToken.expiresAt < new Date()) {
      await invalidateRefreshToken(oldToken)
      throw new AppError('Refresh token expirado', 401)
    }

    if (!storedToken.user.isActive) {
      throw new AppError('Conta desativada', 403)
    }

    // Rotação: invalida o token antigo
    await invalidateRefreshToken(oldToken)

    const accessToken = generateAccessToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    })
    const refreshToken = generateRefreshToken(storedToken.user.id)
    await saveRefreshToken(storedToken.user.id, refreshToken, 7)

    return { accessToken, refreshToken }
  }

  async logout(refreshToken: string): Promise<void> {
    await invalidateRefreshToken(refreshToken)
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<void> {
    const user = await prisma.user.findUnique({ where: { email: input.email } })

    // Responde sempre com sucesso para evitar user enumeration
    if (!user) return

    // Invalida tokens anteriores
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const rawToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: rawToken,
        expiresAt,
      },
    })

    const resetUrl = `${env.FRONTEND_URL}/nova-senha?token=${rawToken}`
    const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })

    await sendPasswordResetEmail(
      user.email,
      user.name,
      resetUrl,
      settings?.storeName ?? undefined
    )

    logger.info(`Link de recuperação de senha enviado para: ${user.email}`)
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token: input.token },
      include: { user: true },
    })

    if (!tokenRecord) {
      throw new AppError('Token inválido ou expirado', 400)
    }

    if (tokenRecord.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: tokenRecord.id } })
      throw new AppError('Token expirado. Solicite um novo link de recuperação', 400)
    }

    if (tokenRecord.usedAt) {
      throw new AppError('Token já utilizado', 400)
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, SALT_ROUNDS)

    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenRecord.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: tokenRecord.id },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.deleteMany({ where: { userId: tokenRecord.userId } }),
    ])

    logger.info(`Senha redefinida para: ${tokenRecord.user.email}`)
  }

  async getMe(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new AppError('Usuário não encontrado', 404)
    }

    return toSafeUser(user)
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<SafeUser> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name ?? undefined,
        phone: input.phone !== undefined ? input.phone : undefined,
        cpf: input.cpf !== undefined ? input.cpf : undefined,
        birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
      },
    })

    return toSafeUser(user)
  }
}

export const authService = new AuthService()
