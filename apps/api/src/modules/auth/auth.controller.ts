import { Request, Response } from 'express'
import { authService } from './auth.service'
import { asyncHandler } from '../../middleware/error.middleware'
import { validate } from '../../lib/validate'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from './auth.schema'

const REFRESH_COOKIE_NAME = 'refreshToken'
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/auth',
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(registerSchema, req)
  const { user, tokens } = await authService.register(body)

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, REFRESH_COOKIE_OPTIONS)

  res.status(201).json({
    success: true,
    message: 'Conta criada com sucesso',
    data: {
      user,
      accessToken: tokens.accessToken,
    },
  })
})

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(loginSchema, req)
  const { user, tokens } = await authService.login(body)

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, REFRESH_COOKIE_OPTIONS)

  res.status(200).json({
    success: true,
    message: 'Login realizado com sucesso',
    data: {
      user,
      accessToken: tokens.accessToken,
    },
  })
})

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const oldRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined

  if (!oldRefreshToken) {
    res.status(401).json({ success: false, message: 'Refresh token não encontrado' })
    return
  }

  const tokens = await authService.refreshTokens(oldRefreshToken)

  res.cookie(REFRESH_COOKIE_NAME, tokens.refreshToken, REFRESH_COOKIE_OPTIONS)

  res.status(200).json({
    success: true,
    message: 'Tokens renovados com sucesso',
    data: { accessToken: tokens.accessToken },
  })
})

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined

  if (refreshToken) {
    await authService.logout(refreshToken)
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { ...REFRESH_COOKIE_OPTIONS, maxAge: 0 })

  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso',
  })
})

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(forgotPasswordSchema, req)
  await authService.forgotPassword(body)

  res.status(200).json({
    success: true,
    message:
      'Se este e-mail estiver cadastrado, você receberá as instruções de recuperação em breve',
  })
})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(resetPasswordSchema, req)
  await authService.resetPassword(body)

  res.status(200).json({
    success: true,
    message: 'Senha redefinida com sucesso. Faça login com a nova senha',
  })
})

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getMe(req.user!.id)

  res.status(200).json({
    success: true,
    message: 'Dados do usuário retornados com sucesso',
    data: { user },
  })
})

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(updateProfileSchema, req)
  const user = await authService.updateProfile(req.user!.id, body)

  res.status(200).json({
    success: true,
    message: 'Perfil atualizado com sucesso',
    data: { user },
  })
})
