import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'medical' | 'white' | 'gray';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorStyles = {
    primary: 'text-blue-600',
    medical: 'text-teal-600',
    white: 'text-white',
    gray: 'text-gray-400'
  };

  return (
    <div className={`animate-spin ${sizeStyles[size]} ${colorStyles[color]} ${className}`}>
      <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
};

export const LoadingDots: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}> = ({ 
  size = 'md',
  color = 'bg-blue-600'
}) => {
  const sizeStyles = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  };

  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${sizeStyles[size]} ${color} rounded-full animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  );
};

export const LoadingPulse: React.FC<{
  className?: string;
}> = ({ className = '' }) => (
  <div className={`animate-medical-pulse rounded-full bg-blue-500 p-3 ${className}`}>
    <div className="w-6 h-6 bg-white rounded-full" />
  </div>
);

export const LoadingHeartbeat: React.FC = () => (
  <div className="flex items-center space-x-2">
    <div className="animate-heartbeat text-red-500">
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402m5.726-20.583c-2.203 0-4.446 1.042-5.726 3.238-1.285-2.206-3.522-3.248-5.719-3.248-3.183 0-6.281 2.187-6.281 6.191 0 4.661 5.571 9.429 12 15.809 6.43-6.38 12-11.148 12-15.809 0-4.011-3.095-6.181-6.274-6.181"/>
      </svg>
    </div>
    <span className="text-sm text-gray-600">Processando dados médicos...</span>
  </div>
);

export const FullPageLoader: React.FC<{
  message?: string;
  subMessage?: string;
}> = ({
  message = 'Carregando...',
  subMessage = 'Aguarde um momento'
}) => (
  <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center z-50">
    <div className="text-center space-y-6 p-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 border-t-blue-600 mx-auto" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse text-blue-600">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
            </svg>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
        <p className="text-gray-600">{subMessage}</p>
      </div>
    </div>
  </div>
);

export const InlineLoader: React.FC<{
  message?: string;
  className?: string;
}> = ({
  message = 'Carregando...',
  className = ''
}) => (
  <div className={`flex items-center space-x-3 ${className}`}>
    <LoadingSpinner size="sm" />
    <span className="text-sm text-gray-600">{message}</span>
  </div>
);

export const ButtonLoader: React.FC<{
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}> = ({
  loading,
  children,
  loadingText = 'Carregando...',
  className = '',
  onClick,
  disabled
}) => (
  <button
    className={`relative transition-all duration-200 ${className} ${
      loading || disabled ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
    }`}
    onClick={onClick}
    disabled={loading || disabled}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" color="white" />
      </div>
    )}
    <span className={loading ? 'invisible' : 'visible'}>
      {loading ? loadingText : children}
    </span>
  </button>
);

export const CardLoader: React.FC = () => (
  <div className="card p-6 space-y-4 animate-pulse">
    <div className="flex items-center space-x-4">
      <div className="rounded-full bg-gray-300 h-12 w-12" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-300 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-300 rounded" />
      <div className="h-3 bg-gray-300 rounded w-5/6" />
      <div className="h-3 bg-gray-300 rounded w-4/6" />
    </div>
  </div>
);

export const TableLoader: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-3 bg-white rounded">
        <div className="rounded-full bg-gray-300 h-8 w-8 animate-pulse" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-gray-300 rounded w-1/3 animate-pulse" />
          <div className="h-2 bg-gray-300 rounded w-1/4 animate-pulse" />
        </div>
        <div className="h-6 bg-gray-300 rounded w-16 animate-pulse" />
      </div>
    ))}
  </div>
);

export const ProgressLoader: React.FC<{
  progress: number;
  message?: string;
  showPercentage?: boolean;
}> = ({
  progress,
  message = 'Processando...',
  showPercentage = true
}) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{message}</span>
      {showPercentage && (
        <span className="text-sm font-medium text-gray-800">{Math.round(progress)}%</span>
      )}
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div 
        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
  </div>
);

// Medical-specific loaders
export const MedicalLoader: React.FC<{ 
  type?: 'ecg' | 'heartbeat' | 'pulse';
  message?: string;
}> = ({ 
  type = 'heartbeat',
  message = 'Processando dados médicos...'
}) => {
  const renderIcon = () => {
    switch (type) {
      case 'ecg':
        return (
          <div className="animate-pulse">
            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h4l2-7 4 7 2-4h6v-2H3v6z"/>
            </svg>
          </div>
        );
      case 'pulse':
        return <LoadingPulse className="w-12 h-12" />;
      default:
        return <LoadingHeartbeat />;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-8">
      {renderIcon()}
      <p className="text-center text-gray-600">{message}</p>
    </div>
  );
};

// Dashboard skeleton for complex layouts
export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-8 animate-pulse">
    {/* Header skeleton */}
    <div className="space-y-4">
      <div className="h-8 bg-gray-300 rounded w-1/3" />
      <div className="h-4 bg-gray-300 rounded w-1/4" />
    </div>
    
    {/* Metrics cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-8 h-8 bg-gray-300 rounded" />
            <div className="w-6 h-6 bg-gray-300 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-3/4" />
            <div className="h-4 bg-gray-300 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Main content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-white p-6 rounded-2xl border space-y-4">
        <div className="h-6 bg-gray-300 rounded w-1/2" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-300 rounded w-3/4" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl border space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-300 rounded w-1/3" />
          <div className="h-8 bg-gray-300 rounded w-20" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-3 bg-gray-50 rounded">
              <div className="w-6 h-6 bg-gray-300 rounded" />
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-300 rounded w-2/3" />
                <div className="h-3 bg-gray-300 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-300 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);