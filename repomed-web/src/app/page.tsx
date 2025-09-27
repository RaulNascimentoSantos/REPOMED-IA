'use client';

export default function HomePage() {
  // TEMPORÁRIO: Página estática para quebrar o loop infinito
  // TODO: Reimplementar auto-redirect quando o problema for identificado

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

          {/* Navegação manual temporária */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <a
              href="/auth/login"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </a>
            <a
              href="/home"
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Dashboard
            </a>
          </div>

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