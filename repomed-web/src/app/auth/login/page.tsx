'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Key, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('dr.silva@repomed.com.br');
  const [password, setPassword] = useState('RepoMed2025!');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evitar multiple submits
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setLoginAttempts(prev => prev + 1);

    try {
      // Limpar dados anteriores
      localStorage.clear();

      // Salvar dados de autenticação
      localStorage.setItem('token', 'demo-token');
      localStorage.setItem('user', JSON.stringify({
        name: 'Dr. João Silva',
        email: email,
        crm: 'CRM SP 123456'
      }));

      // Redirecionar para home
      window.location.href = '/home';

    } catch (error) {
      console.error('[LOGIN] Erro no login:', error);
      alert('Erro no login. Tente novamente.');
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* gradiente vibrante roxo-verde-laranja EXATO da imagem */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(147, 51, 234, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(245, 101, 101, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(251, 191, 36, 0.8) 0%, transparent 50%),
            linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)
          `
        }}
      />

      {/* Container central */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card principal com glassmorphism */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            {/* Logo e título */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">RepoMed IA</h1>
              <p className="text-white/80 text-base">Sistema Médico Enterprise v4.0</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Médico */}
              <div>
                <label htmlFor="email" className="block text-white/90 text-base font-medium mb-2">
                  Email Médico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="dr.silva@repomed.com.br"
                    required
                    aria-describedby="email-help"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-white/90 text-base font-medium mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/30 backdrop-blur-sm border border-white/20 rounded-xl pl-12 pr-12 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="••••••••••••"
                    required
                    aria-describedby="password-help"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Lembrar de mim e Esqueci a senha */}
              <div className="flex items-center justify-between">
                <label htmlFor="remember-me" className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember-me"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-white/20 border border-white/30 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="ml-2 text-white/80 text-base">Lembrar de mim</span>
                </label>
                <a href="/auth/forgot-password" className="text-blue-300 hover:text-blue-200 text-base transition-colors">
                  Esqueci a senha
                </a>
              </div>

              {/* Botão de entrada */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed opacity-70'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transform hover:scale-105'
                }`}
              >
                {isLoading ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-red-600/20 backdrop-blur-sm rounded-xl border border-red-400/30">
              <p className="text-red-200 text-base font-medium mb-1">DEMO CREDENTIALS</p>
              <p className="text-white/90 text-base"><strong>Email:</strong> dr.silva@repomed.com.br</p>
              <p className="text-white/90 text-base"><strong>Senha:</strong> RepoMed2025!</p>
              <p className="text-white/70 text-base mt-1">Já preenchidos automaticamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}