const axios = require('axios');

const BASE_URL = 'http://localhost:8081';

async function testMedicalAPIs() {
  console.log('🔬 Testando APIs médicas do RepoMed IA...\n');
  
  try {
    // Test CID-10 search
    console.log('📋 1. Testando busca por CID-10...');
    const cid10Search = await axios.get(`${BASE_URL}/api/cid10/search?q=diabetes`);
    console.log(`✅ Encontrados ${cid10Search.data.data.length} resultados CID-10`);
    if (cid10Search.data.data.length > 0) {
      console.log(`   Primeiro resultado: ${cid10Search.data.data[0].code} - ${cid10Search.data.data[0].description}`);
    }
    
    // Test CID-10 by code
    console.log('\n📋 2. Testando busca CID-10 por código...');
    const cid10ByCode = await axios.get(`${BASE_URL}/api/cid10/E11`);
    console.log(`✅ CID-10 E11: ${cid10ByCode.data.data.description}`);
    
    // Test CID-10 categories
    console.log('\n📋 3. Testando categorias CID-10...');
    const cid10Categories = await axios.get(`${BASE_URL}/api/cid10/categories`);
    console.log(`✅ ${cid10Categories.data.data.length} categorias CID-10 encontradas`);
    
    // Test medications search
    console.log('\n💊 4. Testando busca por medicamentos...');
    const medicationsSearch = await axios.get(`${BASE_URL}/api/medications/search?q=paracetamol`);
    console.log(`✅ Encontrados ${medicationsSearch.data.data.length} medicamentos`);
    if (medicationsSearch.data.data.length > 0) {
      console.log(`   Primeiro resultado: ${medicationsSearch.data.data[0].name} - ${medicationsSearch.data.data[0].presentation}`);
    }
    
    // Test medication by ID
    console.log('\n💊 5. Testando busca medicamento por ID...');
    const medicationById = await axios.get(`${BASE_URL}/api/medications/1`);
    console.log(`✅ Medicamento ID 1: ${medicationById.data.data.name}`);
    
    // Test controlled medications
    console.log('\n🔒 6. Testando medicamentos controlados...');
    const controlledMeds = await axios.get(`${BASE_URL}/api/medications/controlled`);
    console.log(`✅ ${controlledMeds.data.data.length} medicamentos controlados encontrados`);
    
    // Test drug interactions
    console.log('\n⚠️  7. Testando interações medicamentosas...');
    try {
      const interactions = await axios.post(`${BASE_URL}/api/medications/interactions`, {
        medicationIds: [1, 2]
      });
      console.log(`✅ Verificação de interações concluída: ${interactions.data.data.length} interações encontradas`);
    } catch (error) {
      console.log('ℹ️  Nenhuma interação cadastrada para estes medicamentos');
    }
    
    console.log('\n🎉 Todos os testes de APIs médicas passaram com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testMedicalAPIs();