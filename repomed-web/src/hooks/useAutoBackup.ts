import { useEffect, useRef, useCallback } from 'react';
import { useNotifications } from '../components/NotificationSystem';

interface BackupConfig {
  enabled?: boolean;
  interval?: number; // minutes
  maxBackups?: number;
  backupOnChange?: boolean;
  types?: string[];
}

interface BackupData {
  type: string;
  data: any;
  metadata?: Record<string, any>;
}

const DEFAULT_CONFIG: BackupConfig = {
  enabled: true,
  interval: 30, // 30 minutes
  maxBackups: 10,
  backupOnChange: true,
  types: ['kanban', 'settings', 'preferences']
};

export function useAutoBackup(config: BackupConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const { addNotification } = useNotifications();
  const intervalRef = useRef<NodeJS.Timeout>();
  const lastBackupRef = useRef<Date | null>(null);
  const dataHashRef = useRef<string>('');

  const createBackup = useCallback(async (data: BackupData) => {
    if (!finalConfig.enabled) return null;

    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Backup failed: ${response.statusText}`);
      }

      const result = await response.json();
      lastBackupRef.current = new Date();

      addNotification({
        type: 'success',
        title: '💾 Backup criado',
        message: `Backup ${data.type} salvo com sucesso`,
        duration: 3000
      });

      return result;
    } catch (error) {
      console.error('Backup error:', error);
      addNotification({
        type: 'error',
        title: '❌ Erro no backup',
        message: `Falha ao criar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        duration: 5000
      });
      return null;
    }
  }, [finalConfig.enabled, addNotification]);

  const getBackupHistory = useCallback(async (type?: string) => {
    try {
      const url = new URL('/api/backup', window.location.origin);
      if (type) url.searchParams.set('type', type);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Failed to get backup history: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get backup history error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  const deleteBackup = useCallback(async (backupId: string) => {
    try {
      const url = new URL('/api/backup', window.location.origin);
      url.searchParams.set('id', backupId);

      const response = await fetch(url.toString(), {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete backup: ${response.statusText}`);
      }

      const result = await response.json();

      addNotification({
        type: 'success',
        title: '🗑️ Backup removido',
        message: 'Backup deletado com sucesso',
        duration: 3000
      });

      return result;
    } catch (error) {
      console.error('Delete backup error:', error);
      addNotification({
        type: 'error',
        title: '❌ Erro ao deletar',
        message: `Falha ao deletar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        duration: 5000
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [addNotification]);

  const backupKanbanData = useCallback(async (force = false) => {
    const STORAGE_KEY = 'kanban_board_data';

    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return null;

      // Check if data has changed
      const dataHash = btoa(savedData).slice(0, 16);
      if (!force && dataHash === dataHashRef.current) {
        return null; // No changes, skip backup
      }

      dataHashRef.current = dataHash;
      const columns = JSON.parse(savedData);

      const totalTasks = columns.reduce((acc: number, col: any) => acc + (col.tasks?.length || 0), 0);

      const backupResult = await createBackup({
        type: 'kanban',
        data: columns,
        metadata: {
          source: 'auto-backup',
          totalTasks,
          totalColumns: columns.length,
          clientId: `user_${Date.now().toString(36)}`
        }
      });

      return backupResult;
    } catch (error) {
      console.error('Kanban backup error:', error);
      return null;
    }
  }, [createBackup]);

  const restoreFromBackup = useCallback(async (backupFile: File) => {
    try {
      const text = await backupFile.text();
      const backup = JSON.parse(text);

      if (!backup.version || !backup.type || !backup.data) {
        throw new Error('Invalid backup file format');
      }

      // Validate backup integrity
      if (backup.type === 'kanban') {
        if (!Array.isArray(backup.data)) {
          throw new Error('Invalid Kanban backup data');
        }

        // Restore to localStorage
        localStorage.setItem('kanban_board_data', JSON.stringify(backup.data));

        addNotification({
          type: 'success',
          title: '✅ Backup restaurado',
          message: `Kanban board restaurado de ${backup.timestamp}`,
          duration: 5000
        });

        // Trigger page reload to reflect changes
        window.location.reload();
      }

      return { success: true, backup };
    } catch (error) {
      console.error('Restore backup error:', error);
      addNotification({
        type: 'error',
        title: '❌ Erro na restauração',
        message: `Falha ao restaurar backup: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        duration: 7000
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [addNotification]);

  const startAutoBackup = useCallback(() => {
    if (!finalConfig.enabled || intervalRef.current) return;

    const intervalMs = (finalConfig.interval || 5) * 60 * 1000; // Convert minutes to ms

    intervalRef.current = setInterval(async () => {
      await backupKanbanData();
    }, intervalMs);

    console.log(`Auto-backup started with ${finalConfig.interval} minute intervals`);
  }, [finalConfig.enabled, finalConfig.interval, backupKanbanData]);

  const stopAutoBackup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
      console.log('Auto-backup stopped');
    }
  }, []);

  // Start auto-backup on mount
  useEffect(() => {
    if (finalConfig.enabled) {
      startAutoBackup();
    }

    return () => {
      stopAutoBackup();
    };
  }, [finalConfig.enabled, startAutoBackup, stopAutoBackup]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    createBackup,
    backupKanbanData,
    restoreFromBackup,
    getBackupHistory,
    deleteBackup,
    startAutoBackup,
    stopAutoBackup,
    isEnabled: finalConfig.enabled,
    lastBackup: lastBackupRef.current,
    config: finalConfig
  };
}

// Hook específico para Kanban com configurações otimizadas
export function useKanbanBackup() {
  const backupHook = useAutoBackup({
    enabled: true,
    interval: 15, // 15 minutes for Kanban
    maxBackups: 20,
    backupOnChange: true,
    types: ['kanban']
  });

  // Backup when data changes
  const backupOnChange = useCallback((columns: any[]) => {
    if (backupHook.config.backupOnChange) {
      // Debounce to avoid too frequent backups
      const debounceKey = 'kanban_backup_debounce';
      const existingTimeout = (window as any)[debounceKey];

      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      (window as any)[debounceKey] = setTimeout(() => {
        backupHook.backupKanbanData();
      }, 5000); // 5 second debounce
    }
  }, [backupHook]);

  return {
    ...backupHook,
    backupOnChange
  };
}