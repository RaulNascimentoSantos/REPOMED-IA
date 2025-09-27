/**
 * 🏠 Home PRO V9 - Testes E2E
 *
 * Testes automatizados para validar:
 * - Eliminação de branding duplicado
 * - Funcionalidade de componentes
 * - Responsividade
 * - Acessibilidade
 * - Temas (dark/light/medical/clinical)
 */

import { test, expect } from '@playwright/test';

test.describe('Home PRO V9 - Visual & UX Re-arquitetura', () => {
  test.beforeEach(async ({ page }) => {
    // Habilitar feature flag antes dos testes
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('repomed-feature-flags', JSON.stringify({
        FF_HOME_PRO_V9: true
      }));
    });
    await page.goto('/home');
  });

  test.describe('Estrutura e Layout', () => {
    test('deve exibir layout Home PRO V9 quando feature flag ativa', async ({ page }) => {
      // Verificar se o container principal existe
      await expect(page.locator('.homePro')).toBeVisible();

      // Verificar estrutura above/below fold
      await expect(page.locator('.aboveFold')).toBeVisible();
      await expect(page.locator('.belowFold')).toBeVisible();
    });

    test('deve ter todos os componentes principais visíveis', async ({ page }) => {
      // Header
      await expect(page.locator('.header')).toBeVisible();

      // KPI Rail
      await expect(page.locator('.kpiRail')).toBeVisible();

      // Alerts
      await expect(page.locator('.alertsSection')).toBeVisible();

      // Quick Actions
      await expect(page.locator('.quickActionsSection')).toBeVisible();

      // Insights
      await expect(page.locator('.insightsSection')).toBeVisible();

      // Recent Activity
      await expect(page.locator('.recentActivitySection')).toBeVisible();
    });
  });

  test.describe('Header - Sem Branding Duplicado', () => {
    test('deve exibir apenas uma vez o nome "RepoMed IA"', async ({ page }) => {
      const repomedTexts = await page.locator('text=RepoMed IA').count();

      // Deve aparecer apenas no sidebar, não no header
      expect(repomedTexts).toBeLessThanOrEqual(1);
    });

    test('deve exibir saudação personalizada', async ({ page }) => {
      const greeting = page.locator('.greeting');
      await expect(greeting).toBeVisible();

      // Verificar se contém saudação baseada no horário
      const greetingText = await greeting.textContent();
      expect(greetingText).toMatch(/(Bom dia|Boa tarde|Boa noite)/);
    });

    test('deve exibir informações do médico', async ({ page }) => {
      await expect(page.locator('.crmNumber')).toBeVisible();
      await expect(page.locator('.systemStatus')).toBeVisible();
    });

    test('deve ter botões de ação funcionais', async ({ page }) => {
      await expect(page.locator('.notificationButton')).toBeVisible();
      await expect(page.locator('.profileButton')).toBeVisible();
    });
  });

  test.describe('KPI Rail - Números Grandes', () => {
    test('deve exibir KPIs com números grandes (48px)', async ({ page }) => {
      const kpiValues = page.locator('.kpiValue');
      await expect(kpiValues.first()).toBeVisible();

      // Verificar se a fonte é grande (48px no CSS)
      const fontSize = await kpiValues.first().evaluate(el =>
        window.getComputedStyle(el).fontSize
      );
      expect(parseInt(fontSize)).toBeGreaterThanOrEqual(48);
    });

    test('deve exibir pelo menos 4 KPIs', async ({ page }) => {
      const kpiCards = page.locator('.kpiCard');
      expect(await kpiCards.count()).toBeGreaterThanOrEqual(4);
    });

    test('deve ter ícones e tendências visíveis', async ({ page }) => {
      await expect(page.locator('.kpiIcon').first()).toBeVisible();
      await expect(page.locator('.kpiTrend').first()).toBeVisible();
    });
  });

  test.describe('Alerts - Máximo 3 com Filetes', () => {
    test('deve exibir no máximo 3 alertas', async ({ page }) => {
      const alertCards = page.locator('.alertCard');
      const alertCount = await alertCards.count();
      expect(alertCount).toBeLessThanOrEqual(3);
    });

    test('deve ter alertas com bordas coloridas superiores', async ({ page }) => {
      const alerts = page.locator('.alertCard');

      if (await alerts.count() > 0) {
        // Verificar se tem classes de tipo (critical, warning, info)
        const firstAlert = alerts.first();
        const className = await firstAlert.getAttribute('class');
        expect(className).toMatch(/(alertCritical|alertWarning|alertInfo)/);
      }
    });

    test('deve ter botões de ação nos alertas', async ({ page }) => {
      const actionButtons = page.locator('.alertActionButton');
      const dismissButtons = page.locator('.alertDismissButton');

      if (await actionButtons.count() > 0) {
        await expect(actionButtons.first()).toBeVisible();
      }
      if (await dismissButtons.count() > 0) {
        await expect(dismissButtons.first()).toBeVisible();
      }
    });
  });

  test.describe('Quick Actions - Grade 3×2', () => {
    test('deve exibir ações em layout de grid', async ({ page }) => {
      const quickActionsGrid = page.locator('.quickActionsGrid');
      await expect(quickActionsGrid).toBeVisible();

      // Verificar se tem estilo grid
      const display = await quickActionsGrid.evaluate(el =>
        window.getComputedStyle(el).display
      );
      expect(display).toBe('grid');
    });

    test('deve ter pelo menos 6 ações rápidas', async ({ page }) => {
      const actionCards = page.locator('.quickActionCard');
      expect(await actionCards.count()).toBeGreaterThanOrEqual(6);
    });

    test('deve ter ações clicáveis', async ({ page }) => {
      const firstAction = page.locator('.quickActionCard').first();
      await expect(firstAction).toBeVisible();

      // Verificar se é clicável
      const tabIndex = await firstAction.getAttribute('tabindex');
      expect(tabIndex).toBe('0');
    });
  });

  test.describe('Insights - 2 Cards Grandes', () => {
    test('deve exibir exatamente 2 cards de insights', async ({ page }) => {
      const insightCards = page.locator('.insightCard');
      expect(await insightCards.count()).toBe(2);
    });

    test('deve ter dados e métricas visíveis', async ({ page }) => {
      await expect(page.locator('.insightData').first()).toBeVisible();
      await expect(page.locator('.insightPrimaryData').first()).toBeVisible();
    });

    test('deve ter botões de ação nos insights', async ({ page }) => {
      const actionLabels = page.locator('.insightActionLabel');
      if (await actionLabels.count() > 0) {
        await expect(actionLabels.first()).toBeVisible();
      }
    });
  });

  test.describe('Recent Activity - Lista Zebra', () => {
    test('deve exibir lista de atividades', async ({ page }) => {
      await expect(page.locator('.activityList')).toBeVisible();
    });

    test('deve ter efeito zebra (linhas alternadas)', async ({ page }) => {
      const activityItems = page.locator('.activityItem');

      if (await activityItems.count() >= 2) {
        const firstItem = activityItems.nth(0);
        const secondItem = activityItems.nth(1);

        const firstClass = await firstItem.getAttribute('class');
        const secondClass = await secondItem.getAttribute('class');

        // Verificar classes diferentes para efeito zebra
        expect(firstClass).toContain('activityItemEven');
        expect(secondClass).toContain('activityItemOdd');
      }
    });

    test('deve ter ícones e timestamps', async ({ page }) => {
      const firstActivity = page.locator('.activityItem').first();

      if (await firstActivity.count() > 0) {
        await expect(firstActivity.locator('.activityIconContainer')).toBeVisible();
        await expect(firstActivity.locator('.activityTimestamp')).toBeVisible();
      }
    });
  });

  test.describe('Responsividade', () => {
    test('deve funcionar em mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });

      await expect(page.locator('.homePro')).toBeVisible();
      await expect(page.locator('.header')).toBeVisible();
      await expect(page.locator('.kpiRail')).toBeVisible();
    });

    test('deve funcionar em tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      await expect(page.locator('.homePro')).toBeVisible();
      await expect(page.locator('.quickActionsGrid')).toBeVisible();
    });

    test('deve funcionar em desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      await expect(page.locator('.homePro')).toBeVisible();
      await expect(page.locator('.insightsGrid')).toBeVisible();
    });
  });

  test.describe('Acessibilidade', () => {
    test('deve ter landmarks adequados', async ({ page }) => {
      await expect(page.locator('header[aria-label]')).toBeVisible();
      await expect(page.locator('section[aria-label]')).toHaveCount(5); // 5 seções principais
    });

    test('deve ter navegação por teclado', async ({ page }) => {
      // Testar tab navigation
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('deve ter textos alternativos', async ({ page }) => {
      const buttons = page.locator('button[aria-label]');
      expect(await buttons.count()).toBeGreaterThan(0);
    });
  });

  test.describe('Feature Flag & Rollback', () => {
    test('deve fallback para layout antigo quando flag desabilitada', async ({ page }) => {
      // Desabilitar feature flag
      await page.evaluate(() => {
        localStorage.setItem('repomed-feature-flags', JSON.stringify({
          FF_HOME_PRO_V9: false
        }));
      });

      await page.reload();

      // Verificar se não existe o novo layout
      await expect(page.locator('.homePro')).not.toBeVisible();

      // Verificar se existe o layout antigo
      await expect(page.locator('.hx-bg')).toBeVisible();
    });

    test('deve permitir toggle da feature flag via localStorage', async ({ page }) => {
      // Verificar estado inicial (ativado)
      await expect(page.locator('.homePro')).toBeVisible();

      // Desativar
      await page.evaluate(() => {
        localStorage.setItem('repomed-feature-flags', JSON.stringify({
          FF_HOME_PRO_V9: false
        }));
      });
      await page.reload();
      await expect(page.locator('.homePro')).not.toBeVisible();

      // Reativar
      await page.evaluate(() => {
        localStorage.setItem('repomed-feature-flags', JSON.stringify({
          FF_HOME_PRO_V9: true
        }));
      });
      await page.reload();
      await expect(page.locator('.homePro')).toBeVisible();
    });
  });

  test.describe('Temas', () => {
    test('deve funcionar com tema light', async ({ page }) => {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'light');
      });

      await expect(page.locator('.homePro')).toBeVisible();
    });

    test('deve funcionar com tema dark', async ({ page }) => {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'dark');
      });

      await expect(page.locator('.homePro')).toBeVisible();
    });

    test('deve funcionar com tema medical', async ({ page }) => {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'medical');
      });

      await expect(page.locator('.homePro')).toBeVisible();
    });

    test('deve funcionar com tema clinical', async ({ page }) => {
      await page.evaluate(() => {
        document.documentElement.setAttribute('data-theme', 'clinical');
      });

      await expect(page.locator('.homePro')).toBeVisible();
    });
  });
});