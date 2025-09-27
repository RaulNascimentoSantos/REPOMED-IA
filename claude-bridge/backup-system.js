import fs from 'fs/promises';
import fssync from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class FrontendBackupSystem {
  constructor(logger) {
    this.logger = logger;
    this.backupDir = '/outputs/frontend-backups';
    this.checksumCache = new Map();
    this.lockFile = '/tmp/backup-lock';
    this.maxBackups = 10;

    // Arquivos críticos do frontend
    this.criticalFiles = [
      'repomed-web/package.json',
      'repomed-web/package-lock.json',
      'repomed-web/next.config.js',
      'repomed-web/tsconfig.json',
      'repomed-web/tailwind.config.js',
      'repomed-web/src/app',
      'repomed-web/src/components',
      'repomed-web/src/pages',
      'repomed-web/src/lib',
      'repomed-web/src/hooks',
      'repomed-web/src/services',
      'repomed-web/src/styles'
    ];
  }

  async initialize() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      this.logger.info('💾 Sistema de backup inicializado');
    } catch (error) {
      this.logger.error('Erro ao inicializar backup:', error);
    }
  }

  async calculateChecksum(filePath) {
    try {
      const content = await fs.readFile(filePath);
      return crypto.createHash('md5').update(content).digest('hex');
    } catch (error) {
      return null;
    }
  }

  async hasChanged(filePath, baseDir = '/repo') {
    const fullPath = path.join(baseDir, filePath);
    const cacheKey = filePath;

    try {
      const currentChecksum = await this.calculateChecksum(fullPath);
      const cachedChecksum = this.checksumCache.get(cacheKey);

      if (currentChecksum && currentChecksum !== cachedChecksum) {
        this.checksumCache.set(cacheKey, currentChecksum);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  async createBackup(baseDir = '/repo') {
    if (fssync.existsSync(this.lockFile)) {
      this.logger.warn('Backup já em andamento, pulando...');
      return { success: false, reason: 'backup_in_progress' };
    }

    try {
      // Criar lock
      await fs.writeFile(this.lockFile, new Date().toISOString());

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `frontend-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      await fs.mkdir(backupPath, { recursive: true });

      let backedUpFiles = 0;
      const errors = [];

      for (const file of this.criticalFiles) {
        try {
          const sourcePath = path.join(baseDir, file);
          const targetPath = path.join(backupPath, file);

          // Verificar se arquivo/pasta existe
          if (!fssync.existsSync(sourcePath)) {
            continue;
          }

          // Criar diretório de destino
          await fs.mkdir(path.dirname(targetPath), { recursive: true });

          // Verificar se é arquivo ou diretório
          const stat = await fs.stat(sourcePath);

          if (stat.isDirectory()) {
            // Copiar diretório recursivamente
            await this.copyDirectory(sourcePath, targetPath);
            backedUpFiles++;
          } else {
            // Copiar arquivo
            await fs.copyFile(sourcePath, targetPath);
            backedUpFiles++;
          }

        } catch (error) {
          errors.push(`${file}: ${error.message}`);
        }
      }

      // Criar manifesto do backup
      const manifest = {
        timestamp: new Date().toISOString(),
        files: backedUpFiles,
        errors: errors.length,
        errorDetails: errors,
        version: 'v3.0',
        type: 'frontend-critical'
      };

      await fs.writeFile(
        path.join(backupPath, 'manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // Limpar backups antigos
      await this.cleanOldBackups();

      this.logger.info(`✅ Backup criado: ${backupName} (${backedUpFiles} itens)`);

      return {
        success: true,
        backupPath,
        files: backedUpFiles,
        errors: errors.length
      };

    } catch (error) {
      this.logger.error('Erro ao criar backup:', error);
      return { success: false, error: error.message };
    } finally {
      // Remover lock
      try {
        await fs.unlink(this.lockFile);
      } catch (err) {
        // Ignorar erro de remoção de lock
      }
    }
  }

  async copyDirectory(source, target) {
    await fs.mkdir(target, { recursive: true });

    const items = await fs.readdir(source);

    for (const item of items) {
      // Pular node_modules e .next
      if (item === 'node_modules' || item === '.next' || item.startsWith('.')) {
        continue;
      }

      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);

      const stat = await fs.stat(sourcePath);

      if (stat.isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        await fs.copyFile(sourcePath, targetPath);
      }
    }
  }

  async restoreBackup(backupName, baseDir = '/repo') {
    try {
      const backupPath = path.join(this.backupDir, backupName);

      if (!fssync.existsSync(backupPath)) {
        throw new Error(`Backup ${backupName} não encontrado`);
      }

      // Ler manifesto
      const manifestPath = path.join(backupPath, 'manifest.json');
      const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));

      let restoredFiles = 0;
      const errors = [];

      for (const file of this.criticalFiles) {
        try {
          const sourcePath = path.join(backupPath, file);
          const targetPath = path.join(baseDir, file);

          if (!fssync.existsSync(sourcePath)) {
            continue;
          }

          // Criar diretório de destino
          await fs.mkdir(path.dirname(targetPath), { recursive: true });

          const stat = await fs.stat(sourcePath);

          if (stat.isDirectory()) {
            // Remover diretório existente e copiar do backup
            if (fssync.existsSync(targetPath)) {
              await fs.rm(targetPath, { recursive: true, force: true });
            }
            await this.copyDirectory(sourcePath, targetPath);
            restoredFiles++;
          } else {
            await fs.copyFile(sourcePath, targetPath);
            restoredFiles++;
          }

        } catch (error) {
          errors.push(`${file}: ${error.message}`);
        }
      }

      this.logger.info(`🔄 Backup restaurado: ${backupName} (${restoredFiles} itens)`);

      return {
        success: true,
        files: restoredFiles,
        errors: errors.length,
        errorDetails: errors,
        manifest
      };

    } catch (error) {
      this.logger.error('Erro ao restaurar backup:', error);
      return { success: false, error: error.message };
    }
  }

  async listBackups() {
    try {
      const backups = [];
      const items = await fs.readdir(this.backupDir);

      for (const item of items) {
        const backupPath = path.join(this.backupDir, item);
        const manifestPath = path.join(backupPath, 'manifest.json');

        if (fssync.existsSync(manifestPath)) {
          try {
            const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
            const stat = await fs.stat(backupPath);

            backups.push({
              name: item,
              timestamp: manifest.timestamp,
              files: manifest.files,
              errors: manifest.errors,
              size: await this.getDirectorySize(backupPath),
              age: Date.now() - new Date(manifest.timestamp).getTime()
            });
          } catch (err) {
            // Pular backups com manifesto corrompido
          }
        }
      }

      // Ordenar por timestamp (mais recente primeiro)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      return backups;
    } catch (error) {
      this.logger.error('Erro ao listar backups:', error);
      return [];
    }
  }

  async getDirectorySize(dirPath) {
    try {
      const { stdout } = await execAsync(`du -sb "${dirPath}" | cut -f1`);
      return parseInt(stdout.trim());
    } catch (error) {
      return 0;
    }
  }

  async cleanOldBackups() {
    try {
      const backups = await this.listBackups();

      if (backups.length > this.maxBackups) {
        const toDelete = backups.slice(this.maxBackups);

        for (const backup of toDelete) {
          const backupPath = path.join(this.backupDir, backup.name);
          await fs.rm(backupPath, { recursive: true, force: true });
          this.logger.info(`🗑️ Backup antigo removido: ${backup.name}`);
        }
      }
    } catch (error) {
      this.logger.error('Erro ao limpar backups antigos:', error);
    }
  }

  async autoBackupOnChange(baseDir = '/repo') {
    try {
      let hasChanges = false;

      for (const file of this.criticalFiles) {
        if (await this.hasChanged(file, baseDir)) {
          hasChanges = true;
          break;
        }
      }

      if (hasChanges) {
        this.logger.info('📝 Alterações detectadas, criando backup...');
        return await this.createBackup(baseDir);
      }

      return { success: true, reason: 'no_changes' };
    } catch (error) {
      this.logger.error('Erro no backup automático:', error);
      return { success: false, error: error.message };
    }
  }

  async validateFrontend(baseDir = '/repo') {
    const frontendPath = path.join(baseDir, 'repomed-web');
    const issues = [];

    try {
      // Verificar package.json
      const packagePath = path.join(frontendPath, 'package.json');
      if (!fssync.existsSync(packagePath)) {
        issues.push('package.json não encontrado');
      } else {
        try {
          const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));
          if (!pkg.scripts || !pkg.scripts.dev) {
            issues.push('Script dev não configurado em package.json');
          }
        } catch (err) {
          issues.push('package.json inválido');
        }
      }

      // Verificar next.config.js
      const nextConfigPath = path.join(frontendPath, 'next.config.js');
      if (!fssync.existsSync(nextConfigPath)) {
        issues.push('next.config.js não encontrado');
      }

      // Verificar estrutura de diretórios
      const requiredDirs = ['src/app', 'src/components'];
      for (const dir of requiredDirs) {
        const dirPath = path.join(frontendPath, dir);
        if (!fssync.existsSync(dirPath)) {
          issues.push(`Diretório ${dir} não encontrado`);
        }
      }

      // Verificar se pode buildar
      try {
        await execAsync('cd /repo/repomed-web && npm ci && npx next build', { timeout: 120000 });
      } catch (buildError) {
        issues.push(`Build falhou: ${buildError.message.substring(0, 200)}`);
      }

    } catch (error) {
      issues.push(`Erro na validação: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  async emergencyRestore() {
    try {
      this.logger.warn('🚨 Iniciando restauração de emergência...');

      const backups = await this.listBackups();

      if (backups.length === 0) {
        throw new Error('Nenhum backup disponível para restauração');
      }

      // Usar o backup mais recente válido
      const latestBackup = backups[0];
      const result = await this.restoreBackup(latestBackup.name);

      if (result.success) {
        this.logger.info('✅ Restauração de emergência concluída');

        // Tentar reinstalar dependências
        try {
          await execAsync('cd /repo/repomed-web && npm ci', { timeout: 60000 });
          this.logger.info('📦 Dependências reinstaladas');
        } catch (err) {
          this.logger.warn('Erro ao reinstalar dependências:', err.message);
        }
      }

      return result;
    } catch (error) {
      this.logger.error('Erro na restauração de emergência:', error);
      return { success: false, error: error.message };
    }
  }
}

export default FrontendBackupSystem;