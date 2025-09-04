import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 // Adicionar delay para visualização
  });
  const page = await browser.newPage();
  
  console.log('🏥 TESTE AO VIVO - RepoMed IA - TELA VISÍVEL...\n');
  
  const errors = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console: ${msg.text()}`);
    } else if (msg.type() === 'log' && msg.text().includes('RepoMed')) {
      console.log(`📋 Log: ${msg.text()}`);
    }
  });

  page.on('response', response => {
    if (response.url().includes('/api/')) {
      console.log(`📡 API: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🔍 PASSO 1: Abrindo RepoMed IA...');
    await page.goto('http://localhost:3018', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const title = await page.title();
    console.log(`📄 Título: "${title}"`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    console.log(`📝 Status: ${hasContent ? '✅ CARREGOU' : '❌ PÁGINA EM BRANCO'}`);
    
    if (hasContent) {
      const preview = bodyContent.slice(0, 200).replace(/\s+/g, ' ').trim();
      console.log(`📖 Conteúdo: "${preview}..."`);
      
      console.log('\n🔐 PASSO 2: Testando formulário de login...');
      
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"], button:has-text("Entrar")');
      
      const hasEmail = await emailInput.count() > 0;
      const hasPassword = await passwordInput.count() > 0;
      const hasSubmit = await submitButton.count() > 0;
      
      console.log(`   📧 Campo Email: ${hasEmail ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   🔒 Campo Senha: ${hasPassword ? '✅ Presente' : '❌ Ausente'}`);
      console.log(`   🔘 Botão Login: ${hasSubmit ? '✅ Presente' : '❌ Ausente'}`);
      
      if (hasEmail && hasPassword && hasSubmit) {
        console.log('\n   🧪 Preenchendo formulário...');
        
        // Destacar campos visualmente
        await page.evaluate(() => {
          const emailField = document.querySelector('input[type="email"], input[placeholder*="email"]');
          const passwordField = document.querySelector('input[type="password"]');
          if (emailField) emailField.style.border = '3px solid #00ff00';
          if (passwordField) passwordField.style.border = '3px solid #00ff00';
        });
        
        await page.waitForTimeout(1000);
        
        await emailInput.fill('admin@repomed.com');
        console.log('   ✅ Email preenchido: admin@repomed.com');
        
        await passwordInput.fill('123456');
        console.log('   ✅ Senha preenchida: 123456');
        
        await page.waitForTimeout(1000);
        
        console.log('\n   🚀 Clicando no botão de login...');
        await submitButton.click();
        
        console.log('   ⏳ Aguardando resposta do servidor...');
        await page.waitForTimeout(5000);
        
        const currentUrl = page.url();
        console.log(`   📍 URL após login: ${currentUrl}`);
        
        // Verificar se mudou de página ou se há dashboard
        const dashboardIndicators = [
          'nav a, [role="navigation"] a',
          '[class*="dashboard"], [class*="workspace"]', 
          '[class*="sidebar"], [class*="menu"]',
          'button:has-text("Sair"), button:has-text("Logout")'
        ];
        
        let dashboardFound = false;
        for (const selector of dashboardIndicators) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            dashboardFound = true;
            console.log(`   📊 Dashboard detectado: ${selector} (${count} elementos)`);
          }
        }
        
        if (dashboardFound) {
          console.log('\n🎉 PASSO 3: Explorando interface autenticada...');
          
          // Listar todos os links disponíveis
          const allLinks = await page.locator('a:visible').all();
          console.log(`   🔗 Links encontrados: ${allLinks.length}`);
          
          for (let i = 0; i < Math.min(allLinks.length, 5); i++) {
            const linkText = (await allLinks[i].textContent())?.trim() || '';
            const linkHref = await allLinks[i].getAttribute('href');
            if (linkText) {
              console.log(`      ${i+1}. "${linkText}" → ${linkHref}`);
            }
          }
          
          // Testar navegação em alguns links
          console.log('\n   🧭 Testando navegação...');
          for (let i = 0; i < Math.min(allLinks.length, 3); i++) {
            const linkText = (await allLinks[i].textContent())?.trim() || '';
            if (linkText && !linkText.toLowerCase().includes('sair') && !linkText.toLowerCase().includes('logout')) {
              try {
                console.log(`      🔗 Clicando em: "${linkText}"`);
                await allLinks[i].click();
                await page.waitForTimeout(2000);
                
                const newUrl = page.url();
                console.log(`         📍 Nova URL: ${newUrl}`);
                
                const newContent = await page.textContent('body');
                const hasNewContent = newContent && newContent.trim().length > 50;
                console.log(`         📄 Carregou: ${hasNewContent ? '✅' : '❌'}`);
                
                // Voltar se necessário
                if (newUrl !== currentUrl) {
                  await page.goBack();
                  await page.waitForTimeout(1000);
                }
              } catch (navError) {
                console.log(`         ❌ Erro: ${navError.message}`);
              }
            }
          }
          
          console.log('\n🔧 PASSO 4: Testando botões e funcionalidades...');
          
          const buttons = await page.locator('button:visible').all();
          console.log(`   🔘 Botões encontrados: ${buttons.length}`);
          
          for (let i = 0; i < Math.min(buttons.length, 4); i++) {
            try {
              const buttonText = (await buttons[i].textContent())?.trim() || '';
              if (buttonText && !buttonText.toLowerCase().includes('sair')) {
                console.log(`      🔘 Testando: "${buttonText}"`);
                await buttons[i].click();
                await page.waitForTimeout(1500);
                
                // Verificar se algo mudou na página
                const modalOrDialog = await page.locator('[role="dialog"], .modal, [class*="modal"]').count();
                if (modalOrDialog > 0) {
                  console.log(`         💬 Modal/Dialog aberto`);
                  // Fechar modal se houver
                  const closeButton = page.locator('[aria-label="Close"], button:has-text("Fechar"), button:has-text("Cancel")');
                  if (await closeButton.count() > 0) {
                    await closeButton.first().click();
                    await page.waitForTimeout(500);
                  }
                }
              }
            } catch (buttonError) {
              console.log(`         ⚠️  Erro no botão: ${buttonError.message}`);
            }
          }
          
        } else {
          console.log('   ⚠️  Dashboard não encontrado. Possível erro de login.');
        }
        
      } else {
        console.log('   ❌ Formulário de login incompleto');
      }
      
    } else {
      console.log('❌ Sistema não carregou. Encerrando teste.');
      await browser.close();
      return;
    }
    
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('==================');
    
    if (errors.length === 0) {
      console.log('✅ NENHUM ERRO JAVASCRIPT ENCONTRADO!');
    } else {
      console.log(`❌ ${errors.length} erro(s) encontrado(s):`);
      errors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
    }
    
    const finalUrl = page.url();
    console.log(`🌐 URL final: ${finalUrl}`);
    
    const finalContent = await page.textContent('body');
    console.log(`📄 Conteúdo final: ${finalContent ? finalContent.length : 0} caracteres`);
    
    console.log('\n🎯 TESTE CONCLUÍDO!');
    console.log('O navegador permanecerá aberto por 60 segundos para inspeção manual...');
    
    // Destacar a página toda para mostrar que está funcionando
    await page.evaluate(() => {
      document.body.style.animation = 'pulse 2s infinite';
      const style = document.createElement('style');
      style.textContent = `
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    });
    
    await page.waitForTimeout(60000); // 60 segundos
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  await browser.close();
  console.log('🏁 Navegador fechado. Teste finalizado!');
})();