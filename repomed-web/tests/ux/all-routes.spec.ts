import { test, expect } from "@playwright/test";
import fs from "fs"; import path from "path";
import { BASE_URL, SAFE_WRITE, THEME, OUT_DIR, VISUAL_POLLUTION_THRESHOLD, MEDICAL_UX_CONFIG, DENSITY_ANALYSIS } from "./config";

function tsDir() {
  const stamp = new Date().toISOString().replace(/[:.]/g,"-");
  const dir = path.join(OUT_DIR, stamp);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
function slugify(p: string) { return p === "/" ? "root" : p.replace(/^\//,"").replace(/[\/:?<>\\|*"']/g,"_"); }

async function setTheme(page, theme: string) {
  await page.addInitScript((t) => {
    try { localStorage.setItem("repomed_theme", t); } catch {}
  }, theme);
}

const destructiveWords = /(apagar|excluir|delete|remover|cancelar conta|desativar|danger)/i;

test("Executa auditoria completa em todas as rotas descobertas", async ({ page, context, browserName }) => {
  test.setTimeout(600000); // 10 minutes timeout
  // const outRoot = tsDir();

  // Interceptar métodos de escrita, se SAFE_WRITE
  if (SAFE_WRITE) {
    await context.route("**/*", async (route) => {
      const req = route.request();
      const method = req.method().toUpperCase();
      if (["POST","PUT","PATCH","DELETE"].includes(method)) {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ok: true, mocked: true, method, url: req.url() })
        });
      }
      return route.continue();
    });
  }

  // carregar lista de rotas
  const routesPath = path.join(__dirname, "routes.json");
  if (!fs.existsSync(routesPath)) throw new Error("routes.json não encontrado — crie o arquivo de rotas primeiro.");
  const routes: string[] = JSON.parse(fs.readFileSync(routesPath, "utf8"));

  const outRoot = tsDir();

  // Loop de rotas
  for (const routePath of routes) {
    const routeOut = path.join(outRoot, "routes", slugify(routePath));
    fs.mkdirSync(routeOut, { recursive: true });

    // forçar tema
    await setTheme(page, THEME);

    // ir para a rota
    const resp = await page.goto(BASE_URL + routePath, { waitUntil: "networkidle" }).catch(()=>null);
    if (!resp || !resp.ok()) {
      fs.writeFileSync(path.join(routeOut, "skip.txt"), `Falha ao abrir: ${routePath}`);
      continue;
    }

    // screenshot inicial + html
    await page.screenshot({ path: path.join(routeOut, "000-inicial.png"), fullPage: true });
    const html = await page.content();
    fs.writeFileSync(path.join(routeOut, "dom.html"), html);

    // abrir dropdowns/accordions/tabs (heurística)
    await page.locator('[aria-expanded="false"], [data-state="closed"]').first().press("Enter").catch(()=>{});
    const buttons = await page.locator('button, [role="button"], a[href]').all();

    const clickedLog: any[] = [];
    let clickIndex = 1;

    for (const el of buttons) {
      const role = await el.getAttribute("role");
      const tag = await el.evaluate(e => e.tagName.toLowerCase());
      const href = tag === "a" ? await el.getAttribute("href") : null;
      const text = (await el.innerText()).trim().slice(0,80);
      const title = (await el.getAttribute("title")) || "";
      const name = text || title || href || `${role||tag}`;

      // pular externos e destrutivos em SAFE_WRITE
      if (href && /^https?:\/\//i.test(href) && !href.startsWith(new URL(BASE_URL).origin)) continue;
      if (SAFE_WRITE && destructiveWords.test(`${text} ${title}`)) continue;

      // tentar clicar com timeout curto
      try {
        await el.scrollIntoViewIfNeeded();
        await el.click({ trial: false, timeout: 2000 });
        await page.waitForTimeout(250);
        // se abriu modal, tenta fechar com ESC
        await page.keyboard.press("Escape").catch(()=>{});
        await page.screenshot({ path: path.join(routeOut, `${String(clickIndex).padStart(3,"0")}-${name.replace(/\s+/g,"_").slice(0,40)}.png`) });
        clickedLog.push({ name, href, role, tag });
        clickIndex++;
        // voltar se mudou rota (permanecer na página corrente)
        const current = new URL(page.url());
        if (current.pathname !== routePath) await page.goto(BASE_URL + routePath, { waitUntil: "domcontentloaded" });
      } catch {}
    }

    // Análise de poluição visual (NOVO)
    const visualPollution = await page.evaluate((thresholds) => {
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const allElements = Array.from(document.querySelectorAll("*"));
      const visibleElements = allElements.filter(el => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el as HTMLElement);
        return rect.width > 0 && rect.height > 0 &&
               style.visibility !== "hidden" && style.display !== "none";
      });

      // Análise de densidade
      const density = {
        totalElements: visibleElements.length,
        elementsPerViewport: visibleElements.length / (viewport.width * viewport.height) * 100000,
        exceedsThreshold: visibleElements.length > thresholds.maxElementsPerScreen
      };

      // Análise de cores
      const colors = new Set();
      const fontSizes = new Set();
      visibleElements.forEach(el => {
        const style = getComputedStyle(el as HTMLElement);
        colors.add(style.color);
        colors.add(style.backgroundColor);
        fontSizes.add(style.fontSize);
      });

      // Análise de elementos interativos
      const interactiveElements = visibleElements.filter(el =>
        el.tagName.toLowerCase() === "button" ||
        el.tagName.toLowerCase() === "a" ||
        el.getAttribute("role") === "button" ||
        el.getAttribute("onclick") ||
        el.getAttribute("tabindex")
      );

      return {
        density,
        colorComplexity: {
          uniqueColors: colors.size,
          exceedsThreshold: colors.size > thresholds.maxColorVariations
        },
        typographyComplexity: {
          uniqueFontSizes: fontSizes.size,
          exceedsThreshold: fontSizes.size > thresholds.maxFontSizes
        },
        interactiveOverload: {
          count: interactiveElements.length,
          exceedsThreshold: interactiveElements.length > thresholds.maxInteractiveElements
        },
        cognitiveLoad: {
          score: Math.min(10, (colors.size / 5) + (fontSizes.size / 2) + (interactiveElements.length / 10)),
          level: colors.size > 8 || fontSizes.size > 4 ? "high" : colors.size > 5 ? "medium" : "low"
        }
      };
    }, VISUAL_POLLUTION_THRESHOLD);
    fs.writeFileSync(path.join(routeOut, "visual-pollution.json"), JSON.stringify(visualPollution, null, 2));

    // Análise específica do menu lateral (NOVO)
    const menuAnalysis = await page.evaluate((config) => {
      const sidebar = document.querySelector('[role="navigation"], nav, .sidebar, .menu-lateral') ||
                     document.querySelector('[class*="sidebar"], [class*="menu"], [class*="nav"]');

      if (!sidebar) return { found: false };

      const menuItems = Array.from(sidebar.querySelectorAll('a, button, [role="menuitem"]'));
      const categories = Array.from(sidebar.querySelectorAll('[role="group"], .menu-section, .nav-section'));

      const contrastAnalysis = menuItems.map(item => {
        const style = getComputedStyle(item as HTMLElement);
        const rect = item.getBoundingClientRect();

        return {
          text: item.textContent?.trim().slice(0, 50),
          clickableArea: rect.width * rect.height,
          meetsSizeRequirement: (rect.width * rect.height) >= config.menuAnalysis.minClickableArea,
          color: style.color,
          backgroundColor: style.backgroundColor,
          fontSize: style.fontSize
        };
      });

      return {
        found: true,
        structure: {
          totalItems: menuItems.length,
          categories: categories.length,
          itemsPerCategory: categories.length > 0 ? menuItems.length / categories.length : menuItems.length
        },
        accessibility: {
          itemsSizeCompliant: contrastAnalysis.filter(item => item.meetsSizeRequirement).length,
          totalItems: contrastAnalysis.length,
          complianceRate: contrastAnalysis.length > 0 ?
            contrastAnalysis.filter(item => item.meetsSizeRequirement).length / contrastAnalysis.length : 0
        },
        items: contrastAnalysis
      };
    }, MEDICAL_UX_CONFIG);
    fs.writeFileSync(path.join(routeOut, "menu-analysis.json"), JSON.stringify(menuAnalysis, null, 2));

    // auditoria rápida (fontes/contraste/vars)
    const audit = await page.evaluate(() => {
      function hasText(el: Element) {
        const t = (el.textContent||"").trim(); return !!t && t.length>0;
      }
      function vis(el: Element) {
        const s = getComputedStyle(el as HTMLElement);
        return s.visibility !== "hidden" && s.display !== "none" && (el as HTMLElement).offsetHeight>0;
      }
      function lum(rgb: string) {
        const m = rgb.match(/\d+(\.\d+)?/g); if (!m) return 0;
        const [r,g,b] = m.slice(0,3).map(Number).map(v=>v/255).map(u=>u<=0.03928?u/12.92:Math.pow((u+0.055)/1.055,2.4));
        return 0.2126*r+0.7152*g+0.0722*b;
      }
      function cr(fg: string, bg: string) {
        const L1 = lum(fg)+0.05, L2 = lum(bg)+0.05;
        return (Math.max(L1,L2)/Math.min(L1,L2));
      }
      const els = Array.from(document.querySelectorAll("*")).filter(e=>vis(e)&&hasText(e)).slice(0,300);
      const items = els.map(e=>{
        const s = getComputedStyle(e as HTMLElement);
        let bg = s.backgroundColor, p = e.parentElement as HTMLElement|null;
        while (bg === "rgba(0, 0, 0, 0)" && p) { bg = getComputedStyle(p).backgroundColor; p = p.parentElement; }
        const ratio = cr(s.color, bg);
        const tag = e.tagName.toLowerCase();
        return {
          text: (e.textContent||"").trim().slice(0,80),
          color: s.color, backgroundColor: bg,
          fontSize: parseFloat(s.fontSize),
          contrastRatio: Number(ratio.toFixed(2)),
          lowContrast: ratio < 4.5,
          tooSmall: parseFloat(s.fontSize) < 16,
          tag: tag,
          usesVar: s.color.includes("var(")||s.backgroundColor.includes("var(")
        };
      });

      // Análise mais detalhada
      const worstContrast = items.filter(i => i.lowContrast).sort((a,b) => a.contrastRatio - b.contrastRatio).slice(0,5);
      const totalElements = document.querySelectorAll("*").length;
      const lowContrastCount = items.filter(i => i.lowContrast).length;
      const smallTextCount = items.filter(i => i.tooSmall).length;

      const root = getComputedStyle(document.documentElement);
      const expected = ["--bg","--fg","--muted","--card-bg","--status-success","--status-warning","--status-error"];
      const missing = expected.filter(v => !root.getPropertyValue(v));

      return {
        totalElements,
        lowContrastCount,
        smallTextCount,
        worstContrast,
        missing,
        issues: items.filter(i => i.lowContrast || i.tooSmall)
      };
    });
    fs.writeFileSync(path.join(routeOut, "audit.json"), JSON.stringify(audit,null,2));

    // A11y com axe
    await page.addScriptTag({ path: require.resolve("axe-core") });
    const axeRes = await page.evaluate(async () => {
      // @ts-ignore
      return await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a","wcag2aa"] }, resultTypes: ["violations"] });
    });
    fs.writeFileSync(path.join(routeOut, "axe.json"), JSON.stringify(axeRes,null,2));

    // Log de interações
    fs.writeFileSync(path.join(routeOut, "interactions.json"), JSON.stringify(clickedLog,null,2));
  }
});