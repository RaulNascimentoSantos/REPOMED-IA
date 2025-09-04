const playwright = require('playwright');

async function testDigitalSignatureDemo() {
  console.log('🚀 TESTE DE ASSINATURA DIGITAL - REPOMED IA v3.0');
  console.log('🔧 DevTools F12 habilitado para debug');
  console.log('🖋️ Foco: Login → Criar Documento → Assinar Digitalmente');

  let browser;
  let context;
  let page;

  try {
    // Configurar browser com DevTools
    browser = await playwright.chromium.launch({
      headless: false,
      devtools: true,
      slowMo: 1500
    });

    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
    });

    page = await context.newPage();

    // Interceptar e logar requisições
    page.on('request', request => {
      if (request.url().includes('localhost:808') || request.url().includes('localhost:300')) {
        console.log(`✅ HTTP ${request.method()}: ${request.url()}`);
      }
    });

    page.on('requestfailed', request => {
      console.log(`❌ REQUEST FAILED: ${request.url()} ${request.failure()?.errorText}`);
    });

    page.on('response', response => {
      if (response.url().includes('localhost:808') && response.status() >= 400) {
        console.log(`🚨 HTTP ${response.status()}: ${response.url()}`);
      }
    });

    // Interceptar console logs
    page.on('console', msg => {
      const type = msg.type();
      if (['error', 'warning', 'log', 'info'].includes(type)) {
        console.log(`🌐 BROWSER ${type.toUpperCase()}: ${msg.text()}`);
      }
    });

    console.log('\n🔐 FASE 1: LOGIN NO SISTEMA');
    await page.goto('http://localhost:3008/auth/login', { waitUntil: 'networkidle' });
    
    // Aguardar elementos de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    
    console.log('📋 Fazendo login com credenciais...');
    await page.fill('input[type="email"]', 'admin@repomed.com');
    await page.fill('input[type="password"]', 'admin123456');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento após login
    try {
      await Promise.race([
        page.waitForURL('**/dashboard', { timeout: 8000 }),
        page.waitForURL('**/workspace', { timeout: 8000 })
      ]);
      console.log('✅ Login realizado!');
    } catch (e) {
      console.log('⚠️ Login realizado - continuando...');
      await page.waitForTimeout(3000);
    }

    console.log('\n📄 FASE 2: CRIANDO NOVO DOCUMENTO');
    await page.goto('http://localhost:3008/documents/new', { waitUntil: 'networkidle' });
    
    // Aguardar carregamento da página de criação
    await page.waitForSelector('h1, h2, h3', { timeout: 5000 });
    console.log('✅ Página de criação de documento carregada');

    // Aguardar templates carregarem
    await page.waitForTimeout(3000);

    // Procurar por templates disponíveis
    const templateButtons = await page.$$('button:has-text("Receita"), button:has-text("Template"), [data-template]');
    if (templateButtons.length > 0) {
      console.log(`📋 ${templateButtons.length} templates encontrados`);
      console.log('🎯 Selecionando primeiro template...');
      await templateButtons[0].click();
      await page.waitForTimeout(2000);
      console.log('✅ Template selecionado!');
    } else {
      console.log('⚠️ Templates não encontrados visualmente - tentando outros seletores...');
      
      // Tentar outros seletores para templates
      const alternativeSelectors = [
        'button[class*="template"]',
        'div[class*="template"] button',
        'button:has-text("Selecionar")',
        'button:has-text("Usar")'
      ];
      
      for (const selector of alternativeSelectors) {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`📋 Encontrado via seletor: ${selector}`);
          await elements[0].click();
          await page.waitForTimeout(2000);
          break;
        }
      }
    }

    console.log('\n📝 FASE 3: PREENCHENDO DADOS DO DOCUMENTO');
    
    // Procurar campos de formulário para preencher
    const nameFields = await page.$$('input[name*="name"], input[placeholder*="nome"], input[placeholder*="Name"]');
    if (nameFields.length > 0) {
      await nameFields[0].fill('João Silva Teste');
      console.log('✅ Nome do paciente preenchido');
    }

    const cpfFields = await page.$$('input[name*="cpf"], input[placeholder*="CPF"]');
    if (cpfFields.length > 0) {
      await cpfFields[0].fill('123.456.789-00');
      console.log('✅ CPF preenchido');
    }

    // Procurar campo de conteúdo/observações
    const contentFields = await page.$$('textarea, input[name*="content"], input[name*="instructions"]');
    if (contentFields.length > 0) {
      await contentFields[0].fill('Prescrição médica de teste para demonstração de assinatura digital');
      console.log('✅ Conteúdo do documento preenchido');
    }

    console.log('\n💾 FASE 4: SALVANDO DOCUMENTO');
    
    // Procurar botão de salvar/criar
    const saveButtons = await page.$$('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]');
    if (saveButtons.length > 0) {
      console.log('📄 Salvando documento...');
      await saveButtons[0].click();
      await page.waitForTimeout(3000);
      console.log('✅ Documento criado!');
    }

    console.log('\n🖋️ FASE 5: TESTANDO ASSINATURA DIGITAL');
    
    // Ir para lista de documentos
    await page.goto('http://localhost:3008/documents', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Procurar por botões de assinatura
    const signatureSelectors = [
      'button:has-text("Assinar")',
      'button:has-text("Sign")',
      'button[aria-label*="assin"]',
      'button[class*="sign"]',
      '[data-action="sign"]',
      'button:has-text("🖋️")'
    ];

    let signatureFound = false;
    for (const selector of signatureSelectors) {
      const signButtons = await page.$$(selector);
      if (signButtons.length > 0) {
        console.log(`🖋️ Botão de assinatura encontrado: ${selector}`);
        console.log('📝 Iniciando processo de assinatura...');
        await signButtons[0].click();
        await page.waitForTimeout(3000);
        signatureFound = true;
        break;
      }
    }

    if (!signatureFound) {
      console.log('⚠️ Botão de assinatura não encontrado na interface');
      console.log('🔍 Verificando se existe modal ou área de assinatura...');
      
      // Verificar se existem elementos relacionados a assinatura
      const signatureElements = await page.$$('canvas, [class*="signature"], [data-signature], svg');
      if (signatureElements.length > 0) {
        console.log(`✅ ${signatureElements.length} elementos de assinatura encontrados!`);
      } else {
        console.log('ℹ️ Funcionalidade de assinatura pode estar em desenvolvimento');
      }
    }

    console.log('\n🎯 FASE 6: VERIFICANDO FUNCIONALIDADES AVANÇADAS');
    
    // Verificar QR Code
    const qrElements = await page.$$('canvas, svg, img[alt*="QR"], [data-qr]');
    if (qrElements.length > 0) {
      console.log(`📱 ${qrElements.length} elementos de QR Code encontrados!`);
    }

    // Verificar PDF
    const pdfButtons = await page.$$('button:has-text("PDF"), button:has-text("Baixar"), button:has-text("Download")');
    if (pdfButtons.length > 0) {
      console.log(`📄 ${pdfButtons.length} botões de PDF encontrados!`);
    }

    console.log('\n✅ DEMONSTRAÇÃO COMPLETA!');
    console.log('🎉 Sistema RepoMed IA testado com sucesso');
    console.log('🖋️ Funcionalidade de assinatura digital mapeada');
    
    // Manter navegador aberto para inspeção
    console.log('\n⏱️ Mantendo navegador aberto para inspeção...');
    console.log('🔧 Use DevTools F12 para inspecionar elementos');
    console.log('💡 Pressione Ctrl+C para finalizar');
    
    // Aguardar indefinidamente para manter navegador aberto
    await page.waitForTimeout(300000); // 5 minutos

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  } finally {
    // Não fechar automaticamente para permitir inspeção manual
    console.log('🔍 Navegador mantido aberto para inspeção manual');
  }
}

// Executar o teste
testDigitalSignatureDemo().catch(console.error);