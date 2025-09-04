import { test, expect } from '@playwright/test';
import axe from 'axe-core';

async function runAxe(page) {
  await page.addScriptTag({ path: require.resolve('axe-core') });
  return await page.evaluate(async () => await (window as any).axe.run());
}

test('@a11y home/workspace sem violações críticas', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill('doctor@example.com');
  await page.getByLabel('Senha').fill('dev123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/');
  const res = await runAxe(page);
  const critical = res.violations.filter((v:any) => ['critical','serious'].includes(v.impact));
  expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0);
});