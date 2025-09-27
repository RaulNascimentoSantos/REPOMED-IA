'use client';

/**
 * 🚀 Medical Lazy Loading System
 * Optimized for medical components with priority-based loading
 * Reduces initial bundle size and improves Core Web Vitals
 */

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { Loader2, Heart, FileText, Users, Stethoscope, AlertTriangle } from 'lucide-react';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  medicalContext?: 'patient' | 'prescription' | 'document' | 'general';
  timeout?: number; // Timeout for critical medical components
}

// Medical-specific fallback with contextual loading messages
const MedicalFallback = React.memo(({
  medicalContext = 'general',
  priority = 'medium'
}: {
  medicalContext?: string;
  priority?: string;
}) => {
  const getIcon = () => {
    switch (medicalContext) {
      case 'patient': return <Users className="w-6 h-6" />;
      case 'prescription': return <FileText className="w-6 h-6" />;
      case 'document': return <FileText className="w-6 h-6" />;
      default: return <Stethoscope className="w-6 h-6" />;
    }
  };

  const getMessage = () => {
    switch (medicalContext) {
      case 'patient': return 'Carregando dados do paciente...';
      case 'prescription': return 'Preparando prescrição médica...';
      case 'document': return 'Processando documento médico...';
      default: return 'Carregando componente médico...';
    }
  };

  const getPriorityColor = () => {
    switch (priority) {
      case 'critical': return 'text-red-500 animate-pulse';
      case 'high': return 'text-blue-500';
      case 'medium': return 'text-emerald-500';
      case 'low': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="medical-card flex items-center justify-center p-8 min-h-[120px]">
      <div className="flex flex-col items-center gap-3">
        <div className={`${getPriorityColor()} transition-colors duration-200`}>
          {getIcon()}
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className={`w-4 h-4 animate-spin ${getPriorityColor()}`} />
          <span className="medical-text-secondary text-sm font-medium">
            {getMessage()}
          </span>
        </div>
        {priority === 'critical' && (
          <div className="flex items-center gap-1 mt-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="medical-text-small text-red-600">
              Componente crítico - carregamento prioritário
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// Enhanced fallback with skeleton loading for better UX
const SkeletonFallback = React.memo(({
  medicalContext = 'general'
}: {
  medicalContext?: string;
}) => {
  const getSkeletonPattern = () => {
    switch (medicalContext) {
      case 'patient':
        return (
          <div className="medical-card p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-200 rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
        );

      case 'prescription':
        return (
          <div className="medical-card p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3"></div>
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="medical-card p-6 space-y-4">
            <div className="h-6 bg-slate-200 rounded animate-pulse w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        );
    }
  };

  return getSkeletonPattern();
});

// Performance monitoring for lazy loaded components
const useLoadingPerformance = (priority: string) => {
  const startTimeRef = useRef<number>();
  const [loadTime, setLoadTime] = useState<number | null>(null);

  useEffect(() => {
    startTimeRef.current = performance.now();

    return () => {
      if (startTimeRef.current) {
        const endTime = performance.now();
        const duration = endTime - startTimeRef.current;
        setLoadTime(duration);

        // Log performance for critical medical components
        if (priority === 'critical' && duration > 2000) {
          console.warn(`[LazyLoader] Critical medical component took ${duration}ms to load`);
        }
      }
    };
  }, [priority]);

  return loadTime;
};

export const LazyLoader = React.memo(({
  children,
  fallback,
  className = "",
  priority = 'medium',
  medicalContext = 'general',
  timeout = 10000
}: LazyLoaderProps) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const loadTime = useLoadingPerformance(priority);

  // Timeout handling for critical components
  useEffect(() => {
    if (priority === 'critical') {
      const timer = setTimeout(() => {
        setHasTimedOut(true);
        console.error(`[LazyLoader] Critical medical component timed out after ${timeout}ms`);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [priority, timeout]);

  // Choose appropriate fallback based on context and preferences
  const getFallback = () => {
    if (hasTimedOut) {
      return (
        <div className="medical-card p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="medical-text font-medium text-red-600 mb-2">
            Timeout no carregamento do componente crítico
          </p>
          <p className="medical-text-small">
            Recarregue a página ou entre em contato com o suporte técnico
          </p>
        </div>
      );
    }

    if (fallback) {
      return fallback;
    }

    // Use skeleton for better UX in non-critical components
    if (priority === 'low' || priority === 'medium') {
      return <SkeletonFallback medicalContext={medicalContext} />;
    }

    // Use enhanced medical fallback for critical/high priority
    return <MedicalFallback medicalContext={medicalContext} priority={priority} />;
  };

  return (
    <Suspense fallback={getFallback()}>
      <div className={className} data-medical-context={medicalContext} data-priority={priority}>
        {children}
      </div>
    </Suspense>
  );
});

// Specialized lazy loaders for common medical components
export const LazyPatientLoader = React.memo((props: Omit<LazyLoaderProps, 'medicalContext'>) => (
  <LazyLoader {...props} medicalContext="patient" />
));

export const LazyPrescriptionLoader = React.memo((props: Omit<LazyLoaderProps, 'medicalContext'>) => (
  <LazyLoader {...props} medicalContext="prescription" priority="high" />
));

export const LazyDocumentLoader = React.memo((props: Omit<LazyLoaderProps, 'medicalContext'>) => (
  <LazyLoader {...props} medicalContext="document" />
));

// Critical medical component loader with zero tolerance for delays
export const CriticalMedicalLoader = React.memo((props: Omit<LazyLoaderProps, 'priority' | 'timeout'>) => (
  <LazyLoader {...props} priority="critical" timeout={3000} />
));

export default LazyLoader;