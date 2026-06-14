// Standalone migration runner — loads .env FIRST before any other module
// This file uses CommonJS require() to ensure dotenv runs before ES module evaluation

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') })

// Now safe to import modules that read process.env
import { runMigrations } from './migrate'

runMigrations()
  .then(() => {
    console.log('✅ All migrations complete')
    process.exit(0)
  })
  .catch((err: Error) => {
    console.error('❌ Migration error:', err.message)
    process.exit(1)
  })
