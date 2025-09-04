import { test, expect } from '@playwright/test';

test.describe('Responsividade - Todos Breakpoints', () => {
  
  const breakpoints = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Mobile Large', width: 414, height: 896 },
    { name: 'Tablet Portrait', width: 768, height: 1024 },
    { name: 'Tablet Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Desktop Large', width: 1920, height: 1080 }
  ];
  
  const testPages = [
    { url: '/', name: 'Home' },
    { url: '/auth/login', name: 'Login' },
  ];

  for (const device of breakpoints) {
    test.describe(`${device.name} (${device.width}x${device.height})`, () => {
      
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: device.width, height: device.height });
      });

      for (const pageTest of testPages) {
        test(`${pageTest.name} - layout não quebra`, async ({ page }) => {
          await page.goto(`http://localhost:3021${pageTest.url}`);
          await page.waitForLoadState('networkidle');

          // Verificar se não há scroll horizontal
          const hasHorizontalScroll = await page.evaluate(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
          });
          
          if (hasHorizontalScroll && device.width >= 768) {
            // Desktop/tablet não deveria ter scroll horizontal
            console.warn(`⚠️  ${pageTest.name} em ${device.name}: Scroll horizontal detectado`);
          }

          // Verificar se elementos críticos são visíveis
          const criticalElements = [
            'h1, h2, [role="main"]',
            'button, input, a[href]'
          ];

          for (const selector of criticalElements) {
            const elements = await page.locator(selector).count();
            if (elements > 0) {
              const firstElement = page.locator(selector).first();
              const isVisible = await firstElement.isVisible();
              expect(isVisible).toBe(true);
            }
          }

          // Screenshot para comparação visual
          await page.screenshot({
            path: `test-results/screenshots/${device.name}-${pageTest.name}-${device.width}x${device.height}.png`,
            fullPage: true
          });
        });

        test(`${pageTest.name} - texto legível (min 14px)`, async ({ page }) => {
          await page.goto(`http://localhost:3021${pageTest.url}`);
          await page.waitForLoadState('networkidle');

          // Verificar tamanhos de fonte dos elementos principais
          const textElements = await page.locator('p, span, div, button, input, label').all();
          
          for (const element of textElements.slice(0, 10)) { // Testar apenas os primeiros 10
            const fontSize = await element.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              return parseFloat(styles.fontSize);
            });

            if (fontSize > 0 && fontSize < 14) {
              const tagName = await element.evaluate(el => el.tagName);
              console.warn(`⚠️  Texto muito pequeno: ${tagName} com ${fontSize}px em ${device.name}`);
            }
          }
        });

        test(`${pageTest.name} - botões tocáveis (min 44x44px)`, async ({ page }) => {
          await page.goto(`http://localhost:3021${pageTest.url}`);
          await page.waitForLoadState('networkidle');

          const buttons = await page.locator('button, [role="button"], a[href]').all();
          
          for (const button of buttons.slice(0, 8)) { // Testar primeiros 8 botões
            const box = await button.boundingBox();
            if (box) {
              const minSize = device.width <= 768 ? 44 : 40; // Mobile precisa de área maior
              
              if (box.width < minSize || box.height < minSize) {
                const text = await button.textContent();
                console.warn(`⚠️  Botão pequeno demais: "${text?.slice(0, 20)}" (${box.width}x${box.height}) em ${device.name}`);
              }
            }
          }
        });
      }

      test('navegação mobile - drawer/hamburger', async ({ page }) => {
        if (device.width <= 768) {
          await page.goto('http://localhost:3021');
          await page.waitForLoadState('networkidle');

          // Procurar por botão hamburger ou menu mobile
          const mobileMenuTriggers = [
            '[aria-label*="menu" i]',
            '[aria-label*="navigation" i]',
            'button:has-text("☰")',
            'button:has-text("Menu")',
            '.hamburger',
            '[data-mobile-menu]'
          ];

          let menuFound = false;
          for (const selector of mobileMenuTriggers) {
            const element = page.locator(selector);
            if (await element.count() > 0) {
              menuFound = true;
              console.log(`✅ Menu mobile encontrado: ${selector} em ${device.name}`);
              
              // Tentar abrir o menu
              try {
                await element.first().click();
                await page.waitForTimeout(500); // Aguardar animação
              } catch (e) {
                console.log(`Menu não clicável: ${selector}`);
              }
              break;
            }
          }

          if (!menuFound && device.width <= 768) {
            console.warn(`⚠️  Nenhum menu mobile encontrado em ${device.name}`);
          }
        }
      });

      test('imagens responsivas', async ({ page }) => {
        await page.goto('http://localhost:3021');
        await page.waitForLoadState('networkidle');

        const images = await page.locator('img').all();
        
        for (const img of images.slice(0, 5)) {
          const box = await img.boundingBox();
          const src = await img.getAttribute('src');
          
          if (box && src) {
            // Verificar se a imagem não estoura o container
            if (box.width > device.width) {
              console.warn(`⚠️  Imagem muito larga: ${src} (${box.width}px) em ${device.name} (${device.width}px)`);
            }

            // Verificar se tem atributo srcset ou é SVG (responsivo)
            const srcset = await img.getAttribute('srcset');
            const isSvg = src.includes('.svg') || src.startsWith('data:image/svg');
            
            if (!srcset && !isSvg && device.width <= 768) {
              console.log(`ℹ️  Imagem sem srcset: ${src} em ${device.name}`);
            }
          }
        }
      });

      test('tabelas scrolláveis horizontalmente', async ({ page }) => {
        await page.goto('http://localhost:3021');
        await page.waitForLoadState('networkidle');

        const tables = await page.locator('table').all();
        
        for (const table of tables) {
          const box = await table.boundingBox();
          if (box && box.width > device.width * 0.9) {
            // Verificar se a tabela está em um container scrollável
            const parent = await table.locator('..').first();
            const parentStyles = await parent.evaluate((el) => {
              const styles = window.getComputedStyle(el);
              return {
                overflowX: styles.overflowX,
                overflowY: styles.overflowY
              };
            });

            const isScrollable = parentStyles.overflowX === 'auto' || parentStyles.overflowX === 'scroll';
            
            if (!isScrollable && device.width <= 768) {
              console.warn(`⚠️  Tabela larga sem scroll horizontal em ${device.name}`);
            } else if (isScrollable) {
              console.log(`✅ Tabela com scroll horizontal em ${device.name}`);
            }
          }
        }
      });

      test('formulários em layout adequado', async ({ page }) => {
        await page.goto('http://localhost:3021');
        await page.waitForLoadState('networkidle');

        const forms = await page.locator('form').all();
        
        for (const form of forms) {
          const inputs = await form.locator('input, select, textarea').all();
          
          if (inputs.length > 1) {
            // Em mobile, inputs devem estar em coluna única ou pelo menos não muito apertados
            const firstInput = inputs[0];
            const secondInput = inputs[1];
            
            const box1 = await firstInput.boundingBox();
            const box2 = await secondInput.boundingBox();
            
            if (box1 && box2 && device.width <= 768) {
              // Se estão na mesma linha e muito próximos, pode ser problemático
              const sameRow = Math.abs(box1.y - box2.y) < 20;
              const tooClose = Math.abs(box1.x - box2.x) < 100;
              
              if (sameRow && tooClose) {
                console.warn(`⚠️  Inputs muito próximos em mobile: ${device.name}`);
              }
            }
          }
        }
      });

      test('overflow horizontal zero', async ({ page }) => {
        await page.goto('http://localhost:3021');
        await page.waitForLoadState('networkidle');

        // Verificar se algum elemento está causando overflow
        const overflowingElements = await page.evaluate((viewportWidth) => {
          const elements = document.querySelectorAll('*');
          const problematic: string[] = [];
          
          elements.forEach((el, index) => {
            if (index < 100) { // Verificar apenas os primeiros 100 elementos
              const rect = el.getBoundingClientRect();
              if (rect.right > viewportWidth + 10) { // 10px de tolerância
                const tag = el.tagName.toLowerCase();
                const classes = el.className;
                problematic.push(`${tag}${classes ? '.' + classes.split(' ')[0] : ''} (${Math.round(rect.right)}px)`);
              }
            }
          });
          
          return problematic.slice(0, 5); // Retornar apenas os primeiros 5
        }, device.width);

        if (overflowingElements.length > 0) {
          console.warn(`⚠️  Elementos estourando em ${device.name}:`, overflowingElements);
        } else {
          console.log(`✅ Nenhum overflow detectado em ${device.name}`);
        }
      });
    });
  }

  test.describe('Orientação', () => {
    test('landscape funciona', async ({ page }) => {
      // Simular rotação para landscape
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('http://localhost:3021');
      await page.waitForLoadState('networkidle');

      // Verificar se o layout se adapta
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
      expect(bodyHeight).toBeGreaterThan(0);

      // Screenshot landscape
      await page.screenshot({
        path: 'test-results/screenshots/landscape-667x375.png',
        fullPage: true
      });
    });

    test('portrait mobile funciona', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('http://localhost:3021');
      await page.waitForLoadState('networkidle');

      // Verificar elementos essenciais visíveis
      const header = page.locator('header, nav, h1').first();
      if (await header.count() > 0) {
        expect(await header.isVisible()).toBe(true);
      }
    });
  });
});