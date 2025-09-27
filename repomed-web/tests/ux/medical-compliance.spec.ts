/**
 * RepoMed IA v5.2 - Medical Compliance Testing
 * AAA accessibility with visual regression gates
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

let jsErrors: string[] = [];

test.beforeEach(async ({ page, context }) => {
  jsErrors = [];
  page.on('pageerror', e => jsErrors.push(String(e)));
  page.on('console', m => m.type() === 'error' && jsErrors.push(m.text()));

  // 🔒 WRITE-BLOCKER: Prevent data mutations during testing
  await context.route('**/*', route => {
    const method = route.request().method().toUpperCase();
    if (method === 'DELETE') return route.abort();
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Write blocked by medical testing',
          timestamp: new Date().toISOString()
        })
      });
    }
    return route.continue();
  });

  await page.waitForLoadState('networkidle');

  // 🔧 TIMEOUT DO FONTS.READY (EVITA TRAVAR EM CI)
  await page.evaluate(async () => {
    const waitFonts = document.fonts ? document.fonts.ready : Promise.resolve();
    await Promise.race([waitFonts, new Promise(r => setTimeout(r, 4000))]);
  });
});

test.afterEach(async () => {
  // ❌ GATE: Zero JavaScript errors allowed
  expect(jsErrors).toHaveLength(0);
});

// 🔒 TRAVA FINAL 1: GATE DE REGRESSÃO VISUAL POR ROTA
test('a11y crítico zerado + regressão visual', async ({ page }) => {
  const id = process.env.UX_PATIENT_ID ?? 'demo';
  const criticalRoutes = [
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/prescricoes/nova',
    '/documentos/criar/receita',
    `/pacientes/${id}`
  ];

  for (const route of criticalRoutes) {
    console.log(`🔍 Testing route: ${route}`);

    await page.goto(route, { waitUntil: 'networkidle', timeout: 30000 });

    // Aguardar estabilização COMPLETA
    await page.waitForLoadState('networkidle');
    await page.evaluate(async () => {
      if (document.fonts) await document.fonts.ready;
    });

    // ❌ GATE: Zero critical accessibility violations
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    const criticalViolations = violations.filter(v => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);

    // 🔒 GATE DE REGRESSÃO VISUAL (DEPOIS DE FONTS.READY)
    await expect(page).toHaveScreenshot(`${route.replace(/\//g,'_')}.png`, {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide'
    });

    // Generate accessibility report
    await test.info().attach(`axe-${route.replace(/\//g, '_')}.json`, {
      body: JSON.stringify({
        route,
        violations,
        criticalCount: criticalViolations.length,
        totalViolations: violations.length,
        timestamp: new Date().toISOString()
      }, null, 2),
      contentType: 'application/json'
    });

    console.log(`✅ Route ${route}: ${criticalViolations.length} critical violations`);
  }
});

// 🔒 TRAVA FINAL 2: AUDIT DE ÍCONES ROTULADOS (SEM FALSOS POSITIVOS)
test('ícones rotulados sem falsos positivos', async ({ page }) => {
  const id = process.env.UX_PATIENT_ID ?? 'demo';
  const routes = [
    '/auth/login',
    '/prescricoes/nova',
    `/pacientes/${id}`
  ];

  for (const route of routes) {
    console.log(`🎯 Icon audit for: ${route}`);

    await page.goto(route, { waitUntil: 'networkidle' });

    // 🔒 AUDIT DE ÍCONES SEM FALSOS POSITIVOS
    const unlabeledIcons = await page.$$eval('button:has(svg), a:has(svg)', nodes =>
      nodes.filter(n => {
        const svg = n.querySelector('svg');
        if (!svg) return false;

        // Skip if aria-hidden (decorative icons)
        if (svg.getAttribute('aria-hidden') === 'true' ||
            n.getAttribute('aria-hidden') === 'true') return false;

        // Check for labels
        const label = (n.getAttribute('aria-label')||'').trim()
          || (n.getAttribute('title')||'').trim()
          || (n.textContent||'').trim();

        return !label;
      }).length
    );

    // ❌ GATE: Zero unlabeled interactive icons
    expect(unlabeledIcons).toBe(0);

    console.log(`✅ Route ${route}: ${unlabeledIcons} unlabeled icons`);
  }
});

// 🏥 MEDICAL TEXT SIZE COMPLIANCE
test('medical text size compliance (16px+ minimum)', async ({ page }) => {
  const medicalRoutes = ['/prescricoes/nova', '/pacientes', '/auth/login'];

  for (const route of medicalRoutes) {
    await page.goto(route, { waitUntil: 'networkidle' });

    // Check for text smaller than 16px in critical medical areas
    const smallTextElements = await page.$$eval('*', elements => {
      return elements.filter(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const hasText = el.textContent && el.textContent.trim().length > 0;

        // Ignore non-text elements and hidden elements
        if (!hasText || style.display === 'none' || style.visibility === 'hidden') {
          return false;
        }

        // Medical critical: Allow only 16px+ for form labels, inputs, medical data
        const isMedicalElement = el.closest('form, [role="form"], .medical-data, .prescription, .patient-info');
        if (isMedicalElement && fontSize < 16) {
          return true;
        }

        return false;
      }).length;
    });

    // ❌ GATE: Zero small text in medical contexts
    expect(smallTextElements).toBe(0);
  }
});

// 🎨 AAA CONTRAST COMPLIANCE
test('AAA contrast compliance verification', async ({ page }) => {
  const routes = ['/auth/login', '/prescricoes/nova'];

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'networkidle' });

    // Verify our AAA contrast tokens are being used
    const contrastIssues = await new AxeBuilder({ page })
      .withTags(['wcag2aaa'])
      .include('form, input, label, button')
      .analyze();

    const contrastViolations = contrastIssues.violations.filter(v =>
      v.id === 'color-contrast-enhanced'
    );

    // ❌ GATE: Zero AAA contrast violations in forms
    expect(contrastViolations).toHaveLength(0);
  }
});

// 🚫 HARDCODED GRAY COLORS DETECTION
test('no hardcoded problematic gray colors', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });

  // Check for problematic hardcoded colors in computed styles
  const problematicColors = await page.evaluate(() => {
    const problematicHexes = ['#6b7280', '#9ca3af', '#94a3b8'];
    const elements = document.querySelectorAll('*');
    let found = [];

    for (const el of elements) {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bgColor = style.backgroundColor;
      const borderColor = style.borderColor;

      for (const hex of problematicHexes) {
        if (color.includes(hex) || bgColor.includes(hex) || borderColor.includes(hex)) {
          found.push({
            element: el.tagName,
            color: color,
            backgroundColor: bgColor,
            borderColor: borderColor
          });
        }
      }
    }

    return found;
  });

  // ❌ GATE: Zero hardcoded problematic grays
  expect(problematicColors).toHaveLength(0);
});

// 📱 MEDICAL VIEWPORT TESTING
test('medical professional viewport compliance', async ({ page }) => {
  // Test common medical workstation viewport
  await page.setViewportSize({ width: 1366, height: 768 });

  const criticalRoutes = ['/prescricoes/nova', '/pacientes'];

  for (const route of criticalRoutes) {
    await page.goto(route, { waitUntil: 'networkidle' });

    // Check if critical medical elements are visible and accessible
    const medicalElements = await page.$$eval('[role="form"], form, .medical-form, .prescription-form',
      elements => elements.map(el => ({
        visible: el.offsetHeight > 0 && el.offsetWidth > 0,
        accessible: !el.hasAttribute('aria-hidden')
      }))
    );

    // ❌ GATE: All medical forms must be visible and accessible
    for (const element of medicalElements) {
      expect(element.visible).toBe(true);
      expect(element.accessible).toBe(true);
    }
  }
});