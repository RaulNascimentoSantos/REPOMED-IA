import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    devtools: true
  });
  const page = await browser.newPage();
  
  console.log('🎯 TESTE LOGIN COM CORS CORRIGIDO - Porto 3023 -> 8090...\n');
  
  const errors = [];
  let loginSuccess = false;
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      if (!msg.text().includes('CORS policy')) {
        console.log(`❌ Console Error: ${msg.text()}`);
      } else {
        console.log(`🚫 CORS Error: ${msg.text()}`);
      }
    } else if (msg.type() === 'log' && msg.text().includes('RepoMed')) {
      console.log(`✅ App Log: ${msg.text()}`);
    }
  });

  page.on('request', request => {
    if (request.url().includes('/api/auth/login')) {
      console.log(`📡 LOGIN REQUEST: ${request.method()} ${request.url()}`);
      console.log(`   📤 Data: ${request.postData()}`);
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/auth/login')) {
      console.log(`📡 LOGIN RESPONSE: ${response.status()} ${response.url()}`);
      
      if (response.status() === 200) {
        loginSuccess = true;
        const responseBody = await response.text();
        console.log(`   ✅ Success! Body: ${responseBody}`);
      } else {
        console.log(`   ❌ Failed with status ${response.status()}`);
      }
    }
  });

  try {
    console.log('🔍 PASSO 1: Acessando frontend na porta 3023...');
    await page.goto('http://localhost:3023', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`📄 Título: "${title}"`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    
    if (!hasContent) {
      console.log('❌ Página não carregou conteúdo. Encerrando teste.');
      await browser.close();
      return;
    }
    
    console.log('✅ Página carregada com conteúdo!');
    
    console.log('\n🔐 PASSO 2: Executando login...');
    
    const emailField = page.locator('input[type="email"], input[placeholder*="email"]');
    const passwordField = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")');
    
    console.log(`   📧 Campo email: ${await emailField.count() > 0 ? '✅' : '❌'}`);
    console.log(`   🔒 Campo senha: ${await passwordField.count() > 0 ? '✅' : '❌'}`);
    console.log(`   🔘 Botão enviar: ${await submitButton.count() > 0 ? '✅' : '❌'}`);
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      console.log('\n   📝 Preenchendo formulário...');
      
      await emailField.fill('admin@repomed.com');
      console.log('   ✅ Email preenchido');
      
      await passwordField.fill('123456');
      console.log('   ✅ Senha preenchida');
      
      console.log('\n   🚀 Enviando login...');
      await submitButton.click();
      
      console.log('   ⏳ Aguardando resposta (10 segundos)...');
      await page.waitForTimeout(10000);
      
      const currentUrl = page.url();
      console.log(`   📍 URL atual: ${currentUrl}`);
      
      if (loginSuccess) {
        console.log('\n🎉 LOGIN REALIZADO COM SUCESSO!');
        
        if (!currentUrl.includes('/auth/login')) {
          console.log('✅ Redirecionamento funcionou!');
          
          // Verificar elementos do dashboard
          const dashboardElements = await page.locator('nav, [role="navigation"], [class*="dashboard"]').count();
          console.log(`   📊 Elementos de dashboard: ${dashboardElements}`);
          
          if (dashboardElements > 0) {
            console.log('🏠 Dashboard carregado com sucesso!');
            
            // Listar links disponíveis
            const navLinks = await page.locator('nav a, [role="navigation"] a').all();
            console.log(`   🔗 Links de navegação encontrados: ${navLinks.length}`);
            
            for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
              const linkText = await navLinks[i].textContent();
              if (linkText?.trim()) {
                console.log(`      ${i+1}. "${linkText.trim()}"`);
              }
            }
          }
        }
        
      } else {
        console.log('\n❌ Login falhou ou não retornou sucesso');
        
        // Verificar mensagens de erro na tela
        const errorMessages = await page.locator('[class*="error"], [role="alert"], .text-red').all();
        if (errorMessages.length > 0) {
          console.log('   🔍 Mensagens de erro encontradas:');
          for (const errorEl of errorMessages) {
            const errorText = await errorEl.textContent();
            if (errorText?.trim()) {
              console.log(`      • ${errorText.trim()}`);
            }
          }
        }
      }
    }
    
    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`   🎯 Login bem-sucedido: ${loginSuccess ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   ❌ Erros JavaScript: ${errors.length}`);
    
    if (errors.length > 0) {
      errors.forEach(error => console.log(`      • ${error}`));
    }
    
    if (loginSuccess && errors.length === 0) {
      console.log('\n🏆 SISTEMA FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Frontend carregado');
      console.log('✅ Backend respondendo');
      console.log('✅ CORS configurado');
      console.log('✅ Login funcional');
      console.log('✅ Zero erros');
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador aberto por 45 segundos...');
  console.log('🖱️  Explore a interface se o login funcionou!');
  
  await page.waitForTimeout(45000);
  await browser.close();
  
  console.log('\n🏁 Teste finalizado!');
})();