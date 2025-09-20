import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

/**
 * RepoMed IA - Testes de Contraste Médico
 * Validação específica de contraste para aplicações médicas
 */

test.describe('Medical Color Contrast Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3023');
    await injectAxe(page);
  });

  test('Medical status colors - contrast validation', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes');

    // Verificar contraste de cores de status médico
    const statusElements = [
      '.bg-green-600', // Status ativo
      '.bg-red-600',   // Status expirado
      '.bg-yellow-600', // Status pendente
      '.bg-blue-600',   // Status processando
    ];

    for (const selector of statusElements) {
      const elements = await page.locator(selector).count();

      if (elements > 0) {
        // Verificar se texto dentro do elemento tem contraste adequado
        const textColor = await page.locator(selector).first().evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            color: style.color,
            backgroundColor: style.backgroundColor,
          };
        });

        console.log(`Status color validation: ${selector}`, textColor);

        // O contraste será validado pelo axe-core
        await checkA11y(page, selector, {
          rules: {
            'color-contrast': { enabled: true }
          }
        });
      }
    }
  });

  test('Medical form validation - error contrast', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes/nova');

    // Tentar enviar formulário para gerar erros
    const submitButton = page.locator('button[type="submit"], button:has-text("Salvar")');

    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(1000);

      // Verificar contraste de mensagens de erro
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      });
    }
  });

  test('Medical themes - all variants contrast', async ({ page }) => {
    const themes = [
      'default',
      'light',
      'dark',
      'medical-blue',
      'medical-green',
      'medical-red',
      'high-contrast'
    ];

    for (const theme of themes) {
      // Aplicar tema via localStorage
      await page.evaluate((themeName) => {
        localStorage.setItem('theme', themeName);
        document.documentElement.setAttribute('data-theme', themeName);
      }, theme);

      await page.reload();
      await page.waitForTimeout(500);

      console.log(`Testing contrast for theme: ${theme}`);

      // Verificar contraste para cada tema
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'color-contrast-enhanced': { enabled: true }
        }
      });
    }
  });

  test('Medical buttons - focus contrast', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes');

    const buttons = await page.locator('button, a[role="button"]').count();

    if (buttons > 0) {
      // Testar contraste no estado focus
      const firstButton = page.locator('button, a[role="button"]').first();

      await firstButton.focus();

      // Verificar se outline/focus tem contraste adequado
      const focusStyle = await firstButton.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          outline: style.outline,
          outlineColor: style.outlineColor,
          boxShadow: style.boxShadow,
        };
      });

      console.log('Focus style:', focusStyle);

      // Validar contraste em estado focus
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'focus-visible': { enabled: true }
        }
      });
    }
  });

  test('Medical data visualization - accessible colors', async ({ page }) => {
    await page.goto('http://localhost:3023');

    // Procurar por gráficos ou visualizações
    const charts = await page.locator('[data-testid*="chart"], .recharts-wrapper, svg').count();

    if (charts > 0) {
      // Verificar se gráficos usam cores acessíveis
      await checkA11y(page, null, {
        rules: {
          'color-contrast': { enabled: true },
          'svg-img-alt': { enabled: true }
        }
      });
    }
  });

  test('Medical alerts - critical color contrast', async ({ page }) => {
    await page.goto('http://localhost:3023/prescricoes/nova');

    // Buscar por alertas médicos críticos
    const alertSelectors = [
      '[role="alert"]',
      '.alert-danger',
      '.alert-warning',
      '.alert-success',
      '[aria-live="assertive"]'
    ];

    for (const selector of alertSelectors) {
      const alerts = await page.locator(selector).count();

      if (alerts > 0) {
        // Alertas médicos devem ter contraste aprimorado
        await checkA11y(page, selector, {
          rules: {
            'color-contrast-enhanced': { enabled: true }
          }
        });
      }
    }
  });
});