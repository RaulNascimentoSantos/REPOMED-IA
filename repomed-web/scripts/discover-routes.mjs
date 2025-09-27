import { chromium } from "playwright";
import fs from "fs"; import path from "path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3023";
const OUT_DIR = process.env.UX_OUT_DIR || "TESTES UX";
const MAX_DEPTH = Number(process.env.MAX_DEPTH || "3");

const visited = new Set();
const queue = ["/"];
const routes = [];

function norm(url) {
  try { const u = new URL(url, BASE_URL);
    if (u.origin !== new URL(BASE_URL).origin) return null;
    return u.pathname.replace(/\/+$/,"") || "/";
  } catch { return null; }
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  let depth = 0;
  while (queue.length && depth <= MAX_DEPTH) {
    const size = queue.length;
    for (let i=0;i<size;i++) {
      const pathn = queue.shift();
      if (!pathn || visited.has(pathn)) continue;
      visited.add(pathn);
      const res = await p.goto(BASE_URL + pathn, { waitUntil: "domcontentloaded" }).catch(()=>null);
      if (!res || !res.ok()) continue;
      routes.push(pathn);
      const hrefs = await p.$$eval("a[href]", as => as.map(a => (a).getAttribute("href")));
      hrefs.forEach(h => {
        const n = norm(h);
        if (n && !visited.has(n) && !queue.includes(n)) queue.push(n);
      });
    }
    depth++;
  }
  await b.close();
  const stamp = new Date().toISOString().replace(/[:.]/g,"-");
  const dir = path.join(OUT_DIR, stamp);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "routes.json"), JSON.stringify([...new Set(routes)].sort(), null, 2));
  console.log(`Rotas descobertas: ${routes.length}. Salvo em ${path.join(dir,"routes.json")}`);
})();