import { execSync } from 'node:child_process';

const target = process.env.APP_BASE || 'http://localhost:4173'; // vite preview
try {
  const cmd = `npx lighthouse ${target} --quiet --chrome-flags="--headless" --only-categories=performance,accessibility --output=json --output-path=stdout`;
  const out = execSync(cmd, { stdio: ['ignore','pipe','pipe'] }).toString();
  const report = JSON.parse(out);
  const perf = Math.round(report.categories.performance.score * 100);
  const a11y = Math.round(report.categories.accessibility.score * 100);
  console.log('Lighthouse => Perf:', perf, 'A11y:', a11y);
  if (perf < 90 || a11y < 95) {
    console.error('❌ Threshold não atingido (Perf>=90, A11y>=95)');
    process.exit(1);
  }
  console.log('✅ Thresholds ok');
} catch (e) {
  console.error('Falha ao rodar Lighthouse', e?.message || e);
  process.exit(1);
}