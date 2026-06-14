import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { pool } from './pool'

// ── Migration runner ──────────────────────────────────────────
// Reads .sql files from /migrations, runs them in sort order,
// and records each in a `migrations` table to prevent re-runs.

export async function runMigrations(): Promise<void> {
  const client = await pool.connect()
  try {
    // Ensure tracking table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id       SERIAL      PRIMARY KEY,
        name     TEXT        UNIQUE NOT NULL,
        run_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Enable pg_trgm for GIN trigram indexes (idempotent)
    await client.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`)

    const migrationsDir = path.join(__dirname, 'migrations')
    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith('.up.sql'))
      .sort()

    for (const file of files) {
      const { rowCount } = await client.query(
        'SELECT 1 FROM migrations WHERE name = $1',
        [file],
      )

      if (rowCount === 0) {
        const sql = await readFile(path.join(migrationsDir, file), 'utf-8')
        await client.query('BEGIN')
        try {
          await client.query(sql)
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file])
          await client.query('COMMIT')
          console.log(`✅ Migration applied: ${file}`)
        } catch (err) {
          await client.query('ROLLBACK')
          throw new Error(`Migration failed [${file}]: ${(err as Error).message}`)
        }
      } else {
        console.log(`⏭  Migration already applied: ${file}`)
      }
    }
  } finally {
    client.release()
  }
}

// Allow standalone execution: `npm run migrate`
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ All migrations complete')
      process.exit(0)
    })
    .catch((err: Error) => {
      console.error('❌ Migration error:', err.message)
      process.exit(1)
    })
}
