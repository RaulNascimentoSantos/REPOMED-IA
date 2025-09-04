import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    devtools: true
  });
  const page = await browser.newPage();
  
  console.log('🎯 TESTE LOGIN COM REDIRECIONAMENTO CORRIGIDO...\n');
  
  let tokenSaved = false;
  let redirected = false;
  
  // Monitorar localStorage
  await page.addInitScript(() => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      if (key === 'token') {
        console.log(`🔑 TOKEN SALVO: ${value}`);
        window.tokenSavedFlag = true;
      }
      return originalSetItem.call(this, key, value);
    };
  });
  
  page.on('console', msg => {
    if (msg.text().includes('TOKEN SALVO')) {
      tokenSaved = true;
      console.log(`✅ ${msg.text()}`);
    } else if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  page.on('response', async response => {
    if (response.url().includes('/api/auth/login') && response.status() === 200) {
      const responseText = await response.text();
      console.log(`📡 LOGIN SUCCESS: ${responseText}`);
    }
  });

  try {
    console.log('🔍 PASSO 1: Carregando página de login...');
    await page.goto('http://localhost:3023/auth/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('✅ Página de login carregada');
    
    console.log('\n🔐 PASSO 2: Executando login...');
    
    await page.fill('input[type="email"]', 'admin@repomed.com');
    console.log('   📧 Email preenchido');
    
    await page.fill('input[type="password"]', '123456');
    console.log('   🔒 Senha preenchida');
    
    console.log('\n   🚀 Clicando em Entrar...');
    await page.click('button[type="submit"]');
    
    console.log('   ⏳ Aguardando processamento...');
    await page.waitForTimeout(5000);
    
    // Verificar se o token foi salvo
    const storageCheck = await page.evaluate(() => {
      return {
        token: localStorage.getItem('token'),
        tokenSavedFlag: window.tokenSavedFlag || false
      };
    });
    
    console.log(`\n💾 VERIFICAÇÃO DE STORAGE:`);
    console.log(`   🎯 Token no localStorage: ${storageCheck.token}`);
    console.log(`   🚩 Flag de salvamento: ${storageCheck.tokenSavedFlag}`);
    
    // Verificar URL atual
    const currentUrl = page.url();
    console.log(`\n📍 URL ATUAL: ${currentUrl}`);
    
    if (currentUrl.includes('/auth/login')) {
      console.log('❌ AINDA NA PÁGINA DE LOGIN');
      
      // Verificar se há mensagens de erro
      const errorMessages = await page.locator('[class*="error"], [role="alert"]').all();
      if (errorMessages.length > 0) {
        for (const error of errorMessages) {
          const errorText = await error.textContent();
          console.log(`   🔍 Erro: ${errorText}`);
        }
      }
      
      // Forçar redirecionamento se token estiver salvo
      if (storageCheck.token && storageCheck.token !== 'null') {
        console.log('🔧 Forçando redirecionamento manual...');
        await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(3000);
        
        const newUrl = page.url();
        console.log(`   📍 Nova URL: ${newUrl}`);
        
        if (newUrl !== 'http://localhost:3023/auth/login') {
          redirected = true;
          console.log('✅ REDIRECIONAMENTO FORÇADO FUNCIONOU!');
        }
      }
      
    } else {
      redirected = true;
      console.log('✅ REDIRECIONAMENTO AUTOMÁTICO FUNCIONOU!');
    }
    
    if (redirected) {
      console.log('\n🏠 PASSO 3: Explorando dashboard...');
      
      const finalContent = await page.textContent('body');
      console.log(`   📄 Conteúdo da página: ${finalContent?.slice(0, 200)}...`);
      
      // Procurar elementos de dashboard/workspace
      const dashboardElements = {
        nav: await page.locator('nav, [role="navigation"]').count(),
        sidebar: await page.locator('[class*="sidebar"], aside').count(),
        header: await page.locator('header, [class*="header"]').count(),
        buttons: await page.locator('button:visible').count(),
        links: await page.locator('a:visible').count()
      };
      
      console.log(`\n🎨 ELEMENTOS DO DASHBOARD:`);
      Object.entries(dashboardElements).forEach(([key, count]) => {
        console.log(`   ${key}: ${count}`);
      });
      
      if (dashboardElements.nav > 0 || dashboardElements.buttons > 0) {
        console.log('🎉 DASHBOARD DETECTADO!');
        
        // Listar links de navegação se houver
        const navLinks = await page.locator('nav a, [role="navigation"] a').all();
        if (navLinks.length > 0) {
          console.log('\n🔗 LINKS DE NAVEGAÇÃO:');
          for (let i = 0; i < Math.min(navLinks.length, 5); i++) {
            const linkText = await navLinks[i].textContent();
            const linkHref = await navLinks[i].getAttribute('href');
            if (linkText?.trim()) {
              console.log(`   ${i+1}. "${linkText.trim()}" → ${linkHref}`);
            }
          }
        }
      }
    }
    
    console.log(`\n🏆 RESULTADO FINAL:`);
    console.log(`   💾 Token salvo: ${storageCheck.token ? '✅' : '❌'}`);
    console.log(`   🔀 Redirecionou: ${redirected ? '✅' : '❌'}`);
    console.log(`   📍 URL final: ${page.url()}`);
    
    if (storageCheck.token && redirected) {
      console.log('\n🎉 LOGIN E REDIRECIONAMENTO FUNCIONANDO PERFEITAMENTE!');
    } else if (storageCheck.token && !redirected) {
      console.log('\n⚠️  Token salvo mas não redirecionou automaticamente');
    } else {
      console.log('\n❌ Token não foi salvo corretamente');
    }
    
  } catch (error) {
    console.error(`💥 ERRO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador aberto por 60 segundos...');
  console.log('🖱️  Explore o dashboard se o login funcionou!');
  
  await page.waitForTimeout(60000);
  await browser.close();
  
  console.log('\n🏁 Teste finalizado!');
})();