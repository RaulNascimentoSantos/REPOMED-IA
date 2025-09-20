#!/usr/bin/env node

/**
 * RepoMed IA v5.1 - Baseline Metrics Collection
 * Collects performance and UX metrics before implementing new features
 * Provides data-driven foundation for measuring improvements
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Critical medical routes for baseline measurement
const CRITICAL_ROUTES = [
  '/home',
  '/prescricoes',
  '/prescricoes/nova',
  '/documentos',
  '/documentos/novo',
  '/pacientes',
  '/pacientes/novo',
  '/configuracoes'
];

const baseline = {
  timestamp: new Date().toISOString(),
  version: '5.1-baseline',
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch
  },
  routes: {},
  summary: {
    totalRoutes: 0,
    averageMetrics: {},
    slowestRoute: null,
    fastestRoute: null
  },
  recommendations: []
};

console.log('📊 RepoMed IA Baseline Metrics Collection\n');
console.log('🏥 Measuring medical workflow performance before optimizations...\n');

/**
 * Test server connectivity
 */
async function checkServerHealth() {
  console.log('🔍 Checking server health...');

  try {
    const { stdout: healthCheck } = await execAsync('curl -s -o nul -w "%{http_code}" http://localhost:3023/home');

    if (healthCheck.trim() !== '200') {
      throw new Error(`Server not responding properly (HTTP ${healthCheck.trim()})`);
    }

    console.log('   ✅ Server is healthy and responding\n');
    return true;

  } catch (error) {
    console.log(`   ❌ Server health check failed: ${error.message}`);
    console.log('   💡 Make sure the development server is running: npm run dev');
    return false;
  }
}

/**
 * Collect performance metrics for a route
 */
async function collectRouteMetrics(route) {
  const url = `http://localhost:3023${route}`;

  console.log(`📈 Collecting baseline for ${route}...`);

  try {
    // Basic connectivity test
    const startTime = Date.now();
    const { stdout: responseCode } = await execAsync(`curl -s -o nul -w "%{http_code},%{time_total}" ${url}`);
    const endTime = Date.now();

    const [httpCode, curlTime] = responseCode.trim().split(',');

    if (httpCode !== '200') {
      console.log(`   ⚠️  Route ${route} returned HTTP ${httpCode}`);
      return null;
    }

    // Lightweight Lighthouse audit for core metrics
    let lighthouseMetrics = {};
    try {
      console.log(`   🔬 Running Lighthouse audit...`);
      const lighthouseCmd = `npx lighthouse ${url} --chrome-flags="--headless --no-sandbox" --output=json --quiet --only-categories=performance`;

      const { stdout: lighthouseOutput } = await execAsync(lighthouseCmd);
      const audit = JSON.parse(lighthouseOutput);

      lighthouseMetrics = {
        performanceScore: Math.round(audit.categories.performance.score * 100),
        fcp: Math.round(audit.audits['first-contentful-paint']?.numericValue || 0),
        lcp: Math.round(audit.audits['largest-contentful-paint']?.numericValue || 0),
        ttfb: Math.round(audit.audits['server-response-time']?.numericValue || 0),
        cls: Number(audit.audits['cumulative-layout-shift']?.numericValue || 0).toFixed(3),
        tti: Math.round(audit.audits['interactive']?.numericValue || 0)
      };

    } catch (lighthouseError) {
      console.log(`   ⚠️  Lighthouse audit failed: ${lighthouseError.message}`);
      lighthouseMetrics = {
        performanceScore: null,
        fcp: null,
        lcp: null,
        ttfb: null,
        cls: null,
        tti: null
      };
    }

    // Simple load time measurement
    const basicMetrics = {
      responseTime: Math.round(parseFloat(curlTime) * 1000),
      httpStatus: httpCode,
      timestamp: new Date().toISOString()
    };

    const routeMetrics = {
      ...basicMetrics,
      ...lighthouseMetrics,
      route,
      url
    };

    // Log results
    console.log(`   📊 Baseline metrics collected:`);
    console.log(`      Response Time: ${routeMetrics.responseTime}ms`);
    if (routeMetrics.performanceScore !== null) {
      console.log(`      Performance Score: ${routeMetrics.performanceScore}/100`);
      console.log(`      FCP: ${routeMetrics.fcp}ms`);
      console.log(`      LCP: ${routeMetrics.lcp}ms`);
      console.log(`      TTFB: ${routeMetrics.ttfb}ms`);
      console.log(`      CLS: ${routeMetrics.cls}`);
    }

    baseline.routes[route] = routeMetrics;
    return routeMetrics;

  } catch (error) {
    console.log(`   ❌ Failed to collect metrics for ${route}: ${error.message}`);
    return null;
  }
}

/**
 * Analyze collected metrics and generate insights
 */
function analyzeBaseline() {
  console.log('\n📊 Baseline Analysis\n');

  const validRoutes = Object.values(baseline.routes).filter(r => r !== null);
  baseline.summary.totalRoutes = validRoutes.length;

  if (validRoutes.length === 0) {
    console.log('❌ No valid metrics collected');
    return;
  }

  // Calculate averages
  const totals = validRoutes.reduce((acc, route) => {
    acc.responseTime += route.responseTime || 0;
    if (route.performanceScore !== null) {
      acc.performanceScore += route.performanceScore || 0;
      acc.fcp += route.fcp || 0;
      acc.lcp += route.lcp || 0;
      acc.ttfb += route.ttfb || 0;
      acc.performanceRoutes++;
    }
    return acc;
  }, {
    responseTime: 0,
    performanceScore: 0,
    fcp: 0,
    lcp: 0,
    ttfb: 0,
    performanceRoutes: 0
  });

  baseline.summary.averageMetrics = {
    responseTime: Math.round(totals.responseTime / validRoutes.length),
    performanceScore: totals.performanceRoutes > 0 ? Math.round(totals.performanceScore / totals.performanceRoutes) : null,
    fcp: totals.performanceRoutes > 0 ? Math.round(totals.fcp / totals.performanceRoutes) : null,
    lcp: totals.performanceRoutes > 0 ? Math.round(totals.lcp / totals.performanceRoutes) : null,
    ttfb: totals.performanceRoutes > 0 ? Math.round(totals.ttfb / totals.performanceRoutes) : null
  };

  // Find fastest and slowest routes
  const sortedByResponse = validRoutes.sort((a, b) => (a.responseTime || 0) - (b.responseTime || 0));
  baseline.summary.fastestRoute = sortedByResponse[0];
  baseline.summary.slowestRoute = sortedByResponse[sortedByResponse.length - 1];

  // Generate recommendations
  const recommendations = [];

  if (baseline.summary.averageMetrics.responseTime > 1000) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message: 'Average response time is above 1 second - consider server optimization'
    });
  }

  if (baseline.summary.averageMetrics.performanceScore !== null && baseline.summary.averageMetrics.performanceScore < 70) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      message: 'Lighthouse performance score is below 70 - optimization needed'
    });
  }

  if (baseline.summary.averageMetrics.lcp && baseline.summary.averageMetrics.lcp > 2500) {
    recommendations.push({
      type: 'web-vitals',
      priority: 'critical',
      message: 'LCP is above 2.5s - critical for medical applications'
    });
  }

  baseline.recommendations = recommendations;

  // Display results
  console.log('📈 Summary Statistics:');
  console.log(`   Routes analyzed: ${baseline.summary.totalRoutes}`);
  console.log(`   Average response time: ${baseline.summary.averageMetrics.responseTime}ms`);

  if (baseline.summary.averageMetrics.performanceScore !== null) {
    console.log(`   Average performance score: ${baseline.summary.averageMetrics.performanceScore}/100`);
    console.log(`   Average FCP: ${baseline.summary.averageMetrics.fcp}ms`);
    console.log(`   Average LCP: ${baseline.summary.averageMetrics.lcp}ms`);
    console.log(`   Average TTFB: ${baseline.summary.averageMetrics.ttfb}ms`);
  }

  console.log(`\n🏃 Fastest route: ${baseline.summary.fastestRoute.route} (${baseline.summary.fastestRoute.responseTime}ms)`);
  console.log(`🐌 Slowest route: ${baseline.summary.slowestRoute.route} (${baseline.summary.slowestRoute.responseTime}ms)`);

  if (recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    recommendations.forEach((rec, index) => {
      const icon = rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '🟡' : 'ℹ️';
      console.log(`   ${icon} ${rec.message}`);
    });
  } else {
    console.log('\n✅ No immediate performance concerns detected');
  }
}

/**
 * Save baseline data for future comparisons
 */
function saveBaseline() {
  const baselinePath = join(projectRoot, 'baseline-metrics.json');

  // Save current baseline
  writeFileSync(baselinePath, JSON.stringify(baseline, null, 2));

  // Also save with timestamp for historical tracking
  const timestampPath = join(projectRoot, `baseline-${Date.now()}.json`);
  writeFileSync(timestampPath, JSON.stringify(baseline, null, 2));

  console.log('\n💾 Baseline saved:');
  console.log(`   Primary: baseline-metrics.json`);
  console.log(`   Archive: ${timestampPath.split('/').pop()}`);
}

/**
 * Compare with previous baseline if exists
 */
function compareWithPrevious() {
  const previousPath = join(projectRoot, 'baseline-metrics.json');

  if (!existsSync(previousPath)) {
    console.log('\n📝 No previous baseline found - this will be the reference');
    return;
  }

  try {
    const previousBaseline = JSON.parse(readFileSync(previousPath, 'utf8'));

    console.log('\n🔄 Comparison with previous baseline:');
    console.log(`   Previous: ${previousBaseline.timestamp}`);
    console.log(`   Current:  ${baseline.timestamp}`);

    if (previousBaseline.summary.averageMetrics.responseTime) {
      const responseTimeDiff = baseline.summary.averageMetrics.responseTime - previousBaseline.summary.averageMetrics.responseTime;
      const icon = responseTimeDiff <= 0 ? '✅' : '⚠️';
      console.log(`   ${icon} Response time: ${responseTimeDiff > 0 ? '+' : ''}${responseTimeDiff}ms`);
    }

    if (baseline.summary.averageMetrics.performanceScore !== null && previousBaseline.summary.averageMetrics.performanceScore !== null) {
      const scoreDiff = baseline.summary.averageMetrics.performanceScore - previousBaseline.summary.averageMetrics.performanceScore;
      const icon = scoreDiff >= 0 ? '✅' : '⚠️';
      console.log(`   ${icon} Performance score: ${scoreDiff > 0 ? '+' : ''}${scoreDiff} points`);
    }

  } catch (error) {
    console.log(`   ⚠️  Could not read previous baseline: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🎯 Target: Medical-grade performance baseline\n');

  // Check server health
  const serverHealthy = await checkServerHealth();
  if (!serverHealthy) {
    console.log('❌ Cannot proceed without healthy server');
    process.exit(1);
  }

  // Collect metrics for all critical routes
  for (const route of CRITICAL_ROUTES) {
    await collectRouteMetrics(route);
    // Brief pause between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Analyze and compare
  analyzeBaseline();
  compareWithPrevious();
  saveBaseline();

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Baseline collection complete');
  console.log('🎯 Use this data to measure the impact of UX improvements');
  console.log('🏥 Medical performance targets:');
  console.log('   • Response time: <500ms');
  console.log('   • Performance score: >90');
  console.log('   • LCP: <2.5s');
  console.log('   • TTFB: <300ms');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Baseline collection interrupted');
  console.log('💾 Saving partial results...');
  saveBaseline();
  process.exit(1);
});

// Run baseline collection
main().catch(error => {
  console.error('💥 Baseline collection failed:', error);
  process.exit(1);
});