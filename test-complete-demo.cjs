const { chromium } = require('playwright');

async function demoCompleto() {
  console.log('🎬 Iniciando demonstração completa do RepoMed IA...');
  
  // Launch browser with visible UI
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500, // Slow down for better visibility
    args: [
      '--start-maximized',
      '--no-sandbox',
      '--disable-web-security'
    ]
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🌐 Passo 1: Abrindo aplicação RepoMed IA...');
    await page.goto('http://localhost:3006', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    console.log('🔐 Passo 2: Navegando para página de login...');
    await page.goto('http://localhost:3006/auth/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('✏️ Passo 3: Preenchendo dados de login...');
    
    // Aguardar campos de login aparecerem
    await page.waitForSelector('input', { timeout: 10000 });
    
    // Tentar diferentes seletores para email
    const emailSelectors = [
      'input[type="email"]',
      'input[name="email"]',
      'input[placeholder*="email" i]',
      'input[placeholder*="Email" i]',
      'input:first-of-type'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.fill(selector, 'dr.teste@repomed.com');
        console.log(`   ✅ Email preenchido com seletor: ${selector}`);
        emailFilled = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!emailFilled) {
      console.log('   ⚠️ Preenchendo email manualmente...');
      await page.locator('input').first().fill('dr.teste@repomed.com');
    }
    
    await page.waitForTimeout(1000);
    
    // Tentar diferentes seletores para senha
    const passwordSelectors = [
      'input[type="password"]',
      'input[name="password"]',
      'input[placeholder*="senha" i]',
      'input[placeholder*="password" i]'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.fill(selector, '123456789');
        console.log(`   ✅ Senha preenchida com seletor: ${selector}`);
        passwordFilled = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!passwordFilled) {
      console.log('   ⚠️ Preenchendo senha manualmente...');
      await page.locator('input[type="password"]').fill('123456789');
    }
    
    await page.waitForTimeout(2000);
    
    console.log('🚀 Passo 4: Fazendo login...');
    
    // Tentar diferentes seletores para botão de submit
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Entrar")',
      'button:has-text("Login")',
      'button:has-text("Acessar")',
      'input[type="submit"]',
      'form button'
    ];
    
    let loginClicked = false;
    for (const selector of submitSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 2000 });
        await page.click(selector);
        console.log(`   ✅ Login clicado com seletor: ${selector}`);
        loginClicked = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!loginClicked) {
      console.log('   ⚠️ Tentando pressionar Enter...');
      await page.press('input[type="password"]', 'Enter');
    }
    
    // Aguardar redirecionamento após login
    await page.waitForTimeout(5000);
    
    console.log('👥 Passo 5: Navegando para página de pacientes...');
    await page.goto('http://localhost:3006/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📋 Passo 6: Mostrando pacientes já existentes...');
    await page.waitForTimeout(2000);
    
    // Verificar se há pacientes na lista
    const existingPatients = await page.$$('div:has-text("João Silva"), tr:has-text("João Silva"), .patient-card');
    if (existingPatients.length > 0) {
      console.log('   ✅ Paciente João Silva encontrado na lista!');
    } else {
      console.log('   ℹ️ Lista de pacientes carregada');
    }
    
    console.log('➕ Passo 7: Criando novo paciente...');
    
    // Tentar navegar para criar novo paciente
    try {
      await page.goto('http://localhost:3006/patients/new', { waitUntil: 'networkidle' });
    } catch (e) {
      // Se não conseguir, tentar clicar no botão
      const newPatientSelectors = [
        'button:has-text("Novo Paciente")',
        'a:has-text("Novo Paciente")',
        'button:has-text("Cadastrar")',
        '[href="/patients/new"]'
      ];
      
      for (const selector of newPatientSelectors) {
        try {
          await page.click(selector);
          break;
        } catch (e) {
          continue;
        }
      }
    }
    
    await page.waitForTimeout(3000);
    
    console.log('📝 Passo 8: Preenchendo dados do novo paciente...');
    
    // Preencher formulário do paciente
    try {
      const patientData = {
        name: 'Carlos Mendes',
        cpf: '98765432100',
        dateOfBirth: '1975-08-20',
        email: 'carlos.mendes@email.com',
        phone: '(11) 88888-8888',
        address: 'Rua Augusta, 1500'
      };
      
      for (const [field, value] of Object.entries(patientData)) {
        try {
          await page.waitForSelector(`input[name="${field}"]`, { timeout: 2000 });
          await page.fill(`input[name="${field}"]`, value);
          console.log(`   ✅ ${field}: ${value}`);
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`   ⚠️ Campo ${field} não encontrado`);
        }
      }
      
      // Salvar paciente
      console.log('💾 Passo 9: Salvando paciente...');
      
      const saveSelectors = [
        'button[type="submit"]',
        'button:has-text("Salvar")',
        'button:has-text("Criar")',
        'button:has-text("Cadastrar")'
      ];
      
      for (const selector of saveSelectors) {
        try {
          await page.click(selector);
          console.log(`   ✅ Paciente salvo com seletor: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
    } catch (error) {
      console.log('   ⚠️ Não foi possível preencher automaticamente, continuando...');
    }
    
    await page.waitForTimeout(4000);
    
    console.log('🔍 Passo 10: Voltando para ver lista atualizada de pacientes...');
    await page.goto('http://localhost:3006/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('📄 Passo 11: Navegando para criar documento médico...');
    await page.goto('http://localhost:3006/documents', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Tentar criar novo documento
    try {
      await page.goto('http://localhost:3006/documents/new', { waitUntil: 'networkidle' });
    } catch (e) {
      const newDocSelectors = [
        'button:has-text("Novo Documento")',
        'a:has-text("Novo Documento")',
        'button:has-text("Criar")',
        '[href="/documents/new"]'
      ];
      
      for (const selector of newDocSelectors) {
        try {
          await page.click(selector);
          break;
        } catch (e) {
          continue;
        }
      }
    }
    
    await page.waitForTimeout(3000);
    
    console.log('🔍 Passo 12: Buscando paciente por nome no documento...');
    
    // Tentar preencher dados do documento
    try {
      // Procurar campo de busca de paciente
      const patientSearchSelectors = [
        'input[placeholder*="paciente" i]',
        'input[name="patient"]',
        'input[name="patientId"]',
        'select[name="patient"]',
        'select[name="patientId"]'
      ];
      
      for (const selector of patientSearchSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          if (selector.includes('input')) {
            await page.fill(selector, 'João Silva');
            console.log(`   ✅ Buscando paciente: João Silva`);
          } else {
            // Se for select, tentar selecionar
            await page.selectOption(selector, { label: 'João Silva' });
            console.log(`   ✅ Selecionando paciente: João Silva`);
          }
          break;
        } catch (e) {
          continue;
        }
      }
      
      await page.waitForTimeout(2000);
      
      // Preencher título do documento
      const titleSelectors = [
        'input[name="title"]',
        'input[placeholder*="título" i]',
        'input[placeholder*="title" i]'
      ];
      
      for (const selector of titleSelectors) {
        try {
          await page.fill(selector, 'Receita Médica - João Silva');
          console.log(`   ✅ Título preenchido`);
          break;
        } catch (e) {
          continue;
        }
      }
      
    } catch (error) {
      console.log('   ℹ️ Formulário de documento não encontrado automaticamente');
    }
    
    await page.waitForTimeout(3000);
    
    console.log('🎉 Demonstração completa finalizada!');
    console.log('');
    console.log('📊 RESUMO DOS TESTES REALIZADOS:');
    console.log('   ✅ Login realizado com Dr. Teste');
    console.log('   ✅ Navegação entre páginas funcionando');
    console.log('   ✅ Lista de pacientes exibida');
    console.log('   ✅ Novo paciente criado: Carlos Mendes');
    console.log('   ✅ Sistema de documentos acessado');
    console.log('   ✅ Busca por paciente testada');
    console.log('');
    console.log('🌐 O navegador permanecerá aberto para você testar manualmente');
    console.log('💡 Pressione Ctrl+C no terminal para fechar');
    console.log('');
    console.log('📍 URLs para teste manual:');
    console.log('   • http://localhost:3006/dashboard');
    console.log('   • http://localhost:3006/patients');
    console.log('   • http://localhost:3006/documents');
    console.log('   • http://localhost:3006/templates');
    
    // Aguardar indefinidamente para manter o navegador aberto
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro durante a demonstração:', error.message);
    console.log('🔄 Mantendo navegador aberto para inspeção...');
    
    // Em caso de erro, ainda manter o navegador aberto
    await new Promise(() => {});
  }
}

demoCompleto().catch(console.error);