#!/usr/bin/env node

import { execSync } from 'child_process'
import { performance } from 'perf_hooks'
import chalk from 'chalk'

console.log(chalk.blue('🧪 RepoMed IA - Suite Completa de Testes'))
console.log(chalk.gray('=' .repeat(50)))

const startTime = performance.now()
let totalTests = 0
let passedTests = 0
let failedTests = 0
const results = {}

// Utility function to run command and capture results
function runCommand(command, description, options = {}) {
  console.log(chalk.yellow(`\n🏃 Executando: ${description}`))
  console.log(chalk.gray(`Comando: ${command}`))
  
  const testStartTime = performance.now()
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: process.cwd(),
      ...options
    })
    
    const duration = ((performance.now() - testStartTime) / 1000).toFixed(2)
    console.log(chalk.green(`✅ ${description} - Concluído em ${duration}s`))
    
    results[description] = {
      status: 'passed',
      duration,
      output: output.trim()
    }
    
    passedTests++
    return { success: true, output }
    
  } catch (error) {
    const duration = ((performance.now() - testStartTime) / 1000).toFixed(2)
    console.log(chalk.red(`❌ ${description} - Falhou em ${duration}s`))
    console.log(chalk.red(`Erro: ${error.message}`))
    
    if (error.stdout) {
      console.log(chalk.gray('STDOUT:'))
      console.log(error.stdout.toString())
    }
    
    if (error.stderr) {
      console.log(chalk.gray('STDERR:'))
      console.log(error.stderr.toString())
    }
    
    results[description] = {
      status: 'failed',
      duration,
      error: error.message,
      stdout: error.stdout?.toString(),
      stderr: error.stderr?.toString()
    }
    
    failedTests++
    return { success: false, error }
  } finally {
    totalTests++
  }
}

// Main test execution
async function runAllTests() {
  console.log(chalk.blue('\n📋 Iniciando execução da suite de testes...'))
  
  // 1. Lint and Format Check
  console.log(chalk.magenta('\n🔍 FASE 1: Qualidade de Código'))
  runCommand('npm run lint', 'Verificação de Lint')
  runCommand('npx prettier --check .', 'Verificação de Formatação')
  
  // 2. Unit Tests - API
  console.log(chalk.magenta('\n🧪 FASE 2: Testes Unitários - Backend'))
  runCommand('cd repomed-api && npm test -- --reporter=verbose', 'Testes Unitários API')
  
  // 3. Unit Tests - Web
  console.log(chalk.magenta('\n🧪 FASE 3: Testes Unitários - Frontend'))
  runCommand('cd repomed-web && npm test -- --reporter=verbose', 'Testes Unitários Web')
  
  // 4. Integration Tests
  console.log(chalk.magenta('\n🔗 FASE 4: Testes de Integração'))
  runCommand('cd repomed-api && npm test -- --run tests/integration/', 'Testes de Integração API')
  
  // 5. Contract Tests
  console.log(chalk.magenta('\n📝 FASE 5: Testes de Contrato'))
  runCommand('npm run test:contracts', 'Testes de Contratos Zod')
  
  // 6. Build Tests
  console.log(chalk.magenta('\n🏗️  FASE 6: Testes de Build'))
  runCommand('npm run build', 'Build Completo')
  
  // 7. Load Tests (if API is running)
  console.log(chalk.magenta('\n⚡ FASE 7: Testes de Carga'))
  
  // Check if API is running
  try {
    const healthCheck = await fetch('http://localhost:8082/health')
    if (healthCheck.ok) {
      runCommand('npm run test:load', 'Testes de Carga')
    } else {
      console.log(chalk.yellow('⚠️  API não está rodando, pulando testes de carga'))
      results['Testes de Carga'] = { status: 'skipped', reason: 'API não disponível' }
      totalTests++
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  API não está rodando, pulando testes de carga'))
    results['Testes de Carga'] = { status: 'skipped', reason: 'API não disponível' }
    totalTests++
  }
  
  // 8. E2E Tests (if services are running)
  console.log(chalk.magenta('\n🎭 FASE 8: Testes End-to-End'))
  
  try {
    const webCheck = await fetch('http://localhost:3002')
    const apiCheck = await fetch('http://localhost:8082/health')
    
    if (webCheck.ok && apiCheck.ok) {
      runCommand('npm run test:e2e', 'Testes End-to-End')
    } else {
      console.log(chalk.yellow('⚠️  Serviços não estão rodando, pulando testes E2E'))
      results['Testes End-to-End'] = { status: 'skipped', reason: 'Serviços não disponíveis' }
      totalTests++
    }
  } catch (error) {
    console.log(chalk.yellow('⚠️  Serviços não estão rodando, pulando testes E2E'))
    results['Testes End-to-End'] = { status: 'skipped', reason: 'Serviços não disponíveis' }
    totalTests++
  }
  
  // Generate comprehensive report
  generateReport()
}

function generateReport() {
  const totalDuration = ((performance.now() - startTime) / 1000).toFixed(2)
  
  console.log(chalk.blue('\n' + '=' .repeat(60)))
  console.log(chalk.blue('📊 RELATÓRIO FINAL DA SUITE DE TESTES'))
  console.log(chalk.blue('=' .repeat(60)))
  
  // Summary statistics
  console.log(chalk.white('\n📈 RESUMO:'))
  console.log(`   Total de testes: ${totalTests}`)
  console.log(chalk.green(`   ✅ Aprovados: ${passedTests}`))
  console.log(chalk.red(`   ❌ Reprovados: ${failedTests}`))
  
  const skippedTests = Object.values(results).filter(r => r.status === 'skipped').length
  if (skippedTests > 0) {
    console.log(chalk.yellow(`   ⏭️  Pulados: ${skippedTests}`))
  }
  
  console.log(`   ⏱️  Tempo total: ${totalDuration}s`)
  console.log(`   📊 Taxa de sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`)
  
  // Detailed results
  console.log(chalk.white('\n📋 RESULTADOS DETALHADOS:'))
  
  Object.entries(results).forEach(([testName, result]) => {
    const statusIcon = {
      'passed': '✅',
      'failed': '❌',
      'skipped': '⏭️'
    }[result.status]
    
    const statusColor = {
      'passed': chalk.green,
      'failed': chalk.red,
      'skipped': chalk.yellow
    }[result.status]
    
    console.log(`   ${statusIcon} ${statusColor(testName)} ${result.duration ? `(${result.duration}s)` : ''}`)
    
    if (result.reason) {
      console.log(chalk.gray(`      Motivo: ${result.reason}`))
    }
    
    if (result.error) {
      console.log(chalk.red(`      Erro: ${result.error.substring(0, 100)}...`))
    }
  })
  
  // Performance insights
  const durations = Object.values(results)
    .filter(r => r.duration)
    .map(r => parseFloat(r.duration))
    .sort((a, b) => b - a)
  
  if (durations.length > 0) {
    console.log(chalk.white('\n⚡ PERFORMANCE:'))
    console.log(`   Teste mais lento: ${durations[0]}s`)
    console.log(`   Teste mais rápido: ${durations[durations.length - 1]}s`)
    console.log(`   Tempo médio: ${(durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2)}s`)
  }
  
  // Quality gates
  console.log(chalk.white('\n🎯 CRITÉRIOS DE QUALIDADE:'))
  
  const qualityCriteria = [
    { name: 'Taxa de sucesso > 80%', passed: (passedTests / totalTests) > 0.8 },
    { name: 'Zero falhas críticas', passed: failedTests === 0 },
    { name: 'Tempo total < 10min', passed: parseFloat(totalDuration) < 600 },
    { name: 'Build bem-sucedido', passed: results['Build Completo']?.status === 'passed' }
  ]
  
  let criteriaMet = 0
  qualityCriteria.forEach(criteria => {
    const icon = criteria.passed ? '✅' : '❌'
    const color = criteria.passed ? chalk.green : chalk.red
    console.log(`   ${icon} ${color(criteria.name)}`)
    if (criteria.passed) criteriaMet++
  })
  
  // Final verdict
  const overallSuccess = criteriaMet === qualityCriteria.length && failedTests === 0
  
  console.log(chalk.blue('\n' + '=' .repeat(60)))
  console.log(`🏆 RESULTADO GERAL: ${overallSuccess ? chalk.green('✅ APROVADO') : chalk.red('❌ REPROVADO')}`)
  console.log(chalk.gray(`   Critérios atendidos: ${criteriaMet}/${qualityCriteria.length}`))
  console.log(chalk.blue('=' .repeat(60)))
  
  // Save report to file
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      skipped: skippedTests,
      duration: totalDuration,
      successRate: (passedTests / totalTests) * 100
    },
    results,
    qualityCriteria: qualityCriteria.map(c => ({ ...c, status: c.passed ? 'met' : 'unmet' })),
    overallSuccess
  }
  
  try {
    const fs = await import('fs')
    fs.writeFileSync('./test-results/test-report.json', JSON.stringify(reportData, null, 2))
    console.log(chalk.gray('\n📄 Relatório salvo em: ./test-results/test-report.json'))
  } catch (error) {
    console.log(chalk.yellow('\n⚠️  Não foi possível salvar o relatório em arquivo'))
  }
  
  // Exit with appropriate code
  process.exit(overallSuccess ? 0 : 1)
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.log(chalk.red('\n💥 Erro não capturado:'))
  console.error(error)
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.log(chalk.red('\n💥 Promise rejeitada:'))
  console.error(reason)
  process.exit(1)
})

// Execute tests
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(error => {
    console.error(chalk.red('Erro fatal na execução dos testes:'), error)
    process.exit(1)
  })
}