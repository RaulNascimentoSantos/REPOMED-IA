import { useEffect, useRef, useCallback, useState } from 'react';
import { useFeatureFlag } from '@/components/providers/FeatureFlagProvider';

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T & { cancel: () => void } {
  let timeout: NodeJS.Timeout | undefined;

  const debounced = ((...args: any[]) => {
    const later = () => {
      timeout = undefined;
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }) as T & { cancel: () => void };

  debounced.cancel = () => {
    clearTimeout(timeout);
    timeout = undefined;
  };

  return debounced;
}

// Detectar criticidade dos dados médicos
function detectDataCriticality(data: any, context: string): 'low' | 'medium' | 'high' | 'critical' {
  const dataStr = JSON.stringify(data).toLowerCase();

  const criticalPatterns = [
    'dosagem', 'dose', 'mg', 'ml', 'comprimido', 'medicamento',
    'alergia', 'contraindicação', 'interação', 'emergência',
    'diagnóstico', 'sintoma grave', 'urgência'
  ];

  const mediumPatterns = [
    'paciente', 'nome', 'cpf', 'telefone', 'endereço',
    'exame', 'procedimento', 'consulta'
  ];

  let criticalScore = 0;
  criticalPatterns.forEach(pattern => {
    if (dataStr.includes(pattern)) criticalScore += 2;
  });

  mediumPatterns.forEach(pattern => {
    if (dataStr.includes(pattern)) criticalScore += 1;
  });

  if (context === 'prescription') criticalScore += 3;
  if (context === 'medical_record') criticalScore += 2;

  if (criticalScore >= 8) return 'critical';
  if (criticalScore >= 5) return 'high';
  if (criticalScore >= 2) return 'medium';
  return 'low';
}

interface UseAutoSaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  isDataValid?: (data: T) => boolean;
  context?: 'prescription' | 'patient' | 'medical_record' | 'general';
  enableCriticalMode?: boolean;
  maxVersions?: number;
}

interface AutoSaveMetrics {
  totalSaves: number;
  criticalSaves: number;
  lastSave: number | null;
  lastCriticality: 'low' | 'medium' | 'high' | 'critical';
  storageUsed: number;
  hasUnsavedChanges: boolean;
}

export function useAutoSave<T>({
  data,
  saveFunction,
  delay = 2000,
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
  isDataValid,
  context = 'general',
  enableCriticalMode = true,
  maxVersions = 5
}: UseAutoSaveOptions<T>) {
  const [metrics, setMetrics] = useState<AutoSaveMetrics>({
    totalSaves: 0,
    criticalSaves: 0,
    lastSave: null,
    lastCriticality: 'low',
    storageUsed: 0,
    hasUnsavedChanges: false
  });

  const isAutoSaveEnabled = useFeatureFlag('FF_SMART_AUTOFILL');
  const isSaving = useRef(false);
  const lastSavedData = useRef<T>(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const versionCounter = useRef(1);

  const performSave = useCallback(async (dataToSave: T) => {
    if (isSaving.current || (!isAutoSaveEnabled && enabled)) return;

    if (isDataValid && !isDataValid(dataToSave)) {
      return;
    }

    const criticality = enableCriticalMode ? detectDataCriticality(dataToSave, context) : 'low';
    const currentTime = Date.now();

    try {
      isSaving.current = true;
      onSaveStart?.();

      // Salvar dados principais
      await saveFunction(dataToSave);

      // Salvar histórico de versões para dados críticos
      if (enableCriticalMode && (criticality === 'critical' || criticality === 'high')) {
        const historyKey = `autosave-history-${context}`;
        const existingHistory = localStorage.getItem(historyKey);
        const history = existingHistory ? JSON.parse(existingHistory) : [];

        const versionData = {
          version: versionCounter.current++,
          data: dataToSave,
          timestamp: currentTime,
          criticality,
          context
        };

        history.push(versionData);

        // Limitar histórico
        if (history.length > maxVersions) {
          history.splice(0, history.length - maxVersions);
        }

        localStorage.setItem(historyKey, JSON.stringify(history));
      }

      lastSavedData.current = dataToSave;

      // Atualizar métricas
      setMetrics(prev => ({
        ...prev,
        totalSaves: prev.totalSaves + 1,
        criticalSaves: criticality === 'critical' ? prev.criticalSaves + 1 : prev.criticalSaves,
        lastSave: currentTime,
        lastCriticality: criticality,
        storageUsed: new Blob([JSON.stringify(dataToSave)]).size,
        hasUnsavedChanges: false
      }));

      onSaveSuccess?.();
    } catch (error) {
      onSaveError?.(error as Error);
    } finally {
      isSaving.current = false;
    }
  }, [
    saveFunction, onSaveStart, onSaveSuccess, onSaveError, isDataValid,
    context, enableCriticalMode, maxVersions, isAutoSaveEnabled, enabled
  ]);

  // Ajustar delay baseado na criticidade
  const getAdaptiveDelay = useCallback((currentData: T) => {
    if (!enableCriticalMode) return delay;

    const criticality = detectDataCriticality(currentData, context);
    switch (criticality) {
      case 'critical': return Math.min(delay / 4, 1000); // Máximo 1s para dados críticos
      case 'high': return Math.min(delay / 2, 2000);     // Máximo 2s para dados importantes
      case 'medium': return delay;
      default: return delay * 1.5; // Dados baixo impacto podem esperar mais
    }
  }, [delay, enableCriticalMode, context]);

  const debouncedSave = useCallback(
    debounce((dataToSave: T) => {
      performSave(dataToSave);
    }, delay),
    [performSave, delay]
  );

  useEffect(() => {
    if (!enabled || !isAutoSaveEnabled) return;

    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData.current);

    if (hasChanged && !isSaving.current) {
      // Atualizar métricas sobre mudanças não salvas
      setMetrics(prev => ({ ...prev, hasUnsavedChanges: true }));

      // Usar delay adaptivo para dados críticos
      const adaptiveDelay = getAdaptiveDelay(data);
      debouncedSave.cancel();

      const adaptiveDebouncedSave = debounce((dataToSave: T) => {
        performSave(dataToSave);
      }, adaptiveDelay);

      adaptiveDebouncedSave(data);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, isAutoSaveEnabled, debouncedSave, getAdaptiveDelay, performSave]);

  // Detectar saída da página para salvar dados críticos
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (metrics.hasUnsavedChanges && enableCriticalMode) {
        const criticality = detectDataCriticality(data, context);
        if (criticality === 'critical' || criticality === 'high') {
          e.preventDefault();
          e.returnValue = 'Você tem alterações críticas não salvas. Deseja realmente sair?';
          // Tentar salvar sincronamente
          performSave(data);
          return e.returnValue;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [metrics.hasUnsavedChanges, enableCriticalMode, data, context, performSave]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const forceSave = useCallback(() => {
    debouncedSave.cancel();
    return performSave(data);
  }, [debouncedSave, performSave, data]);

  const loadHistory = useCallback(() => {
    const historyKey = `autosave-history-${context}`;
    const history = localStorage.getItem(historyKey);
    return history ? JSON.parse(history) : [];
  }, [context]);

  const clearHistory = useCallback(() => {
    const historyKey = `autosave-history-${context}`;
    localStorage.removeItem(historyKey);
  }, [context]);

  return {
    isSaving: isSaving.current,
    forceSave,
    lastSaved: lastSavedData.current,
    metrics,
    loadHistory,
    clearHistory,
    currentCriticality: enableCriticalMode ? detectDataCriticality(data, context) : 'low',
    isEnabled: isAutoSaveEnabled && enabled
  };
}

export function usePrescriptionAutoSave(prescriptionData: any, isValid: boolean = true) {
  const saveToLocalStorage = useCallback(async (data: any) => {
    const key = 'prescription-draft';
    localStorage.setItem(key, JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString(),
      version: Date.now()
    }));
  }, []);

  const isDataValid = useCallback((data: any) => {
    return isValid && data.paciente && data.medications?.some((med: any) => med.name?.trim());
  }, [isValid]);

  return useAutoSave({
    data: prescriptionData,
    saveFunction: saveToLocalStorage,
    delay: 3000,
    enabled: true,
    isDataValid,
    context: 'prescription',
    enableCriticalMode: true,
    maxVersions: 10
  });
}

export function loadPrescriptionDraft() {
  const key = 'prescription-draft';
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const data = JSON.parse(stored);
      return {
        ...data,
        lastSaved: data.lastSaved ? new Date(data.lastSaved) : null
      };
    } catch {
      localStorage.removeItem(key);
    }
  }

  return null;
}

export function clearPrescriptionDraft() {
  localStorage.removeItem('prescription-draft');
}