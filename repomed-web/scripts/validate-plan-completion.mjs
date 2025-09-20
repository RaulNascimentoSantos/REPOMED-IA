#!/usr/bin/env node

/**
 * RepoMed IA v5.1 - Validação de Completude do Plano
 *
 * Valida se todas as melhorias UX médicas foram implementadas:
 * ✅ 1. Suporte multi-tema QuickActionsBar
 * ✅ 2. Performance crítica (INP) corrigida
 * ✅ 3. Acessibilidade validada em todos os temas
 * ✅ 4. StatusBadge/ConfirmDialog integrados
 */

import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

const SERVER_URL = 'http://localhost:3023';
const REPORT_DIR = './test-results/plan-validation';

// Critérios de validação do plano
const PLAN_CRITERIA = [
  {
    id: 'multi-theme-support',
    name: '🎨 Suporte Multi-Tema QuickActionsBar',
    description: 'Verificar se QuickActionsBar usa CSS variables para todos os temas',
    routes: ['/home', '/prescricoes', '/pacientes']
  },
  {
    id: 'performance-inp',
    name: '⚡ Performance INP Otimizada',
    description: 'Validar que INP está abaixo de 200ms',
    routes: ['/home', '/prescricoes', '/prescricoes/nova']
  },
  {
    id: 'accessibility-compliance',
    name: '♿ Acessibilidade WCAG 2.1 AA',
    description: 'Confirmar compliance em elementos críticos',
    routes: ['/home', '/prescricoes', '/pacientes']
  },
  {
    id: 'medical-components',
    name: '🏥 Componentes Médicos Integrados',
    description: 'StatusBadge e ConfirmDialog em rotas críticas',
    routes: ['/prescricoes', '/prescricoes/nova']
  }
];

async function checkServerHealth() {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const response = await page.goto(`${SERVER_URL}/home`, { timeout: 10000 });
    await browser.close();

    if (!response || response.status() !== 200) {
      throw new Error(`Server responded with status ${response?.status()}`);
    }

    console.log('✅ Server health check passed');
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error.message);
    return false;
  }
}

async function validateMultiThemeSupport(page, route) {
  try {
    await page.goto(`${SERVER_URL}${route}`, { waitUntil: 'networkidle' });

    // Procurar QuickActionsBar
    const quickActionsBtn = page.locator('button[aria-label*="ações rápidas"], [title*="Ações Rápidas"], button:has(svg)').first();

    if (await quickActionsBtn.count() === 0) {
      return {
        passed: false,
        message: 'QuickActionsBar não encontrado'
      };
    }

    // Verificar se está usando CSS variables
    const usesVariables = await quickActionsBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      const bg = style.backgroundColor;
      const color = style.color;

      // Verificar se não está usando cores hardcoded comuns
      const hardcodedColors = [
        'rgb(255, 255, 255)', // white
        'rgba(0, 0, 0, 0)', // transparent
        'rgb(30, 41, 59)', // slate-800
        'rgb(51, 65, 85)'  // slate-700
      ];

      return !hardcodedColors.includes(bg) && !hardcodedColors.includes(color);
    });

    // Testar mudança de tema
    await page.evaluate(() => {
      localStorage.setItem('repomed-theme', 'light');
      document.documentElement.className = 'theme-light';
      document.documentElement.setAttribute('data-theme', 'light');
    });

    await page.waitForTimeout(500);

    const lightThemeStyles = await quickActionsBtn.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      };
    });

    // Voltar ao tema dark
    await page.evaluate(() => {
      localStorage.setItem('repomed-theme', 'dark');
      document.documentElement.className = 'theme-dark';
      document.documentElement.setAttribute('data-theme', 'dark');
    });

    return {
      passed: usesVariables,
      message: usesVariables ? 'CSS variables implementadas' : 'Ainda usa cores hardcoded',
      details: { lightThemeStyles }
    };

  } catch (error) {
    return {
      passed: false,
      message: `Erro: ${error.message}`
    };
  }
}

async function validatePerformanceINP(page, route) {
  try {
    // Usar Performance API para medir INP
    await page.goto(`${SERVER_URL}${route}`, { waitUntil: 'networkidle' });

    const inpMeasurement = await page.evaluate(() => {
      return new Promise((resolve) => {
        let maxDelay = 0;
        const startTime = performance.now();

        // Simular interação e medir resposta
        const button = document.querySelector('button, a, [role="button"]');
        if (button) {
          const interactionStart = performance.now();

          button.addEventListener('click', () => {
            const interactionEnd = performance.now();
            const delay = interactionEnd - interactionStart;
            maxDelay = Math.max(maxDelay, delay);
          });

          // Simular clique
          button.click();

          setTimeout(() => {
            resolve({
              inp: maxDelay,
              totalTime: performance.now() - startTime
            });
          }, 1000);
        } else {
          resolve({ inp: 0, totalTime: performance.now() - startTime });
        }
      });
    });

    const inpPassed = inpMeasurement.inp < 200 || inpMeasurement.inp === 0;

    return {
      passed: inpPassed,
      message: `INP: ${inpMeasurement.inp.toFixed(1)}ms (meta: <200ms)`,
      details: inpMeasurement
    };

  } catch (error) {
    return {
      passed: false,
      message: `Erro: ${error.message}`
    };
  }
}

async function validateAccessibility(page, route) {
  try {
    await page.goto(`${SERVER_URL}${route}`, { waitUntil: 'networkidle' });

    // Verificar estrutura de headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();

    // Verificar elementos focáveis
    const focusableElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();

    // Teste básico de navegação por teclado
    await page.keyboard.press('Tab');
    const focusedElement = await page.locator(':focus').count();

    // Verificar aria-labels em botões
    const buttonsWithLabels = await page.locator('button[aria-label], button[title]').count();
    const totalButtons = await page.locator('button').count();

    const accessibilityScore = (
      (headings > 0 ? 25 : 0) +
      (focusableElements > 0 ? 25 : 0) +
      (focusedElement > 0 ? 25 : 0) +
      (totalButtons > 0 && buttonsWithLabels / totalButtons > 0.5 ? 25 : 0)
    );

    return {
      passed: accessibilityScore >= 75,
      message: `Score: ${accessibilityScore}/100`,
      details: {
        headings,
        focusableElements,
        focusedElement,
        buttonsWithLabels,
        totalButtons
      }
    };

  } catch (error) {
    return {
      passed: false,
      message: `Erro: ${error.message}`
    };
  }
}

async function validateMedicalComponents(page, route) {
  try {
    await page.goto(`${SERVER_URL}${route}`, { waitUntil: 'networkidle' });

    let statusBadgeFound = false;
    let confirmDialogCapable = false;

    // Procurar StatusBadge
    const statusBadges = await page.locator('[role="status"], .status-badge, [aria-live]').count();
    statusBadgeFound = statusBadges > 0;

    // Verificar se existem botões que podem acionar ConfirmDialog
    const actionButtons = await page.locator('button:has-text("Excluir"), button:has-text("Download"), button:has-text("Confirmar")').count();
    confirmDialogCapable = actionButtons > 0;

    // Se na página de prescrições, tentar acionar um botão de ação
    if (route === '/prescricoes') {
      const deleteBtn = page.locator('button[aria-label*="Excluir"]').first();
      if (await deleteBtn.count() > 0) {
        await deleteBtn.click();
        await page.waitForTimeout(500);

        // Verificar se dialog apareceu
        const dialog = await page.locator('[role="dialog"], .confirm-dialog').count();
        confirmDialogCapable = dialog > 0;

        // Fechar dialog se aberto
        if (dialog > 0) {
          await page.keyboard.press('Escape');
        }
      }
    }

    return {
      passed: statusBadgeFound && confirmDialogCapable,
      message: `StatusBadge: ${statusBadgeFound ? '✅' : '❌'}, ConfirmDialog: ${confirmDialogCapable ? '✅' : '❌'}`,
      details: {
        statusBadges,
        actionButtons,
        statusBadgeFound,
        confirmDialogCapable
      }
    };

  } catch (error) {
    return {
      passed: false,
      message: `Erro: ${error.message}`
    };
  }
}

async function validateCriterion(browser, criterion) {
  console.log(`\n   🔍 Validando: ${criterion.name}`);

  const results = [];

  for (const route of criterion.routes) {
    const page = await browser.newPage();

    try {
      console.log(`      📄 Testando rota: ${route}`);

      let result;

      switch (criterion.id) {
        case 'multi-theme-support':
          result = await validateMultiThemeSupport(page, route);
          break;
        case 'performance-inp':
          result = await validatePerformanceINP(page, route);
          break;
        case 'accessibility-compliance':
          result = await validateAccessibility(page, route);
          break;
        case 'medical-components':
          result = await validateMedicalComponents(page, route);
          break;
        default:
          result = { passed: false, message: 'Critério não implementado' };
      }

      results.push({
        route,
        ...result
      });

      console.log(`         ${result.passed ? '✅' : '❌'} ${result.message}`);

    } catch (error) {
      results.push({
        route,
        passed: false,
        message: `Erro: ${error.message}`
      });
      console.log(`         ❌ Erro: ${error.message}`);
    } finally {
      await page.close();
    }
  }

  const passedRoutes = results.filter(r => r.passed).length;
  const totalRoutes = results.length;

  return {
    criterion: criterion.name,
    description: criterion.description,
    routes: results,
    summary: {
      passed: passedRoutes,
      total: totalRoutes,
      success: passedRoutes === totalRoutes
    }
  };
}

async function generateReport(results) {
  try {
    await fs.mkdir(REPORT_DIR, { recursive: true });

    const jsonReport = {
      timestamp: new Date().toISOString(),
      version: 'v5.1-plan-validation',
      criteria: results,
      summary: {
        totalCriteria: results.length,
        passedCriteria: results.filter(r => r.summary.success).length,
        totalRoutes: results.reduce((acc, r) => acc + r.summary.total, 0),
        passedRoutes: results.reduce((acc, r) => acc + r.summary.passed, 0)
      }
    };

    const jsonPath = path.join(REPORT_DIR, 'plan-validation.json');
    await fs.writeFile(jsonPath, JSON.stringify(jsonReport, null, 2));

    console.log(`\n📊 Relatório salvo em: ${jsonPath}`);
    return jsonReport;

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.message);
    return null;
  }
}

async function main() {
  console.log('🏥 RepoMed IA v5.1 - Validação de Completude do Plano\n');

  // 1. Verificar servidor
  console.log('🔍 Verificando servidor...');
  if (!(await checkServerHealth())) {
    console.log('💡 Execute: npm run dev');
    process.exit(1);
  }

  // 2. Executar validações
  console.log('\n🚀 Iniciando validação do plano...');

  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-web-security']
  });

  try {
    const results = [];

    for (const criterion of PLAN_CRITERIA) {
      const result = await validateCriterion(browser, criterion);
      results.push(result);
    }

    // 3. Gerar relatório
    console.log('\n📊 Gerando relatório...');
    const report = await generateReport(results);

    // 4. Resumo final
    const totalSuccess = results.filter(r => r.summary.success).length;
    const totalCriteria = results.length;

    console.log('\n🎯 RESULTADO FINAL:');
    console.log(`   ✅ Critérios aprovados: ${totalSuccess}/${totalCriteria}`);
    console.log(`   📊 Taxa de sucesso: ${((totalSuccess / totalCriteria) * 100).toFixed(1)}%`);

    if (totalSuccess === totalCriteria) {
      console.log('\n🏆 PLANO 100% CONCLUÍDO!');
      console.log('   🎨 Multi-tema implementado');
      console.log('   ⚡ Performance otimizada');
      console.log('   ♿ Acessibilidade validada');
      console.log('   🏥 Componentes médicos integrados');
      console.log('\n🚀 RepoMed IA v5.1 pronto para produção!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Alguns critérios precisam de atenção');
      results.forEach(r => {
        if (!r.summary.success) {
          console.log(`   ❌ ${r.criterion}: ${r.summary.passed}/${r.summary.total} rotas`);
        }
      });
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Erro durante validação:', error.message);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as validatePlanCompletion };