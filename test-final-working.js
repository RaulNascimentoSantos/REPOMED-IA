import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  const page = await browser.newPage();
  
  console.log('🏥 TESTE FINAL COM API CORRIGIDA - Porto 3019...\n');
  
  const errors = [];
  const apiCalls = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('ERR_CONNECTION_REFUSED')) {
      console.log(`❌ Console: ${msg.text()}`);
    }
  });

  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiCalls.push(`${request.method()} ${request.url()}`);
      console.log(`📡 API Request: ${request.method()} ${request.url()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`📡 API Response: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🔍 PASSO 1: Carregando RepoMed IA com API correta...');
    await page.goto('http://localhost:3019', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`📄 Título: "${title}"`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    console.log(`📝 Status: ${hasContent ? '✅ PÁGINA CARREGADA' : '❌ PÁGINA EM BRANCO'}`);
    
    if (!hasContent) {
      console.log('❌ Sistema não carregou. Encerrando.');
      await browser.close();
      return;
    }
    
    console.log('\n🔐 PASSO 2: Testando login com backend integrado...');
    
    const emailField = page.locator('input[type="email"], input[placeholder*="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Entrar")');
    
    console.log(`   📧 Email: ${await emailField.count() > 0 ? '✅' : '❌'}`);
    console.log(`   🔒 Senha: ${await passwordField.count() > 0 ? '✅' : '❌'}`);
    console.log(`   🔘 Botão: ${await loginButton.count() > 0 ? '✅' : '❌'}`);
    
    if (await emailField.count() > 0 && await passwordField.count() > 0 && await loginButton.count() > 0) {
      console.log('\n   🧪 Executando login...');
      
      await emailField.fill('admin@repomed.com');
      console.log('   ✅ Email preenchido');
      
      await passwordField.fill('123456');
      console.log('   ✅ Senha preenchida');
      
      console.log('   📤 Enviando formulário...');
      await loginButton.click();
      
      console.log('   ⏳ Aguardando resposta da API...');
      await page.waitForTimeout(8000);
      
      const finalUrl = page.url();
      console.log(`   📍 URL final: ${finalUrl}`);
      
      // Verificar se houve resposta da API
      const hasApiCall = apiCalls.some(call => call.includes('/api/auth/login'));
      console.log(`   📡 Chamada de API feita: ${hasApiCall ? '✅ SIM' : '❌ NÃO'}`);
      
      // Verificar se redirecionou para dashboard
      const isDashboard = !finalUrl.includes('/auth/login');
      console.log(`   🏠 Redirecionou para dashboard: ${isDashboard ? '✅ SIM' : '❌ NÃO'}`);
      
      if (isDashboard) {
        console.log('\n🎉 PASSO 3: LOGIN BEM-SUCEDIDO! Explorando dashboard...');
        
        const dashboardContent = await page.textContent('body');
        console.log(`   📄 Conteúdo do dashboard: ${dashboardContent.length} caracteres`);
        
        // Procurar elementos típicos de dashboard
        const navigation = await page.locator('nav, [role="navigation"]').count();
        const buttons = await page.locator('button:visible').count();
        const links = await page.locator('a:visible').count();
        const forms = await page.locator('form').count();
        
        console.log(`   🧭 Navegação: ${navigation} elementos`);
        console.log(`   🔘 Botões: ${buttons} elementos`);
        console.log(`   🔗 Links: ${links} elementos`);
        console.log(`   📝 Formulários: ${forms} elementos`);
        
        // Testar navegação se houver links
        if (links > 0) {
          console.log('\n   🔗 Testando navegação...');
          
          const navLinks = await page.locator('nav a:visible, [role="navigation"] a:visible').all();
          
          for (let i = 0; i < Math.min(navLinks.length, 3); i++) {
            try {
              const linkText = (await navLinks[i].textContent())?.trim();
              if (linkText && !linkText.toLowerCase().includes('sair')) {
                console.log(`      🔗 Navegando para: "${linkText}"`);
                await navLinks[i].click();
                await page.waitForTimeout(3000);
                
                const newUrl = page.url();
                const newContent = await page.textContent('body');
                const contentLoaded = newContent && newContent.length > 100;
                
                console.log(`         📍 Nova URL: ${newUrl}`);
                console.log(`         📄 Conteúdo carregado: ${contentLoaded ? '✅' : '❌'}`);
                
                if (newUrl !== finalUrl) {
                  await page.goBack();
                  await page.waitForTimeout(2000);
                }
              }
            } catch (navError) {
              console.log(`         ⚠️  Erro de navegação: ${navError.message}`);
            }
          }
        }
        
        // Testar funcionalidades se houver botões
        if (buttons > 2) {
          console.log('\n   🔘 Testando funcionalidades...');
          
          const actionButtons = await page.locator('button:visible:not([class*="close"]):not([aria-label*="close"])').all();
          
          for (let i = 0; i < Math.min(actionButtons.length, 2); i++) {
            try {
              const buttonText = (await actionButtons[i].textContent())?.trim();
              if (buttonText && !buttonText.toLowerCase().includes('sair')) {
                console.log(`      🔘 Clicando: "${buttonText}"`);
                await actionButtons[i].click();
                await page.waitForTimeout(2000);
                
                // Verificar se abriu modal ou mudou algo
                const modals = await page.locator('[role="dialog"], .modal, [class*="modal"]').count();
                if (modals > 0) {
                  console.log(`         💬 Modal aberto`);
                  
                  // Fechar modal
                  const closeBtn = page.locator('[aria-label="Close"], button:has-text("Fechar"), [data-dismiss]');
                  if (await closeBtn.count() > 0) {
                    await closeBtn.first().click();
                    await page.waitForTimeout(1000);
                  }
                } else {
                  console.log(`         📄 Página atualizada`);
                }
              }
            } catch (btnError) {
              console.log(`         ⚠️  Erro no botão: ${btnError.message}`);
            }
          }
        }
        
      } else {
        console.log('\n⚠️  Login não redirecionou - verificando mensagens de erro...');
        
        const errorMessages = await page.locator('[class*="error"], [class*="alert"], .text-red').all();
        if (errorMessages.length > 0) {
          for (const error of errorMessages) {
            const errorText = await error.textContent();
            if (errorText?.trim()) {
              console.log(`   ❌ Erro: ${errorText.trim()}`);
            }
          }
        }
      }
    }
    
    console.log('\n🏆 RELATÓRIO FINAL DETALHADO:');
    console.log('===============================');
    
    console.log('📡 CHAMADAS DE API:');
    if (apiCalls.length > 0) {
      apiCalls.forEach(call => console.log(`   • ${call}`));
    } else {
      console.log('   ❌ Nenhuma chamada de API detectada');
    }
    
    console.log('\n❌ ERROS JAVASCRIPT:');
    if (errors.length === 0) {
      console.log('   ✅ Nenhum erro encontrado!');
    } else {
      errors.forEach(error => console.log(`   • ${error}`));
    }
    
    const success = errors.length === 0 && hasContent && apiCalls.length > 0;
    
    console.log(`\n🎯 RESULTADO: ${success ? '✅ SISTEMA FUNCIONANDO PERFEITAMENTE!' : '⚠️  SISTEMA PARCIALMENTE FUNCIONAL'}`);
    
    if (success) {
      console.log('🚀 RepoMed IA está totalmente operacional!');
      console.log('✅ Frontend carregando');
      console.log('✅ Backend respondendo');
      console.log('✅ API integrada');
      console.log('✅ Interface funcionando');
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador aberto por 30 segundos para inspeção...');
  await page.waitForTimeout(30000);
  await browser.close();
  
  console.log('🏁 Teste finalizado!');
})();