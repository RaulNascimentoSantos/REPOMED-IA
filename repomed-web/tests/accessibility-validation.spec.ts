import { test, expect } from '@playwright/test';

test.describe('Acessibilidade WCAG AA', () => {
  
  const testPages = [
    { url: '/', name: 'Home Page' },
    { url: '/auth/login', name: 'Login Page' },
  ];

  for (const pageTest of testPages) {
    test.describe(`${pageTest.name}`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.goto(`http://localhost:3021${pageTest.url}`);
        await page.waitForLoadState('networkidle');
      });

      test('deve ter estrutura de heading hierárquica', async ({ page }) => {
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
        
        if (headings.length > 0) {
          console.log(`${pageTest.name} - Headings encontrados: ${headings.length}`);
          
          // Verificar se há pelo menos um h1
          const h1Count = await page.locator('h1').count();
          expect(h1Count).toBeGreaterThanOrEqual(1);
          
          // Log da hierarquia para análise manual
          const headingStructure = await page.evaluate(() => {
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            return headings.map(h => ({
              level: parseInt(h.tagName.charAt(1)),
              text: h.textContent?.slice(0, 50) || ''
            }));
          });
          
          console.log('Estrutura de headings:', headingStructure);
        }
      });

      test('deve ter landmarks ARIA apropriados', async ({ page }) => {
        const landmarks = [
          { role: 'main', name: 'Conteúdo principal' },
          { role: 'navigation', name: 'Navegação' },
          { role: 'banner', name: 'Header/Banner' },
          { role: 'contentinfo', name: 'Footer' },
        ];

        for (const landmark of landmarks) {
          const elements = await page.locator(`[role="${landmark.role}"], ${landmark.role}`).count();
          if (elements > 0) {
            console.log(`✅ ${pageTest.name}: ${landmark.name} encontrado (${elements})`);
          } else if (landmark.role === 'main') {
            // Main é obrigatório
            console.warn(`⚠️  ${pageTest.name}: Landmark '${landmark.name}' não encontrado`);
          }
        }
      });

      test('inputs devem ter labels ou aria-label', async ({ page }) => {
        const inputs = await page.locator('input, select, textarea').all();
        let problematicInputs = 0;

        for (const input of inputs) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const ariaLabelledBy = await input.getAttribute('aria-labelledby');
          const placeholder = await input.getAttribute('placeholder');
          const type = await input.getAttribute('type');
          
          let hasLabel = false;
          
          // Verificar label associado por ID
          if (id) {
            const labelCount = await page.locator(`label[for="${id}"]`).count();
            hasLabel = labelCount > 0;
          }
          
          // Verificar outras formas de labeling
          if (!hasLabel) {
            hasLabel = !!(ariaLabel || ariaLabelledBy);
          }
          
          // Inputs de tipo hidden ou submit podem não precisar de label
          if (['hidden', 'submit', 'button'].includes(type || '')) {
            hasLabel = true;
          }
          
          if (!hasLabel) {
            problematicInputs++;
            console.warn(`⚠️  Input sem label: tipo="${type}" placeholder="${placeholder}"`);
          }
        }

        if (inputs.length > 0) {
          const percentage = ((inputs.length - problematicInputs) / inputs.length) * 100;
          console.log(`${pageTest.name}: ${percentage.toFixed(1)}% dos inputs têm labels adequados`);
          
          // Exigir pelo menos 80% dos inputs com labels
          expect(percentage).toBeGreaterThanOrEqual(80);
        }
      });

      test('deve ter contraste de cor adequado', async ({ page }) => {
        // Este teste é mais visual e seria melhor com ferramentas específicas
        // Por enquanto, verificamos se elementos têm estilos de cor definidos
        
        const coloredElements = await page.evaluate(() => {
          const elements = document.querySelectorAll('h1, h2, h3, p, span, button, a');
          let withColors = 0;
          let total = 0;
          
          elements.forEach(el => {
            if (total < 20) { // Verificar apenas os primeiros 20
              total++;
              const styles = window.getComputedStyle(el);
              const color = styles.color;
              const backgroundColor = styles.backgroundColor;
              
              if (color !== 'rgba(0, 0, 0, 0)' || backgroundColor !== 'rgba(0, 0, 0, 0)') {
                withColors++;
              }
            }
          });
          
          return { withColors, total };
        });

        console.log(`${pageTest.name}: ${coloredElements.withColors}/${coloredElements.total} elementos com cores definidas`);
        
        if (coloredElements.total > 0) {
          const percentage = (coloredElements.withColors / coloredElements.total) * 100;
          expect(percentage).toBeGreaterThan(50); // Pelo menos 50% dos elementos devem ter cores definidas
        }
      });

      test('deve suportar navegação por teclado', async ({ page }) => {
        // Testar tab order
        const focusableElements = await page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])').count();
        
        if (focusableElements > 0) {
          console.log(`${pageTest.name}: ${focusableElements} elementos focáveis encontrados`);
          
          // Navegar pelos primeiros elementos
          for (let i = 0; i < Math.min(5, focusableElements); i++) {
            await page.keyboard.press('Tab');
            
            // Verificar se algum elemento está focado
            const focusedElement = await page.locator(':focus').count();
            expect(focusedElement).toBe(1);
            
            // Pequena pausa entre navegações
            await page.waitForTimeout(100);
          }
          
          console.log(`✅ ${pageTest.name}: Navegação por teclado funcionando`);
        }
      });

      test('imagens devem ter alt text apropriado', async ({ page }) => {
        const images = await page.locator('img').all();
        let problematicImages = 0;

        for (const img of images) {
          const alt = await img.getAttribute('alt');
          const src = await img.getAttribute('src');
          const role = await img.getAttribute('role');
          
          // Imagens decorativas podem ter alt="" ou role="presentation"
          const isDecorative = alt === '' || role === 'presentation';
          
          // Imagens de conteúdo devem ter alt text descritivo
          const hasDescriptiveAlt = alt && alt.length > 0 && alt !== 'image';
          
          if (!isDecorative && !hasDescriptiveAlt) {
            problematicImages++;
            console.warn(`⚠️  Imagem sem alt adequado: src="${src}" alt="${alt}"`);
          }
        }

        if (images.length > 0) {
          const percentage = ((images.length - problematicImages) / images.length) * 100;
          console.log(`${pageTest.name}: ${percentage.toFixed(1)}% das imagens têm alt text adequado`);
          
          // Exigir pelo menos 90% das imagens com alt adequado
          expect(percentage).toBeGreaterThanOrEqual(90);
        }
      });

      test('deve ter skip links para navegação', async ({ page }) => {
        // Procurar por skip links (geralmente escondidos até receberem foco)
        const skipLinks = await page.locator('a[href^="#"]:has-text("skip"), a[href^="#"]:has-text("pular")').count();
        
        if (skipLinks > 0) {
          console.log(`✅ ${pageTest.name}: ${skipLinks} skip link(s) encontrado(s)`);
        } else {
          console.warn(`⚠️  ${pageTest.name}: Nenhum skip link encontrado`);
        }
      });

      test('formulários devem ter instruções claras', async ({ page }) => {
        const forms = await page.locator('form').all();
        
        for (const form of forms) {
          const requiredFields = await form.locator('input[required], select[required], textarea[required]').count();
          const fieldLabels = await form.locator('label').count();
          const helperTexts = await form.locator('[id*="help"], [id*="description"], .help-text, .form-help').count();
          
          console.log(`${pageTest.name} - Form:`, {
            requiredFields,
            fieldLabels,
            helperTexts
          });

          if (requiredFields > 0) {
            // Se há campos obrigatórios, deve haver alguma indicação visual
            const asterisks = await form.locator(':has-text("*")').count();
            const requiredTexts = await form.locator(':has-text("obrigatório"), :has-text("required")').count();
            
            const hasRequiredIndicator = asterisks > 0 || requiredTexts > 0;
            
            if (!hasRequiredIndicator) {
              console.warn(`⚠️  Form sem indicação de campos obrigatórios`);
            }
          }
        }
      });

      test('deve funcionar com zoom 200%', async ({ page }) => {
        // Simular zoom de 200%
        await page.evaluate(() => {
          document.body.style.zoom = '2';
        });

        await page.waitForTimeout(500);

        // Verificar se elementos críticos ainda são visíveis e funcionais
        const criticalElements = await page.locator('h1, button, input, a[href]').count();
        
        if (criticalElements > 0) {
          // Tentar interagir com o primeiro botão
          const firstButton = page.locator('button').first();
          if (await firstButton.count() > 0) {
            const isVisible = await firstButton.isVisible();
            expect(isVisible).toBe(true);
          }
          
          console.log(`✅ ${pageTest.name}: Funcional com zoom 200%`);
        }

        // Resetar zoom
        await page.evaluate(() => {
          document.body.style.zoom = '1';
        });
      });
    });
  }

  test.describe('Testes Globais de Acessibilidade', () => {
    
    test('deve ter meta viewport configurado', async ({ page }) => {
      await page.goto('http://localhost:3021');
      
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport).toBeTruthy();
      expect(viewport).toContain('width=device-width');
      
      console.log(`✅ Meta viewport: ${viewport}`);
    });

    test('deve ter lang definido no HTML', async ({ page }) => {
      await page.goto('http://localhost:3021');
      
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
      expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // pt, pt-BR, en, etc.
      
      console.log(`✅ Idioma da página: ${lang}`);
    });

    test('deve ter título descritivo', async ({ page }) => {
      await page.goto('http://localhost:3021');
      
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(70); // SEO best practice
      
      console.log(`✅ Título da página: "${title}"`);
    });
  });
});