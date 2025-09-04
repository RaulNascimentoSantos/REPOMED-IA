import * as React from 'react';

export default function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado</h1>
        <p className="text-slate-600 mb-4">Ocorreu um erro inesperado. Tente recarregar a página.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Recarregar página
        </button>
      </div>
    </div>
  );
}