import { FastifyInstance } from 'fastify'
import { getAnalytics } from './analytics.repository'
import { ok } from '../../shared/response'

export default async function analyticsRoutes(app: FastifyInstance) {
  app.get('/analytics', {
    schema: {
      tags: ['Analytics'],
      summary: 'Get aggregated student statistics (course, year, gender, monthly enrollment)',
    },
    handler: async (_req, reply) => {
      const data = await getAnalytics()
      reply.send(ok(data))
    },
  })
}
