import { Pool, PoolClient } from 'pg'
import { env } from '../config/env'

// Singleton connection pool — shared across the entire application
export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  max: env.DB_POOL_MAX,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 3_000,
  allowExitOnIdle: false,
})

// Surface unexpected idle client errors rather than silently swallowing them
pool.on('error', (err: Error) => {
  console.error('Unexpected idle client error:', err.message)
})

/**
 * Helper to run multiple queries in a single transaction.
 * Automatically commits on success and rolls back on error.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
