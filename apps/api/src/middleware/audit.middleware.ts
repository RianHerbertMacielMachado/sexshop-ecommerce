import { Request, Response, NextFunction } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

interface AuditOptions {
  entity: string
  action?: string
  getEntityId?: (req: Request) => string | undefined
}

export function auditLog(options: AuditOptions) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res)
    let responseBody: unknown = null

    res.json = function (body: unknown) {
      responseBody = body
      return originalJson(body)
    }

    res.on('finish', () => {
      if (!req.user?.id) return
      if (req.method === 'GET') return
      if (res.statusCode >= 400) return

      const action =
        options.action ??
        {
          POST: `CREATE_${options.entity.toUpperCase()}`,
          PUT: `UPDATE_${options.entity.toUpperCase()}`,
          PATCH: `UPDATE_${options.entity.toUpperCase()}`,
          DELETE: `DELETE_${options.entity.toUpperCase()}`,
        }[req.method] ??
        `${req.method}_${options.entity.toUpperCase()}`

      const entityId =
        options.getEntityId?.(req) ??
        req.params.id ??
        (responseBody as { data?: { id?: string } })?.data?.id

      prisma.auditLog
        .create({
          data: {
            userId: req.user.id,
            action,
            resource: options.entity,
            resourceId: entityId ?? null,
            newData: req.method !== 'DELETE' ? (req.body as Prisma.InputJsonObject) : undefined,
            ip:
              (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ?? req.ip ?? null,
            userAgent: req.headers['user-agent'] ?? null,
          },
        })
        .catch((err: Error) => logger.error('Falha ao salvar audit log:', err))
    })

    next()
  }
}

export function sanitizeRequestBody(body: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'newPassword', 'currentPassword', 'token', 'secret', 'key', 'config']
  const sanitized = { ...body }

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}
