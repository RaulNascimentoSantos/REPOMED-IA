/**
 * RepoMed IA v6.0 - Performance Provider
 *
 * Provider que inicializa o sistema de monitoramento de performance
 * e disponibiliza métricas para componentes que precisam.
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializePerformanceMonitoring, getPerformanceReport } from '@/utils/performance';
import { useFeatureFlag } from '@/components/providers/FeatureFlagProvider';

interface PerformanceContextType {
  isMonitoring: boolean;
  performanceReport: any;
  refreshReport: () => void;
}

const PerformanceContext = createContext<PerformanceContextType | null>(null);

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export function PerformanceProvider({ children }: PerformanceProviderProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [performanceReport, setPerformanceReport] = useState(null);

  const performanceMonitorEnabled = useFeatureFlag('FF_PERFORMANCE_MONITOR');

  useEffect(() => {
    // DESABILITADO TEMPORARIAMENTE PARA EVITAR AUTO-REFRESH
    // if (performanceMonitorEnabled) {
    //   console.log('[Performance] Inicializando monitoramento de performance...');
    //   try {
    //     initializePerformanceMonitoring();
    //     setIsMonitoring(true);
    //   } catch (error) {
    //     console.error('[Performance] Erro ao inicializar monitoramento:', error);
    //   }
    // }
  }, [performanceMonitorEnabled]);

  const refreshReport = () => {
    if (isMonitoring) {
      const report = getPerformanceReport();
      setPerformanceReport(report);
    }
  };

  const value: PerformanceContextType = {
    isMonitoring,
    performanceReport,
    refreshReport
  };

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
}

export function usePerformance() {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformance deve ser usado dentro de um PerformanceProvider');
  }
  return context;
}