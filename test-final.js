import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🚀 TESTE FINAL - RepoMed IA com todos os fixes...\n');
  
  const errors = [];
  const warnings = [];
  const logs = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JS Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${msg.text()}`);
    } else if (msg.type() === 'warn') {
      warnings.push(msg.text());
    } else if (msg.type() === 'log' && msg.text().includes('RepoMed')) {
      logs.push(msg.text());
    }
  });

  try {
    console.log('🔍 Acessando http://localhost:3016...');
    await page.goto('http://localhost:3016', { waitUntil: 'networkidle' });
    console.log('⏳ Aguardando carregamento completo...');
    await page.waitForTimeout(7000); // 7 segundos para carregar completamente
    
    const title = await page.title();
    console.log(`\n📄 Título: "${title}"`);
    
    const reactRoot = await page.locator('#root').count();
    console.log(`⚛️  React root: ${reactRoot > 0 ? '✅ DETECTADO' : '❌ NÃO ENCONTRADO'}`);
    
    const bodyContent = await page.textContent('body');
    const hasContent = bodyContent && bodyContent.trim().length > 50;
    const contentLength = bodyContent ? bodyContent.trim().length : 0;
    
    console.log(`📝 Conteúdo: ${hasContent ? '✅ COM CONTEÚDO' : '❌ PÁGINA EM BRANCO'} (${contentLength} chars)`);
    
    if (hasContent) {
      // Mostrar preview do conteúdo
      const preview = bodyContent.slice(0, 200).replace(/\s+/g, ' ').trim();
      console.log(`📖 Preview: "${preview}..."`);
      
      // Análise detalhada da interface
      console.log(`\n🎨 ANÁLISE DA INTERFACE:`);
      
      const elements = {
        nav: await page.locator('nav, [role="navigation"]').count(),
        header: await page.locator('header, [class*="header"]').count(),
        main: await page.locator('main, [role="main"], [class*="main"]').count(),
        sidebar: await page.locator('[class*="sidebar"], [class*="menu"], aside').count(),
        buttons: await page.locator('button').count(),
        links: await page.locator('a').count(),
        forms: await page.locator('form').count(),
        inputs: await page.locator('input').count(),
        cards: await page.locator('[class*="card"]').count(),
        tables: await page.locator('table').count()
      };
      
      Object.entries(elements).forEach(([key, count]) => {
        console.log(`   ${key.padEnd(8)}: ${count > 0 ? '✅' : '❌'} ${count}`);
      });
      
      // Verificar texto específico do RepoMed
      const repomedTexts = [
        { name: 'RepoMed', selector: 'text=/RepoMed/i' },
        { name: 'Documentos', selector: 'text=/Documentos/i' },
        { name: 'Pacientes', selector: 'text=/Pacientes/i' },
        { name: 'Templates', selector: 'text=/Templates/i' },
        { name: 'Login', selector: 'text=/Login|Entrar/i' },
        { name: 'Dashboard', selector: 'text=/Dashboard|Painel/i' }
      ];
      
      console.log(`\n🏥 ELEMENTOS DO REPOMED:`);
      for (const text of repomedTexts) {
        const count = await page.locator(text.selector).count();
        console.log(`   ${text.name.padEnd(10)}: ${count > 0 ? '✅' : '❌'} ${count}`);
      }
      
      // Teste de interação básica
      console.log(`\n🔧 TESTE DE INTERAÇÕES:`);
      
      // Tentar clicar no primeiro botão visível
      const visibleButtons = await page.locator('button:visible').all();
      if (visibleButtons.length > 0) {
        try {
          const firstButton = visibleButtons[0];
          const buttonText = (await firstButton.textContent()) || 'Sem texto';
          console.log(`   Clicando em: "${buttonText.trim()}"`);
          await firstButton.click();
          await page.waitForTimeout(1000);
          console.log(`   ✅ Click funcionou`);
        } catch (clickError) {
          console.log(`   ❌ Erro no click: ${clickError.message}`);
        }
      } else {
        console.log(`   ⚠️  Nenhum botão visível para testar`);
      }
      
    } else {
      // Diagnóstico de página em branco
      console.log(`\n🔍 DIAGNÓSTICO DE PÁGINA EM BRANCO:`);
      
      const htmlContent = await page.content();
      console.log(`   HTML length: ${htmlContent.length} chars`);
      
      const scripts = await page.locator('script').count();
      const stylesheets = await page.locator('link[rel="stylesheet"]').count();
      const divs = await page.locator('div').count();
      
      console.log(`   Scripts: ${scripts}`);
      console.log(`   CSS files: ${stylesheets}`);
      console.log(`   Divs: ${divs}`);
      
      // Verificar se há elementos ocultos
      const hiddenElements = await page.locator('[style*="display: none"], [hidden]').count();
      console.log(`   Elementos ocultos: ${hiddenElements}`);
    }
    
    // Relatório de logs importantes
    if (logs.length > 0) {
      console.log(`\n📋 LOGS DO SISTEMA:`);
      logs.forEach(log => console.log(`   • ${log}`));
    }
    
    // RESULTADO FINAL
    console.log(`\n🏆 RESULTADO FINAL:`);
    console.log(`===============================`);
    
    if (errors.length === 0 && hasContent) {
      console.log('🎉 SUCESSO COMPLETO!');
      console.log('✅ Sem erros JavaScript');
      console.log('✅ Conteúdo renderizado');
      console.log('✅ React funcionando');
      console.log('✅ Interface carregada');
      console.log('\n🚀 FRONTEND TOTALMENTE FUNCIONAL!');
    } else if (errors.length === 0 && !hasContent) {
      console.log('⚠️  SUCESSO PARCIAL');
      console.log('✅ Sem erros JavaScript');
      console.log('❌ Página em branco');
      console.log('ℹ️  Possível problema de renderização');
    } else {
      console.log('❌ FALHA DETECTADA');
      console.log(`❌ ${errors.length} erro(s) JavaScript:`);
      errors.forEach((error, i) => console.log(`   ${i+1}. ${error}`));
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  ${warnings.length} warning(s) encontrados`);
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  console.log(`\n⏰ Mantendo navegador aberto por 8 segundos...`);
  await page.waitForTimeout(8000);
  await browser.close();
  
  console.log(`\n🏁 Teste finalizado!`);
})();