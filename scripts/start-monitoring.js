#!/usr/bin/env node

import { execSync } from 'child_process'
import { existsSync } from 'fs'
import chalk from 'chalk'

console.log(chalk.blue('🚀 RepoMed IA - Inicializando Stack de Monitoramento'))
console.log(chalk.gray('=' .repeat(60)))

// Verificar se o Docker está rodando
try {
  execSync('docker --version', { stdio: 'ignore' })
  console.log(chalk.green('✅ Docker detectado'))
} catch (error) {
  console.log(chalk.red('❌ Docker não está instalado ou não está rodando'))
  console.log(chalk.yellow('💡 Instale o Docker Desktop e tente novamente'))
  process.exit(1)
}

// Verificar se os arquivos de configuração existem
const requiredFiles = [
  './monitoring/prometheus.yml',
  './monitoring/alert_rules.yml',
  './monitoring/grafana/provisioning/datasources/prometheus.yml',
  './monitoring/grafana/provisioning/dashboards/dashboard.yml'
]

let missingFiles = false
requiredFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(chalk.green(`✅ ${file}`))
  } else {
    console.log(chalk.red(`❌ ${file} - arquivo não encontrado`))
    missingFiles = true
  }
})

if (missingFiles) {
  console.log(chalk.red('\n❌ Arquivos de configuração em falta'))
  console.log(chalk.yellow('💡 Execute primeiro: npm run setup:local'))
  process.exit(1)
}

console.log(chalk.blue('\n🐳 Iniciando serviços de monitoramento...'))

try {
  // Parar serviços existentes (se houver)
  console.log(chalk.yellow('🛑 Parando serviços existentes...'))
  execSync('docker compose --profile monitoring down', { stdio: 'inherit' })

  // Criar diretórios necessários
  console.log(chalk.yellow('📁 Criando volumes e diretórios...'))
  execSync('docker volume create repomed-prometheus-data', { stdio: 'ignore' })
  execSync('docker volume create repomed-grafana-data', { stdio: 'ignore' })

  // Iniciar todos os serviços de monitoramento
  console.log(chalk.yellow('🚀 Iniciando stack completa de monitoramento...'))
  execSync('docker compose --profile monitoring up -d', { stdio: 'inherit' })

  // Aguardar serviços ficarem prontos
  console.log(chalk.yellow('⏳ Aguardando serviços ficarem prontos...'))
  
  const checkService = (url, name) => {
    const maxRetries = 30
    let retries = 0
    
    while (retries < maxRetries) {
      try {
        execSync(`curl -f ${url}`, { stdio: 'ignore' })
        console.log(chalk.green(`✅ ${name} está pronto`))
        return true
      } catch (error) {
        retries++
        if (retries < maxRetries) {
          process.stdout.write('.')
          execSync('sleep 2', { stdio: 'ignore' })
        }
      }
    }
    
    console.log(chalk.yellow(`⚠️  ${name} pode não estar completamente pronto`))
    return false
  }

  // Verificar se os serviços estão respondendo
  checkService('http://localhost:9090/-/healthy', 'Prometheus')
  checkService('http://localhost:3001/api/health', 'Grafana')
  checkService('http://localhost:9100/metrics', 'Node Exporter')

  console.log(chalk.green('\n🎉 Stack de monitoramento iniciada com sucesso!'))
  console.log(chalk.blue('\n📊 Serviços disponíveis:'))
  console.log(chalk.white(`  • Prometheus:     http://localhost:9090`))
  console.log(chalk.white(`  • Grafana:        http://localhost:3001`))
  console.log(chalk.white(`    - Usuário:      admin`))
  console.log(chalk.white(`    - Senha:        admin123`))
  console.log(chalk.white(`  • Node Exporter:  http://localhost:9100`))
  console.log(chalk.white(`  • Postgres Exp:   http://localhost:9187`))
  console.log(chalk.white(`  • Redis Exporter: http://localhost:9121`))
  console.log(chalk.white(`  • cAdvisor:       http://localhost:8080`))

  console.log(chalk.blue('\n🔧 Próximos passos:'))
  console.log(chalk.white(`  1. Inicie a API: npm run dev:api`))
  console.log(chalk.white(`  2. Acesse o Grafana em http://localhost:3001`))
  console.log(chalk.white(`  3. Os dashboards já estão pré-configurados`))
  console.log(chalk.white(`  4. Para parar: npm run monitoring:stop`))

  console.log(chalk.yellow('\n💡 Dica: Execute alguns requests na API para ver métricas'))

} catch (error) {
  console.log(chalk.red('\n❌ Erro ao iniciar stack de monitoramento:'))
  console.log(chalk.red(error.message))
  
  console.log(chalk.yellow('\n🔧 Tentando diagnóstico...'))
  
  try {
    console.log(chalk.gray('\nStatus dos containers:'))
    execSync('docker compose --profile monitoring ps', { stdio: 'inherit' })
  } catch (diagError) {
    console.log(chalk.red('Não foi possível obter status dos containers'))
  }
  
  console.log(chalk.yellow('\n💡 Soluções possíveis:'))
  console.log(chalk.white('  • Verificar se há conflitos de porta'))
  console.log(chalk.white('  • Verificar logs: docker compose --profile monitoring logs'))
  console.log(chalk.white('  • Reiniciar Docker Desktop'))
  console.log(chalk.white('  • Verificar espaço em disco'))
  
  process.exit(1)
}

// Script para parar os serviços
if (process.argv.includes('--stop')) {
  console.log(chalk.yellow('\n🛑 Parando serviços de monitoramento...'))
  try {
    execSync('docker compose --profile monitoring down', { stdio: 'inherit' })
    console.log(chalk.green('✅ Serviços de monitoramento parados'))
  } catch (error) {
    console.log(chalk.red('❌ Erro ao parar serviços:', error.message))
    process.exit(1)
  }
}