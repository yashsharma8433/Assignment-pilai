import Fastify, { FastifyInstance } from 'fastify'
import { env } from './config/env'
import { AppError } from './shared/errors'
import { fail } from './shared/response'

// Plugins
import corsPlugin from './plugins/cors'
import helmetPlugin from './plugins/helmet'
import multipartPlugin from './plugins/multipart'
import staticPlugin from './plugins/static'
import swaggerPlugin from './plugins/swagger'
import rateLimitPlugin from './plugins/rateLimit'

// Routes
import studentRoutes from './modules/students/students.routes'
import analyticsRoutes from './modules/analytics/analytics.routes'
import logsRoutes from './modules/logs/logs.routes'

/**
 * Factory function — decouples app construction from startup.
 * This makes the app easy to test: just call buildApp() in tests.
 */
export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      ...(env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
        : {}),
    },
    disableRequestLogging: false,
    trustProxy: true, // for rate-limit behind reverse proxy
  })

  // ── Plugins (order matters) ───────────────────────────────
  await app.register(swaggerPlugin)   // swagger first so routes are captured
  await app.register(corsPlugin)
  await app.register(helmetPlugin)
  await app.register(rateLimitPlugin)
  await app.register(multipartPlugin)
  await app.register(staticPlugin)

  // ── Routes ───────────────────────────────────────────────
  await app.register(studentRoutes,   { prefix: '/api/v1' })
  await app.register(analyticsRoutes, { prefix: '/api/v1' })
  await app.register(logsRoutes,      { prefix: '/api/v1' })

  // ── Health check ─────────────────────────────────────────
  app.get('/health', { schema: { hide: true } }, async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  // ── Global error handler ──────────────────────────────────
  app.setErrorHandler((error, _req, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(fail(error.code, error.message))
    }

    // Zod / Fastify validation errors
    if (error.validation) {
      return reply.status(400).send(
        fail('VALIDATION_ERROR', 'Request validation failed', error.validation),
      )
    }

    // PostgreSQL unique constraint violation
    if ((error as NodeJS.ErrnoException & { code?: string }).code === '23505') {
      const detail = (error as { detail?: string }).detail ?? ''
      const field = detail.match(/\((.+?)\)/)?.[1] ?? 'field'
      return reply.status(409).send(
        fail('CONFLICT', `A student with this ${field} already exists`),
      )
    }

    app.log.error(error)
    return reply.status(500).send(fail('INTERNAL_ERROR', 'An unexpected error occurred'))
  })

  // ── 404 handler ───────────────────────────────────────────
  app.setNotFoundHandler((_req, reply) => {
    reply.status(404).send(fail('NOT_FOUND', 'Route not found'))
  })

  return app
}
