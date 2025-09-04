import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    devtools: true
  });
  const page = await browser.newPage();
  
  console.log('🔍 DEBUG LOGIN NETWORK ERROR...\n');
  
  const networkRequests = [];
  const networkResponses = [];
  const errors = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  page.on('request', request => {
    networkRequests.push({
      method: request.method(),
      url: request.url(),
      headers: request.headers(),
      postData: request.postData()
    });
    
    if (request.url().includes('/api/')) {
      console.log(`📡 REQUEST: ${request.method()} ${request.url()}`);
      if (request.postData()) {
        console.log(`   📤 Data: ${request.postData()}`);
      }
    }
  });

  page.on('response', response => {
    networkResponses.push({
      url: response.url(),
      status: response.status(),
      headers: response.headers()
    });
    
    if (response.url().includes('/api/')) {
      console.log(`📡 RESPONSE: ${response.status()} ${response.url()}`);
      
      // Log response body for API calls
      response.text().then(text => {
        if (text && text.length < 500) {
          console.log(`   📥 Body: ${text}`);
        }
      }).catch(() => {});
    }
  });

  page.on('requestfailed', request => {
    console.log(`❌ REQUEST FAILED: ${request.method()} ${request.url()}`);
    console.log(`   🔥 Error: ${request.failure()?.errorText}`);
  });

  try {
    console.log('🔍 PASSO 1: Carregando página...');
    await page.goto('http://localhost:3022', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('\n🔐 PASSO 2: Testando login com monitoramento detalhado...');
    
    // Verificar se formulário está presente
    const emailField = page.locator('input[type="email"], input[placeholder*="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"], button:has-text("Entrar")');
    
    console.log(`   📧 Email field: ${await emailField.count()}`);
    console.log(`   🔒 Password field: ${await passwordField.count()}`);
    console.log(`   🔘 Login button: ${await loginButton.count()}`);
    
    if (await emailField.count() > 0 && await passwordField.count() > 0) {
      console.log('\n   📝 Preenchendo campos...');
      
      await emailField.fill('admin@repomed.com');
      await passwordField.fill('123456');
      
      console.log('   📤 Enviando formulário...');
      console.log('   ⏳ Monitorando requisições de rede...');
      
      // Interceptar especificamente a requisição de login
      let loginRequestMade = false;
      let loginResponse = null;
      
      page.on('request', request => {
        if (request.url().includes('/api/auth/login') && request.method() === 'POST') {
          loginRequestMade = true;
          console.log('🎯 LOGIN REQUEST INTERCEPTED!');
          console.log(`   URL: ${request.url()}`);
          console.log(`   Headers:`, JSON.stringify(request.headers(), null, 2));
          console.log(`   Body: ${request.postData()}`);
        }
      });
      
      page.on('response', response => {
        if (response.url().includes('/api/auth/login')) {
          loginResponse = response;
          console.log('🎯 LOGIN RESPONSE INTERCEPTED!');
          console.log(`   Status: ${response.status()}`);
          console.log(`   Headers:`, JSON.stringify(response.headers(), null, 2));
        }
      });
      
      await loginButton.click();
      
      console.log('   ⏰ Aguardando 10 segundos para capturar toda a comunicação...');
      await page.waitForTimeout(10000);
      
      console.log('\n📊 ANÁLISE DA REQUISIÇÃO DE LOGIN:');
      console.log(`   🎯 Login request made: ${loginRequestMade ? '✅' : '❌'}`);
      console.log(`   🎯 Login response received: ${loginResponse ? '✅' : '❌'}`);
      
      if (loginResponse) {
        const responseText = await loginResponse.text();
        console.log(`   📥 Response body: ${responseText}`);
      }
      
      // Verificar se há mensagens de erro na página
      const errorElements = await page.locator('[class*="error"], [class*="alert"], .text-red, [role="alert"]').all();
      if (errorElements.length > 0) {
        console.log('\n❌ ERROS NA PÁGINA:');
        for (const errorEl of errorElements) {
          const errorText = await errorEl.textContent();
          if (errorText?.trim()) {
            console.log(`   • ${errorText.trim()}`);
          }
        }
      }
      
      // Verificar URL atual
      const currentUrl = page.url();
      console.log(`\n📍 URL atual: ${currentUrl}`);
      
      if (currentUrl.includes('/auth/login')) {
        console.log('⚠️  Ainda na página de login - login falhou ou não redirecionou');
      } else {
        console.log('✅ Redirecionou - login pode ter funcionado');
      }
    }
    
    console.log('\n🌐 RESUMO DAS REQUISIÇÕES DE REDE:');
    const apiRequests = networkRequests.filter(req => req.url.includes('/api/'));
    
    console.log(`   📊 Total requests: ${networkRequests.length}`);
    console.log(`   📊 API requests: ${apiRequests.length}`);
    
    apiRequests.forEach((req, i) => {
      console.log(`   ${i+1}. ${req.method} ${req.url}`);
      if (req.postData) {
        console.log(`      Data: ${req.postData}`);
      }
    });
    
    const apiResponses = networkResponses.filter(res => res.url.includes('/api/'));
    console.log(`\n📡 API RESPONSES:`);
    apiResponses.forEach((res, i) => {
      console.log(`   ${i+1}. ${res.status} ${res.url}`);
    });
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador aberto por 30 segundos para análise...');
  console.log('👀 Verifique Network tab no DevTools!');
  
  await page.waitForTimeout(30000);
  await browser.close();
  
  console.log('\n🏁 Debug finalizado!');
})();