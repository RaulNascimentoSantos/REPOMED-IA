import fs from "fs"; import path from "path";
const OUT_DIR = process.env.UX_OUT_DIR || "TESTES UX";
const runs = fs.readdirSync(OUT_DIR).filter(f=>/\d{4}-\d{2}-\d{2}T/.test(f)).sort();
if (!runs.length) throw new Error("Nenhuma execução encontrada.");
const dir = path.join(OUT_DIR, runs[runs.length-1]);
const routes = JSON.parse(fs.readFileSync(path.join(dir,"routes.json"),"utf8"));
const routesDir = path.join(dir,"routes");

function readJSON(p){ try { return JSON.parse(fs.readFileSync(p,"utf8")); } catch { return null; } }

let md = `# Relatório UX — ${dir.split(path.sep).pop()}\n\nBase: ${process.env.BASE_URL || "http://localhost:3023"}\n\nTotal de rotas: **${routes.length}**\n\n`;

let worstContrast = [];
let smallFonts = 0, lowContrastEls = 0, axeViol = 0;

for (const r of routes) {
  const slug = r === "/" ? "root" : r.replace(/^\//,"").replace(/[\/:?<>\\|*"']/g,"_");
  const p = path.join(routesDir, slug, "audit.json");
  const a = readJSON(p); const ax = readJSON(path.join(routesDir, slug, "axe.json"));
  if (a) {
    smallFonts += a.small||0; lowContrastEls += a.low||0;
    const top = (a.items||[]).filter(i=>i.lowContrast).sort((x,y)=>x.ratio-y.ratio).slice(0,2).map(i=>({route:r, ratio:i.ratio, text:i.text}));
    worstContrast.push(...top);
  }
  if (ax?.violations) axeViol += ax.violations.length;
  md += `- ${r} — audit: ${a?`${a.low} baixo contraste / ${a.small} fontes <16px`:"n/a"}; axe: ${ax?.violations?.length ?? "n/a"} violações\n`;
}

worstContrast = worstContrast.sort((x,y)=>x.ratio - y.ratio).slice(0,10);
md += `\n## Sumário\n- Elementos com baixo contraste (total): **${lowContrastEls}**\n- Ocorrências de fontes <16px (total): **${smallFonts}**\n- Violações axe (soma das rotas): **${axeViol}**\n\n`;

md += `## Top 10 piores contrastes\n` + worstContrast.map(w=>`- ${w.ratio} em **${w.route}** — "${w.text}"`).join("\n") + "\n";

fs.writeFileSync(path.join(dir, "index.md"), md);
console.log("Relatório consolidado em", path.join(dir,"index.md"));