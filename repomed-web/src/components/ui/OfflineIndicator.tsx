'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, AlertTriangle, Database, Clock } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface OfflineIndicatorProps {
  className?: string;
  showDataCount?: boolean;
}

interface OfflineData {
  patients: number;
  prescriptions: number;
  documents: number;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className,
  showDataCount = true
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastOnline, setLastOnline] = useState<Date | null>(null);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    patients: 0,
    prescriptions: 0,
    documents: 0
  });

  // Monitor network status
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);

      if (online) {
        setIsConnecting(true);
        // Simulate connection verification
        setTimeout(() => {
          setIsConnecting(false);
          setLastOnline(new Date());
        }, 1000);
      } else {
        setIsConnecting(false);
        // Count available offline data (placeholder for now)
        const patients = 0; // offlineUtils.getLastEntries('patients').length;
        const prescriptions = 0; // offlineUtils.getLastEntries('prescriptions').length;
        const documents = 0; // offlineUtils.getLastEntries('documents').length;

        setOfflineData({ patients, prescriptions, documents });
      }
    };

    updateOnlineStatus();

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Don't show indicator when online (unless specified)
  if (isOnline && !isConnecting) {
    return null;
  }

  const totalOfflineItems = offlineData.patients + offlineData.prescriptions + offlineData.documents;

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50',
        'transition-all duration-300 ease-in-out',
        className
      )}
    >
      {/* Connecting State */}
      {isConnecting && (
        <StatusBadge status="info" className="animate-pulse">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 animate-spin" />
            Reconectando...
          </div>
        </StatusBadge>
      )}

      {/* Offline State */}
      {!isOnline && !isConnecting && (
        <div className="space-y-2">
          {/* Main offline indicator */}
          <StatusBadge status="warning" aria-live="assertive">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="font-medium">Modo Offline</span>
            </div>
          </StatusBadge>

          {/* Data availability indicator */}
          {showDataCount && totalOfflineItems > 0 && (
            <div className={cn(
              'bg-slate-100 dark:bg-slate-800 rounded-lg p-3',
              'border border-slate-200 dark:border-slate-700',
              'text-sm space-y-2'
            )}>
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Database className="w-4 h-4" />
                <span className="font-medium">Dados Disponíveis Offline</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {offlineData.patients > 0 && (
                  <div className="flex flex-col items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {offlineData.patients}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400">Pacientes</span>
                  </div>
                )}

                {offlineData.prescriptions > 0 && (
                  <div className="flex flex-col items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <span className="font-semibold text-green-700 dark:text-green-300">
                      {offlineData.prescriptions}
                    </span>
                    <span className="text-green-600 dark:text-green-400">Prescrições</span>
                  </div>
                )}

                {offlineData.documents > 0 && (
                  <div className="flex flex-col items-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                    <span className="font-semibold text-purple-700 dark:text-purple-300">
                      {offlineData.documents}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">Documentos</span>
                  </div>
                )}
              </div>

              {/* Warning about data freshness */}
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-medium">Dados podem estar desatualizados</p>
                  <p className="text-amber-700 dark:text-amber-400">
                    Algumas funcionalidades estão limitadas no modo offline
                  </p>
                </div>
              </div>

              {/* Last online time */}
              {lastOnline && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span className="text-xs text-slate-500">
                    Última conexão: {lastOnline.toLocaleTimeString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* No offline data warning */}
          {showDataCount && totalOfflineItems === 0 && (
            <StatusBadge status="error">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Nenhum dado disponível offline
              </div>
            </StatusBadge>
          )}
        </div>
      )}
    </div>
  );
};

// Compact version for status bars
export const OfflineIndicatorCompact: React.FC<{ className?: string }> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (isOnline) {
    return (
      <div className={cn('flex items-center gap-1 text-green-600', className)}>
        <Wifi className="w-3 h-3" />
        <span className="text-xs font-medium">Online</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-1 text-amber-600', className)}>
      <WifiOff className="w-3 h-3" />
      <span className="text-xs font-medium">Offline</span>
    </div>
  );
};

export default OfflineIndicator;