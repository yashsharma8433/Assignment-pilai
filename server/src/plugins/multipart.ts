import fp from 'fastify-plugin'
import multipart from '@fastify/multipart'
import { env } from '../config/env'

export default fp(async (fastify) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: env.MAX_UPLOAD_SIZE_BYTES,
      files: 1, // max 1 file per request
      fieldSize: 10_000, // max field value size
    },
    attachFieldsToBody: false, // we handle fields manually for control
  })
})
