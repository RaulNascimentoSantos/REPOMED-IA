const fs = require('fs');
const postgres = require('postgres');

// Database connection
const sql = postgres({
  host: 'localhost',
  port: 5432,
  database: 'repomed_dev',
  username: 'repomed',
  password: 'senha123',
});

async function runMigration() {
  try {
    console.log('🔄 Executando migração do sistema médico...');
    
    // Read the migration file
    const migrationSQL = fs.readFileSync('./repomed-api/migrations/007_complete_medical_system.sql', 'utf8');
    
    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executando:', statement.substring(0, 50) + '...');
        await sql.unsafe(statement.trim());
      }
    }
    
    console.log('✅ Migração concluída com sucesso!');
    
    // Test the tables
    const cid10Count = await sql`SELECT COUNT(*) as count FROM cid10`;
    const medicationsCount = await sql`SELECT COUNT(*) as count FROM medications`;
    
    console.log(`📊 CID-10 registros: ${cid10Count[0].count}`);
    console.log(`💊 Medicamentos registros: ${medicationsCount[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
  } finally {
    await sql.end();
  }
}

runMigration();