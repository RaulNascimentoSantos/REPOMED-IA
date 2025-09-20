'use client';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 24, className = '', fullScreen = false }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <Loader2 className={cn('animate-spin text-blue-600', className)} size={size} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={cn('animate-spin text-blue-600', className)} size={size} />
    </div>
  );
}