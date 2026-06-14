import { FastifyInstance } from 'fastify'
import { createLogsRepository } from './logs.repository'
import { pool } from '../../db/pool'
import { ok } from '../../shared/response'
import { z } from 'zod'

const logsRepo = createLogsRepository(pool)

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export default async function logsRoutes(app: FastifyInstance) {
  app.get('/logs', {
    schema: {
      tags: ['Logs'],
      summary: 'Get paginated activity log',
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'integer', default: 1 },
          limit: { type: 'integer', default: 20 },
        },
      },
    },
    handler: async (req, reply) => {
      const { page, limit } = querySchema.parse(req.query)
      const { data, total } = await logsRepo.list({ page, limit })
      reply.send(
        ok(data, {
          total,
          page,
          limit,
          total_pages: Math.ceil(total / limit),
        }),
      )
    },
  })
}
