const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function seed() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL || process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/repomed'
  });

  try {
    await client.connect();
    console.log('🔗 Conectado ao banco');

    // Hash senha padrão
    const passwordHash = await bcrypt.hash('senha123', 10);

    // Usuários
    await client.query(`
      INSERT INTO users (email, password, name, role) VALUES
      ('admin@repomed.com', $1, 'Administrador', 'admin'),
      ('medico@repomed.com', $1, 'Dr. João Silva', 'physician'),
      ('medico2@repomed.com', $1, 'Dra. Maria Santos', 'physician')
      ON CONFLICT (email) DO NOTHING
    `, [passwordHash]);

    // Pacientes
    await client.query(`
      INSERT INTO patients (name, cpf, email, phone, birth_date) VALUES
      ('José da Silva', '12345678900', 'jose@email.com', '11999998888', '1980-05-15'),
      ('Maria Oliveira', '98765432100', 'maria@email.com', '11888887777', '1975-10-20'),
      ('Ana Costa', '45678912300', 'ana@email.com', '11777776666', '1990-03-25')
      ON CONFLICT (cpf) DO NOTHING
    `);

    // Templates
    await client.query(`
      INSERT INTO templates (name, type, content) VALUES
      ('Atestado Médico Padrão', 'certificate', 'Atesto para os devidos fins que o(a) paciente {{nome}} esteve sob meus cuidados...'),
      ('Prescrição Simples', 'prescription', 'Prescrição médica para {{nome}}...'),
      ('Laudo de Exame', 'report', 'Laudo médico do paciente {{nome}}...')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ Banco populado com sucesso!');
    console.log('📧 Login: medico@repomed.com');
    console.log('🔑 Senha: senha123');

  } catch (error) {
    console.error('❌ Erro no seed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

seed();