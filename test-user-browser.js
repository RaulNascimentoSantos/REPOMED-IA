// Teste completo de usuário navegando pelo RepoMed IA
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const FRONTEND_URL = 'http://localhost:3021';
const BACKEND_URL = 'http://localhost:8085';

class UserTester {
  constructor() {
    this.results = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      issues: [],
      screenshots: [],
      performance: {},
      interactions: []
    };
  }

  async init() {
    console.log('🌐 Iniciando teste de usuário com navegador real...');
    this.browser = await puppeteer.launch({
      headless: false, // Mostrar navegador
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Configurar listeners para erros
    this.page.on('error', (error) => {
      this.addIssue('ERROR', 'JavaScript Error', error.message);
    });
    
    this.page.on('pageerror', (error) => {
      this.addIssue('ERROR', 'Page Error', error.message);
    });
    
    this.page.on('requestfailed', (request) => {
      this.addIssue('WARNING', 'Request Failed', `${request.method()} ${request.url()}`);
    });
    
    console.log('✅ Navegador iniciado com sucesso!');
  }

  async addIssue(type, category, message) {
    this.results.issues.push({
      type,
      category,
      message,
      timestamp: new Date().toISOString(),
      url: await this.page.url()
    });
    console.log(`${type}: ${category} - ${message}`);
  }

  async takeScreenshot(name) {
    const filename = `screenshot-${Date.now()}-${name}.png`;
    const filepath = path.join(__dirname, 'screenshots', filename);
    
    // Criar diretório se não existir
    if (!fs.existsSync(path.dirname(filepath))) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
    }
    
    await this.page.screenshot({ path: filepath, fullPage: true });
    this.results.screenshots.push({ name, filename, filepath });
    console.log(`📸 Screenshot salva: ${filename}`);
  }

  async clickAndTest(selector, description) {
    try {
      console.log(`🖱️ Testando: ${description}`);
      this.results.totalTests++;
      
      await this.page.waitForSelector(selector, { timeout: 5000 });
      
      // Scroll para o elemento
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, selector);
      
      await this.page.waitForTimeout(500); // Aguardar scroll
      
      const startTime = Date.now();
      await this.page.click(selector);
      await this.page.waitForTimeout(1000); // Aguardar interação
      const endTime = Date.now();
      
      this.results.interactions.push({
        description,
        selector,
        responseTime: endTime - startTime,
        success: true
      });
      
      this.results.passed++;
      console.log(`✅ ${description} - OK (${endTime - startTime}ms)`);
      return true;
    } catch (error) {
      this.addIssue('ERROR', 'Click Failed', `${description}: ${error.message}`);
      this.results.failed++;
      return false;
    }
  }

  async testPage(url, pageName) {
    console.log(`\n📄 === TESTANDO PÁGINA: ${pageName.toUpperCase()} ===`);
    
    try {
      const startTime = Date.now();
      await this.page.goto(url, { waitUntil: 'networkidle0', timeout: 10000 });
      const loadTime = Date.now() - startTime;
      
      this.results.performance[pageName] = {
        loadTime,
        url
      };
      
      console.log(`⏱️ Página carregada em ${loadTime}ms`);
      
      // Screenshot da página
      await this.takeScreenshot(pageName);
      
      // Aguardar um pouco para renderização
      await this.page.waitForTimeout(2000);
      
      return true;
    } catch (error) {
      this.addIssue('ERROR', 'Page Load Failed', `${pageName}: ${error.message}`);
      return false;
    }
  }

  async testHomePage() {
    await this.testPage(FRONTEND_URL, 'home');
    
    // Testar elementos da página inicial
    console.log('🏠 Testando elementos da página inicial...');
    
    // Testar logo
    try {
      await this.page.waitForSelector('.logo', { timeout: 3000 });
      console.log('✅ Logo encontrado');
    } catch {
      this.addIssue('WARNING', 'Element Missing', 'Logo não encontrado');
    }
    
    // Testar menu de navegação
    const menuItems = await this.page.$$('.nav-link, .menu-item, a[href*="/"]');
    console.log(`📋 Encontrados ${menuItems.length} links de navegação`);
    
    for (let i = 0; i < Math.min(menuItems.length, 10); i++) {
      try {
        const link = menuItems[i];
        const href = await link.evaluate(el => el.getAttribute('href'));
        const text = await link.evaluate(el => el.textContent?.trim());
        
        if (href && !href.startsWith('http') && !href.includes('#')) {
          console.log(`🔗 Testando link: ${text || href}`);
          await this.clickAndTest(`.nav-link[href="${href}"], a[href="${href}"]`, `Link: ${text || href}`);
          await this.page.waitForTimeout(1000);
        }
      } catch (error) {
        console.log(`⚠️ Erro ao testar link ${i}: ${error.message}`);
      }
    }
  }

  async testAuthFlow() {
    console.log('\n🔐 === TESTANDO AUTENTICAÇÃO ===');
    
    // Ir para página de login
    await this.testPage(`${FRONTEND_URL}/auth/login`, 'login');
    
    // Testar campos de login
    await this.page.waitForTimeout(2000);
    
    try {
      // Verificar se existem campos de login
      const emailField = await this.page.$('input[type="email"], input[name="email"], #email');
      const passwordField = await this.page.$('input[type="password"], input[name="password"], #password');
      
      if (emailField && passwordField) {
        console.log('📝 Preenchendo formulário de login...');
        
        // Preencher campos
        await this.page.focus('input[type="email"], input[name="email"], #email');
        await this.page.type('input[type="email"], input[name="email"], #email', 'test@test.com', { delay: 100 });
        
        await this.page.focus('input[type="password"], input[name="password"], #password');
        await this.page.type('input[type="password"], input[name="password"], #password', 'password', { delay: 100 });
        
        // Screenshot do formulário preenchido
        await this.takeScreenshot('login-filled');
        
        // Clicar no botão de login
        const loginButton = await this.page.$('button[type="submit"], .btn-login, .login-button, button:contains("Entrar")');
        if (loginButton) {
          console.log('🚀 Clicando no botão de login...');
          await loginButton.click();
          
          // Aguardar redirecionamento ou resposta
          await this.page.waitForTimeout(3000);
          await this.takeScreenshot('after-login');
          
          const currentUrl = this.page.url();
          if (!currentUrl.includes('/auth/login')) {
            console.log('✅ Login realizado com sucesso - redirecionado');
            this.results.passed++;
          } else {
            console.log('❌ Login falhou - ainda na página de login');
            this.results.failed++;
          }
        }
      } else {
        this.addIssue('ERROR', 'Form Missing', 'Campos de login não encontrados');
      }
    } catch (error) {
      this.addIssue('ERROR', 'Login Failed', error.message);
    }
  }

  async testAllButtons() {
    console.log('\n🔘 === TESTANDO TODOS OS BOTÕES ===');
    
    const buttons = await this.page.$$('button, .btn, .button, [role="button"]');
    console.log(`🎯 Encontrados ${buttons.length} botões para testar`);
    
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      try {
        const button = buttons[i];
        const text = await button.evaluate(el => el.textContent?.trim());
        const className = await button.evaluate(el => el.className);
        
        if (text && text.length < 50) {
          console.log(`🔘 Testando botão: "${text}"`);
          
          // Scroll para o botão
          await button.evaluate(el => el.scrollIntoView({ behavior: 'smooth', block: 'center' }));
          await this.page.waitForTimeout(500);
          
          // Verificar se é clicável
          const isEnabled = await button.evaluate(el => !el.disabled && el.style.pointerEvents !== 'none');
          
          if (isEnabled) {
            const startTime = Date.now();
            await button.click();
            await this.page.waitForTimeout(1000);
            const responseTime = Date.now() - startTime;
            
            this.results.interactions.push({
              description: `Botão: ${text}`,
              selector: className ? `.${className.split(' ')[0]}` : 'button',
              responseTime,
              success: true
            });
            
            console.log(`✅ Botão "${text}" clicado - ${responseTime}ms`);
            this.results.passed++;
          } else {
            console.log(`⚠️ Botão "${text}" está desabilitado`);
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao testar botão ${i}: ${error.message}`);
        this.results.failed++;
      }
    }
  }

  async testResponsiveness() {
    console.log('\n📱 === TESTANDO RESPONSIVIDADE ===');
    
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      console.log(`📐 Testando ${viewport.name} (${viewport.width}x${viewport.height})`);
      await this.page.setViewport(viewport);
      await this.page.waitForTimeout(1000);
      await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
      
      // Verificar se elementos estão visíveis
      const visibleElements = await this.page.$$eval('*', elements => 
        elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length
      );
      
      console.log(`✅ ${visibleElements} elementos visíveis em ${viewport.name}`);
    }
    
    // Voltar para desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testPerformance() {
    console.log('\n⚡ === TESTANDO PERFORMANCE ===');
    
    const performanceMetrics = await this.page.metrics();
    
    this.results.performance.metrics = {
      timestamp: Date.now(),
      ...performanceMetrics
    };
    
    console.log('📊 Métricas de Performance:');
    console.log(`- Timestamp: ${performanceMetrics.Timestamp}`);
    console.log(`- Documents: ${performanceMetrics.Documents}`);
    console.log(`- JSEventListeners: ${performanceMetrics.JSEventListeners}`);
    console.log(`- Nodes: ${performanceMetrics.Nodes}`);
    console.log(`- ScriptDuration: ${performanceMetrics.ScriptDuration}`);
    console.log(`- TaskDuration: ${performanceMetrics.TaskDuration}`);
  }

  async generateReport() {
    console.log('\n📋 === GERANDO RELATÓRIO ===');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.totalTests,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: ((this.results.passed / this.results.totalTests) * 100).toFixed(2) + '%'
      },
      performance: this.results.performance,
      interactions: this.results.interactions,
      issues: this.results.issues,
      screenshots: this.results.screenshots.map(s => s.filename)
    };
    
    // Salvar relatório
    const reportPath = path.join(__dirname, 'user-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Gerar relatório HTML
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(__dirname, 'user-test-report.html');
    fs.writeFileSync(htmlPath, htmlReport);
    
    console.log(`📄 Relatório salvo em: ${reportPath}`);
    console.log(`🌐 Relatório HTML: ${htmlPath}`);
    
    return report;
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RepoMed IA - Relatório de Teste de Usuário</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat-number { font-size: 2em; font-weight: bold; color: #667eea; }
        .section { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .success { color: #10b981; }
        .error { color: #ef4444; }
        .warning { color: #f59e0b; }
        .interaction-item { padding: 10px; border-left: 4px solid #667eea; margin: 10px 0; background: #f8fafc; }
        .issue-item { padding: 10px; border-left: 4px solid #ef4444; margin: 10px 0; background: #fef2f2; }
        .screenshot-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }
        .screenshot { text-align: center; }
        .screenshot img { max-width: 100%; border-radius: 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 RepoMed IA - Teste de Usuário Completo</h1>
            <p>Relatório gerado em: ${new Date(report.timestamp).toLocaleString('pt-BR')}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${report.summary.totalTests}</div>
                <div>Total de Testes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number success">${report.summary.passed}</div>
                <div>Aprovados</div>
            </div>
            <div class="stat-card">
                <div class="stat-number error">${report.summary.failed}</div>
                <div>Falharam</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${report.summary.successRate}</div>
                <div>Taxa de Sucesso</div>
            </div>
        </div>

        <div class="section">
            <h2>⚡ Performance</h2>
            ${Object.entries(report.performance).map(([key, value]) => 
                typeof value === 'object' && value.loadTime 
                    ? `<div class="interaction-item"><strong>${key}:</strong> ${value.loadTime}ms</div>`
                    : ''
            ).join('')}
        </div>

        <div class="section">
            <h2>🖱️ Interações Testadas</h2>
            ${report.interactions.map(interaction => `
                <div class="interaction-item">
                    <strong>${interaction.description}</strong><br>
                    Seletor: <code>${interaction.selector}</code><br>
                    Tempo de resposta: ${interaction.responseTime}ms
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>🚨 Problemas Encontrados</h2>
            ${report.issues.length === 0 ? 
                '<div class="success">✅ Nenhum problema encontrado!</div>' :
                report.issues.map(issue => `
                    <div class="issue-item">
                        <strong class="${issue.type.toLowerCase()}">${issue.type}: ${issue.category}</strong><br>
                        ${issue.message}<br>
                        <small>URL: ${issue.url}</small>
                    </div>
                `).join('')
            }
        </div>

        <div class="section">
            <h2>📸 Screenshots</h2>
            <div class="screenshot-grid">
                ${report.screenshots.map(screenshot => `
                    <div class="screenshot">
                        <img src="screenshots/${screenshot}" alt="Screenshot">
                        <p>${screenshot}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  async runAllTests() {
    try {
      await this.init();
      
      // Teste 1: Página inicial
      await this.testHomePage();
      
      // Teste 2: Autenticação
      await this.testAuthFlow();
      
      // Teste 3: Todos os botões
      await this.testAllButtons();
      
      // Teste 4: Responsividade
      await this.testResponsiveness();
      
      // Teste 5: Performance
      await this.testPerformance();
      
      // Gerar relatório
      const report = await this.generateReport();
      
      console.log('\n🎉 === TESTE COMPLETO FINALIZADO ===');
      console.log(`📊 Resumo: ${report.summary.passed}/${report.summary.totalTests} testes passaram (${report.summary.successRate})`);
      console.log(`🚨 Problemas: ${report.issues.length}`);
      console.log(`📸 Screenshots: ${report.screenshots.length}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Erro durante os testes:', error);
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
}

// Executar testes
async function main() {
  const tester = new UserTester();
  await tester.runAllTests();
}

// Executar automaticamente
main().catch(console.error);

export default UserTester;