'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import MainLayout from './MainLayout';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const pathname = usePathname();

  // For login page, render children without layout
  if (pathname === '/auth/login') {
    return <>{children}</>;
  }

  // For all other pages, wrap with MainLayout
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
}