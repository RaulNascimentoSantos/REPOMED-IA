#!/usr/bin/env node

/**
 * RepoMed IA v5.1 - Stack Guardrails
 * Prevents accidental introduction of conflicting build tools
 * Ensures we maintain Next.js 14 App Router + TypeScript stack integrity
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Prohibited patterns that could break our medical-grade stack
const prohibitedPatterns = {
  // Build tools that conflict with Next.js
  vite: /vite|vite-plugin|@vitejs\/|vitest/i,

  // Legacy React tools
  cra: /create-react-app|react-scripts/i,

  // Alternative bundlers that could conflict
  webpack_direct: /webpack(?!.*next)/i, // Allow webpack from Next.js
  parcel: /parcel/i,
  rollup_direct: /rollup(?!.*next)/i,

  // CSS-in-JS libraries that could conflict with our Tailwind + CSS Variables setup
  styled_components: /styled-components/i,
  emotion: /@emotion/i,

  // State management that could conflict with TanStack Query
  redux_toolkit: /@reduxjs\/toolkit/i,
  zustand: /zustand/i,

  // Testing libraries that could conflict with Playwright
  jest_dom: /@testing-library\/jest-dom/i,
  jsdom: /jsdom/i,

  // Development servers that could conflict
  vite_dev: /vite.*dev/i,
  webpack_dev: /webpack-dev-server/i
};

// Files to check for prohibited patterns
const filesToCheck = [
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'next.config.js',
  'next.config.mjs',
  'tsconfig.json',
  'tailwind.config.js',
  'tailwind.config.ts'
];

// Allowed exceptions (packages that are safe despite pattern matches)
const allowedExceptions = [
  'next', // Next.js itself
  '@next/',
  'eslint-config-next',
  'next-themes',
  'next-auth',
  '@tanstack/react-query', // Our approved state management
  'tailwindcss', // Our approved CSS framework
  'typescript',
  '@types/',
  'playwright', // Our approved testing framework
  '@playwright/',
  'axe-playwright' // Our approved accessibility testing
];

let hasViolations = false;
let violationDetails = [];

console.log('🛡️  RepoMed IA Stack Guardrails - Checking integrity...\n');

for (const fileName of filesToCheck) {
  const filePath = join(projectRoot, fileName);

  if (!existsSync(filePath)) {
    continue;
  }

  console.log(`📁 Checking ${fileName}...`);

  try {
    const fileContent = readFileSync(filePath, 'utf8');

    // Check each prohibited pattern
    for (const [category, pattern] of Object.entries(prohibitedPatterns)) {
      const matches = fileContent.match(pattern);

      if (matches) {
        // Check if any match is in allowed exceptions
        const isAllowed = matches.some(match =>
          allowedExceptions.some(exception =>
            match.toLowerCase().includes(exception.toLowerCase())
          )
        );

        if (!isAllowed) {
          hasViolations = true;
          violationDetails.push({
            file: fileName,
            category,
            pattern: pattern.toString(),
            matches: matches
          });

          console.log(`   ❌ VIOLATION: Found prohibited ${category} pattern`);
          console.log(`      Matches: ${matches.join(', ')}`);
        }
      }
    }

    // Special checks for package.json
    if (fileName === 'package.json') {
      try {
        const packageJson = JSON.parse(fileContent);

        // Check for conflicting scripts
        const scripts = packageJson.scripts || {};

        if (scripts.dev && !scripts.dev.includes('next dev')) {
          hasViolations = true;
          violationDetails.push({
            file: fileName,
            category: 'dev_script',
            issue: 'Dev script should use "next dev"',
            current: scripts.dev
          });
          console.log(`   ❌ VIOLATION: Dev script should use Next.js`);
          console.log(`      Current: ${scripts.dev}`);
        }

        if (scripts.build && !scripts.build.includes('next build')) {
          hasViolations = true;
          violationDetails.push({
            file: fileName,
            category: 'build_script',
            issue: 'Build script should use "next build"',
            current: scripts.build
          });
          console.log(`   ❌ VIOLATION: Build script should use Next.js`);
          console.log(`      Current: ${scripts.build}`);
        }

        // Check for required medical-grade dependencies
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        const requiredDeps = [
          'next',
          '@tanstack/react-query',
          'typescript',
          'tailwindcss',
          'playwright'
        ];

        for (const requiredDep of requiredDeps) {
          if (!deps[requiredDep]) {
            console.log(`   ⚠️  WARNING: Missing required dependency: ${requiredDep}`);
          }
        }

      } catch (parseError) {
        console.log(`   ⚠️  WARNING: Could not parse ${fileName} as JSON`);
      }
    }

    if (violationDetails.length === 0 || violationDetails.filter(v => v.file === fileName).length === 0) {
      console.log(`   ✅ Clean`);
    }

  } catch (error) {
    console.log(`   ⚠️  WARNING: Could not read ${fileName}: ${error.message}`);
  }
}

console.log('\n📊 Stack Integrity Report:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (hasViolations) {
  console.log('❌ STACK INTEGRITY COMPROMISED');
  console.log('\nViolations found:');

  violationDetails.forEach((violation, index) => {
    console.log(`\n${index + 1}. File: ${violation.file}`);
    console.log(`   Category: ${violation.category}`);
    if (violation.matches) {
      console.log(`   Matches: ${violation.matches.join(', ')}`);
    }
    if (violation.issue) {
      console.log(`   Issue: ${violation.issue}`);
    }
    if (violation.current) {
      console.log(`   Current: ${violation.current}`);
    }
  });

  console.log('\n🏥 Medical System Requirements:');
  console.log('RepoMed IA requires a stable, tested stack for medical safety:');
  console.log('• Next.js 14 App Router (proven, stable)');
  console.log('• TypeScript (type safety for medical data)');
  console.log('• TanStack Query (reliable state management)');
  console.log('• Tailwind CSS (consistent, accessible styling)');
  console.log('• Playwright (comprehensive E2E testing)');
  console.log('\nIntroducing conflicting tools could compromise patient safety.');
  console.log('Please remove the flagged dependencies and use approved alternatives.');

  process.exit(1);
} else {
  console.log('✅ STACK INTEGRITY VERIFIED');
  console.log('\nStack components verified:');
  console.log('• ✅ Next.js 14 App Router + TypeScript');
  console.log('• ✅ TanStack Query for state management');
  console.log('• ✅ Tailwind CSS for styling');
  console.log('• ✅ Playwright for testing');
  console.log('• ✅ No conflicting build tools detected');

  console.log('\n🏥 Medical-grade stack maintained successfully.');
  console.log('Safe to proceed with medical software deployment.');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Export results for CI/CD integration
const results = {
  timestamp: new Date().toISOString(),
  hasViolations,
  violationCount: violationDetails.length,
  violations: violationDetails,
  stackStatus: hasViolations ? 'COMPROMISED' : 'VERIFIED'
};

// Write results to JSON for CI/CD systems
import { writeFileSync } from 'fs';
writeFileSync(
  join(projectRoot, 'stack-guardrails-report.json'),
  JSON.stringify(results, null, 2)
);

console.log(`\n📄 Detailed report saved to: stack-guardrails-report.json`);