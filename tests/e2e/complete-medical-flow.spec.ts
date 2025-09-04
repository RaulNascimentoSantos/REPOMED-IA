import { test, expect, Page } from '@playwright/test';
import { REPOMED_CONFIG } from '../../config/master.config';

const BASE_URL = REPOMED_CONFIG.urls.frontend;
const API_URL = REPOMED_CONFIG.urls.api;

test.describe('RepoMed IA - Fluxo Médico Completo', () => {
  let page: Page;
  
  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Setup: criar usuário de teste
    await page.request.post(`${API_URL}/auth/register`, {
      data: {
        email: 'test.doctor@repomed.com',
        password: 'Test@123456',
        name: 'Dr. Test',
        crm: '123456',
        uf: 'SP'
      }
    });
  });
  
  test.afterAll(async () => {
    await page.close();
  });
  
  test('01 - Login médico', async () => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/RepoMed IA/);
    
    // Preencher login
    await page.fill('input[type="email"]', 'test.doctor@repomed.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento
    await page.waitForURL('**/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Verificar token JWT
    const localStorage = await page.evaluate(() => window.localStorage);
    expect(localStorage.token).toBeDefined();
  });
  
  test('02 - Cadastrar paciente', async () => {
    await page.goto(`${BASE_URL}/patients/new`);
    
    // Preencher dados do paciente
    await page.fill('input[name="name"]', 'João Silva Teste');
    await page.fill('input[name="cpf"]', '123.456.789-00');
    await page.fill('input[name="birthDate"]', '1990-01-15');
    await page.fill('input[name="phone"]', '(11) 98765-4321');
    await page.fill('input[name="email"]', 'joao.teste@email.com');
    
    // Adicionar alergias
    await page.click('button:text("Adicionar Alergia")');
    await page.fill('input[name="allergy"]', 'Dipirona');
    await page.keyboard.press('Enter');
    
    // Salvar
    await page.click('button:text("Salvar Paciente")');
    
    // Verificar sucesso
    await expect(page.locator('.toast-success')).toContainText('Paciente cadastrado');
    await page.waitForURL('**/patients/*');
  });
  
  test('03 - Criar prescrição', async () => {
    await page.goto(`${BASE_URL}/prescriptions/new`);
    
    // Selecionar paciente
    await page.fill('input[placeholder="Buscar paciente"]', 'João Silva');
    await page.click('text=João Silva Teste');
    
    // Adicionar diagnóstico
    await page.fill('input[name="diagnosis"]', 'Gripe');
    await page.fill('input[name="cid10"]', 'J11');
    await page.click('text=J11 - Influenza');
    
    // Adicionar medicamento
    await page.click('button:text("Adicionar Medicamento")');
    await page.fill('input[name="medication"]', 'Paracetamol');
    await page.click('text=Paracetamol 750mg');
    await page.fill('input[name="dosage"]', '750mg');
    await page.fill('input[name="frequency"]', '6/6h');
    await page.fill('input[name="duration"]', '3 dias');
    
    // Verificar alerta de alergia (se houver)
    if (await page.locator('.alert-warning').count() > 0) {
      await expect(page.locator('.alert-warning')).toContainText('Alergia');
    }
    
    // Salvar e assinar
    await page.click('button:text("Salvar e Assinar")');
    
    // Verificar PDF gerado
    await page.waitForSelector('iframe#prescription-pdf');
    const pdfFrame = page.frameLocator('iframe#prescription-pdf');
    await expect(pdfFrame.locator('body')).toBeVisible();
  });
  
  test('04 - Verificar todas as rotas', async () => {
    const routes = [
      '/dashboard',
      '/patients',
      '/prescriptions',
      '/documents',
      '/templates',
      '/atestados',
      '/laudos',
      '/exames',
      '/metrics',
      '/reports',
      '/analytics',
      '/settings'
    ];
    
    for (const route of routes) {
      await page.goto(`${BASE_URL}${route}`);
      await expect(page).not.toHaveURL('**/404');
      await expect(page.locator('h1')).toBeVisible();
    }
  });
  
  test('05 - Performance check', async () => {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });
    
    expect(metrics.domContentLoaded).toBeLessThan(2000);
    expect(metrics.loadComplete).toBeLessThan(3000);
  });
  
  test('06 - Modo escuro', async () => {
    await page.goto(`${BASE_URL}/settings`);
    await page.click('text=Modo Escuro');
    
    const isDarkMode = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(isDarkMode).toBe(true);
  });
  
  test('07 - Compartilhar documento', async () => {
    await page.goto(`${BASE_URL}/documents`);
    await page.click('.document-item:first-child button:text("Compartilhar")');
    
    // Gerar link de compartilhamento
    await page.click('button:text("Gerar Link")');
    const shareLink = await page.inputValue('input[name="shareLink"]');
    
    expect(shareLink).toContain('/shared/');
    
    // Testar acesso ao link (em nova aba)
    const newPage = await page.context().newPage();
    await newPage.goto(shareLink);
    await expect(newPage.locator('h1')).toContainText('Documento Compartilhado');
  });
  
  test('08 - Logout', async () => {
    await page.goto(`${BASE_URL}/dashboard`);
    await page.click('button[aria-label="Menu do usuário"]');
    await page.click('text=Sair');
    
    await page.waitForURL('**/login');
    
    // Verificar que token foi removido
    const localStorage = await page.evaluate(() => window.localStorage);
    expect(localStorage.token).toBeUndefined();
  });
});

test.describe('RepoMed IA - Testes de Segurança', () => {
  test('Não permite acesso sem autenticação', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);
    await expect(page).toHaveURL('**/login');
  });
  
  test('Rate limiting funciona', async ({ page }) => {
    const requests = [];
    for (let i = 0; i < 150; i++) {
      requests.push(
        page.request.get(`${API_URL}/health`)
      );
    }
    
    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status() === 429);
    
    expect(rateLimited).toBe(true);
  });
});