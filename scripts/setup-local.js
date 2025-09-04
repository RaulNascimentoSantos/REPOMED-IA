#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 🎨 Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔧${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.magenta}🚀 ${msg}${colors.reset}\n`)
};

// 📋 Requisitos do sistema
const requirements = [
  { name: 'Node.js', command: 'node --version', min: '18.0.0' },
  { name: 'npm', command: 'npm --version', min: '9.0.0' },
  { name: 'Docker', command: 'docker --version', min: '20.0.0' },
  { name: 'Docker Compose', command: 'docker compose version', min: '2.0.0' }
];

// 🔍 Verificar se comando existe
async function checkCommand(command) {
  try {
    await execAsync(command);
    return true;
  } catch (error) {
    return false;
  }
}

// 📊 Verificar versão
function compareVersions(current, minimum) {
  const currentParts = current.replace(/[^\d.]/g, '').split('.').map(Number);
  const minimumParts = minimum.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, minimumParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const minimumPart = minimumParts[i] || 0;
    
    if (currentPart < minimumPart) return false;
    if (currentPart > minimumPart) return true;
  }
  
  return true;
}

// ✅ Verificar requisitos do sistema
async function checkSystemRequirements() {
  log.header('Verificando Requisitos do Sistema');
  
  let allOk = true;
  
  for (const req of requirements) {
    try {
      const { stdout } = await execAsync(req.command);
      const version = stdout.trim();
      
      if (req.min && !compareVersions(version, req.min)) {
        log.error(`${req.name}: ${version} (mínimo: ${req.min})`);
        allOk = false;
      } else {
        log.success(`${req.name}: ${version}`);
      }
    } catch (error) {
      log.error(`${req.name}: Não encontrado`);
      allOk = false;
    }
  }
  
  if (!allOk) {
    log.error('Alguns requisitos não foram atendidos. Por favor, instale as dependências em falta.');
    process.exit(1);
  }
  
  return true;
}

// 📁 Verificar estrutura de diretórios
function checkDirectoryStructure() {
  log.header('Verificando Estrutura de Diretórios');
  
  const requiredDirs = [
    'repomed-api',
    'repomed-web',
    'scripts'
  ];
  
  const optionalDirs = [
    'packages',
    'packages/contracts',
    'tests',
    'tests/e2e',
    'tests/load',
    'tests/contracts'
  ];
  
  let allOk = true;
  
  // Verificar diretórios obrigatórios
  for (const dir of requiredDirs) {
    const dirPath = join(rootDir, dir);
    if (existsSync(dirPath)) {
      log.success(`Diretório encontrado: ${dir}`);
    } else {
      log.error(`Diretório obrigatório não encontrado: ${dir}`);
      allOk = false;
    }
  }
  
  // Verificar diretórios opcionais
  for (const dir of optionalDirs) {
    const dirPath = join(rootDir, dir);
    if (existsSync(dirPath)) {
      log.success(`Diretório encontrado: ${dir}`);
    } else {
      log.warning(`Diretório opcional não encontrado: ${dir} (será criado se necessário)`);
    }
  }
  
  return allOk;
}

// 🔧 Configurar arquivo .env
function setupEnvironmentFiles() {
  log.header('Configurando Arquivos de Ambiente');
  
  const envExample = join(rootDir, '.env.example');
  const envFile = join(rootDir, '.env');
  
  if (!existsSync(envExample)) {
    log.error('.env.example não encontrado');
    return false;
  }
  
  if (!existsSync(envFile)) {
    log.step('Copiando .env.example para .env');
    const envContent = readFileSync(envExample, 'utf8');
    writeFileSync(envFile, envContent);
    log.success('.env criado com base no .env.example');
  } else {
    log.info('.env já existe');
  }
  
  // Verificar arquivos .env dos submódulos
  const submodules = ['repomed-api', 'repomed-web'];
  
  for (const submodule of submodules) {
    const subEnvExample = join(rootDir, submodule, '.env.example');
    const subEnvFile = join(rootDir, submodule, '.env');
    
    if (existsSync(subEnvExample) && !existsSync(subEnvFile)) {
      log.step(`Copiando .env.example para .env em ${submodule}`);
      const envContent = readFileSync(subEnvExample, 'utf8');
      writeFileSync(subEnvFile, envContent);
      log.success(`${submodule}/.env criado`);
    }
  }
  
  return true;
}

// 📦 Instalar dependências
async function installDependencies() {
  log.header('Instalando Dependências');
  
  try {
    log.step('Instalando dependências raiz...');
    await execAsync('npm install', { cwd: rootDir });
    log.success('Dependências raiz instaladas');
    
    log.step('Instalando dependências do backend...');
    await execAsync('npm install', { cwd: join(rootDir, 'repomed-api') });
    log.success('Dependências do backend instaladas');
    
    log.step('Instalando dependências do frontend...');
    await execAsync('npm install', { cwd: join(rootDir, 'repomed-web') });
    log.success('Dependências do frontend instaladas');
    
    return true;
  } catch (error) {
    log.error(`Erro ao instalar dependências: ${error.message}`);
    return false;
  }
}

// 🐳 Verificar Docker
async function checkDockerServices() {
  log.header('Verificando Serviços Docker');
  
  try {
    log.step('Verificando se Docker está rodando...');
    await execAsync('docker info');
    log.success('Docker está rodando');
    
    const dockerComposePath = join(rootDir, 'docker-compose.yml');
    if (existsSync(dockerComposePath)) {
      log.step('Verificando configuração do Docker Compose...');
      await execAsync('docker compose config', { cwd: rootDir });
      log.success('Docker Compose configurado corretamente');
    } else {
      log.warning('docker-compose.yml não encontrado');
    }
    
    return true;
  } catch (error) {
    log.error(`Problema com Docker: ${error.message}`);
    return false;
  }
}

// 🎯 Verificar saúde do sistema
async function healthCheck() {
  log.header('Verificação de Saúde do Sistema');
  
  try {
    // Verificar se as portas estão disponíveis
    const ports = [3000, 8080, 5432, 6379, 9000];
    
    for (const port of ports) {
      try {
        await execAsync(`netstat -an | grep ${port}`, { stdio: 'pipe' });
        log.warning(`Porta ${port} pode estar em uso`);
      } catch {
        log.success(`Porta ${port} disponível`);
      }
    }
    
    return true;
  } catch (error) {
    log.warning(`Erro na verificação de saúde: ${error.message}`);
    return false;
  }
}

// 📋 Resumo final
function printSummary() {
  log.header('Resumo da Configuração');
  
  console.log(`${colors.bright}Comandos disponíveis:${colors.reset}`);
  console.log(`  ${colors.green}npm run dev${colors.reset}           - Iniciar desenvolvimento (frontend + backend)`);
  console.log(`  ${colors.green}npm run docker:up${colors.reset}     - Subir serviços Docker (PostgreSQL, Redis, MinIO)`);
  console.log(`  ${colors.green}npm run db:reseed${colors.reset}     - Resetar e popular banco de dados`);
  console.log(`  ${colors.green}npm run test${colors.reset}          - Executar todos os testes`);
  console.log(`  ${colors.green}npm run lint${colors.reset}          - Verificar código`);
  console.log();
  console.log(`${colors.bright}URLs de desenvolvimento:${colors.reset}`);
  console.log(`  Frontend: ${colors.cyan}http://localhost:3000${colors.reset}`);
  console.log(`  Backend:  ${colors.cyan}http://localhost:8080${colors.reset}`);
  console.log(`  MinIO:    ${colors.cyan}http://localhost:9001${colors.reset} (admin:minioadmin/minioadmin123)`);
  console.log();
  console.log(`${colors.bright}Próximos passos:${colors.reset}`);
  console.log(`  1. ${colors.yellow}npm run docker:up${colors.reset}   - Subir serviços de infraestrutura`);
  console.log(`  2. ${colors.yellow}npm run db:reseed${colors.reset}   - Configurar banco de dados`);
  console.log(`  3. ${colors.yellow}npm run dev${colors.reset}         - Iniciar desenvolvimento`);
  console.log();
}

// 🚀 Função principal
async function main() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log(`
██████╗ ███████╗██████╗  ██████╗ ███╗   ███╗███████╗██████╗     ██╗ █████╗ 
██╔══██╗██╔════╝██╔══██╗██╔═══██╗████╗ ████║██╔════╝██╔══██╗    ██║██╔══██╗
██████╔╝█████╗  ██████╔╝██║   ██║██╔████╔██║█████╗  ██║  ██║    ██║███████║
██╔══██╗██╔══╝  ██╔═══╝ ██║   ██║██║╚██╔╝██║██╔══╝  ██║  ██║    ██║██╔══██║
██║  ██║███████╗██║     ╚██████╔╝██║ ╚═╝ ██║███████╗██████╔╝    ██║██║  ██║
╚═╝  ╚═╝╚══════╝╚═╝      ╚═════╝ ╚═╝     ╚═╝╚══════╝╚═════╝     ╚═╝╚═╝  ╚═╝
  `);
  console.log(`${colors.reset}`);
  console.log(`${colors.bright}🏥 Sistema Médico Completo - Configuração Local${colors.reset}\n`);
  
  const steps = [
    { name: 'Requisitos do Sistema', fn: checkSystemRequirements },
    { name: 'Estrutura de Diretórios', fn: checkDirectoryStructure },
    { name: 'Arquivos de Ambiente', fn: setupEnvironmentFiles },
    { name: 'Dependências', fn: installDependencies },
    { name: 'Serviços Docker', fn: checkDockerServices },
    { name: 'Verificação de Saúde', fn: healthCheck }
  ];
  
  let success = true;
  
  for (const step of steps) {
    try {
      const result = await step.fn();
      if (!result) {
        success = false;
        log.error(`Falha na etapa: ${step.name}`);
        break;
      }
    } catch (error) {
      success = false;
      log.error(`Erro na etapa ${step.name}: ${error.message}`);
      break;
    }
  }
  
  if (success) {
    log.success('✨ Configuração local concluída com sucesso!');
    printSummary();
  } else {
    log.error('❌ Falha na configuração local. Verifique os erros acima.');
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    log.error(`Erro inesperado: ${error.message}`);
    process.exit(1);
  });
}

export { main as setupLocal };