'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para login ou home dependendo da autenticação
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/home');
    } else {
      router.push('/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full opacity-20 animate-pulse"></div>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <h1 className="text-2xl font-bold text-indigo-900">RepoMed IA</h1>
          <p className="text-gray-600">Sistema Completo de Documentos Médicos</p>
          <div className="text-xs text-indigo-500 font-medium">v7.0 Estabilizado ✓</div>
          <div className="flex items-center justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
}