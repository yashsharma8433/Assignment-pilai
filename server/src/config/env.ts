import { z } from 'zod'
import path from 'path'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace'])
    .default('info'),

  // Database
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_POOL_MAX: z.coerce.number().int().positive().default(10),

  // Storage
  UPLOAD_DIR: z.string().default('./uploads'),
  MAX_UPLOAD_SIZE_MB: z.coerce.number().positive().default(2),

  // Security
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

// Validate at startup — crash fast if env is misconfigured
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(JSON.stringify(parsed.error.format(), null, 2))
  process.exit(1)
}

export const env = {
  ...parsed.data,
  // Resolve upload dir relative to project root
  UPLOAD_DIR: path.resolve(parsed.data.UPLOAD_DIR),
  MAX_UPLOAD_SIZE_BYTES: parsed.data.MAX_UPLOAD_SIZE_MB * 1024 * 1024,
}

export type Env = typeof env
