import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('🔍 Testando frontend em http://localhost:3013...');
  
  try {
    await page.goto('http://localhost:3013', { waitUntil: 'networkidle' });
    
    const title = await page.title();
    console.log('📄 Título da página:', title);
    
    const body = await page.textContent('body');
    console.log('📝 Conteúdo da página (primeiros 200 chars):', body.slice(0, 200));
    
    const hasReact = await page.locator('[data-reactroot], #root, #app').count();
    console.log('⚛️  React detectado:', hasReact > 0 ? 'SIM' : 'NÃO');
    
    const scripts = await page.locator('script').count();
    console.log('📜 Scripts carregados:', scripts);
    
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    
    await page.waitForTimeout(2000);
    
    console.log('❌ Erros JavaScript:', errors.length > 0 ? errors : 'Nenhum');
    
    if (errors.length === 0 && hasReact === 0 && body.length < 50) {
      console.log('⚠️  PÁGINA EM BRANCO DETECTADA!');
    } else if (errors.length === 0) {
      console.log('✅ Página carregou com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar página:', error.message);
  }
  
  await browser.close();
})();