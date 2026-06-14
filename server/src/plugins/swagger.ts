import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export default fp(async (fastify) => {
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'Student Management System API',
        description: 'REST API for the Student Management System',
        version: '1.0.0',
      },
      tags: [
        { name: 'Students', description: 'Student CRUD operations' },
        { name: 'Analytics', description: 'Aggregated statistics' },
        { name: 'Logs', description: 'Activity audit log' },
      ],
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  })
})
