import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000,
    devtools: false
  });
  const page = await browser.newPage();
  
  console.log('🏥 TESTE COMPLETO DE FUNCIONALIDADES REPOMED IA\n');
  
  const errors = [];
  const testResults = {};
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });

  try {
    // ===== LOGIN =====
    console.log('🔐 FASE 1: LOGIN E AUTENTICAÇÃO...');
    await page.goto('http://localhost:3023/auth/login', { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', 'admin@repomed.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    if (!page.url().includes('/auth/login')) {
      console.log('✅ Login realizado com sucesso!');
      testResults.login = 'success';
    } else {
      console.log('❌ Login falhou');
      testResults.login = 'failed';
    }
    
    // ===== WORKSPACE =====
    console.log('\n🏠 FASE 2: NAVEGAÇÃO DO WORKSPACE...');
    await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
    
    // Testar cards do workspace
    const workspaceElements = await page.locator('.rounded-2xl').count();
    console.log(`✅ Workspace carregado com ${workspaceElements} cards`);
    testResults.workspace = workspaceElements > 0 ? 'success' : 'failed';
    
    // ===== GESTÃO DE PACIENTES =====
    console.log('\n👥 FASE 3: TESTANDO GESTÃO DE PACIENTES...');
    
    // 3.1 - Lista de pacientes
    await page.goto('http://localhost:3023/patients', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const patientsContent = await page.textContent('body');
    const hasPatientsContent = patientsContent && patientsContent.includes('Pacientes');
    console.log(`${hasPatientsContent ? '✅' : '❌'} Lista de pacientes: ${hasPatientsContent ? 'OK' : 'Falhou'}`);
    
    // 3.2 - Formulário de criar paciente
    await page.goto('http://localhost:3023/patients/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Testar preenchimento do formulário
    try {
      await page.fill('input[id="name"]', 'João Silva Teste');
      await page.fill('input[id="cpf"]', '123.456.789-00');
      await page.fill('input[id="birthDate"]', '1985-05-15');
      await page.selectOption('select[id="gender"]', 'masculino');
      await page.fill('input[id="phone"]', '(11) 99999-9999');
      await page.fill('input[id="email"]', 'joao.teste@email.com');
      
      console.log('✅ Formulário de paciente preenchido com sucesso');
      testResults.createPatient = 'success';
    } catch (error) {
      console.log(`❌ Erro ao preencher formulário: ${error.message}`);
      testResults.createPatient = 'failed';
    }
    
    // ===== TEMPLATES MÉDICOS =====
    console.log('\n📋 FASE 4: TESTANDO TEMPLATES MÉDICOS...');
    
    await page.goto('http://localhost:3023/templates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const templatesContent = await page.textContent('body');
    const hasTemplatesContent = templatesContent && templatesContent.includes('Templates');
    console.log(`${hasTemplatesContent ? '✅' : '❌'} Lista de templates: ${hasTemplatesContent ? 'OK' : 'Falhou'}`);
    
    // Testar criação de template
    await page.goto('http://localhost:3023/templates/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const createTemplateContent = await page.textContent('body');
    const hasCreateTemplate = createTemplateContent && createTemplateContent.includes('template');
    console.log(`${hasCreateTemplate ? '✅' : '❌'} Criar template: ${hasCreateTemplate ? 'OK' : 'Falhou'}`);
    testResults.templates = hasTemplatesContent && hasCreateTemplate ? 'success' : 'failed';
    
    // ===== DOCUMENTOS MÉDICOS =====
    console.log('\n📄 FASE 5: TESTANDO DOCUMENTOS MÉDICOS...');
    
    // Testar interface nova de documentos
    await page.goto('http://localhost:3023/documents-new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const documentsContent = await page.textContent('body');
    const hasDocumentsContent = documentsContent && documentsContent.includes('Documento');
    console.log(`${hasDocumentsContent ? '✅' : '❌'} Interface nova documentos: ${hasDocumentsContent ? 'OK' : 'Falhou'}`);
    
    // Testar lista otimizada
    await page.goto('http://localhost:3023/documents-list', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const documentsListContent = await page.textContent('body');
    const hasListContent = documentsListContent && documentsListContent.length > 100;
    console.log(`${hasListContent ? '✅' : '❌'} Lista documentos: ${hasListContent ? 'OK' : 'Falhou'}`);
    
    // Testar criação de documento
    await page.goto('http://localhost:3023/documents/new', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const createDocContent = await page.textContent('body');
    const hasCreateDoc = createDocContent && createDocContent.includes('Documento');
    console.log(`${hasCreateDoc ? '✅' : '❌'} Criar documento: ${hasCreateDoc ? 'OK' : 'Falhou'}`);
    testResults.documents = hasDocumentsContent && hasListContent && hasCreateDoc ? 'success' : 'failed';
    
    // ===== PRESCRIÇÕES =====
    console.log('\n💊 FASE 6: TESTANDO PRESCRIÇÕES...');
    
    await page.goto('http://localhost:3023/prescription/create', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const prescriptionContent = await page.textContent('body');
    const hasPrescriptionContent = prescriptionContent && prescriptionContent.includes('prescrição');
    console.log(`${hasPrescriptionContent ? '✅' : '❌'} Criar prescrição: ${hasPrescriptionContent ? 'OK' : 'Falhou'}`);
    testResults.prescriptions = hasPrescriptionContent ? 'success' : 'failed';
    
    // ===== MÉTRICAS E ANALYTICS =====
    console.log('\n📊 FASE 7: TESTANDO MÉTRICAS E ANALYTICS...');
    
    // Métricas
    await page.goto('http://localhost:3023/metrics', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const metricsContent = await page.textContent('body');
    const hasMetricsContent = metricsContent && !metricsContent.includes('Error');
    console.log(`${hasMetricsContent ? '✅' : '❌'} Página de métricas: ${hasMetricsContent ? 'OK' : 'Precisa ajustes'}`);
    
    // Relatórios
    await page.goto('http://localhost:3023/reports', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const reportsContent = await page.textContent('body');
    const hasReportsContent = reportsContent && reportsContent.length > 50;
    console.log(`${hasReportsContent ? '✅' : '❌'} Relatórios: ${hasReportsContent ? 'OK' : 'Falhou'}`);
    
    // Analytics
    await page.goto('http://localhost:3023/analytics', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const analyticsContent = await page.textContent('body');
    const hasAnalyticsContent = analyticsContent && analyticsContent.length > 50;
    console.log(`${hasAnalyticsContent ? '✅' : '❌'} Analytics: ${hasAnalyticsContent ? 'OK' : 'Falhou'}`);
    testResults.analytics = hasMetricsContent && hasReportsContent && hasAnalyticsContent ? 'success' : 'failed';
    
    // ===== PERFIL E CONFIGURAÇÕES =====
    console.log('\n⚙️ FASE 8: TESTANDO PERFIL E CONFIGURAÇÕES...');
    
    // Perfil
    await page.goto('http://localhost:3023/account/profile', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const profileContent = await page.textContent('body');
    const hasProfileContent = profileContent && profileContent.includes('Perfil');
    console.log(`${hasProfileContent ? '✅' : '❌'} Perfil: ${hasProfileContent ? 'OK' : 'Falhou'}`);
    
    // Configurações
    await page.goto('http://localhost:3023/account/settings', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    const settingsContent = await page.textContent('body');
    const hasSettingsContent = settingsContent && settingsContent.length > 50;
    console.log(`${hasSettingsContent ? '✅' : '❌'} Configurações: ${hasSettingsContent ? 'OK' : 'Falhou'}`);
    testResults.account = hasProfileContent && hasSettingsContent ? 'success' : 'failed';
    
    // ===== NAVEGAÇÃO DO HEADER =====
    console.log('\n🧭 FASE 9: TESTANDO NAVEGAÇÃO DO HEADER...');
    
    await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    // Testar botões do header do workspace
    const headerButtons = await page.locator('nav button').count();
    console.log(`✅ Encontrados ${headerButtons} botões de navegação no header`);
    
    // Testar quick actions
    const quickActionButtons = await page.locator('text=Cadastrar').count();
    const quickActionDocs = await page.locator('text=Criar').count();
    console.log(`✅ Quick actions: ${quickActionButtons} cadastrar, ${quickActionDocs} criar`);
    testResults.navigation = headerButtons > 0 ? 'success' : 'failed';
    
    // ===== RESULTADOS FINAIS =====
    console.log('\n📊 RELATÓRIO COMPLETO DE FUNCIONALIDADES:');
    console.log('==========================================');
    
    const totalTests = Object.keys(testResults).length;
    const successfulTests = Object.values(testResults).filter(r => r === 'success').length;
    const successRate = (successfulTests / totalTests) * 100;
    
    console.log(`📈 Taxa de sucesso: ${successfulTests}/${totalTests} (${successRate.toFixed(1)}%)`);
    console.log(`❌ Erros JavaScript: ${errors.length}`);
    
    console.log('\n📋 DETALHAMENTO POR MÓDULO:');
    Object.entries(testResults).forEach(([module, result]) => {
      const status = result === 'success' ? '✅' : '❌';
      console.log(`   ${status} ${module}: ${result}`);
    });
    
    // ===== ANÁLISE DE PÁGINAS FALTANTES =====
    console.log('\n🔍 ANÁLISE DE PÁGINAS FALTANTES:');
    
    const missingPages = [];
    
    // Testar páginas que podem estar faltando
    const pagesToCheck = [
      { url: '/patients/1', name: 'Detalhes do Paciente' },
      { url: '/patients/1/edit', name: 'Editar Paciente' },
      { url: '/templates/1', name: 'Detalhes do Template' },
      { url: '/documents/1', name: 'Detalhes do Documento' },
      { url: '/documents/1/sign', name: 'Assinar Documento' },
      { url: '/prescription/1', name: 'Visualizar Prescrição' },
      { url: '/share/abc123', name: 'Página de Compartilhamento' },
      { url: '/verify/abc123', name: 'Verificar Documento' }
    ];
    
    for (const pageInfo of pagesToCheck) {
      try {
        await page.goto(`http://localhost:3023${pageInfo.url}`, { waitUntil: 'networkidle', timeout: 5000 });
        await page.waitForTimeout(1000);
        
        const content = await page.textContent('body');
        const hasError = content && (content.includes('404') || content.includes('Error') || content.includes('Not Found'));
        
        if (hasError || !content || content.length < 100) {
          missingPages.push(pageInfo.name);
          console.log(`❌ ${pageInfo.name}: Precisa implementar`);
        } else {
          console.log(`✅ ${pageInfo.name}: OK`);
        }
      } catch (error) {
        missingPages.push(pageInfo.name);
        console.log(`❌ ${pageInfo.name}: Erro ao carregar`);
      }
    }
    
    console.log('\n📝 PÁGINAS QUE PRECISAM SER CRIADAS/MELHORADAS:');
    missingPages.forEach(page => {
      console.log(`   🚧 ${page}`);
    });
    
    if (successRate >= 80) {
      console.log('\n🏆 EXCELENTE! Sistema altamente funcional!');
    } else if (successRate >= 60) {
      console.log('\n👍 BOM! Sistema parcialmente funcional');
    } else {
      console.log('\n⚠️ ATENÇÃO! Sistema precisa de mais desenvolvimento');
    }
    
    console.log('\n⏰ Mantendo navegador aberto por 30 segundos para exploração manual...');
    console.log('🖱️ Explore livremente o sistema!');
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  await page.waitForTimeout(30000);
  console.log('\n🏁 Teste completo de funcionalidades finalizado!');
  await browser.close();
})();