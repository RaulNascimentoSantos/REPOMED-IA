import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`} />
  );
}

interface SkeletonProps {
  className?: string;
  rows?: number;
}

export function Skeleton({ className = '', rows = 1 }: SkeletonProps) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded ${className} ${i > 0 ? 'mt-2' : ''}`} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-12 w-96 mx-auto" />
        <Skeleton className="h-6 w-64 mx-auto" />
        <div className="flex justify-center gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20" />
          ))}
        </div>
      </div>

      {/* Metrics grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-6 w-6" />
            </div>
            <Skeleton className="h-6 w-32" />
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>

      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Skeleton className="h-8 w-40 mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full mr-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-6 w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Skeleton className="h-8 w-8 rounded-full mr-4" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MedicalLoaderProps {
  type?: 'spin' | 'pulse' | 'bounce' | 'medical';
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function MedicalLoader({ type = 'medical', message = 'Carregando...', size = 'md' }: MedicalLoaderProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const renderLoader = () => {
    switch (type) {
      case 'spin':
        return <div className={`animate-spin rounded-full border-4 border-blue-600 border-t-transparent ${sizeClasses[size]}`} />;

      case 'pulse':
        return <div className={`animate-pulse bg-blue-600 rounded-full ${sizeClasses[size]}`} />;

      case 'bounce':
        return (
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`bg-blue-600 rounded-full animate-bounce ${sizeClasses.sm}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        );

      case 'medical':
      default:
        return (
          <div className="relative">
            <div className={`animate-spin rounded-full border-4 border-blue-200 ${sizeClasses[size]}`} />
            <div className={`absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent ${sizeClasses[size]}`} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-blue-600 text-lg font-bold">+</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {renderLoader()}
      {message && (
        <p className="text-gray-600 text-center font-medium">{message}</p>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showText?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function ProgressBar({ progress, className = '', showText = true, color = 'blue' }: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    yellow: 'bg-yellow-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600'
  };

  const backgroundColorClasses = {
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    yellow: 'bg-yellow-100',
    red: 'bg-red-100',
    purple: 'bg-purple-100'
  };

  return (
    <div className={`w-full ${className}`}>
      <div className={`h-3 rounded-full overflow-hidden ${backgroundColorClasses[color]}`}>
        <div
          className={`h-full transition-all duration-300 ease-out ${colorClasses[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showText && (
        <div className="mt-1 text-sm text-gray-600 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}