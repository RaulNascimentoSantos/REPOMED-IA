// Configuração do banco de dados PostgreSQL para RepoMed IA
const { Pool } = require('pg');

// Configuração padrão do PostgreSQL
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'repomed_ia',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Pool de conexões
const pool = new Pool(dbConfig);

// Função para testar conexão
async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');
    const result = await client.query('SELECT NOW()');
    console.log('🕒 Horário do servidor:', result.rows[0].now);
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Erro ao conectar com PostgreSQL:', err.message);
    console.log('💡 Para usar PostgreSQL:');
    console.log('   1. Instale PostgreSQL: https://www.postgresql.org/download/');
    console.log('   2. Crie o banco: createdb repomed_ia');
    console.log('   3. Execute: psql -d repomed_ia -f database/init.sql');
    return false;
  }
}

// Query helper
async function query(text, params) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('🔍 Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ Erro na query:', err.message);
    throw err;
  }
}

// Função para inicializar banco (se não existir)
async function initializeDatabase() {
  const isConnected = await testConnection();
  if (!isConnected) {
    console.log('⚠️  PostgreSQL não está disponível. Usando dados mock.');
    return false;
  }

  try {
    // Verificar se tabelas existem
    const result = await query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'users'
    `);

    if (result.rows.length === 0) {
      console.log('📄 Tabelas não encontradas. Para inicializar o banco:');
      console.log('   psql -d repomed_ia -f database/init.sql');
    } else {
      console.log('✅ Banco de dados RepoMed IA inicializado');
    }

    return true;
  } catch (err) {
    console.error('❌ Erro ao verificar banco:', err.message);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  initializeDatabase,
  dbConfig
};