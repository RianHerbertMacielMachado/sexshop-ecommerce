import { ZodSchema, ZodObject, ZodRawShape } from 'zod'
import { Request } from 'express'
import { ValidationError } from '../middleware/error.middleware'

export function validate<T extends ZodRawShape>(
  schema: ZodObject<T>,
  req: Request
): { body: ReturnType<ZodObject<T>['parse']>['body']; query: ReturnType<ZodObject<T>['parse']>['query']; params: ReturnType<ZodObject<T>['parse']>['params'] } {
  const result = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params,
  })

  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map((e) => ({
        field: e.path.slice(1).join('.'),
        message: e.message,
        code: e.code,
      }))
    )
  }

  return result.data as { body: ReturnType<ZodObject<T>['parse']>['body']; query: ReturnType<ZodObject<T>['parse']>['query']; params: ReturnType<ZodObject<T>['parse']>['params'] }
}

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }))
    )
  }
  return result.data
}
