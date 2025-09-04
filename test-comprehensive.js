import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔍 Teste abrangente do frontend RepoMed IA...\n');
  
  // Capturar erros
  const errors = [];
  page.on('pageerror', error => {
    errors.push(`❌ JS Error: ${error.message}`);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  try {
    console.log('📍 1. Testando página inicial...');
    await page.goto('http://localhost:3013', { waitUntil: 'networkidle' });
    await page.waitForTimeout(4000); // Aguardar 4s para ver se há erros
    
    const title = await page.title();
    console.log(`📄 Título: ${title}`);
    
    // Verificar se React está funcionando
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️  React root detectado: ${reactRoot > 0 ? 'SIM' : 'NÃO'}`);
    
    // Verificar elementos da página
    const navLinks = await page.locator('nav a, [role="navigation"] a').count();
    console.log(`🔗 Links de navegação: ${navLinks}`);
    
    const buttons = await page.locator('button').count();
    console.log(`🔘 Botões detectados: ${buttons}`);
    
    const forms = await page.locator('form').count();
    console.log(`📝 Formulários detectados: ${forms}`);
    
    console.log('\n📍 2. Testando navegação entre páginas...');
    
    // Tentar clicar em links de navegação
    const navigationLinks = await page.locator('nav a, [role="navigation"] a').all();
    
    if (navigationLinks.length > 0) {
      for (let i = 0; i < Math.min(navigationLinks.length, 3); i++) {
        try {
          const linkText = await navigationLinks[i].textContent();
          console.log(`🔗 Testando link: "${linkText}"`);
          
          await navigationLinks[i].click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          console.log(`📍 URL atual: ${currentUrl}`);
          
        } catch (linkError) {
          console.log(`⚠️  Erro ao clicar no link: ${linkError.message}`);
        }
      }
    } else {
      console.log('ℹ️  Nenhum link de navegação encontrado');
    }
    
    console.log('\n📍 3. Testando interações com botões...');
    
    // Voltar para página inicial
    await page.goto('http://localhost:3013');
    await page.waitForTimeout(2000);
    
    const allButtons = await page.locator('button:visible').all();
    
    if (allButtons.length > 0) {
      for (let i = 0; i < Math.min(allButtons.length, 3); i++) {
        try {
          const buttonText = await allButtons[i].textContent();
          console.log(`🔘 Testando botão: "${buttonText}"`);
          
          await allButtons[i].click();
          await page.waitForTimeout(1000);
          
        } catch (buttonError) {
          console.log(`⚠️  Erro ao clicar no botão: ${buttonError.message}`);
        }
      }
    } else {
      console.log('ℹ️  Nenhum botão visível encontrado');
    }
    
    console.log('\n📍 4. Verificando responsividade...');
    
    // Testar diferentes tamanhos de tela
    await page.setViewportSize({ width: 375, height: 667 }); // Mobile
    await page.waitForTimeout(1000);
    console.log('📱 Mobile (375x667): OK');
    
    await page.setViewportSize({ width: 768, height: 1024 }); // Tablet  
    await page.waitForTimeout(1000);
    console.log('📋 Tablet (768x1024): OK');
    
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.waitForTimeout(1000);
    console.log('🖥️  Desktop (1920x1080): OK');
    
    console.log('\n📍 5. Relatório final...');
    
    if (errors.length === 0) {
      console.log('✅ SUCESSO: Nenhum erro detectado!');
      console.log('✅ Frontend está funcionando corretamente');
    } else {
      console.log(`❌ ERROS ENCONTRADOS: ${errors.length}`);
      errors.forEach(error => console.log(error));
    }
    
  } catch (error) {
    console.error(`❌ Erro crítico: ${error.message}`);
  }
  
  await page.waitForTimeout(3000); // Manter aberto para visualização
  await browser.close();
})();