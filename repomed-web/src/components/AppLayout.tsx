'use client';

import React from 'react';
import { Navigation } from './Navigation';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function AppLayout({ children, className, fullWidth = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <Navigation />
      
      <main 
        className={cn(
          "transition-all duration-300",
          "lg:ml-72", // Offset for sidebar on desktop
          "pt-20 lg:pt-8", // Top padding for mobile menu button
          !fullWidth && "max-w-7xl mx-auto",
          "px-4 sm:px-6 lg:px-8 pb-8",
          className
        )}
      >
        {/* Glass Container for Content */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
          {children}
        </div>
      </main>
    </div>
  );
}