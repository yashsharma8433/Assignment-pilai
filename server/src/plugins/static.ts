import fp from 'fastify-plugin'
import staticFiles from '@fastify/static'
import { env } from '../config/env'

export default fp(async (fastify) => {
  await fastify.register(staticFiles, {
    root: env.UPLOAD_DIR,
    prefix: '/uploads/',
    decorateReply: false,
  })
})
