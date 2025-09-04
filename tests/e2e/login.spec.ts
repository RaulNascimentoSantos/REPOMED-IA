import { test, expect } from '@playwright/test';

test('login feliz e erro credenciais', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill('doctor@example.com');
  await page.getByLabel('Senha').fill('dev123456');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/'); // redireciona pra Workspace

  // Erro (logout simulado)
  await page.context().clearCookies();
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill('wrong@example.com');
  await page.getByLabel('Senha').fill('badpass');
  await page.getByRole('button', { name: 'Entrar' }).click();
  // Deve aparecer mensagem vinda do RFC7807.detail (fallback se mock)
  await expect(page.locator('text=Erro')).toBeVisible({ timeout: 5000 });
});