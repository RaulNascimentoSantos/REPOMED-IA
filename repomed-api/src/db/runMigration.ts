import { db } from './index'
import { sql } from 'drizzle-orm'

async function runMigration() {
  try {
    console.log('🔄 Running authentication enhancement migration...')
    
    // Add new columns to users table
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS uf VARCHAR(2),
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS crm_validated_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
    `)
    
    // Update CRM column length for consistency
    await db.execute(sql`ALTER TABLE users ALTER COLUMN crm TYPE VARCHAR(20)`)
    
    // Create indexes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_crm_uf ON users(crm, uf) WHERE crm IS NOT NULL`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true`)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`)
    
    // Update existing users to be active by default
    await db.execute(sql`UPDATE users SET is_active = true WHERE is_active IS NULL`)
    
    console.log('✅ Migration completed successfully!')
    console.log('📊 Enhanced users table with:')
    console.log('   - UF field for CRM validation')
    console.log('   - is_active flag for user status')
    console.log('   - crm_validated_at timestamp')
    console.log('   - last_login_at tracking')
    console.log('   - Optimized indexes for performance')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// Run if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('🎉 Migration process completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Migration process failed:', error)
      process.exit(1)
    })
}

export { runMigration }