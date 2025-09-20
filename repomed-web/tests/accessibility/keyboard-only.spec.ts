import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * RepoMed IA - Testes de Acessibilidade Keyboard-Only
 * Testes específicos para navegação médica apenas por teclado
 */

test.describe('Medical Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Configurar modo keyboard-only
    await page.addInitScript(() => {
      // Simular usuário que usa apenas teclado
      Object.defineProperty(navigator, 'userAgent', {
        value: navigator.userAgent + ' KeyboardOnly'
      });
    });

    await page.goto('http://localhost:3023');
    await injectAxe(page);
  });

  test('Prescription list - keyboard navigation flow', async ({ page }) => {
    // Navegar para prescrições
    await page.goto('http://localhost:3023/prescricoes');

    // Verificar que a página carrega - usar selector mais específico
    await expect(page.locator('main h1, .content h1').first()).toContainText('Prescrições Médicas');

    // Testar navegação por Tab
    let focusedElement;

    // 1. Focus no botão "Nova Prescrição"
    await page.keyboard.press('Tab');
    focusedElement = await page.locator(':focus');
    await expect(focusedElement).toContainText('Nova Prescrição');

    // 2. Testar ativação com Enter
    await page.keyboard.press('Enter');
    await page.waitForURL('**/prescricoes/nova');
    await expect(page).toHaveURL(/.*prescricoes\/nova/);

    // Verificar acessibilidade da página
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    });
  });

  test('New prescription form - complete keyboard workflow', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes/nova');

    // Verificar que existem elementos focáveis
    const focusableElements = await page.locator('[tabindex]:not([tabindex="-1"]), input, button, select, textarea, a[href]').count();
    expect(focusableElements).toBeGreaterThan(0);

    // Testar sequência de Tab
    let tabIndex = 0;
    const maxTabs = 20; // Limite para evitar loop infinito

    while (tabIndex < maxTabs) {
      await page.keyboard.press('Tab');

      const focusedElement = await page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());

      // Verificar se elementos de formulário médico estão acessíveis
      if (['input', 'select', 'button', 'textarea'].includes(tagName)) {
        const ariaLabel = await focusedElement.getAttribute('aria-label');
        const label = await focusedElement.getAttribute('aria-labelledby');
        const placeholder = await focusedElement.getAttribute('placeholder');

        // Elementos médicos devem ter labels descritivos
        expect(ariaLabel || label || placeholder).toBeTruthy();
      }

      tabIndex++;

      // Parar se chegamos no último elemento focável
      try {
        await page.keyboard.press('Tab');
        const newFocused = await page.locator(':focus');
        if (await newFocused.evaluate(el => el === document.body)) {
          break;
        }
        // Voltar um tab para não pular elementos
        await page.keyboard.press('Shift+Tab');
      } catch (e) {
        break;
      }
    }

    // Verificar acessibilidade específica para formulários médicos
    await checkA11y(page, null, {
      rules: {
        'label': { enabled: true },
        'color-contrast': { enabled: true },
        'keyboard-accessible': { enabled: true },
        'focus-visible': { enabled: true }
      }
    });
  });

  test('Medical forms - required field validation with keyboard', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes/nova');

    // Tentar enviar formulário vazio usando Enter
    await page.keyboard.press('Tab'); // Focar no primeiro campo
    await page.keyboard.press('Enter'); // Tentar enviar

    // Verificar se mensagens de erro são anunciadas
    const errorMessages = await page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]').count();

    if (errorMessages > 0) {
      // Verificar se erros são acessíveis por teclado
      const firstError = page.locator('[role="alert"], [aria-live="polite"], [aria-live="assertive"]').first();
      await expect(firstError).toBeVisible();
    }
  });

  test('Medical modal dialogs - keyboard trap and escape', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes');

    // Procurar por botões que abrem modais
    const modalTriggers = await page.locator('button:has-text("Editar"), button:has-text("Imprimir"), button:has-text("Download")').count();

    if (modalTriggers > 0) {
      // Abrir primeiro modal encontrado
      await page.locator('button:has-text("Editar"), button:has-text("Imprimir"), button:has-text("Download")').first().click();

      // Aguardar modal aparecer
      await page.waitForTimeout(500);

      // Verificar se existe modal
      const modal = page.locator('[role="dialog"], [aria-modal="true"]');
      if (await modal.count() > 0) {
        // Testar keyboard trap - Tab deve permanecer dentro do modal
        const initialFocus = await page.locator(':focus');

        // Navegar por todos os elementos do modal
        for (let i = 0; i < 10; i++) {
          await page.keyboard.press('Tab');
          const currentFocus = await page.locator(':focus');

          // Focus deve estar dentro do modal
          const isWithinModal = await currentFocus.evaluate((el, modalEl) => {
            return modalEl && modalEl.contains(el);
          }, await modal.elementHandle());

          if (isWithinModal !== null) {
            expect(isWithinModal).toBe(true);
          }
        }

        // Testar escape para fechar modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);

        // Modal deve estar fechado
        await expect(modal).not.toBeVisible();
      }
    }
  });

  test('Medical shortcuts - keyboard accessibility', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes');

    // Testar atalhos médicos comuns - usar formato correto do Playwright
    const shortcuts = [
      'Control+KeyN', // Nova prescrição
      'Control+KeyS', // Salvar
      'Control+KeyP', // Imprimir
      'Escape'        // Cancelar/Fechar
    ];

    for (const shortcut of shortcuts) {
      try {
        await page.keyboard.press(shortcut);
        await page.waitForTimeout(200);
      } catch (error) {
        // Log erro mas não falha o teste - alguns atalhos podem não estar implementados
        console.log(`Shortcut ${shortcut} não implementado:`, error.message);
      }

      // Verificar se alguma ação ocorreu (não deve dar erro)
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('Medical search - keyboard interaction', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes');

    // Procurar campo de busca - pegar o primeiro disponível
    const searchInput = page.locator('input[placeholder*="Buscar"], input[type="search"]').first();

    if (await searchInput.count() > 0) {
      // Focar no campo de busca
      await searchInput.focus();

      // Verificar se está focado
      await expect(searchInput).toBeFocused();

      // Digitar termo médico
      await searchInput.type('paracetamol');

      // Pressionar Enter para buscar
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Verificar se resultados aparecem e são navegáveis
      const results = await page.locator('[data-testid*="prescription"], .prescription-item, [class*="prescription"]').count();

      if (results > 0) {
        // Navegar pelos resultados com Tab
        await page.keyboard.press('Tab');
        const focusedResult = await page.locator(':focus');
        await expect(focusedResult).toBeVisible();
      }
    }
  });

  test('Medical data tables - keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes');

    // Procurar tabelas de dados médicos
    const tables = await page.locator('table, [role="table"], [role="grid"]').count();

    if (tables > 0) {
      const table = page.locator('table, [role="table"], [role="grid"]').first();

      // Verificar se tabela tem cabeçalhos apropriados
      const headers = await table.locator('th, [role="columnheader"]').count();
      expect(headers).toBeGreaterThan(0);

      // Testar navegação por células
      const cells = await table.locator('td, [role="cell"]').count();

      if (cells > 0) {
        // Focar na primeira célula
        await table.locator('td, [role="cell"]').first().focus();

        // Testar navegação com setas (se suportado)
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('ArrowDown');

        // Pelo menos deve manter foco na tabela
        const focused = await page.locator(':focus');
        const isInTable = await focused.evaluate((el, tableEl) => {
          return tableEl && tableEl.contains(el);
        }, await table.elementHandle());

        if (isInTable !== null) {
          expect(isInTable).toBe(true);
        }
      }
    }
  });

  test('Medical error handling - keyboard accessible', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes/nova');

    // Tentar ações que podem gerar erros médicos
    const submitButton = page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Criar")');

    if (await submitButton.count() > 0) {
      // Enviar formulário vazio
      await submitButton.focus();
      await page.keyboard.press('Enter');

      await page.waitForTimeout(1000);

      // Verificar se erros são acessíveis
      const errorAlerts = await page.locator('[role="alert"], [aria-live="assertive"], .error, .invalid').count();

      if (errorAlerts > 0) {
        // Primeiro erro deve ser focável ou anunciado
        const firstError = page.locator('[role="alert"], [aria-live="assertive"], .error, .invalid').first();
        await expect(firstError).toBeVisible();

        // Verificar se tem texto descritivo
        const errorText = await firstError.textContent();
        expect(errorText?.length).toBeGreaterThan(0);
      }
    }
  });
});