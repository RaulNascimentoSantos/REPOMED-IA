import { useState, useEffect, useCallback } from 'react';

interface OfflineQueueItem {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

interface UseOfflineSyncOptions {
  enabled?: boolean;
  maxRetries?: number;
  retryInterval?: number;
}

export function useOfflineSync({
  enabled = true,
  maxRetries = 3,
  retryInterval = 5000
}: UseOfflineSyncOptions = {}) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadQueue = useCallback(() => {
    const stored = localStorage.getItem('offline-sync-queue');
    if (stored) {
      try {
        const parsedQueue = JSON.parse(stored);
        setQueue(parsedQueue);
        return parsedQueue;
      } catch {
        localStorage.removeItem('offline-sync-queue');
      }
    }
    return [];
  }, []);

  const saveQueue = useCallback((newQueue: OfflineQueueItem[]) => {
    localStorage.setItem('offline-sync-queue', JSON.stringify(newQueue));
    setQueue(newQueue);
  }, []);

  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) => {
    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    const currentQueue = loadQueue();
    const newQueue = [...currentQueue, queueItem];
    saveQueue(newQueue);

    return queueItem.id;
  }, [loadQueue, saveQueue]);

  const processQueue = useCallback(async () => {
    if (!isOnline || isProcessing || !enabled) return;

    setIsProcessing(true);
    const currentQueue = loadQueue();

    for (const item of currentQueue) {
      try {
        const response = await fetch(`http://localhost:8081${item.endpoint}`, {
          method: item.type === 'CREATE' ? 'POST' : item.type === 'UPDATE' ? 'PUT' : 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: item.data ? JSON.stringify(item.data) : undefined
        });

        if (response.ok) {
          const newQueue = currentQueue.filter(q => q.id !== item.id);
          saveQueue(newQueue);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        const updatedItem = {
          ...item,
          retryCount: item.retryCount + 1
        };

        if (updatedItem.retryCount >= maxRetries) {
          const newQueue = currentQueue.filter(q => q.id !== item.id);
          saveQueue(newQueue);
          console.error(`Failed to sync item ${item.id} after ${maxRetries} retries:`, error);
        } else {
          const newQueue = currentQueue.map(q =>
            q.id === item.id ? updatedItem : q
          );
          saveQueue(newQueue);
        }
      }
    }

    setIsProcessing(false);
  }, [isOnline, isProcessing, enabled, loadQueue, saveQueue, maxRetries]);

  useEffect(() => {
    if (isOnline && enabled) {
      processQueue();
    }
  }, [isOnline, enabled, processQueue]);

  useEffect(() => {
    if (enabled) {
      loadQueue();
    }
  }, [enabled, loadQueue]);

  return {
    isOnline,
    isProcessing,
    queueSize: queue.length,
    addToQueue,
    processQueue,
    clearQueue: () => {
      localStorage.removeItem('offline-sync-queue');
      setQueue([]);
    }
  };
}

export function usePrescriptionOfflineSync() {
  const offlineSync = useOfflineSync();

  const createPrescriptionOffline = useCallback((prescriptionData: any) => {
    return offlineSync.addToQueue({
      type: 'CREATE',
      endpoint: '/prescriptions',
      data: prescriptionData
    });
  }, [offlineSync]);

  const updatePrescriptionOffline = useCallback((id: string, prescriptionData: any) => {
    return offlineSync.addToQueue({
      type: 'UPDATE',
      endpoint: `/prescriptions/${id}`,
      data: prescriptionData
    });
  }, [offlineSync]);

  return {
    ...offlineSync,
    createPrescriptionOffline,
    updatePrescriptionOffline
  };
}