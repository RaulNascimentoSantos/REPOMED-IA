import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'wave'
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
        return 'rounded-none';
      default:
        return 'rounded-md';
    }
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'pulse':
        return 'animate-pulse bg-gray-200';
      case 'wave':
        return 'loading-skeleton';
      default:
        return 'bg-gray-200';
    }
  };

  const style = {
    width: width || (variant === 'text' ? '100%' : '40px'),
    height: height || (variant === 'text' ? '1rem' : '40px')
  };

  return (
    <div 
      className={`${getVariantStyles()} ${getAnimationClass()} ${className}`}
      style={style}
    />
  );
};

// Pre-built skeleton patterns for common use cases
export const SkeletonCard: React.FC = () => (
  <div className="card p-6 space-y-4">
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={60} height={60} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" height="1.2rem" />
        <Skeleton width="40%" height="1rem" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="80%" height="1rem" />
      <Skeleton width="60%" height="1rem" />
    </div>
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <Skeleton width="30%" height="1rem" />
          <Skeleton width="20%" height="0.8rem" />
        </div>
        <div className="space-y-2">
          <Skeleton width="60px" height="2rem" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="space-y-8">
    {/* Header skeleton */}
    <div className="space-y-4">
      <Skeleton width="300px" height="2.5rem" />
      <Skeleton width="200px" height="1.2rem" />
    </div>
    
    {/* Metrics cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="card p-6 text-center space-y-4">
          <Skeleton variant="circular" width={60} height={60} className="mx-auto" />
          <div className="space-y-2">
            <Skeleton width="80%" height="2rem" className="mx-auto" />
            <Skeleton width="60%" height="1rem" className="mx-auto" />
          </div>
        </div>
      ))}
    </div>
    
    {/* Main content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <SkeletonTable rows={6} />
      </div>
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  </div>
);

export const SkeletonButton: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeStyles = {
    sm: 'h-8 w-20',
    md: 'h-10 w-24',
    lg: 'h-12 w-32'
  };

  return (
    <Skeleton 
      variant="rounded" 
      className={sizeStyles[size]}
    />
  );
};

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 40 }) => (
  <Skeleton variant="circular" width={size} height={size} />
);

export const SkeletonText: React.FC<{ 
  lines?: number; 
  className?: string;
}> = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton 
        key={index}
        width={index === lines - 1 ? '60%' : '100%'}
        height="1rem"
      />
    ))}
  </div>
);