import { test, expect } from '@playwright/test';

test('documento: criar → assinar (mock) → gerar/baixar PDF', async ({ page, context }) => {
  // login
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill('doctor@example.com');
  await page.getByLabel('Senha').fill('dev123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  // criar documento (se veio de templateId na URL, só preencher título)
  await page.goto('/documents/new');
  await page.getByLabel('Template ID').fill('TEMPLATE_DE_TESTE'); // se já veio via query, ignora
  await page.getByLabel('Título').fill('Receita de Teste');
  await page.getByRole('button', { name: 'Criar' }).click();

  await expect(page).toHaveURL(/\/documents\/\w+/);
  // voltar pra lista para assinar (caso sua ação de assinar esteja na lista)
  await page.getByRole('button', { name: 'Voltar' }).click();
  await expect(page).toHaveURL('/documents');

  // Assinar
  await page.getByRole('button', { name: /^Assinar$/ }).first().click();
  await page.waitForTimeout(300); // aguardar mutate
  // PDF
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /^PDF$/ }).first().click()
  ]);
  const path = await download.path();
  expect(path).toBeTruthy();
});