import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Testando frontend com Buffer fix na porta 3015...\n');
  
  const errors = [];
  const warnings = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warn') {
      warnings.push(msg.text());
    }
  });

  try {
    console.log('📍 Acessando http://localhost:3015...');
    await page.goto('http://localhost:3015', { waitUntil: 'networkidle' });
    await page.waitForTimeout(6000); // Aguardar 6s para garantir que carregou
    
    const title = await page.title();
    console.log(`📄 Título: ${title}`);
    
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️  React root: ${reactRoot > 0 ? 'SIM' : 'NÃO'}`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    console.log(`📝 Conteúdo: ${hasContent ? 'COM CONTEÚDO' : 'EM BRANCO'}`);
    
    if (hasContent) {
      console.log(`📝 Preview: "${bodyContent.slice(0, 150).replace(/\s+/g, ' ')}..."`);
      
      // Verificar elementos específicos do RepoMed
      const nav = await page.locator('nav, [role="navigation"]').count();
      const sidebar = await page.locator('[class*="sidebar"], [class*="menu"]').count();
      const header = await page.locator('header, [class*="header"]').count();
      const buttons = await page.locator('button').count();
      const links = await page.locator('a').count();
      const forms = await page.locator('form').count();
      const inputs = await page.locator('input').count();
      
      console.log(`\n🎨 Elementos da interface:`);
      console.log(`   📍 Header: ${header}`);
      console.log(`   🧭 Navegação: ${nav}`);
      console.log(`   📋 Sidebar: ${sidebar}`);
      console.log(`   🔘 Botões: ${buttons}`);
      console.log(`   🔗 Links: ${links}`);
      console.log(`   📝 Formulários: ${forms}`);
      console.log(`   ⌨️  Inputs: ${inputs}`);
      
      // Tentar detectar texto específico do RepoMed
      const repomedText = await page.locator('text=/RepoMed|Documentos|Pacientes|Templates/i').count();
      console.log(`   🏥 Elementos RepoMed: ${repomedText}`);
      
    } else {
      // Se estiver em branco, tentar verificar o que há no DOM
      const htmlContent = await page.content();
      console.log(`🔍 HTML length: ${htmlContent.length} chars`);
      
      const scripts = await page.locator('script').count();
      const stylesheets = await page.locator('link[rel="stylesheet"]').count();
      console.log(`📜 Scripts: ${scripts}, CSS: ${stylesheets}`);
    }
    
    console.log(`\n⚠️  Warnings: ${warnings.length}`);
    
    console.log('\n📊 RESULTADO FINAL:');
    if (errors.length === 0 && hasContent) {
      console.log('🎉 SUCESSO TOTAL! Frontend funcionando perfeitamente!');
      console.log('✅ Sem erros JavaScript');
      console.log('✅ Conteúdo carregado');
      console.log('✅ React funcionando');
    } else if (errors.length === 0 && !hasContent) {
      console.log('⚠️  PARCIAL: Sem erros, mas página em branco');
      console.log('ℹ️  Possível problema de CSS ou renderização');
    } else {
      console.log(`❌ FALHA: ${errors.length} erros encontrados:`);
      errors.forEach(error => console.log(`   • ${error}`));
    }
    
  } catch (error) {
    console.error(`💥 Erro crítico: ${error.message}`);
  }
  
  await page.waitForTimeout(5000); // Deixar aberto para visualização
  await browser.close();
})();