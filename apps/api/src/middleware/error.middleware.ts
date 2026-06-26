import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'
import { logger } from '../lib/logger'

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly errors?: unknown

  constructor(message: string, statusCode: number = 500, errors?: unknown) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.isOperational = true
    this.errors = errors
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(errors: unknown) {
    super('Dados de entrada inválidos', 422, errors)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(`${resource} não encontrado`, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Não autorizado') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acesso negado') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

interface ErrorResponse {
  success: false
  message: string
  errors?: unknown
  stack?: string
  code?: string
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = 500
  let message = 'Erro interno do servidor'
  let errors: unknown = undefined
  let code: string | undefined = undefined

  if (error instanceof AppError) {
    statusCode = error.statusCode
    message = error.message
    errors = error.errors
  } else if (error instanceof ZodError) {
    statusCode = 422
    message = 'Dados de entrada inválidos'
    errors = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }))
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': {
        statusCode = 409
        const target = (error.meta?.target as string[])?.join(', ') ?? 'campo'
        message = `Já existe um registro com este ${target}`
        code = 'DUPLICATE_ENTRY'
        break
      }
      case 'P2025': {
        statusCode = 404
        message = 'Registro não encontrado'
        code = 'NOT_FOUND'
        break
      }
      case 'P2003': {
        statusCode = 400
        message = 'Referência inválida — registro relacionado não encontrado'
        code = 'FOREIGN_KEY_VIOLATION'
        break
      }
      case 'P2014': {
        statusCode = 400
        message = 'Violação de relação — operação inválida'
        code = 'RELATION_VIOLATION'
        break
      }
      default: {
        statusCode = 500
        message = 'Erro no banco de dados'
        code = error.code
        break
      }
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = 'Dados inválidos para o banco de dados'
  } else if (error instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503
    message = 'Serviço temporariamente indisponível'
    logger.error('Prisma initialization error:', error)
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.path} — ${message}`, {
      error: error.message,
      stack: error.stack,
      statusCode,
    })
  } else {
    logger.warn(`${req.method} ${req.path} — ${message}`, {
      statusCode,
      errors,
    })
  }

  const response: ErrorResponse = {
    success: false,
    message,
    errors,
    code,
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack
  }

  res.status(statusCode).json(response)
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.path} não encontrada`,
  })
}

export function asyncHandler<T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: T, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
