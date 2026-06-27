import { Request, Response, NextFunction } from 'express'
import { AnyZodObject, ZodError, z } from 'zod'
import { AppError } from './error.middleware'

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.reduce(
          (acc, curr) => {
            const key = curr.path.slice(1).join('.')
            acc[key] = curr.message
            return acc
          },
          {} as Record<string, string>
        )
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors,
        })
        return
      }
      next(error)
    }
  }
}
