const { chromium } = require('playwright');

async function debugLiveTest() {
  console.log('🔍 Iniciando teste com DEBUG em tempo real...');
  
  // Abrir navegador com DevTools
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
    devtools: true, // Abre DevTools automaticamente
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-web-security',
      '--auto-open-devtools-for-tabs', // Força abertura do DevTools
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Habilitar logs do console
  page.on('console', msg => {
    console.log(`🌐 BROWSER LOG [${msg.type()}]:`, msg.text());
  });
  
  // Capturar erros de JavaScript
  page.on('pageerror', error => {
    console.log('❌ JAVASCRIPT ERROR:', error.message);
  });
  
  // Capturar requests que falharam
  page.on('requestfailed', request => {
    console.log('❌ REQUEST FAILED:', request.url(), request.failure()?.errorText);
  });
  
  // Capturar responses com erro
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`❌ HTTP ${response.status()}:`, response.url());
    } else if (response.status() >= 200 && response.status() < 300) {
      console.log(`✅ HTTP ${response.status()}:`, response.url());
    }
  });
  
  try {
    console.log('🌐 Passo 1: Abrindo aplicação com DevTools...');
    await page.goto('http://localhost:3008', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Aguardar um pouco para você ver a página inicial
    console.log('⏱️ Aguardando 5 segundos para inspeção visual...');
    await page.waitForTimeout(5000);
    
    // Verificar se há erros na página
    const errors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('.error, [class*="error"]');
      return Array.from(errorElements).map(el => el.textContent);
    });
    
    if (errors.length > 0) {
      console.log('⚠️ Erros encontrados na página:', errors);
    }
    
    console.log('🔐 Passo 2: Navegando para login e debugando...');
    
    // Ir para login
    await page.goto('http://localhost:3008/auth/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Injetar código JavaScript para debug
    await page.evaluate(() => {
      console.log('🔍 DEBUG: Página de login carregada');
      console.log('🔍 DEBUG: URL atual:', window.location.href);
      console.log('🔍 DEBUG: Formulários encontrados:', document.forms.length);
      console.log('🔍 DEBUG: Inputs encontrados:', document.querySelectorAll('input').length);
      
      // Marcar elementos visuais para debug
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input, i) => {
        input.style.border = '3px solid red';
        console.log(`🔍 DEBUG: Input ${i}:`, input.type, input.name, input.placeholder);
      });
      
      const buttons = document.querySelectorAll('button');
      buttons.forEach((button, i) => {
        button.style.border = '3px solid blue';
        console.log(`🔍 DEBUG: Button ${i}:`, button.textContent, button.type);
      });
    });
    
    console.log('✏️ Passo 3: Preenchendo login com debug visual...');
    
    // Aguardar campos aparecerem e destacá-los
    try {
      await page.waitForSelector('input', { timeout: 10000 });
      
      // Encontrar campo de email
      const emailField = await page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
      await emailField.fill('dr.teste@repomed.com');
      
      // Destacar campo preenchido
      await emailField.evaluate(el => {
        el.style.backgroundColor = 'lightgreen';
        el.style.border = '3px solid green';
      });
      
      console.log('✅ Email preenchido com sucesso');
      await page.waitForTimeout(1500);
      
      // Encontrar campo de senha
      const passwordField = await page.locator('input[type="password"]').first();
      await passwordField.fill('123456789');
      
      // Destacar campo preenchido
      await passwordField.evaluate(el => {
        el.style.backgroundColor = 'lightgreen';
        el.style.border = '3px solid green';
      });
      
      console.log('✅ Senha preenchida com sucesso');
      await page.waitForTimeout(1500);
      
    } catch (error) {
      console.log('❌ Erro ao preencher campos:', error.message);
      
      // Debug alternativo - tentar encontrar qualquer input
      await page.evaluate(() => {
        const allInputs = document.querySelectorAll('input');
        console.log('🔍 TODOS OS INPUTS:', Array.from(allInputs).map(i => ({
          type: i.type,
          name: i.name,
          placeholder: i.placeholder,
          id: i.id,
          className: i.className
        })));
      });
    }
    
    console.log('🚀 Passo 4: Tentando fazer login com debug...');
    
    // Destacar botão de submit antes de clicar
    try {
      const submitButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
      
      // Destacar visualmente
      await submitButton.evaluate(el => {
        el.style.backgroundColor = 'yellow';
        el.style.border = '5px solid orange';
        el.style.transform = 'scale(1.1)';
      });
      
      console.log('🎯 Botão de submit encontrado e destacado');
      await page.waitForTimeout(2000);
      
      // Monitorar mudanças de URL
      const currentUrl = page.url();
      console.log('📍 URL antes do login:', currentUrl);
      
      // Clicar no botão
      await submitButton.click();
      console.log('🔄 Botão clicado, aguardando resposta...');
      
      // Aguardar mudança de URL ou resposta
      await page.waitForTimeout(5000);
      
      const newUrl = page.url();
      console.log('📍 URL após login:', newUrl);
      
      if (newUrl !== currentUrl) {
        console.log('✅ Login bem-sucedido - URL mudou!');
        
        // Aguardar carregamento da nova página
        await page.waitForLoadState('networkidle');
        
        console.log('👥 Passo 5: Navegando para pacientes...');
        await page.goto('http://localhost:3008/patients', { waitUntil: 'networkidle' });
        
        // Debug da página de pacientes
        await page.evaluate(() => {
          console.log('🔍 DEBUG: Página de pacientes carregada');
          console.log('🔍 DEBUG: Elementos encontrados:', document.body.innerHTML.length, 'caracteres');
          
          // Destacar elementos importantes
          const buttons = document.querySelectorAll('button');
          buttons.forEach(btn => {
            btn.style.border = '2px solid blue';
            console.log('🔍 Botão encontrado:', btn.textContent);
          });
        });
        
        console.log('➕ Tentando criar novo paciente...');
        
        // Tentar navegar para criar paciente
        try {
          await page.goto('http://localhost:3008/patients/new', { waitUntil: 'networkidle' });
          
          await page.evaluate(() => {
            console.log('🔍 DEBUG: Página novo paciente carregada');
            const form = document.querySelector('form');
            if (form) {
              form.style.border = '3px solid green';
              console.log('✅ Formulário encontrado');
            } else {
              console.log('❌ Formulário não encontrado');
            }
          });
          
        } catch (error) {
          console.log('⚠️ Erro ao navegar para novo paciente:', error.message);
        }
        
      } else {
        console.log('❌ Login falhou - URL não mudou');
        
        // Debug do erro de login
        const errorMessages = await page.evaluate(() => {
          const errors = document.querySelectorAll('.error, .alert, [class*="error"], [class*="alert"]');
          return Array.from(errors).map(el => el.textContent);
        });
        
        if (errorMessages.length > 0) {
          console.log('⚠️ Mensagens de erro encontradas:', errorMessages);
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao tentar login:', error.message);
      
      // Debug de botões disponíveis
      await page.evaluate(() => {
        const allButtons = document.querySelectorAll('button');
        console.log('🔍 TODOS OS BOTÕES:', Array.from(allButtons).map(b => ({
          text: b.textContent,
          type: b.type,
          className: b.className,
          id: b.id
        })));
      });
    }
    
    console.log('🎉 Teste completado - navegador permanece aberto para inspeção');
    console.log('🔧 Use F12 DevTools para continuar debugando');
    console.log('💡 Pressione Ctrl+C para fechar');
    
    // Aguardar indefinidamente
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.log('🔄 Navegador mantido aberto para debug...');
    await new Promise(() => {});
  }
}

debugLiveTest().catch(console.error);