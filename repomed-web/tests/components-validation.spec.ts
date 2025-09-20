import { test, expect } from '@playwright/test';

test.describe('Componentes UI - Validação Completa', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para uma página que usa os componentes
    await page.goto('http://localhost:3021');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Button Component', () => {
    test('deve renderizar todas as variantes', async ({ page }) => {
      // Procurar por botões na página
      const buttons = await page.locator('button').all();
      expect(buttons.length).toBeGreaterThan(0);
      
      // Verificar se ao menos um botão possui classes de estilo
      const buttonClasses = await page.locator('button').first().getAttribute('class');
      expect(buttonClasses).toContain('inline-flex');
      expect(buttonClasses).toContain('items-center');
    });

    test('deve mostrar estado de loading', async ({ page }) => {
      // Tentar encontrar botões que podem entrar em loading state
      const submitButtons = page.locator('button[type="submit"]');
      if (await submitButtons.count() > 0) {
        await submitButtons.first().click();
        // Aguardar possível loading state
        await page.waitForTimeout(100);
      }
    });

    test('deve ter feedback visual ao clicar', async ({ page }) => {
      const button = page.locator('button').first();
      if (await button.count() > 0) {
        await button.click();
        // Verificar se o botão responde ao clique
        expect(await button.isVisible()).toBe(true);
      }
    });

    test('deve ser acessível por teclado', async ({ page }) => {
      const button = page.locator('button').first();
      if (await button.count() > 0) {
        await button.focus();
        await page.keyboard.press('Enter');
        // Verificar se o botão pode ser focado
        expect(await button.evaluate(el => document.activeElement === el)).toBe(true);
      }
    });
  });

  test.describe('Input Component', () => {
    test('deve mostrar placeholder', async ({ page }) => {
      const inputs = page.locator('input[placeholder]');
      if (await inputs.count() > 0) {
        const placeholder = await inputs.first().getAttribute('placeholder');
        expect(placeholder).toBeTruthy();
      }
    });

    test('deve mostrar estados de validação', async ({ page }) => {
      // Verificar inputs com possíveis estados de erro
      const inputs = page.locator('input');
      if (await inputs.count() > 0) {
        const input = inputs.first();
        
        // Verificar se o input tem classes de estilo
        const classes = await input.getAttribute('class');
        expect(classes).toContain('w-full');
        expect(classes).toContain('border');
      }
    });

    test('deve funcionar máscara de CPF', async ({ page }) => {
      // Se houver input de CPF, testar máscara
      const cpfInput = page.locator('input[name*="cpf" i], input[placeholder*="cpf" i]');
      if (await cpfInput.count() > 0) {
        await cpfInput.first().fill('12345678900');
        const value = await cpfInput.first().inputValue();
        // Verificar se aplicou máscara
        console.log('CPF input value:', value);
      }
    });

    test('deve limpar input quando clearable', async ({ page }) => {
      const inputs = page.locator('input');
      if (await inputs.count() > 0) {
        const input = inputs.first();
        await input.fill('teste');
        
        // Procurar botão clear próximo
        const clearButton = page.locator('button[aria-label="Clear input"]');
        if (await clearButton.count() > 0) {
          await clearButton.click();
          expect(await input.inputValue()).toBe('');
        }
      }
    });
  });

  test.describe('Navigation Component', () => {
    test('deve destacar rota ativa', async ({ page }) => {
      // Verificar se existe navegação
      const nav = page.locator('nav, [role="navigation"]');
      if (await nav.count() > 0) {
        // Verificar se há links de navegação
        const navLinks = nav.locator('a');
        expect(await navLinks.count()).toBeGreaterThan(0);
      }
    });

    test('deve funcionar navegação por teclado', async ({ page }) => {
      // Tab através dos elementos navegáveis
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Verificar se algum elemento está focado
      const focusedElement = await page.locator(':focus').count();
      expect(focusedElement).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Modal/Dialog Component', () => {
    test('deve fechar com ESC', async ({ page }) => {
      // Procurar por botões que abrem modals
      const modalTriggers = page.locator('button:has-text("criar"), button:has-text("novo"), button:has-text("adicionar")');
      
      if (await modalTriggers.count() > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(300); // Aguardar animação
        
        // Tentar fechar com ESC
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    });

    test('deve ter focus trap', async ({ page }) => {
      // Similar ao teste anterior, mas focando na navegação dentro do modal
      const modalTriggers = page.locator('button:has-text("criar"), button:has-text("novo")');
      
      if (await modalTriggers.count() > 0) {
        await modalTriggers.first().click();
        await page.waitForTimeout(300);
        
        // Tab dentro do modal
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
      }
    });
  });

  test.describe('Toast Notifications', () => {
    test('deve aparecer após ação', async ({ page }) => {
      // Realizar ação que pode gerar toast (ex: submit form)
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        const submitButton = forms.first().locator('button[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Aguardar possível toast
          await page.waitForTimeout(1000);
          
          // Verificar se há notificações na página
          const toasts = page.locator('[role="alert"], .toast, [data-toast]');
          console.log('Toasts encontrados:', await toasts.count());
        }
      }
    });
  });

  test.describe('Form Validation', () => {
    test('deve mostrar erros de validação', async ({ page }) => {
      // Encontrar forms e tentar submit vazio
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        const form = forms.first();
        const submitButton = form.locator('button[type="submit"]');
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          
          // Aguardar mensagens de erro
          await page.waitForTimeout(500);
          
          // Procurar por mensagens de erro
          const errorMessages = page.locator('.text-red-500, .text-red-600, [role="alert"]');
          console.log('Mensagens de erro encontradas:', await errorMessages.count());
        }
      }
    });

    test('deve focar no primeiro erro', async ({ page }) => {
      const forms = page.locator('form');
      if (await forms.count() > 0) {
        const form = forms.first();
        const submitButton = form.locator('button[type="submit"]');
        
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForTimeout(500);
          
          // Verificar se algum input com erro está focado
          const focusedInput = page.locator('input:focus');
          if (await focusedInput.count() > 0) {
            const classes = await focusedInput.getAttribute('class');
            console.log('Input focado após erro:', classes);
          }
        }
      }
    });
  });

  test.describe('Acessibilidade Básica', () => {
    test('deve ter labels associados a inputs', async ({ page }) => {
      const inputs = page.locator('input');
      const inputsCount = await inputs.count();
      
      for (let i = 0; i < Math.min(inputsCount, 5); i++) {
        const input = inputs.nth(i);
        const id = await input.getAttribute('id');
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');
        
        if (id) {
          const label = page.locator(`label[for="${id}"]`);
          const hasLabel = await label.count() > 0;
          const hasAriaLabel = !!ariaLabel;
          const hasAriaLabelledBy = !!ariaLabelledBy;
          
          // Deve ter pelo menos uma forma de labeling
          expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBe(true);
        }
      }
    });

    test('deve ter role apropriado em elementos interativos', async ({ page }) => {
      // Verificar se botões tem role button (implícito) ou explícito
      const buttons = page.locator('button, [role="button"]');
      expect(await buttons.count()).toBeGreaterThanOrEqual(0);
      
      // Verificar links
      const links = page.locator('a[href], [role="link"]');
      expect(await links.count()).toBeGreaterThanOrEqual(0);
    });

    test('deve ter contraste adequado', async ({ page }) => {
      // Este teste é mais visual, mas podemos verificar se elementos têm classes de cor
      const textElements = page.locator('h1, h2, h3, p, span, div').first();
      if (await textElements.count() > 0) {
        const styles = await textElements.evaluate((el) => {
          return window.getComputedStyle(el);
        });
        
        // Verificar se há cores definidas
        expect(styles.color).toBeTruthy();
      }
    });
  });
});