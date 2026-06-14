import 'dotenv/config'
import { buildApp } from './src/app'
import { env } from './src/config/env'
import { pool } from './src/db/pool'
import { runMigrations } from './src/db/migrate'
import { mkdir } from 'fs/promises'

async function main(): Promise<void> {
  // Ensure uploads directory exists
  await mkdir(env.UPLOAD_DIR, { recursive: true })

  // Run DB migrations before accepting traffic
  await runMigrations()

  const app = await buildApp()

  await app.listen({
    port: env.PORT,
    host: '0.0.0.0',
  })

  app.log.info(`🚀 Server running on http://0.0.0.0:${env.PORT}`)
  app.log.info(`📖 Swagger UI at  http://localhost:${env.PORT}/docs`)

  // ── Graceful shutdown ─────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`Received ${signal} — shutting down gracefully…`)
    try {
      await app.close()       // stop accepting new connections
      await pool.end()        // drain all DB connections
      app.log.info('Shutdown complete')
      process.exit(0)
    } catch (err) {
      app.log.error(err, 'Error during shutdown')
      process.exit(1)
    }
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT',  () => void shutdown('SIGINT'))

  // Surface unhandled rejections instead of silently crashing
  process.on('unhandledRejection', (reason) => {
    app.log.error({ reason }, 'Unhandled promise rejection')
    void shutdown('unhandledRejection')
  })
}

main().catch((err: Error) => {
  console.error('Fatal startup error:', err.message)
  process.exit(1)
})
