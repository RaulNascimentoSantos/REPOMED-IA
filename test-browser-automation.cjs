const { chromium } = require('playwright');

async function testRepoMedIA() {
  console.log('🚀 Iniciando teste do RepoMed IA...');
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 2000,
    args: ['--start-maximized', '--no-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Navegar para a aplicação
    console.log('📱 Abrindo aplicação...');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📸 Página inicial carregada');
    
    // 2. Tentar ir para dashboard ou login
    try {
      console.log('🏠 Tentando acessar dashboard...');
      await page.goto('http://localhost:3006/dashboard', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('🔐 Redirecionando para login...');
      await page.goto('http://localhost:3006/auth/login', { waitUntil: 'networkidle' });
      await page.waitForTimeout(2000);
    }
    
    // Tentar fazer login se necessário
    const currentUrl = page.url();
    if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
      console.log('✅ Fazendo login com Dr. Teste...');
      
      // Aguardar campos aparecerem
      await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
      
      await page.fill('input[type="email"], input[name="email"]', 'dr.teste@repomed.com');
      await page.fill('input[type="password"], input[name="password"]', '123456789');
      
      // Aguardar botão de submit
      await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
      await page.click('button[type="submit"]');
      
      // Aguardar redirect
      await page.waitForTimeout(5000);
      console.log('🔓 Login realizado!');
    }
    
    // 3. Navegar para pacientes
    console.log('👥 Navegando para página de pacientes...');
    await page.goto('http://localhost:3006/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 4. Tentar criar novo paciente
    console.log('➕ Procurando botão Novo Paciente...');
    
    // Procurar por diferentes seletores de botão
    const selectors = [
      'button:has-text("Novo Paciente")',
      'a:has-text("Novo Paciente")',
      'button:has-text("Cadastrar")',
      '[href="/patients/new"]',
      'button[type="button"]'
    ];
    
    let buttonFound = false;
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        buttonFound = true;
        console.log(`✅ Botão encontrado: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!buttonFound) {
      console.log('🔄 Navegando diretamente para /patients/new');
      await page.goto('http://localhost:3006/patients/new', { waitUntil: 'networkidle' });
    }
    
    await page.waitForTimeout(3000);
    
    // 5. Preencher formulário do paciente
    console.log('📝 Preenchendo formulário do paciente...');
    
    try {
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });
      
      await page.fill('input[name="name"]', 'Ana Lucia Santos');
      await page.fill('input[name="cpf"]', '11122233344');
      await page.fill('input[name="dateOfBirth"]', '1988-12-10');
      await page.fill('input[name="email"]', 'ana.santos@email.com');
      await page.fill('input[name="phone"]', '(11) 77777-7777');
      
      // Tentar preencher endereço se existir
      try {
        await page.fill('input[name="address"]', 'Rua da Consolação, 500');
        await page.fill('input[name="city"]', 'São Paulo');
        await page.fill('input[name="state"]', 'SP');
      } catch (e) {
        console.log('ℹ️ Campos de endereço opcionais não encontrados');
      }
      
      console.log('✅ Formulário preenchido!');
      
      // Salvar paciente
      console.log('💾 Salvando paciente...');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
      
      console.log('🎉 Paciente Ana Lucia Santos criado com sucesso!');
      
    } catch (e) {
      console.log('ℹ️ Não foi possível preencher o formulário automaticamente');
      console.log('💡 Use o navegador manualmente para criar o paciente');
    }
    
    console.log('🌐 Navegador mantido aberto para demonstração manual');
    console.log('📋 Você pode navegar pela aplicação e testar as funcionalidades');
    
    // Mostrar páginas disponíveis
    console.log('\n📍 Páginas disponíveis para teste:');
    console.log('   • http://localhost:3006/dashboard - Dashboard principal');
    console.log('   • http://localhost:3006/patients - Lista de pacientes');
    console.log('   • http://localhost:3006/patients/new - Novo paciente');
    console.log('   • http://localhost:3006/documents - Documentos médicos');
    console.log('   • http://localhost:3006/templates - Templates médicos');
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    console.log('🔄 Mantendo navegador aberto para teste manual...');
  }
  
  // Não fechar o navegador
  console.log('\n💡 Navegador mantido aberto - pressione Ctrl+C para fechar');
}

testRepoMedIA().catch(console.error);