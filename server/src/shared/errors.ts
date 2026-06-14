// ── Typed HTTP Error helper ────────────────────────────────────
// Fastify already exposes createError via `fastify.httpErrors` when you
// use @fastify/sensible, but we keep this lightweight and self-contained.

export class AppError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(statusCode: number, message: string, code = 'APP_ERROR') {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }
}

export const Errors = {
  notFound: (resource = 'Resource') =>
    new AppError(404, `${resource} not found`, 'NOT_FOUND'),

  badRequest: (message: string) =>
    new AppError(400, message, 'BAD_REQUEST'),

  conflict: (message: string) =>
    new AppError(409, message, 'CONFLICT'),

  unprocessable: (message: string) =>
    new AppError(422, message, 'VALIDATION_ERROR'),

  internal: (message = 'Internal server error') =>
    new AppError(500, message, 'INTERNAL_ERROR'),
} as const
