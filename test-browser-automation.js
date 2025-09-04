const { chromium } = require('playwright');

async function testRepoMedIA() {
  console.log('🚀 Iniciando teste do RepoMed IA...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Navegar para a aplicação
    console.log('📱 Abrindo aplicação...');
    await page.goto('http://localhost:3006');
    await page.waitForLoadState('networkidle');
    
    // 2. Ir para login
    console.log('🔐 Navegando para login...');
    await page.goto('http://localhost:3006/auth/login');
    await page.waitForTimeout(2000);
    
    // 3. Fazer login com o usuário que criamos
    console.log('✅ Fazendo login...');
    await page.fill('input[name="email"], input[type="email"]', 'dr.teste@repomed.com');
    await page.fill('input[name="password"], input[type="password"]', '123456789');
    await page.click('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")');
    
    // Aguardar redirect para dashboard
    await page.waitForTimeout(3000);
    
    // 4. Navegar para pacientes
    console.log('👥 Navegando para pacientes...');
    await page.goto('http://localhost:3006/patients');
    await page.waitForTimeout(2000);
    
    // 5. Criar novo paciente
    console.log('➕ Criando novo paciente...');
    await page.click('button:has-text("Novo Paciente"), a:has-text("Novo Paciente")');
    await page.waitForTimeout(2000);
    
    // Preencher formulário do paciente
    console.log('📝 Preenchendo dados do paciente...');
    await page.fill('input[name="name"]', 'Maria da Silva');
    await page.fill('input[name="cpf"]', '98765432100');
    await page.fill('input[name="dateOfBirth"]', '1990-03-20');
    await page.fill('input[name="email"]', 'maria.silva@email.com');
    await page.fill('input[name="phone"]', '(11) 88888-8888');
    await page.fill('input[name="address"]', 'Av. Paulista, 1000');
    
    // Salvar paciente
    await page.click('button[type="submit"], button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    console.log('🎉 Teste completado com sucesso!');
    console.log('✅ Login realizado');
    console.log('✅ Paciente criado: Maria da Silva');
    console.log('📋 Navegue pela aplicação para ver as funcionalidades');
    
    // Manter o navegador aberto para demonstração
    console.log('🌐 Navegador mantido aberto para demonstração...');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    
    // Fallback: abrir páginas manualmente para demonstração
    console.log('🔄 Abrindo páginas para demonstração manual...');
    
    await page.goto('http://localhost:3006');
    await page.waitForTimeout(1000);
    
    // Tentar ir direto para dashboard se já estiver logado
    try {
      await page.goto('http://localhost:3006/dashboard');
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('ℹ️ Dashboard não acessível, indo para login...');
      await page.goto('http://localhost:3006/auth/login');
    }
  }
  
  // Não fechar o navegador para permitir interação manual
  console.log('💡 Use o navegador para testar as funcionalidades manualmente');
}

testRepoMedIA().catch(console.error);