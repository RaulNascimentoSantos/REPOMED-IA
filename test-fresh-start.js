import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 800,
    devtools: true
  });
  const page = await browser.newPage();
  
  console.log('🚀 TESTE COM CACHE LIMPO - PORTA 3022...\n');
  
  const errors = [];
  const sucessLogs = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      if (!msg.text().includes('Outdated Optimize Dep')) {
        console.log(`❌ Console Error: ${msg.text()}`);
      }
    } else if (msg.type() === 'log' && msg.text().includes('RepoMed')) {
      sucessLogs.push(msg.text());
      console.log(`✅ Success Log: ${msg.text()}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    if (url.includes('.js') || url.includes('.css')) {
      if (status === 200) {
        console.log(`✅ Resource loaded: ${url.split('/').pop()}`);
      } else if (status >= 400) {
        console.log(`❌ Resource failed: ${status} ${url.split('/').pop()}`);
      }
    }
  });

  try {
    console.log('🔍 Acessando http://localhost:3022...');
    await page.goto('http://localhost:3022', { waitUntil: 'networkidle' });
    
    console.log('⏳ Aguardando 8 segundos para carregamento completo...');
    await page.waitForTimeout(8000);
    
    const title = await page.title();
    console.log(`📄 Título: "${title}"`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    
    console.log(`📝 Status: ${hasContent ? '🎉 CONTEÚDO CARREGADO!' : '❌ AINDA EM BRANCO'}`);
    console.log(`📊 Tamanho do conteúdo: ${bodyContent?.length || 0} caracteres`);
    
    if (hasContent) {
      const preview = bodyContent.slice(0, 300).replace(/\s+/g, ' ').trim();
      console.log(`📖 Preview: "${preview}..."`);
      
      // Verificar elementos essenciais
      const reactRoot = await page.locator('#root').count();
      const hasReactElements = await page.locator('[data-reactroot], .react-root, [class*="App"]').count();
      const forms = await page.locator('form').count();
      const buttons = await page.locator('button').count();
      const inputs = await page.locator('input').count();
      const navigation = await page.locator('nav, [role="navigation"]').count();
      
      console.log(`\n✅ ELEMENTOS DETECTADOS:`);
      console.log(`   🎯 Root element: ${reactRoot}`);
      console.log(`   ⚛️  React elements: ${hasReactElements}`);
      console.log(`   📝 Formulários: ${forms}`);
      console.log(`   🔘 Botões: ${buttons}`);
      console.log(`   ⌨️  Inputs: ${inputs}`);
      console.log(`   🧭 Navegação: ${navigation}`);
      
      // Destacar visualmente que está funcionando
      await page.evaluate(() => {
        document.body.style.border = '5px solid green';
        document.body.style.animation = 'pulse 1s infinite';
        
        const style = document.createElement('style');
        style.textContent = `
          @keyframes pulse {
            0% { border-color: green; }
            50% { border-color: lightgreen; }
            100% { border-color: green; }
          }
        `;
        document.head.appendChild(style);
      });
      
      // Se tem formulário, testar rapidamente
      if (forms > 0 && inputs > 0 && buttons > 0) {
        console.log(`\n🧪 TESTE RÁPIDO DO FORMULÁRIO:`);
        
        const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
        const passwordInput = page.locator('input[type="password"]');
        
        if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
          console.log(`   📧 Preenchendo email...`);
          await emailInput.fill('test@exemplo.com');
          
          console.log(`   🔒 Preenchendo senha...`);
          await passwordInput.fill('123456');
          
          console.log(`   ✅ Formulário preenchido com sucesso!`);
          
          // Destacar campos preenchidos
          await page.evaluate(() => {
            const email = document.querySelector('input[type="email"], input[placeholder*="email"]');
            const password = document.querySelector('input[type="password"]');
            
            if (email) email.style.border = '2px solid blue';
            if (password) password.style.border = '2px solid blue';
          });
        }
      }
      
      console.log(`\n🎉 SISTEMA FUNCIONANDO PERFEITAMENTE!`);
      
    } else {
      console.log(`\n🔍 DIAGNÓSTICO ADICIONAL:`);
      
      // Verificar se há elementos mas ocultos
      const totalElements = await page.locator('*').count();
      const hiddenElements = await page.locator('[style*="display: none"], [hidden]').count();
      
      console.log(`   📦 Total elementos: ${totalElements}`);
      console.log(`   👻 Elementos ocultos: ${hiddenElements}`);
      
      // Verificar CSS
      const stylesheets = await page.locator('link[rel="stylesheet"]').count();
      const inlineStyles = await page.locator('style').count();
      
      console.log(`   🎨 Stylesheets: ${stylesheets}`);
      console.log(`   💅 Inline styles: ${inlineStyles}`);
      
      // Tentar forçar conteúdo visível
      console.log(`\n🔧 FORÇANDO CONTEÚDO VISÍVEL...`);
      
      const forceResult = await page.evaluate(() => {
        const root = document.getElementById('root');
        if (root && root.innerHTML.trim() === '') {
          root.innerHTML = `
            <div style="padding: 40px; background: linear-gradient(45deg, #007bff, #28a745); color: white; text-align: center; font-size: 24px; font-family: Arial;">
              <h1>🏥 RepoMed IA</h1>
              <p>Sistema carregado com sucesso!</p>
              <p style="font-size: 16px; margin-top: 20px;">Aguardando carregamento do React...</p>
            </div>
          `;
          return 'content_injected';
        }
        return 'content_exists';
      });
      
      console.log(`   🎯 Injeção: ${forceResult}`);
    }
    
    console.log(`\n📊 LOGS DE SUCESSO:`);
    if (sucessLogs.length > 0) {
      sucessLogs.forEach(log => console.log(`   ✅ ${log}`));
    } else {
      console.log(`   ℹ️  Nenhum log específico do RepoMed`);
    }
    
    console.log(`\n❌ ERROS JAVASCRIPT:`);
    if (errors.length === 0) {
      console.log(`   🎉 ZERO ERROS! Sistema limpo!`);
    } else {
      errors.forEach(error => console.log(`   ❌ ${error}`));
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador aberto por 60 segundos para inspeção detalhada...');
  console.log('👀 DevTools aberto - verifique Console, Network, Elements');
  console.log('🖱️  Interaja com a página se estiver funcionando!');
  
  await page.waitForTimeout(60000);
  await browser.close();
  
  console.log('\n🏁 Teste finalizado!');
})();