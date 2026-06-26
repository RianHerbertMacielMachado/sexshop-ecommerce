import winston from 'winston'
import path from 'path'

const { combine, timestamp, errors, json, colorize, printf } = winston.format

const devFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : ''
  return `${ts} [${level}]: ${stack ?? message}${metaStr}`
})

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
)

const devTransports: winston.transport[] = [
  new winston.transports.Console({
    format: combine(
      colorize({ all: true }),
      timestamp({ format: 'HH:mm:ss' }),
      errors({ stack: true }),
      devFormat
    ),
  }),
]

const prodTransports: winston.transport[] = [
  new winston.transports.Console({ format: prodFormat }),
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: prodFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 5,
  }),
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: prodFormat,
    maxsize: 10 * 1024 * 1024,
    maxFiles: 10,
  }),
]

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: process.env.NODE_ENV === 'production' ? prodTransports : devTransports,
  exitOnError: false,
})

export function httpLogger() {
  return (
    req: { method: string; url: string; ip: string },
    res: { statusCode: number; on: Function },
    next: Function
  ) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'http'
      logger.log(level, `${req.method} ${req.url}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      })
    })
    next()
  }
}
