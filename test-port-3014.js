import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testando frontend limpo na porta 3014...\n');
  
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  try {
    console.log('📍 Acessando http://localhost:3014...');
    await page.goto('http://localhost:3014', { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000); // Aguardar 5s
    
    const title = await page.title();
    console.log(`📄 Título: ${title}`);
    
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️  React root: ${reactRoot > 0 ? 'SIM' : 'NÃO'}`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    console.log(`📝 Conteúdo da página: ${hasContent ? 'COM CONTEÚDO' : 'EM BRANCO'}`);
    
    if (hasContent) {
      console.log(`📝 Primeiros 100 chars: "${bodyContent.slice(0, 100)}..."`);
      
      // Verificar elementos da interface
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      const forms = await page.locator('form').count();
      const inputs = await page.locator('input').count();
      
      console.log(`🔘 Botões: ${buttons}`);
      console.log(`🔗 Links: ${links}`);
      console.log(`📝 Formulários: ${forms}`);
      console.log(`⌨️  Inputs: ${inputs}`);
    }
    
    console.log('\n📊 RESULTADO:');
    if (errors.length === 0 && hasContent) {
      console.log('✅ SUCESSO: Frontend funcionando sem erros!');
    } else if (errors.length > 0) {
      console.log(`❌ ERRO: ${errors.length} erros JavaScript encontrados:`);
      errors.forEach(error => console.log(`   • ${error}`));
    } else {
      console.log('⚠️  AVISO: Página em branco ou sem conteúdo');
    }
    
  } catch (error) {
    console.error(`❌ Erro crítico: ${error.message}`);
  }
  
  await page.waitForTimeout(3000);
  await browser.close();
})();