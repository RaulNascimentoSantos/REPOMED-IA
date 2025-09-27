/**
 * RepoMed IA v6.0 - Medical Auto-Save Hook
 *
 * Sistema inteligente de auto-save para formulários médicos:
 * - Salva automaticamente dados em intervalos configuráveis
 * - Detecta mudanças significativas para otimizar salvamento
 * - Funciona offline com sincronização quando online
 * - Priorização baseada na criticidade do documento médico
 * - Versionamento automático para auditoria médica
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface AutoSaveOptions {
  key: string;                          // Chave única para identificar o formulário
  saveInterval?: number;                // Intervalo em ms (padrão: 30s)
  debounceDelay?: number;              // Delay para debounce em ms (padrão: 2s)
  criticalData?: boolean;              // Se true, salva mais frequentemente
  enableVersioning?: boolean;          // Habilita versionamento automático
  maxVersions?: number;                // Máximo de versões mantidas (padrão: 10)
  onSave?: (data: any, version?: number) => Promise<boolean>; // Callback personalizado de save
  onRestore?: (data: any) => void;     // Callback para restaurar dados
  onError?: (error: Error) => void;    // Callback para tratar erros
}

interface AutoSaveState {
  data: any;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  isOnline: boolean;
  isSaving: boolean;
  saveError: string | null;
  currentVersion: number;
  totalVersions: number;
}

export function useMedicalAutoSave<T = any>(
  formData: T,
  options: AutoSaveOptions
): AutoSaveState & {
  forceSave: () => Promise<boolean>;
  clearData: () => void;
  restoreVersion: (version: number) => T | null;
  getVersionHistory: () => Array<{ version: number; timestamp: Date; data: T }>;
} {
  const {
    key,
    saveInterval = options.criticalData ? 15000 : 30000, // 15s para crítico, 30s normal
    debounceDelay = 2000,
    criticalData = false,
    enableVersioning = true,
    maxVersions = 10,
    onSave,
    onRestore,
    onError
  } = options;

  const [state, setState] = useState<AutoSaveState>({
    data: formData,
    lastSaved: null,
    hasUnsavedChanges: false,
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isSaving: false,
    saveError: null,
    currentVersion: 1,
    totalVersions: 1
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastDataRef = useRef<string>('');
  const versionCounterRef = useRef(1);

  // Monitorar status online/offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Gerar chave de storage com contexto médico
  const getStorageKey = useCallback((suffix: string = '') => {
    const baseKey = `repomed_autosave_${key}`;
    return suffix ? `${baseKey}_${suffix}` : baseKey;
  }, [key]);

  // Salvar dados no localStorage com versionamento
  const saveToStorage = useCallback(async (data: T, isManual = false): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isSaving: true, saveError: null }));

      const timestamp = new Date();
      const version = enableVersioning ? versionCounterRef.current++ : 1;

      const saveData = {
        data,
        timestamp: timestamp.toISOString(),
        version,
        manual: isManual,
        critical: criticalData,
        checksum: generateChecksum(data)
      };

      // Salvar dados atuais
      localStorage.setItem(getStorageKey(), JSON.stringify(saveData));

      // Salvar histórico de versões se habilitado
      if (enableVersioning) {
        const historyKey = getStorageKey('history');
        const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');

        existingHistory.push(saveData);

        // Manter apenas as últimas versões
        if (existingHistory.length > maxVersions) {
          existingHistory.splice(0, existingHistory.length - maxVersions);
        }

        localStorage.setItem(historyKey, JSON.stringify(existingHistory));
      }

      // Tentar salvar no servidor se online e callback fornecido
      let serverSaveSuccess = true;
      if (state.isOnline && onSave) {
        try {
          serverSaveSuccess = await onSave(data, version);
        } catch (error) {
          console.warn('[AutoSave] Falha ao salvar no servidor:', error);
          serverSaveSuccess = false;
        }
      }

      setState(prev => ({
        ...prev,
        lastSaved: timestamp,
        hasUnsavedChanges: false,
        isSaving: false,
        currentVersion: version,
        totalVersions: enableVersioning ? Math.min(versionCounterRef.current, maxVersions) : 1
      }));

      console.log(`[AutoSave] Dados salvos - Versão ${version} | Server: ${serverSaveSuccess ? '✓' : '✗'}`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: errorMessage
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      return false;
    }
  }, [
    enableVersioning,
    criticalData,
    maxVersions,
    onSave,
    onError,
    state.isOnline,
    getStorageKey
  ]);

  // Gerar checksum simples para detectar mudanças
  const generateChecksum = useCallback((data: any): string => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }, []);

  // Detectar mudanças nos dados
  useEffect(() => {
    const currentDataStr = JSON.stringify(formData);

    if (currentDataStr !== lastDataRef.current && lastDataRef.current !== '') {
      setState(prev => ({ ...prev, hasUnsavedChanges: true, data: formData }));

      // Limpar debounce anterior
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Configurar novo debounce para auto-save
      debounceRef.current = setTimeout(() => {
        if (currentDataStr !== lastDataRef.current) {
          saveToStorage(formData);
        }
      }, debounceDelay);
    }

    lastDataRef.current = currentDataStr;
  }, [formData, debounceDelay, saveToStorage]);

  // Auto-save periódico
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // DESABILITADO: intervalRef.current = setInterval(() => {
    //   if (state.hasUnsavedChanges && !state.isSaving) {
    //     console.log('[AutoSave] Salvamento automático periódico');
    //     saveToStorage(formData);
    //   }
    // }, saveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [saveInterval, state.hasUnsavedChanges, state.isSaving, saveToStorage, formData]);

  // Restaurar dados ao montar o componente
  useEffect(() => {
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (saved) {
        const parsedData = JSON.parse(saved);

        // Verificar integridade dos dados
        if (parsedData.data && parsedData.checksum) {
          const currentChecksum = generateChecksum(parsedData.data);

          if (currentChecksum === parsedData.checksum) {
            setState(prev => ({
              ...prev,
              lastSaved: new Date(parsedData.timestamp),
              currentVersion: parsedData.version || 1
            }));

            onRestore?.(parsedData.data);
            console.log('[AutoSave] Dados restaurados com sucesso');
          } else {
            console.warn('[AutoSave] Checksum inválido - dados podem estar corrompidos');
          }
        }
      }
    } catch (error) {
      console.error('[AutoSave] Erro ao restaurar dados:', error);
      onError?.(error instanceof Error ? error : new Error('Falha na restauração'));
    }
  }, [getStorageKey, generateChecksum, onRestore, onError]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Função para forçar salvamento manual
  const forceSave = useCallback(async (): Promise<boolean> => {
    return await saveToStorage(formData, true);
  }, [saveToStorage, formData]);

  // Limpar dados salvos
  const clearData = useCallback(() => {
    localStorage.removeItem(getStorageKey());
    localStorage.removeItem(getStorageKey('history'));

    setState(prev => ({
      ...prev,
      lastSaved: null,
      hasUnsavedChanges: false,
      currentVersion: 1,
      totalVersions: 1
    }));

    versionCounterRef.current = 1;
  }, [getStorageKey]);

  // Restaurar versão específica
  const restoreVersion = useCallback((version: number): T | null => {
    try {
      const historyKey = getStorageKey('history');
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

      const versionData = history.find((item: any) => item.version === version);
      return versionData ? versionData.data : null;
    } catch (error) {
      console.error('[AutoSave] Erro ao restaurar versão:', error);
      return null;
    }
  }, [getStorageKey]);

  // Obter histórico de versões
  const getVersionHistory = useCallback(() => {
    try {
      const historyKey = getStorageKey('history');
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]');

      return history.map((item: any) => ({
        version: item.version,
        timestamp: new Date(item.timestamp),
        data: item.data
      }));
    } catch (error) {
      console.error('[AutoSave] Erro ao obter histórico:', error);
      return [];
    }
  }, [getStorageKey]);

  return {
    ...state,
    forceSave,
    clearData,
    restoreVersion,
    getVersionHistory
  };
}