#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 RepoMed IA - Stack Guardrails Validator');
console.log('==========================================\n');

let hasErrors = false;

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${description}`);
    return true;
  } else {
    console.log(`❌ ${description} - File not found: ${filePath}`);
    hasErrors = true;
    return false;
  }
}

function checkDependency(packageName, expectedVersion) {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const version = packageJson.dependencies?.[packageName] || packageJson.devDependencies?.[packageName];

    if (version) {
      const cleanVersion = version.replace(/[\^~]/, '');
      const majorVersion = cleanVersion.split('.')[0];
      const expectedMajor = expectedVersion.split('.')[0];

      if (majorVersion === expectedMajor) {
        console.log(`✅ ${packageName}: ${version}`);
        return true;
      } else {
        console.log(`❌ ${packageName}: Expected v${expectedVersion}, found ${version}`);
        hasErrors = true;
        return false;
      }
    } else {
      console.log(`❌ ${packageName}: Not found in dependencies`);
      hasErrors = true;
      return false;
    }
  } catch (error) {
    console.log(`❌ Error checking ${packageName}: ${error.message}`);
    hasErrors = true;
    return false;
  }
}

function checkPattern(directory, pattern, description) {
  try {
    const result = execSync(`find ${directory} -name "*.tsx" -o -name "*.ts" | xargs grep -l "${pattern}" || true`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });

    if (result.trim()) {
      console.log(`✅ ${description}`);
      return true;
    } else {
      console.log(`⚠️  ${description} - Pattern not found`);
      return false;
    }
  } catch (error) {
    console.log(`⚠️  ${description} - Error checking: ${error.message}`);
    return false;
  }
}

// 1. Stack Dependencies Validation
console.log('📦 Validating Stack Dependencies:');
checkDependency('next', '14');
checkDependency('react', '18');
checkDependency('typescript', '5');
checkDependency('@tanstack/react-query', '5');
checkDependency('tailwindcss', '3');
console.log('');

// 2. Medical UX Components Validation
console.log('🏥 Validating Medical UX Components:');
checkFile('src/components/ui/StatusBadge.tsx', 'StatusBadge component');
checkFile('src/components/ui/ConfirmDialog.tsx', 'ConfirmDialog component');
checkFile('src/hooks/useAutoSave.ts', 'useAutoSave hook');
checkFile('src/lib/feature-flags.ts', 'Feature flags');
checkFile('src/styles/themes.css', 'Medical themes');
console.log('');

// 3. Critical Routes Validation
console.log('🛣️  Validating Critical Routes:');
checkFile('src/app/prescricoes/page.tsx', 'Prescriptions list page');
checkFile('src/app/prescricoes/nova/page.tsx', 'New prescription page');
checkFile('src/app/pacientes/page.tsx', 'Patients page');
checkFile('src/middleware.ts', 'Middleware configuration');
console.log('');

// 4. Accessibility Patterns
console.log('♿ Checking Accessibility Patterns:');
if (process.platform !== 'win32') {
  checkPattern('src/components/ui', 'aria-label', 'ARIA labels in UI components');
  checkPattern('src/components/ui', 'tabIndex', 'Keyboard navigation support');
  checkPattern('src/components/ui', 'role=', 'ARIA roles');
} else {
  console.log('⚠️  Accessibility pattern checks skipped on Windows');
}
console.log('');

// 5. Medical Safety Patterns
console.log('🔒 Checking Medical Safety Patterns:');
if (fs.existsSync('src/lib/feature-flags.ts')) {
  const featureFlags = fs.readFileSync('src/lib/feature-flags.ts', 'utf8');
  if (featureFlags.includes('FF_SAFETY_GUARDS')) {
    console.log('✅ Safety guards feature flag present');
  } else {
    console.log('❌ Safety guards feature flag missing');
    hasErrors = true;
  }
} else {
  console.log('❌ Feature flags file missing');
  hasErrors = true;
}

if (fs.existsSync('src/hooks/useAutoSave.ts')) {
  const autoSave = fs.readFileSync('src/hooks/useAutoSave.ts', 'utf8');
  if (autoSave.includes('usePrescriptionAutoSave')) {
    console.log('✅ Medical auto-save functionality present');
  } else {
    console.log('⚠️  Medical auto-save could be enhanced');
  }
}
console.log('');

// 6. TypeScript Configuration
console.log('🔧 Checking TypeScript Configuration:');
if (fs.existsSync('tsconfig.json')) {
  const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
  if (tsConfig.compilerOptions?.strict) {
    console.log('✅ TypeScript strict mode enabled');
  } else {
    console.log('⚠️  TypeScript strict mode recommended for medical apps');
  }
} else {
  console.log('❌ tsconfig.json not found');
  hasErrors = true;
}
console.log('');

// 7. Summary
console.log('📊 Summary:');
if (hasErrors) {
  console.log('❌ Validation failed - Please fix the errors above');
  process.exit(1);
} else {
  console.log('✅ All stack guardrails passed');
  console.log('🏥 RepoMed IA is ready for medical use');
  process.exit(0);
}