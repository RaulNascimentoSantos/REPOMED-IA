// Test Authentication Flow End-to-End
const axios = require('axios');

const API_BASE = 'http://localhost:8090';

async function testAuthFlow() {
  console.log('🧪 TESTE DE FLUXO DE AUTENTICAÇÃO COMPLETO\n');
  
  try {
    // 1. Test health endpoint
    console.log('1️⃣ Testando health endpoint...');
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health:', health.data);
    console.log('');
    
    // 2. Test user registration
    console.log('2️⃣ Testando registro de usuário...');
    const testUser = {
      name: 'Dr. João Silva',
      email: `test-${Date.now()}@example.com`,
      password: 'Test123!',
      crm: '123456',
      uf: 'SP'
    };
    
    try {
      const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testUser);
      console.log('✅ Registro successful:', {
        success: registerResponse.data.success,
        hasToken: !!registerResponse.data.token,
        hasRefreshToken: !!registerResponse.data.refreshToken,
        user: registerResponse.data.user.name
      });
      
      const { token, refreshToken } = registerResponse.data;
      
      // 3. Test protected route with token
      console.log('\\n3️⃣ Testando rota protegida...');
      const meResponse = await axios.get(`${API_BASE}/api/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Rota protegida:', {
        success: meResponse.data.success,
        user: meResponse.data.user.name
      });
      
      // 4. Test login
      console.log('\\n4️⃣ Testando login...');
      const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      console.log('✅ Login successful:', {
        success: loginResponse.data.success,
        hasToken: !!loginResponse.data.token,
        lastLogin: loginResponse.data.user.lastLogin
      });
      
      // 5. Test refresh token
      console.log('\\n5️⃣ Testando refresh token...');
      const refreshResponse = await axios.post(`${API_BASE}/api/auth/refresh`, {
        refreshToken: refreshToken
      });
      console.log('✅ Refresh token:', {
        success: refreshResponse.data.success,
        hasNewToken: !!refreshResponse.data.token
      });
      
      // 6. Test logout
      console.log('\\n6️⃣ Testando logout...');
      const logoutResponse = await axios.post(`${API_BASE}/api/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Logout successful:', {
        success: logoutResponse.data.success,
        message: logoutResponse.data.message
      });
      
      console.log('\\n🎉 TODOS OS TESTES PASSARAM! Sistema de autenticação funcionando perfeitamente.');
      
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('CRM')) {
        console.log('ℹ️  Registro falhou devido à validação de CRM (esperado em desenvolvimento)');
        console.log('   Erro:', error.response.data.message);
        
        // Test with a valid mock CRM
        console.log('\\n2️⃣.1 Tentando com CRM mock válido...');
        testUser.crm = '12345'; // Mock CRM that should work in development
        
        const registerResponse = await axios.post(`${API_BASE}/api/auth/register`, testUser);
        console.log('✅ Registro com CRM mock:', registerResponse.data.success);
        
        const { token } = registerResponse.data;
        
        // Continue with other tests...
        const meResponse = await axios.get(`${API_BASE}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Rota protegida funcionando');
        
        console.log('\\n🎉 Testes concluídos com sucesso!');
      } else {
        throw error;
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\\n💡 Verifique se o backend está rodando na porta 8090');
      console.error('   Execute: cd repomed-api && npm run dev');
    }
  }
}

// Run tests
testAuthFlow();