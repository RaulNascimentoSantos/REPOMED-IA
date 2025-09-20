import { useEffect, useRef, useCallback } from 'react';

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

interface UseAutoSaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  onSaveStart?: () => void;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
  isDataValid?: (data: T) => boolean;
}

export function useAutoSave<T>({
  data,
  saveFunction,
  delay = 2000,
  enabled = true,
  onSaveStart,
  onSaveSuccess,
  onSaveError,
  isDataValid
}: UseAutoSaveOptions<T>) {
  const isSaving = useRef(false);
  const lastSavedData = useRef<T>(data);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const performSave = useCallback(async (dataToSave: T) => {
    if (isSaving.current) return;

    if (isDataValid && !isDataValid(dataToSave)) {
      return;
    }

    try {
      isSaving.current = true;
      onSaveStart?.();

      await saveFunction(dataToSave);
      lastSavedData.current = dataToSave;

      onSaveSuccess?.();
    } catch (error) {
      onSaveError?.(error as Error);
    } finally {
      isSaving.current = false;
    }
  }, [saveFunction, onSaveStart, onSaveSuccess, onSaveError, isDataValid]);

  const debouncedSave = useCallback(
    debounce((dataToSave: T) => {
      performSave(dataToSave);
    }, delay),
    [performSave, delay]
  );

  useEffect(() => {
    if (!enabled) return;

    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData.current);

    if (hasChanged && !isSaving.current) {
      debouncedSave(data);
    }

    return () => {
      debouncedSave.cancel();
    };
  }, [data, enabled, debouncedSave]);

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

  return {
    isSaving: isSaving.current,
    forceSave,
    lastSaved: lastSavedData.current
  };
}

export function usePrescriptionAutoSave(prescriptionData: any, isValid: boolean = true) {
  const saveToLocalStorage = useCallback(async (data: any) => {
    const key = 'prescription-draft';
    localStorage.setItem(key, JSON.stringify({
      ...data,
      lastSaved: new Date().toISOString()
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
    isDataValid
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