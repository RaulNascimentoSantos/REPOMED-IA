import { test, expect } from '@playwright/test';

test('templates: listar, preview e usar template', async ({ page }) => {
  await page.goto('/auth/login');
  await page.getByLabel('E-mail').fill('doctor@example.com');
  await page.getByLabel('Senha').fill('dev123456');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await page.goto('/templates');
  await expect(page.getByRole('heading', { name: 'Templates' })).toBeVisible();

  // Se lista vazia: criar rapidamente um template (se UI permitir)
  const hasList = await page.locator('table').count();
  if (!hasList) {
    await page.getByRole('button', { name: 'Novo template' }).click();
    await page.getByLabel('Nome').fill('Receita Simples');
    await page.getByRole('button', { name: 'Adicionar campo' }).click();
    await page.getByLabel('Key').first().fill('patientName');
    await page.getByLabel('Label').first().fill('Paciente');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page).toHaveURL('/templates');
  }

  // Preview
  await page.getByRole('button', { name: 'Visualizar' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Close').click();

  // Usar template
  await page.getByRole('button', { name: /Usar este template/i }).first().click();
  await expect(page).toHaveURL(/\/documents\/new\?templateId=/);
});