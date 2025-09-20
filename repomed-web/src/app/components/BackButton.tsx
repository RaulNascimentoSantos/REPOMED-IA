'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  href?: string;
  className?: string;
  children?: React.ReactNode;
  inline?: boolean; // Nova prop para modo inline
}

export default function BackButton({ href = '/', className = '', children, inline = false }: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (href === '/') {
      router.push('/');
    } else if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  // Se inline for true, renderiza como botão inline no cabeçalho
  if (inline) {
    return (
      <button
        onClick={handleBack}
        className={`flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 backdrop-blur-sm border border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${className}`}
        data-testid="back-button"
      >
        <ChevronLeft className="w-4 h-4" />
        {children || 'Voltar'}
      </button>
    );
  }

  // Modo padrão (inline no topo da página)
  return (
    <div className="mb-6">
      <button
        onClick={handleBack}
        className={`flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 hover:text-white rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${className}`}
        data-testid="back-button"
      >
        <ChevronLeft className="w-4 h-4" />
        {children || 'Voltar'}
      </button>
    </div>
  );
}