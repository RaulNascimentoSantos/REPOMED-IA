import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    devtools: true // Abre DevTools automaticamente
  });
  const page = await browser.newPage();
  
  console.log('🔍 DEBUG TELA BRANCA - TESTE VISUAL DETALHADO...\n');
  
  const errors = [];
  const logs = [];
  const warnings = [];
  
  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`❌ JavaScript Error: ${error.message}`);
  });
  
  page.on('console', msg => {
    const text = msg.text();
    logs.push(`[${msg.type()}] ${text}`);
    
    if (msg.type() === 'error') {
      console.log(`❌ Console Error: ${text}`);
    } else if (msg.type() === 'warn') {
      warnings.push(text);
      console.log(`⚠️  Console Warning: ${text}`);
    } else if (text.includes('RepoMed') || text.includes('React') || text.includes('Vite')) {
      console.log(`📋 Console Log: ${text}`);
    }
  });

  try {
    console.log('🔍 PASSO 1: Verificando ambas as portas disponíveis...');
    
    // Testar porta 3019
    console.log('\n📍 Testando porta 3019...');
    try {
      await page.goto('http://localhost:3019', { waitUntil: 'networkidle', timeout: 10000 });
      const title3019 = await page.title();
      const content3019 = await page.textContent('body');
      
      console.log(`   📄 Título: "${title3019}"`);
      console.log(`   📝 Conteúdo: ${content3019 && content3019.trim().length > 50 ? '✅ COM CONTEÚDO' : '❌ BRANCO'}`);
      console.log(`   📊 Tamanho: ${content3019?.length || 0} caracteres`);
      
      if (content3019 && content3019.trim().length > 50) {
        console.log(`   📖 Preview: "${content3019.slice(0, 100).replace(/\s+/g, ' ')}..."`);
      }
    } catch (error3019) {
      console.log(`   ❌ Erro porta 3019: ${error3019.message}`);
    }
    
    // Testar porta 3018
    console.log('\n📍 Testando porta 3018/3020...');
    
    const portsToTry = [3018, 3020, 3021];
    let workingPort = null;
    
    for (const port of portsToTry) {
      try {
        console.log(`   🔍 Tentando porta ${port}...`);
        await page.goto(`http://localhost:${port}`, { waitUntil: 'networkidle', timeout: 5000 });
        
        const title = await page.title();
        const content = await page.textContent('body');
        
        console.log(`      📄 Título: "${title}"`);
        console.log(`      📝 Status: ${content && content.trim().length > 50 ? '✅ COM CONTEÚDO' : '❌ BRANCO'}`);
        
        if (content && content.trim().length > 50) {
          workingPort = port;
          console.log(`      🎉 PORTA ${port} FUNCIONANDO!`);
          break;
        }
        
      } catch (portError) {
        console.log(`      ❌ Porta ${port}: ${portError.message}`);
      }
    }
    
    if (!workingPort) {
      console.log('\n❌ NENHUMA PORTA FUNCIONAL ENCONTRADA');
      console.log('🔧 Tentando diagnóstico mais profundo...');
      
      // Voltar para 3019 para diagnóstico
      await page.goto('http://localhost:3019', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(5000);
      
      console.log('\n🔍 DIAGNÓSTICO DA TELA BRANCA:');
      
      // Verificar HTML estrutura
      const htmlContent = await page.content();
      console.log(`   📄 HTML total: ${htmlContent.length} caracteres`);
      
      // Verificar elementos básicos
      const hasRoot = await page.locator('#root').count();
      const hasReact = await page.locator('[data-reactroot]').count();
      const scriptsCount = await page.locator('script').count();
      const stylesCount = await page.locator('link[rel="stylesheet"], style').count();
      const divsCount = await page.locator('div').count();
      
      console.log(`   🎯 #root element: ${hasRoot > 0 ? '✅' : '❌'} (${hasRoot})`);
      console.log(`   ⚛️  React root: ${hasReact > 0 ? '✅' : '❌'} (${hasReact})`);
      console.log(`   📜 Scripts: ${scriptsCount}`);
      console.log(`   🎨 Styles: ${stylesCount}`);
      console.log(`   📦 Divs: ${divsCount}`);
      
      // Verificar se há CSS oculto
      const hiddenElements = await page.locator('[style*="display: none"], [hidden]').count();
      console.log(`   👻 Elementos ocultos: ${hiddenElements}`);
      
      // Verificar erros de carregamento de recursos
      const failedRequests = [];
      page.on('requestfailed', request => {
        failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
      });
      
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(3000);
      
      if (failedRequests.length > 0) {
        console.log(`\n🌐 RECURSOS QUE FALHARAM:`);
        failedRequests.forEach(req => console.log(`   ❌ ${req}`));
      }
      
      // Tentar injetar conteúdo para teste
      console.log('\n🧪 TESTE DE INJEÇÃO DE CONTEÚDO:');
      
      const injectionResult = await page.evaluate(() => {
        const root = document.getElementById('root');
        if (root) {
          const originalContent = root.innerHTML;
          
          // Injetar conteúdo de teste
          root.innerHTML = '<div style="padding: 20px; background: red; color: white; font-size: 24px;">🚀 TESTE - RepoMed IA está funcionando!</div>';
          
          setTimeout(() => {
            root.innerHTML = originalContent;
          }, 3000);
          
          return {
            hasRoot: true,
            originalLength: originalContent.length,
            wasEmpty: originalContent.trim().length === 0
          };
        }
        return { hasRoot: false };
      });
      
      console.log(`   🎯 Root encontrado: ${injectionResult.hasRoot ? '✅' : '❌'}`);
      if (injectionResult.hasRoot) {
        console.log(`   📄 Conteúdo original: ${injectionResult.originalLength} chars`);
        console.log(`   📝 Estava vazio: ${injectionResult.wasEmpty ? '❌ SIM' : '✅ NÃO'}`);
      }
      
      console.log('\n   👀 Conteúdo de teste injetado por 3 segundos...');
      await page.waitForTimeout(4000);
      
      // Verificar se React está carregando
      const reactStatus = await page.evaluate(() => {
        return {
          hasReact: typeof window.React !== 'undefined',
          hasReactDOM: typeof window.ReactDOM !== 'undefined',
          windowKeys: Object.keys(window).filter(key => key.includes('React')),
          errorBoundary: window.ErrorBoundary ? 'present' : 'missing'
        };
      });
      
      console.log(`\n⚛️  STATUS DO REACT:`);
      console.log(`   React global: ${reactStatus.hasReact ? '✅' : '❌'}`);
      console.log(`   ReactDOM: ${reactStatus.hasReactDOM ? '✅' : '❌'}`);
      console.log(`   Window React keys: ${reactStatus.windowKeys.join(', ')}`);
      
    } else {
      // Testar a porta funcional
      console.log(`\n🎉 TESTANDO PORTA FUNCIONAL: ${workingPort}`);
      
      await page.goto(`http://localhost:${workingPort}`);
      await page.waitForTimeout(3000);
      
      const finalContent = await page.textContent('body');
      console.log(`   📄 Conteúdo final: ${finalContent?.slice(0, 200).replace(/\s+/g, ' ')}...`);
      
      // Testar interação
      const buttons = await page.locator('button:visible').count();
      const inputs = await page.locator('input:visible').count();
      
      console.log(`   🔘 Botões visíveis: ${buttons}`);
      console.log(`   ⌨️  Inputs visíveis: ${inputs}`);
      
      if (buttons > 0 || inputs > 0) {
        console.log(`   ✅ INTERFACE FUNCIONAL DETECTADA!`);
      }
    }
    
    console.log('\n📊 RESUMO DOS LOGS:');
    if (logs.length > 0) {
      console.log(`   📋 Total de logs: ${logs.length}`);
      logs.slice(-5).forEach(log => console.log(`   ${log}`));
    }
    
    console.log('\n⚠️  RESUMO DOS WARNINGS:');
    if (warnings.length > 0) {
      warnings.forEach(warning => console.log(`   ⚠️  ${warning}`));
    }
    
    console.log('\n❌ RESUMO DOS ERROS:');
    if (errors.length === 0) {
      console.log('   ✅ NENHUM ERRO JAVASCRIPT!');
    } else {
      errors.forEach(error => console.log(`   ❌ ${error}`));
    }
    
  } catch (error) {
    console.error(`💥 ERRO CRÍTICO: ${error.message}`);
  }
  
  console.log('\n⏰ Mantendo navegador e DevTools abertos por 45 segundos para análise visual...');
  console.log('👀 INSPECIONE VISUALMENTE: Console, Network, Elements tabs');
  
  await page.waitForTimeout(45000);
  await browser.close();
  
  console.log('\n🏁 Debug finalizado!');
})();