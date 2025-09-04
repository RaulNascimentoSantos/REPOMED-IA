import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000,
    devtools: true
  });
  const page = await browser.newPage();
  
  console.log('🏥 TESTE COMPLETO DO SISTEMA REPOMED IA - TODAS AS PÁGINAS INTEGRADAS...\n');
  
  const errors = [];
  const pageResults = {};
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('Warning')) {
      console.log(`❌ Console Error: ${msg.text()}`);
    }
  });

  try {
    console.log('🔐 PASSO 1: Login no sistema...');
    await page.goto('http://localhost:3023/auth/login', { waitUntil: 'networkidle' });
    
    await page.fill('input[type="email"]', 'admin@repomed.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/auth/login')) {
      console.log('❌ Login falhou');
      return;
    }
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`📍 URL após login: ${page.url()}`);
    
    // Lista de páginas para testar
    const pagesToTest = [
      { name: 'Workspace Principal', url: '/', description: 'Dashboard principal' },
      { name: 'Pacientes', url: '/patients', description: 'Lista de pacientes' },
      { name: 'Criar Paciente', url: '/patients/create', description: 'Formulário de criação' },
      { name: 'Templates', url: '/templates', description: 'Lista de templates' },
      { name: 'Criar Template', url: '/templates/create', description: 'Formulário de template' },
      { name: 'Documentos Novos', url: '/documents-new', description: 'Interface nova de documentos' },
      { name: 'Lista Documentos', url: '/documents-list', description: 'Lista otimizada' },
      { name: 'Documentos Otimizados', url: '/documents-optimized', description: 'Versão otimizada' },
      { name: 'Criar Documento', url: '/documents/new', description: 'Criação de documento' },
      { name: 'Prescrições', url: '/prescription/create', description: 'Criar prescrição' },
      { name: 'Métricas', url: '/metrics', description: 'Dashboard de métricas' },
      { name: 'Relatórios', url: '/reports', description: 'Relatórios do sistema' },
      { name: 'Analytics', url: '/analytics', description: 'Analytics do sistema' },
      { name: 'Perfil', url: '/account/profile', description: 'Perfil do usuário' },
    ];
    
    console.log('\n🧪 PASSO 2: Testando todas as páginas...');
    
    for (let i = 0; i < pagesToTest.length; i++) {
      const pageInfo = pagesToTest[i];
      console.log(`\n📄 ${i + 1}/${pagesToTest.length} - Testando: ${pageInfo.name}`);
      console.log(`   🔗 URL: ${pageInfo.url}`);
      console.log(`   📝 Descrição: ${pageInfo.description}`);
      
      try {
        await page.goto(`http://localhost:3023${pageInfo.url}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        const title = await page.title();
        const bodyContent = await page.textContent('body');
        const hasContent = bodyContent && bodyContent.trim().length > 50;
        const hasError = bodyContent && bodyContent.includes('Error');
        
        // Verificar elementos específicos
        const buttons = await page.locator('button:visible').count();
        const inputs = await page.locator('input:visible').count();
        const links = await page.locator('a:visible').count();
        const forms = await page.locator('form').count();
        
        const result = {
          success: hasContent && !hasError,
          title,
          contentLength: bodyContent?.length || 0,
          hasError,
          elements: { buttons, inputs, links, forms },
          preview: bodyContent?.slice(0, 100).replace(/\s+/g, ' ') || ''
        };
        
        pageResults[pageInfo.name] = result;
        
        if (result.success) {
          console.log(`   ✅ Carregou com sucesso`);
          console.log(`   📊 Elementos: ${buttons} botões, ${inputs} inputs, ${links} links, ${forms} forms`);
          console.log(`   📄 Preview: "${result.preview}..."`);
        } else {
          console.log(`   ❌ Falha no carregamento`);
          console.log(`   📊 Conteúdo: ${result.contentLength} chars`);
          if (hasError) {
            console.log(`   🔥 Contém erros na página`);
          }
        }
        
      } catch (pageError) {
        console.log(`   💥 Erro crítico: ${pageError.message}`);
        pageResults[pageInfo.name] = {
          success: false,
          error: pageError.message,
          contentLength: 0
        };
      }
    }
    
    console.log('\n🧭 PASSO 3: Testando navegação do workspace...');
    
    // Voltar ao workspace e testar navegação
    await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    // Testar navegação pelos cards do workspace
    const navigationTests = [
      { selector: 'text=Ver pacientes', expected: '/patients' },
      { selector: 'text=Ver templates', expected: '/templates' },
      { selector: 'text=Ver documentos', expected: '/documents-new' },
      { selector: 'text=Nova prescrição', expected: '/prescription/create' }
    ];
    
    for (const test of navigationTests) {
      try {
        console.log(`   🔗 Testando navegação: ${test.selector}`);
        
        await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const button = await page.locator(test.selector).first();
        if (await button.count() > 0) {
          await button.click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          const navigatedCorrectly = currentUrl.includes(test.expected);
          
          console.log(`      📍 URL resultado: ${currentUrl}`);
          console.log(`      ${navigatedCorrectly ? '✅' : '❌'} Navegação ${navigatedCorrectly ? 'funcionou' : 'falhou'}`);
        } else {
          console.log(`      ❌ Botão não encontrado: ${test.selector}`);
        }
      } catch (navError) {
        console.log(`      💥 Erro na navegação: ${navError.message}`);
      }
    }
    
    console.log('\n📊 RELATÓRIO FINAL - INTEGRAÇÃO COMPLETA:');
    console.log('=============================================');
    
    const totalPages = Object.keys(pageResults).length;
    const successfulPages = Object.values(pageResults).filter(r => r.success).length;
    const successRate = (successfulPages / totalPages) * 100;
    
    console.log(`📈 Taxa de sucesso: ${successfulPages}/${totalPages} (${successRate.toFixed(1)}%)`);
    console.log(`❌ Erros JavaScript: ${errors.length}`);
    
    console.log('\n📄 RESUMO POR PÁGINA:');
    Object.entries(pageResults).forEach(([name, result]) => {
      const status = result.success ? '✅' : '❌';
      const content = result.contentLength > 0 ? `${result.contentLength} chars` : 'sem conteúdo';
      console.log(`   ${status} ${name}: ${content}`);
      
      if (!result.success && result.error) {
        console.log(`      💥 Erro: ${result.error}`);
      }
    });
    
    if (successRate >= 80) {
      console.log('\n🏆 EXCELENTE! Sistema altamente funcional!');
      console.log('✅ Maior parte das páginas funcionando');
      console.log('✅ Navegação operacional');
      console.log('✅ Login integrado');
    } else if (successRate >= 60) {
      console.log('\n👍 BOM! Sistema parcialmente funcional');
      console.log('⚠️  Algumas páginas precisam de ajustes');
    } else {
      console.log('\n⚠️  ATENÇÃO! Sistema precisa de mais ajustes');
      console.log('❌ Muitas páginas com problemas');
    }
    
    if (errors.length > 0) {
      console.log('\n🔥 ERROS ENCONTRADOS:');
      errors.slice(0, 5).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO DO TESTE: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador aberto por 45 segundos para exploração...');
  console.log('🖱️  Explore o sistema integrado!');
  
  await page.waitForTimeout(45000);
  await browser.close();
  
  console.log('\n🏁 Teste de integração completa finalizado!');
})();