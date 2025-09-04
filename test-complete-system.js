import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🏥 TESTE COMPLETO DO SISTEMA REPOMED IA - Frontend + Backend...\n');
  
  const errors = [];
  const networkErrors = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} - ${response.url()}`);
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('net::ERR_CONNECTION_REFUSED')) {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  try {
    console.log('🔍 ETAPA 1: Carregamento inicial...');
    await page.goto('http://localhost:3018', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📄 Título:', await page.title());
    
    const hasContent = (await page.textContent('body'))?.trim().length > 50;
    console.log(`📝 Conteúdo: ${hasContent ? '✅ Carregado' : '❌ Vazio'}`);
    
    if (!hasContent) {
      console.log('❌ Sistema não carregou. Encerrando teste.');
      return;
    }
    
    console.log('\n🔐 ETAPA 2: Teste de autenticação...');
    
    // Verificar formulário de login
    const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Entrar")');
    
    console.log(`   Email input: ${await emailInput.count() > 0 ? '✅' : '❌'}`);
    console.log(`   Password input: ${await passwordInput.count() > 0 ? '✅' : '❌'}`);
    console.log(`   Login button: ${await loginButton.count() > 0 ? '✅' : '❌'}`);
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      console.log('   🧪 Testando login...');
      
      await emailInput.fill('admin@repomed.com');
      await passwordInput.fill('123456');
      
      console.log('   📝 Credenciais preenchidas');
      
      // Interceptar requisições de API
      let apiCallMade = false;
      page.on('request', request => {
        if (request.url().includes('/api/auth/login')) {
          apiCallMade = true;
          console.log('   📡 Chamada API detectada:', request.url());
        }
      });
      
      await loginButton.click();
      await page.waitForTimeout(5000);
      
      console.log(`   🔗 API chamada: ${apiCallMade ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   📍 URL atual: ${page.url()}`);
      
      // Verificar se redirecionou ou se há dashboard
      const dashboardElements = await page.locator('[class*="dashboard"], [class*="workspace"], nav, sidebar').count();
      console.log(`   📊 Elementos do dashboard: ${dashboardElements > 0 ? '✅' : '❌'} (${dashboardElements})`);
      
      if (dashboardElements > 0) {
        console.log('\n📋 ETAPA 3: Explorando interface autenticada...');
        
        // Procurar por links de navegação
        const navLinks = await page.locator('nav a, [role="navigation"] a').all();
        console.log(`   🧭 Links de navegação: ${navLinks.length}`);
        
        // Testar alguns links se existirem
        for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
          try {
            const linkText = (await navLinks[i].textContent())?.trim() || '';
            if (linkText && !linkText.toLowerCase().includes('sair')) {
              console.log(`   🔗 Testando: "${linkText}"`);
              await navLinks[i].click();
              await page.waitForTimeout(2000);
              
              const newUrl = page.url();
              console.log(`      📍 Nova URL: ${newUrl}`);
              
              // Voltar para home se mudou
              if (newUrl !== 'http://localhost:3018/') {
                await page.goto('http://localhost:3018/');
                await page.waitForTimeout(1000);
              }
            }
          } catch (navError) {
            console.log(`      ⚠️  Erro na navegação: ${navError.message}`);
          }
        }
        
        console.log('\n📊 ETAPA 4: Testando funcionalidades...');
        
        // Procurar botões funcionais
        const buttons = await page.locator('button:visible').all();
        console.log(`   🔘 Botões disponíveis: ${buttons.length}`);
        
        // Testar alguns botões
        for (let i = 0; i < Math.min(buttons.length, 2); i++) {
          try {
            const buttonText = (await buttons[i].textContent())?.trim() || '';
            if (buttonText && !buttonText.toLowerCase().includes('sair')) {
              console.log(`   🔘 Testando botão: "${buttonText}"`);
              await buttons[i].click();
              await page.waitForTimeout(1000);
            }
          } catch (buttonError) {
            console.log(`      ⚠️  Erro no botão: ${buttonError.message}`);
          }
        }
      }
    }
    
    console.log('\n📡 ETAPA 5: Verificando conectividade com API...');
    
    // Testar endpoint direto da API
    try {
      const apiResponse = await page.evaluate(() => 
        fetch('/api/health').then(r => r.json()).catch(e => ({ error: e.message }))
      );
      console.log('   🔍 Health check:', apiResponse.error ? `❌ ${apiResponse.error}` : '✅ OK');
    } catch (apiError) {
      console.log('   🔍 Health check: ❌ Erro na requisição');
    }
    
    console.log('\n🏆 RELATÓRIO FINAL DO SISTEMA:');
    console.log('=====================================');
    
    const systemScore = {
      frontend: hasContent && errors.length === 0 ? 100 : 50,
      authentication: apiCallMade ? 100 : 0,
      navigation: dashboardElements > 0 ? 100 : 0,
      api: networkErrors.length < 3 ? 100 : 50
    };
    
    const totalScore = Object.values(systemScore).reduce((a, b) => a + b, 0) / 4;
    
    console.log(`🎯 PONTUAÇÃO TOTAL: ${totalScore.toFixed(1)}%`);
    console.log(`   Frontend: ${systemScore.frontend}%`);
    console.log(`   Auth: ${systemScore.authentication}%`);
    console.log(`   Navegação: ${systemScore.navigation}%`);
    console.log(`   API: ${systemScore.api}%`);
    
    if (totalScore >= 80) {
      console.log('\n🏆 SISTEMA EXCELENTE! RepoMed IA funcionando perfeitamente!');
    } else if (totalScore >= 60) {
      console.log('\n✅ SISTEMA BOM! Funcionalidades principais operacionais.');
    } else if (totalScore >= 40) {
      console.log('\n⚠️  SISTEMA PARCIAL. Alguns componentes precisam de ajustes.');
    } else {
      console.log('\n❌ SISTEMA COM PROBLEMAS. Requer manutenção.');
    }
    
    if (errors.length > 0) {
      console.log('\n⚠️  Erros encontrados:');
      errors.forEach(error => console.log(`   • ${error}`));
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 Erros de rede:');
      networkErrors.slice(0, 3).forEach(error => console.log(`   • ${error}`));
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO DO SISTEMA: ${error.message}`);
  }
  
  console.log('\n⏰ Finalizando em 6 segundos...');
  await page.waitForTimeout(6000);
  await browser.close();
  
  console.log('🏁 Teste completo do sistema finalizado!');
})();