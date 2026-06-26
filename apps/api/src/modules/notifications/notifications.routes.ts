import { Router, Request, Response } from 'express'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { prisma } from '../../lib/prisma'

const router = Router()

// SSE clients registry
const clients = new Set<Response>()

export function notifyAdmins(event: string, data: unknown): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const client of clients) {
    try {
      client.write(payload)
    } catch {
      clients.delete(client)
    }
  }
}

router.get('/stream', authMiddleware, isAdmin, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders()

  clients.add(res)

  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'SSE conectado' })}\n\n`)

  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n')
    } catch {
      clearInterval(heartbeat)
      clients.delete(res)
    }
  }, 30000)

  req.on('close', () => {
    clearInterval(heartbeat)
    clients.delete(res)
  })
})

export { router as notificationRoutes }
