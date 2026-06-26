import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, 'Nome deve ter no mínimo 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    email: z.string().email('E-mail inválido').toLowerCase().trim(),
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
    phone: z
      .string()
      .regex(/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/, 'Telefone inválido')
      .optional(),
    cpf: z
      .string()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido')
      .optional(),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido').toLowerCase().trim(),
    password: z.string().min(1, 'Senha é obrigatória'),
  }),
})

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('E-mail inválido').toLowerCase().trim(),
  }),
})

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token é obrigatório'),
    newPassword: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
      .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  }),
})

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).trim().optional(),
    phone: z
      .string()
      .regex(/^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/, 'Telefone inválido')
      .optional()
      .nullable(),
    cpf: z
      .string()
      .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido')
      .optional()
      .nullable(),
    birthDate: z
      .string()
      .datetime({ message: 'Data inválida' })
      .optional()
      .nullable(),
  }),
})

export type RegisterInput = z.infer<typeof registerSchema>['body']
export type LoginInput = z.infer<typeof loginSchema>['body']
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body']
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body']
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body']
