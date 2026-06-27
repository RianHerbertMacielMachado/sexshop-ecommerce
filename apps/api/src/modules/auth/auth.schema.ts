import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter um número'),
    phone: z
      .string()
      .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)
      .optional(),
    cpf: z
      .string()
      .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z
      .string()
      .min(8)
      .regex(/[A-Z]/, 'Deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'Deve conter um número'),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    birthDate: z.string().optional(),
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(8)
      .regex(/[A-Z]/)
      .regex(/[0-9]/)
      .optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body']
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body']
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
