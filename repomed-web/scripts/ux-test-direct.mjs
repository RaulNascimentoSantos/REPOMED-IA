import { chromium } from "playwright";
import fs from "fs"; import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3023";
const OUT_DIR = process.env.UX_OUT_DIR || "../TESTES UX";

// Rotas conhecidas do RepoMed
const routes = [
  "/home",
  "/prescricoes",
  "/prescricoes/nova",
  "/pacientes",
  "/pacientes/novo",
  "/documentos",
  "/configuracoes",
  "/notificacoes",
  "/assinatura",
  "/templates"
];

const stamp = new Date().toISOString().replace(/[:.]/g,"-");
const dir = path.join(OUT_DIR, stamp);
fs.mkdirSync(dir, { recursive: true });
fs.mkdirSync(path.join(dir, "routes"), { recursive: true });

console.log(`🚀 Iniciando diagnóstico UX completo - RepoMed IA v5.1`);
console.log(`📁 Relatórios salvos em: ${dir}`);
console.log(`🌐 Base URL: ${BASE_URL}`);
console.log(`📋 ${routes.length} rotas para análise`);

// Salvar lista de rotas
fs.writeFileSync(path.join(dir, "routes.json"), JSON.stringify(routes, null, 2));

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: path.join(dir, "videos") }
});

// Interceptar requests destrutivos em modo seguro
if (process.env.SAFE_WRITE === "1") {
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

const allResults = [];

for (const routePath of routes) {
  const routeName = routePath === "/" ? "root" : routePath.replace(/^\//,"").replace(/[\/:?<>\\|*"']/g,"_");
  const routeDir = path.join(dir, "routes", routeName);
  fs.mkdirSync(routeDir, { recursive: true });

  console.log(`\n🔍 Analisando: ${routePath}`);

  const page = await context.newPage();

  try {
    // Definir tema médico
    await page.addInitScript(() => {
      try { localStorage.setItem("repomed_theme", "medical"); } catch {}
    });

    // Navegar para a rota
    const response = await page.goto(BASE_URL + routePath, {
      waitUntil: "networkidle",
      timeout: 30000
    });

    if (!response || !response.ok()) {
      console.log(`  ❌ Falha ao abrir: ${response?.status() || 'erro'}`);
      fs.writeFileSync(path.join(routeDir, "skip.txt"), `Falha: ${response?.status() || 'erro'}`);
      await page.close();
      continue;
    }

    console.log(`  ✅ Página carregada: ${response.status()}`);

    // Screenshot inicial
    await page.screenshot({
      path: path.join(routeDir, "000-inicial.png"),
      fullPage: true
    });

    // Capturar HTML
    const html = await page.content();
    fs.writeFileSync(path.join(routeDir, "dom.html"), html);

    // Auditoria de contraste e tipografia
    console.log(`  🎨 Analisando contraste e tipografia...`);
    const audit = await page.evaluate(() => {
      function hasText(el) {
        const t = (el.textContent||"").trim();
        return !!t && t.length > 0;
      }

      function isVisible(el) {
        const s = getComputedStyle(el);
        return s.visibility !== "hidden" && s.display !== "none" && el.offsetHeight > 0;
      }

      function getLuminance(rgb) {
        const m = rgb.match(/\d+(\.\d+)?/g);
        if (!m) return 0;
        const [r,g,b] = m.slice(0,3).map(Number).map(v=>v/255).map(u=>u<=0.03928?u/12.92:Math.pow((u+0.055)/1.055,2.4));
        return 0.2126*r + 0.7152*g + 0.0722*b;
      }

      function getContrastRatio(fg, bg) {
        const L1 = getLuminance(fg) + 0.05;
        const L2 = getLuminance(bg) + 0.05;
        return (Math.max(L1,L2) / Math.min(L1,L2));
      }

      const elements = Array.from(document.querySelectorAll("*"))
        .filter(el => isVisible(el) && hasText(el))
        .slice(0, 200);

      const issues = [];

      elements.forEach(el => {
        const styles = getComputedStyle(el);
        let bg = styles.backgroundColor;
        let parent = el.parentElement;

        // Buscar background válido subindo na árvore
        while (bg === "rgba(0, 0, 0, 0)" && parent) {
          bg = getComputedStyle(parent).backgroundColor;
          parent = parent.parentElement;
        }

        const ratio = getContrastRatio(styles.color, bg);
        const fontSize = parseFloat(styles.fontSize);

        issues.push({
          text: el.textContent.trim().slice(0, 50),
          color: styles.color,
          backgroundColor: bg,
          fontSize: fontSize,
          contrastRatio: Number(ratio.toFixed(2)),
          lowContrast: ratio < 4.5,
          tooSmall: fontSize < 16,
          tag: el.tagName.toLowerCase()
        });
      });

      const lowContrast = issues.filter(i => i.lowContrast);
      const smallText = issues.filter(i => i.tooSmall);

      return {
        totalElements: issues.length,
        lowContrastCount: lowContrast.length,
        smallTextCount: smallText.length,
        worstContrast: lowContrast.sort((a,b) => a.contrastRatio - b.contrastRatio).slice(0, 5),
        issues: issues
      };
    });

    fs.writeFileSync(path.join(routeDir, "audit.json"), JSON.stringify(audit, null, 2));
    console.log(`  📊 Elementos analisados: ${audit.totalElements}`);
    console.log(`  ⚠️  Baixo contraste: ${audit.lowContrastCount}`);
    console.log(`  📏 Fontes pequenas: ${audit.smallTextCount}`);

    // Análise de acessibilidade com axe
    console.log(`  ♿ Executando análise A11y...`);
    await page.addScriptTag({ path: require.resolve("axe-core") });
    const axeResults = await page.evaluate(async () => {
      return await axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
        resultTypes: ["violations"]
      });
    });

    fs.writeFileSync(path.join(routeDir, "axe.json"), JSON.stringify(axeResults, null, 2));
    console.log(`  🔍 Violações A11y: ${axeResults.violations.length}`);

    // Testar interações básicas
    console.log(`  🖱️  Testando interações...`);
    const buttons = await page.locator('button, [role="button"], a[href]').all();
    const interactions = [];

    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const btn = buttons[i];
      try {
        const text = await btn.innerText();
        const href = await btn.getAttribute('href');

        await btn.scrollIntoViewIfNeeded();
        await btn.click({ timeout: 2000 });
        await page.waitForTimeout(500);

        // Fechar modais com ESC
        await page.keyboard.press("Escape");

        interactions.push({
          index: i,
          text: text.trim().slice(0, 30),
          href: href,
          clicked: true
        });

        // Screenshot da interação
        await page.screenshot({
          path: path.join(routeDir, `${String(i+1).padStart(3,"0")}-click.png`)
        });

        // Voltar para a rota original se navegou
        const currentUrl = new URL(page.url());
        if (currentUrl.pathname !== routePath) {
          await page.goto(BASE_URL + routePath, { waitUntil: "domcontentloaded" });
        }

      } catch (error) {
        interactions.push({
          index: i,
          text: "Erro ao clicar",
          error: error.message,
          clicked: false
        });
      }
    }

    fs.writeFileSync(path.join(routeDir, "interactions.json"), JSON.stringify(interactions, null, 2));
    console.log(`  👆 Interações testadas: ${interactions.filter(i => i.clicked).length}/${interactions.length}`);

    allResults.push({
      route: routePath,
      status: "success",
      audit: audit,
      axe: axeResults.violations.length,
      interactions: interactions.length
    });

  } catch (error) {
    console.log(`  ❌ Erro: ${error.message}`);
    fs.writeFileSync(path.join(routeDir, "error.txt"), error.message);

    allResults.push({
      route: routePath,
      status: "error",
      error: error.message
    });
  }

  await page.close();
}

await browser.close();

// Gerar relatório consolidado
console.log(`\n📋 Gerando relatório consolidado...`);

const totalLowContrast = allResults.reduce((sum, r) => sum + (r.audit?.lowContrastCount || 0), 0);
const totalSmallText = allResults.reduce((sum, r) => sum + (r.audit?.smallTextCount || 0), 0);
const totalAxeViolations = allResults.reduce((sum, r) => sum + (r.axe || 0), 0);

let report = `# Relatório UX Completo - RepoMed IA v5.1\n\n`;
report += `**Data:** ${new Date().toLocaleString('pt-BR')}\n`;
report += `**Base URL:** ${BASE_URL}\n`;
report += `**Rotas analisadas:** ${routes.length}\n\n`;

report += `## 📊 Resumo Executivo\n\n`;
report += `- **Elementos com baixo contraste:** ${totalLowContrast}\n`;
report += `- **Textos pequenos (<16px):** ${totalSmallText}\n`;
report += `- **Violações WCAG 2.1 AA:** ${totalAxeViolations}\n\n`;

report += `## 📋 Análise por Rota\n\n`;

for (const result of allResults) {
  if (result.status === "success") {
    report += `### ${result.route}\n`;
    report += `- ✅ **Status:** Sucesso\n`;
    report += `- 🎨 **Baixo contraste:** ${result.audit.lowContrastCount}\n`;
    report += `- 📏 **Fontes pequenas:** ${result.audit.smallTextCount}\n`;
    report += `- ♿ **Violações A11y:** ${result.axe}\n`;
    report += `- 🖱️ **Interações testadas:** ${result.interactions}\n\n`;
  } else {
    report += `### ${result.route}\n`;
    report += `- ❌ **Status:** Erro - ${result.error}\n\n`;
  }
}

// Top 10 piores contrastes
const allContrasts = allResults
  .filter(r => r.audit?.worstContrast)
  .flatMap(r => r.audit.worstContrast.map(c => ({...c, route: r.route})))
  .sort((a, b) => a.contrastRatio - b.contrastRatio)
  .slice(0, 10);

if (allContrasts.length > 0) {
  report += `## 🎨 Top 10 Piores Contrastes\n\n`;
  allContrasts.forEach((item, i) => {
    report += `${i+1}. **Ratio ${item.contrastRatio}** em ${item.route} - "${item.text}"\n`;
  });
  report += `\n`;
}

report += `## 🎯 Recomendações\n\n`;
if (totalLowContrast > 0) {
  report += `- **Contraste:** Ajustar ${totalLowContrast} elementos para WCAG AA (4.5:1)\n`;
}
if (totalSmallText > 0) {
  report += `- **Tipografia:** Aumentar ${totalSmallText} textos para 16px+ (melhor legibilidade)\n`;
}
if (totalAxeViolations > 0) {
  report += `- **Acessibilidade:** Corrigir ${totalAxeViolations} violações WCAG 2.1 AA\n`;
}

fs.writeFileSync(path.join(dir, "index.md"), report);

console.log(`\n✅ Diagnóstico UX completo finalizado!`);
console.log(`📁 Relatórios disponíveis em: ${dir}`);
console.log(`📋 Relatório principal: ${path.join(dir, "index.md")}`);
console.log(`\n🎯 Resultados:`, {
  "Rotas analisadas": allResults.filter(r => r.status === "success").length,
  "Baixo contraste": totalLowContrast,
  "Fontes pequenas": totalSmallText,
  "Violações A11y": totalAxeViolations
});