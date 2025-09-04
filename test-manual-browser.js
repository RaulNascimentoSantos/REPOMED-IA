import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500,
    devtools: false
  });
  const page = await browser.newPage();
  
  console.log('🏥 TESTE MANUAL REPOMED IA - FUNCIONALIDADES COMPLETAS\n');
  
  const errors = [];
  
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
    console.log('🔐 PASSO 1: Acessando página de login...');
    await page.goto('http://localhost:3023/auth/login', { waitUntil: 'networkidle' });
    
    console.log('✅ Página de login carregada!');
    console.log('📍 URL atual:', page.url());
    
    // Aguardar elementos da página de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.waitForSelector('button[type="submit"]', { timeout: 10000 });
    
    console.log('✅ Formulário de login encontrado!');
    
    console.log('🔐 PASSO 2: Realizando login...');
    await page.fill('input[type="email"]', 'admin@repomed.com');
    await page.fill('input[type="password"]', '123456');
    
    console.log('✅ Dados preenchidos');
    
    await page.click('button[type="submit"]');
    console.log('✅ Botão de login clicado');
    
    // Aguardar redirecionamento
    await page.waitForTimeout(3000);
    
    if (page.url().includes('/auth/login')) {
      console.log('❌ Login falhou - ainda na página de login');
      console.log('📍 URL atual:', page.url());
    } else {
      console.log('✅ Login realizado com sucesso!');
      console.log('📍 URL após login:', page.url());
    }
    
    console.log('\n🏠 PASSO 3: Testando navegação do Workspace...');
    
    // Ir para o workspace principal
    await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('✅ Workspace principal carregado');
    
    // Testar navegação pelos cards principais
    const mainSections = [
      { name: 'Pacientes', selector: 'text=Ver pacientes', url: '/patients' },
      { name: 'Templates', selector: 'text=Ver templates', url: '/templates' },
      { name: 'Documentos', selector: 'text=Ver documentos', url: '/documents-new' },
      { name: 'Nova prescrição', selector: 'text=Nova prescrição', url: '/prescription/create' }
    ];
    
    for (const section of mainSections) {
      console.log(`\n📄 Testando: ${section.name}...`);
      
      try {
        await page.goto('http://localhost:3023/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        const button = await page.locator(section.selector).first();
        if (await button.count() > 0) {
          await button.click();
          await page.waitForTimeout(2000);
          
          const currentUrl = page.url();
          const navigatedCorrectly = currentUrl.includes(section.url);
          
          console.log(`   📍 URL resultado: ${currentUrl}`);
          console.log(`   ${navigatedCorrectly ? '✅' : '❌'} ${section.name} ${navigatedCorrectly ? 'funcionou' : 'falhou'}`);
          
          if (navigatedCorrectly) {
            // Verificar se a página tem conteúdo
            const bodyText = await page.textContent('body');
            const hasContent = bodyText && bodyText.trim().length > 100;
            console.log(`   📝 Conteúdo: ${hasContent ? 'OK' : 'Vazio'} (${bodyText?.length || 0} chars)`);
          }
        } else {
          console.log(`   ❌ Botão não encontrado: ${section.selector}`);
        }
      } catch (error) {
        console.log(`   💥 Erro: ${error.message}`);
      }
    }
    
    console.log('\n🧪 PASSO 4: Testando páginas específicas...');
    
    const specificPages = [
      { name: 'Criar Paciente', url: '/patients/create' },
      { name: 'Criar Template', url: '/templates/create' },
      { name: 'Lista Documentos', url: '/documents-list' },
      { name: 'Métricas', url: '/metrics' },
      { name: 'Perfil', url: '/account/profile' }
    ];
    
    for (const pageInfo of specificPages) {
      console.log(`\n📄 Testando: ${pageInfo.name}...`);
      
      try {
        await page.goto(`http://localhost:3023${pageInfo.url}`, { waitUntil: 'networkidle', timeout: 10000 });
        await page.waitForTimeout(2000);
        
        const bodyText = await page.textContent('body');
        const hasContent = bodyText && bodyText.trim().length > 50;
        const hasError = bodyText && (bodyText.includes('Error') || bodyText.includes('404'));
        
        console.log(`   ${hasContent && !hasError ? '✅' : '❌'} ${pageInfo.name}: ${bodyText?.length || 0} chars`);
        
        if (hasError) {
          console.log(`   🔥 Erro detectado na página`);
        }
        
      } catch (error) {
        console.log(`   💥 Erro ao carregar: ${error.message}`);
      }
    }
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log('===================');
    console.log(`❌ Erros JavaScript: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🔥 ERROS ENCONTRADOS:');
      errors.slice(0, 3).forEach((error, i) => {
        console.log(`   ${i + 1}. ${error}`);
      });
    }
    
    console.log('\n✅ Sistema carregado e pronto para uso manual!');
    console.log('🖱️  Navegue pelas páginas para testar todas as funcionalidades');
    console.log('⏰ Navegador permanecerá aberto por 60 segundos...\n');
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  // Manter aberto por 60 segundos
  await page.waitForTimeout(60000);
  
  console.log('\n🏁 Teste finalizado!');
  await browser.close();
})();