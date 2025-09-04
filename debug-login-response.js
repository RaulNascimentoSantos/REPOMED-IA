import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true
  });
  const page = await browser.newPage();
  
  console.log('🔍 DEBUG RESPOSTA DO LOGIN...\n');
  
  page.on('response', async response => {
    if (response.url().includes('/api/auth/login') && response.status() === 200) {
      console.log('📡 LOGIN RESPONSE INTERCEPTED:');
      
      const responseText = await response.text();
      console.log(`   📥 Response raw: ${responseText}`);
      
      try {
        const responseJson = JSON.parse(responseText);
        console.log(`   📦 Response parsed:`, responseJson);
        console.log(`   🎯 Token field: ${responseJson.token}`);
        console.log(`   👤 User field: ${responseJson.user || 'undefined'}`);
      } catch (e) {
        console.log(`   ❌ Failed to parse JSON: ${e.message}`);
      }
    }
  });

  // Interceptar localStorage para ver se o token está sendo salvo
  await page.addInitScript(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === 'token' || key === 'authToken') {
        console.log(`🔑 LocalStorage SET: ${key} = ${value}`);
      }
      return originalSetItem.call(this, key, value);
    };
    
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = function(key) {
      const result = originalGetItem.call(this, key);
      if (key === 'token' || key === 'authToken') {
        console.log(`🔑 LocalStorage GET: ${key} = ${result}`);
      }
      return result;
    };
  });

  try {
    console.log('🔍 Acessando página de login...');
    await page.goto('http://localhost:3023', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('\n🔐 Executando login...');
    
    await page.fill('input[type="email"]', 'admin@repomed.com');
    await page.fill('input[type="password"]', '123456');
    
    console.log('📤 Enviando formulário...');
    await page.click('button[type="submit"]');
    
    console.log('⏳ Aguardando 8 segundos...');
    await page.waitForTimeout(8000);
    
    // Verificar estado do localStorage manualmente
    const tokenInStorage = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        authToken: localStorage.getItem('authToken'),
        allKeys: Object.keys(localStorage),
        allEntries: Object.entries(localStorage)
      };
    });
    
    console.log('\n💾 ESTADO DO LOCALSTORAGE:');
    console.log(`   🎯 token: ${tokenInStorage.token}`);
    console.log(`   🎯 authToken: ${tokenInStorage.authToken}`);
    console.log(`   📋 All keys: ${tokenInStorage.allKeys.join(', ')}`);
    console.log(`   📋 All entries:`, tokenInStorage.allEntries);
    
    // Verificar se o componente considera o usuário autenticado
    const authStatus = await page.evaluate(() => {
      // Tentar acessar o estado do React
      const reactFiberKey = Object.keys(window).find(key => 
        key.startsWith('__REACT_DEVTOOLS_GLOBAL_HOOK__')
      );
      
      return {
        url: window.location.href,
        title: document.title,
        hasAuthenticatedElements: document.querySelectorAll('[data-authenticated="true"], .dashboard, .workspace').length,
        bodyContent: document.body.textContent?.slice(0, 200)
      };
    });
    
    console.log('\n🔍 STATUS DA AUTENTICAÇÃO:');
    console.log(`   📍 URL atual: ${authStatus.url}`);
    console.log(`   📄 Title: ${authStatus.title}`);
    console.log(`   🏠 Elementos autenticados: ${authStatus.hasAuthenticatedElements}`);
    console.log(`   📝 Conteúdo: ${authStatus.bodyContent}...`);
    
    if (authStatus.url.includes('/auth/login')) {
      console.log('\n❌ AINDA NA PÁGINA DE LOGIN');
      console.log('🔧 Possíveis problemas:');
      console.log('   • Token não está sendo salvo no localStorage');
      console.log('   • Hook useAuth não está detectando o token');
      console.log('   • Estrutura da resposta da API está incorreta');
    } else {
      console.log('\n✅ LOGIN REDIRECIONOU COM SUCESSO!');
    }
    
  } catch (error) {
    console.error(`💥 ERRO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo aberto por 30 segundos...');
  await page.waitForTimeout(30000);
  await browser.close();
  
  console.log('\n🏁 Debug finalizado!');
})();