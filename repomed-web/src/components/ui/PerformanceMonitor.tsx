import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Activity, Wifi, WifiOff, Clock } from 'lucide-react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  isOnline: boolean;
  memoryUsage?: number;
}

interface PerformanceMonitorProps {
  showDetails?: boolean;
  className?: string;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  className
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    isOnline: navigator.onLine
  });

  useEffect(() => {
    const measurePerformance = () => {
      if (performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;

        const paintEntries = performance.getEntriesByType('paint');
        const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
        const renderTime = fcp ? fcp.startTime : 0;

        let memoryUsage;
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
        }

        setMetrics(prev => ({
          ...prev,
          loadTime: Math.round(loadTime),
          renderTime: Math.round(renderTime),
          memoryUsage
        }));
      }
    };

    const handleOnline = () => setMetrics(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, isOnline: false }));

    measurePerformance();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showDetails) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-slate-400', className)}>
        {metrics.isOnline ? (
          <Wifi className="w-3 h-3 text-green-400" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-400" />
        )}
        <span className="sr-only">
          {metrics.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    );
  }

  const getPerformanceStatus = () => {
    if (metrics.loadTime < 1000) return { status: 'excellent', color: 'text-green-400' };
    if (metrics.loadTime < 2000) return { status: 'good', color: 'text-yellow-400' };
    return { status: 'needs improvement', color: 'text-red-400' };
  };

  const perfStatus = getPerformanceStatus();

  return (
    <div className={cn(
      'fixed bottom-4 left-4 z-40',
      'bg-slate-800/90 backdrop-blur-sm border border-slate-600',
      'rounded-lg p-3 text-xs text-slate-300',
      'shadow-lg max-w-xs',
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-3 h-3" />
        <span className="font-medium">Performance Monitor</span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <span>Connection:</span>
          <div className="flex items-center gap-1">
            {metrics.isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-green-400" />
                <span className="text-green-400">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-400" />
                <span className="text-red-400">Offline</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Load Time:</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className={perfStatus.color}>
              {metrics.loadTime}ms
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>Render Time:</span>
          <span>{metrics.renderTime}ms</span>
        </div>

        {metrics.memoryUsage && (
          <div className="flex items-center justify-between">
            <span>Memory:</span>
            <span>{metrics.memoryUsage.toFixed(1)}MB</span>
          </div>
        )}

        <div className="pt-1 border-t border-slate-600">
          <span className={cn('text-xs', perfStatus.color)}>
            Status: {perfStatus.status}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;