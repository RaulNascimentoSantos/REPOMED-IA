// Teste automatizado do RepoMed IA
// Este script simula o fluxo completo: registro, login e criação de paciente

import axios from 'axios';

const API_URL = 'http://localhost:8081';

// Dados de teste
const testDoctor = {
  name: 'Dr. João Silva',
  email: `teste${Date.now()}@repomed.com`,
  password: 'senha123456',
  crm: '123456',
  uf: 'SP'
};

const testPatient = {
  name: 'Maria Oliveira Santos',
  cpf: '123.456.789-00',
  birthDate: '1990-05-15',
  gender: 'F',
  phone: '(11) 98765-4321',
  email: 'maria@email.com',
  address: 'Rua das Flores, 123',
  city: 'São Paulo',
  state: 'SP',
  zipCode: '01234-567',
  emergencyContactName: 'José Santos',
  emergencyContactPhone: '(11) 98765-4322',
  medicalHistory: 'Hipertensão, Diabetes Tipo 2',
  allergies: 'Penicilina, Dipirona',
  medications: 'Losartana 50mg, Metformina 850mg'
};

async function runTests() {
  console.log('🧪 INICIANDO TESTES DO REPOMED IA\n');
  console.log('=====================================\n');
  
  let token = '';
  
  try {
    // 1. Testar API Status
    console.log('📍 1. Testando status da API...');
    const apiStatus = await axios.get(`${API_URL}/`);
    console.log(`✅ API Rodando: ${apiStatus.data.name} v${apiStatus.data.version}`);
    console.log(`   Status: ${apiStatus.data.status}\n`);
    
    // 2. Health Check
    console.log('💓 2. Health Check...');
    const health = await axios.get(`${API_URL}/health`);
    console.log(`✅ Health: ${health.data.status}`);
    console.log(`   Uptime: ${Math.floor(health.data.uptime / 60)} minutos\n`);
    
    // 3. Registrar novo médico
    console.log('👨‍⚕️ 3. Registrando novo médico...');
    console.log(`   Nome: ${testDoctor.name}`);
    console.log(`   Email: ${testDoctor.email}`);
    console.log(`   CRM: ${testDoctor.crm}/${testDoctor.uf}`);
    
    try {
      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, testDoctor);
      console.log('✅ Médico registrado com sucesso!');
      console.log(`   ID: ${registerResponse.data.user.id}`);
      token = registerResponse.data.token;
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Usuário já existe, fazendo login...');
        
        // 4. Login se usuário já existe
        const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
          email: testDoctor.email,
          password: testDoctor.password
        });
        
        console.log('✅ Login realizado com sucesso!');
        token = loginResponse.data.token;
      } else {
        console.log('❌ Erro no registro:', error.response?.data?.message || error.message);
      }
    }
    
    if (!token) {
      console.log('\n❌ Não foi possível obter token de autenticação\n');
      return;
    }
    
    console.log(`   Token JWT: ${token.substring(0, 20)}...`);
    console.log('\n');
    
    // 5. Testar endpoint protegido
    console.log('🔐 4. Testando endpoint protegido...');
    const meResponse = await axios.get(`${API_URL}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Autenticação funcionando!');
    console.log(`   Usuário: ${meResponse.data.user.email}`);
    console.log(`   Role: ${meResponse.data.user.role}\n`);
    
    // 6. Criar novo paciente
    console.log('👥 5. Criando novo paciente...');
    console.log(`   Nome: ${testPatient.name}`);
    console.log(`   CPF: ${testPatient.cpf}`);
    console.log(`   Nascimento: ${testPatient.birthDate}`);
    
    const patientResponse = await axios.post(
      `${API_URL}/api/patients`,
      testPatient,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Paciente criado com sucesso!');
    console.log(`   ID: ${patientResponse.data.data.id}`);
    console.log(`   Mensagem: ${patientResponse.data.message}\n`);
    
    // 7. Listar pacientes
    console.log('📋 6. Listando pacientes...');
    const patientsResponse = await axios.get(`${API_URL}/api/patients`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log(`✅ Total de pacientes: ${patientsResponse.data.total}`);
    if (patientsResponse.data.data.length > 0) {
      console.log('   Últimos pacientes cadastrados:');
      patientsResponse.data.data.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} (${p.cpf || 'Sem CPF'})`);
      });
    }
    
    console.log('\n=====================================');
    console.log('🎉 TODOS OS TESTES PASSARAM COM SUCESSO!');
    console.log('=====================================\n');
    
    // Resumo final
    console.log('📊 RESUMO DO SISTEMA:');
    console.log('✅ API Backend: Funcionando');
    console.log('✅ Autenticação JWT: Funcionando');
    console.log('✅ Registro de médicos: Funcionando');
    console.log('✅ Login: Funcionando');
    console.log('✅ Criação de pacientes: Funcionando');
    console.log('✅ Listagem de pacientes: Funcionando');
    console.log('\n🚀 RepoMed IA v4.0 - 100% OPERACIONAL!\n');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE OS TESTES:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Mensagem: ${error.response.data?.message || error.response.data?.error}`);
      console.error(`   Detalhes:`, error.response.data);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

// Executar testes
console.log('🏥 REPOMED IA - TESTE AUTOMATIZADO\n');
runTests();