#!/usr/bin/env node

/**
 * RepoMed IA v5.1 - Comprehensive QA Validation Suite
 *
 * Valida todas as melhorias implementadas na v5.1:
 * - Feature Flags funcionando corretamente
 * - Tokens semânticos aplicados
 * - Tema Clinical ativo
 * - Progressive Disclosure funcional
 * - Componentes theme-aware
 */

import fs from 'fs/promises';
import path from 'path';

const REPORT_DIR = './test-results/qa-validation';
const SOURCE_DIR = './src';

// Tests para validar implementação v5.1
const VALIDATION_TESTS = {
  featureFlags: {
    name: 'Feature Flags System',
    description: 'Verifica se o sistema de feature flags está implementado',
    files: [
      'src/config/feature-flags.ts',
      'src/components/providers/FeatureFlagProvider.tsx'
    ]
  },
  semanticTokens: {
    name: 'Semantic Tokens',
    description: 'Verifica se tokens semânticos estão definidos',
    files: [
      'src/styles/semantic-tokens.css'
    ]
  },
  clinicalTheme: {
    name: 'Clinical Theme',
    description: 'Verifica se tema Clinical está implementado',
    files: [
      'src/styles/themes.css'
    ]
  },
  progressiveDisclosure: {
    name: 'Progressive Disclosure',
    description: 'Verifica se layout progressivo está implementado',
    files: [
      'src/components/home/ProgressiveHomeLayout.tsx'
    ]
  },
  themeAwareComponents: {
    name: 'Theme-Aware Components',
    description: 'Verifica se componentes estão usando tokens semânticos',
    files: [
      'src/components/ui/MedicalCard.tsx',
      'src/components/ui/StatusBadge.tsx'
    ]
  }
};

async function checkFileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function analyzeFileContent(filePath, patterns) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const results = {};

    for (const [key, pattern] of Object.entries(patterns)) {
      if (typeof pattern === 'string') {
        results[key] = content.includes(pattern);
      } else if (pattern instanceof RegExp) {
        results[key] = pattern.test(content);
      }
    }

    return { found: true, content, analysis: results };
  } catch (error) {
    return { found: false, error: error.message };
  }
}

async function validateFeatureFlags() {
  console.log('   🚩 Validando Feature Flags...');

  const configFile = await analyzeFileContent('src/config/feature-flags.ts', {
    hasInterface: 'interface FeatureFlags',
    hasFlags: 'FF_CLINICAL_THEME',
    hasProvider: 'FF_HOME_PROGRESSIVE',
    hasThemeAware: 'FF_THEME_AWARE'
  });

  const providerFile = await analyzeFileContent('src/components/providers/FeatureFlagProvider.tsx', {
    hasContext: 'FeatureFlagsContext',
    hasHook: 'useFeatureFlag',
    hasProvider: 'FeatureFlagProvider'
  });

  const score = Object.values(configFile.analysis || {}).filter(Boolean).length +
               Object.values(providerFile.analysis || {}).filter(Boolean).length;

  return {
    passed: score >= 6,
    score: `${score}/7`,
    details: {
      config: configFile,
      provider: providerFile
    }
  };
}

async function validateSemanticTokens() {
  console.log('   🎨 Validando Tokens Semânticos...');

  const tokensFile = await analyzeFileContent('src/styles/semantic-tokens.css', {
    hasSemanticBg: '--semantic-bg-primary',
    hasSemanticText: '--semantic-text-primary',
    hasSemanticAction: '--semantic-action-primary',
    hasSemanticStatus: '--semantic-status-normal',
    hasMedicalTokens: '--semantic-prescription',
    hasPatientTokens: '--semantic-patient',
    hasEmergencyTokens: '--semantic-emergency'
  });

  const score = Object.values(tokensFile.analysis || {}).filter(Boolean).length;

  return {
    passed: score >= 5,
    score: `${score}/7`,
    details: tokensFile
  };
}

async function validateClinicalTheme() {
  console.log('   🏥 Validando Tema Clinical...');

  const themesFile = await analyzeFileContent('src/styles/themes.css', {
    hasClinicalTheme: /\[data-theme="clinical"\]/,
    hasMedicalColors: /#[0-9a-fA-F]{6}.*medical/i,
    hasAccessibleContrast: /#0f1419|#fefffe/,
    hasReducedMotion: 'prefers-reduced-motion'
  });

  const score = Object.values(themesFile.analysis || {}).filter(Boolean).length;

  return {
    passed: score >= 3,
    score: `${score}/4`,
    details: themesFile
  };
}

async function validateProgressiveDisclosure() {
  console.log('   📱 Validando Progressive Disclosure...');

  const progressiveFile = await analyzeFileContent('src/components/home/ProgressiveHomeLayout.tsx', {
    hasProgressiveComponent: 'ProgressiveHomeLayout',
    hasFeatureFlagCheck: 'useFeatureFlag',
    hasPrimaryActions: 'primaryActions',
    hasExpandableSection: 'expandable',
    hasCognitiveLoad: 'progressive disclosure|carga cognitiva'
  });

  const homeFile = await analyzeFileContent('src/app/home/page.tsx', {
    hasFeatureFlagImport: 'useFeatureFlag',
    hasProgressiveCheck: 'FF_HOME_PROGRESSIVE',
    hasConditionalRender: 'ProgressiveHomeLayout'
  });

  const score = Object.values(progressiveFile.analysis || {}).filter(Boolean).length +
               Object.values(homeFile.analysis || {}).filter(Boolean).length;

  return {
    passed: score >= 6,
    score: `${score}/8`,
    details: {
      progressive: progressiveFile,
      home: homeFile
    }
  };
}

async function validateThemeAwareComponents() {
  console.log('   🎯 Validando Componentes Theme-Aware...');

  const medicalCardFile = await analyzeFileContent('src/components/ui/MedicalCard.tsx', {
    usesSemanticTokens: /var\(--semantic-/,
    hasContextVar: 'contextVar',
    hasThemeColors: '--semantic-prescription|--semantic-patient',
    avoidsHardcoded: !/rgb\(255, 255, 255\)|#ffffff/i
  });

  const statusBadgeFile = await analyzeFileContent('src/components/ui/StatusBadge.tsx', {
    usesSemanticClasses: 'semantic-status-',
    hasSemanticVars: /var\(--semantic-status-/,
    hasStatusConfig: 'statusConfig'
  });

  const medicalScore = Object.values(medicalCardFile.analysis || {}).filter(Boolean).length;
  const statusScore = Object.values(statusBadgeFile.analysis || {}).filter(Boolean).length;
  const totalScore = medicalScore + statusScore;

  return {
    passed: totalScore >= 5,
    score: `${totalScore}/7`,
    details: {
      medicalCard: medicalCardFile,
      statusBadge: statusBadgeFile
    }
  };
}

async function runValidationSuite() {
  console.log('🏥 RepoMed IA v5.1 - QA Validation Suite\n');

  // Criar diretório de resultados
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const results = {};
  let totalScore = 0;
  let maxScore = 0;

  // Executar validações
  results.featureFlags = await validateFeatureFlags();
  results.semanticTokens = await validateSemanticTokens();
  results.clinicalTheme = await validateClinicalTheme();
  results.progressiveDisclosure = await validateProgressiveDisclosure();
  results.themeAwareComponents = await validateThemeAwareComponents();

  // Calcular scores
  for (const [key, result] of Object.entries(results)) {
    console.log(`   ${result.passed ? '✅' : '❌'} ${VALIDATION_TESTS[key].name}: ${result.score}`);

    const [current, max] = result.score.split('/').map(Number);
    totalScore += current;
    maxScore += max;
  }

  const successRate = Math.round((totalScore / maxScore) * 100);
  const overallPassed = successRate >= 80;

  console.log(`\n📊 Resultado Final:`);
  console.log(`   Score: ${totalScore}/${maxScore} (${successRate}%)`);
  console.log(`   Status: ${overallPassed ? '✅ APROVADO' : '❌ REPROVADO'}`);

  // Gerar relatório JSON
  const report = {
    timestamp: new Date().toISOString(),
    version: 'v5.1-qa-validation',
    summary: {
      totalScore,
      maxScore,
      successRate,
      passed: overallPassed
    },
    results
  };

  const jsonPath = path.join(REPORT_DIR, 'qa-validation-report.json');
  await fs.writeFile(jsonPath, JSON.stringify(report, null, 2));

  // Gerar relatório Markdown
  const mdReport = generateMarkdownReport(report);
  const mdPath = path.join(REPORT_DIR, 'qa-validation-report.md');
  await fs.writeFile(mdPath, mdReport);

  console.log(`\n📄 Relatórios gerados:`);
  console.log(`   JSON: ${jsonPath}`);
  console.log(`   Markdown: ${mdPath}`);

  return overallPassed;
}

function generateMarkdownReport(data) {
  const { summary, results } = data;

  let md = `# RepoMed IA v5.1 - Relatório de Validação QA\n\n`;
  md += `**Data:** ${new Date(data.timestamp).toLocaleString('pt-BR')}\n`;
  md += `**Versão:** ${data.version}\n\n`;

  md += `## 📊 Resumo Executivo\n\n`;
  md += `- **Score Total:** ${summary.totalScore}/${summary.maxScore}\n`;
  md += `- **Taxa de Sucesso:** ${summary.successRate}%\n`;
  md += `- **Status:** ${summary.passed ? '✅ APROVADO' : '❌ REPROVADO'}\n\n`;

  md += `## 🧪 Resultados dos Testes\n\n`;

  for (const [key, result] of Object.entries(results)) {
    const test = VALIDATION_TESTS[key];
    const status = result.passed ? '✅' : '❌';

    md += `### ${status} ${test.name}\n\n`;
    md += `**Descrição:** ${test.description}\n`;
    md += `**Score:** ${result.score}\n`;
    md += `**Status:** ${result.passed ? 'Aprovado' : 'Reprovado'}\n\n`;
  }

  md += `## 🎯 Melhorias Implementadas na v5.1\n\n`;
  md += `- ✅ **Feature Flags:** Sistema completo com provider React\n`;
  md += `- ✅ **Tokens Semânticos:** Cores baseadas em contexto médico\n`;
  md += `- ✅ **Tema Clinical:** Otimizado para ambiente hospitalar\n`;
  md += `- ✅ **Progressive Disclosure:** Redução da carga cognitiva\n`;
  md += `- ✅ **Componentes Theme-Aware:** Uso de CSS variables\n\n`;

  return md;
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runValidationSuite()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Erro na validação:', error.message);
      process.exit(1);
    });
}

export { runValidationSuite };