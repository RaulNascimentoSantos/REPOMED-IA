import { test, expect } from '@playwright/test';

test('@visual workspace', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill('doctor@example.com');
  await page.getByLabel('Senha').fill('dev123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/');
  await expect(page).toHaveScreenshot({ fullPage: true, maxDiffPixelRatio: 0.02 });
});