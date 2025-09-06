'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Heart, Shield, Stethoscope } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: 'dr.silva@repomed.com.br',
    password: 'RepomMed2025!'
  });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular autenticação
    setTimeout(() => {
      localStorage.setItem('repomed_auth', JSON.stringify({
        user: {
          id: '1',
          name: 'Dr. João Silva',
          email: credentials.email,
          crm: 'CRM-SP 123456',
          specialty: 'Cardiologia',
          avatar: 'https://ui-avatars.com/api/?name=Dr+Joao+Silva&background=3b82f6&color=fff'
        },
        token: 'repomed_token_2025'
      }));
      
      setLoading(false);
      router.push('/patients/create');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-mesh-primary flex items-center justify-center p-4">
      {/* Floating Medical Icons */}
      <div className="absolute inset-0 overflow-hidden">
        <Heart className="absolute top-20 left-20 w-8 h-8 text-red-400/20 animate-float" />
        <Stethoscope className="absolute top-40 right-32 w-10 h-10 text-blue-400/20 animate-float" style={{ animationDelay: '1s' }} />
        <Shield className="absolute bottom-32 left-32 w-6 h-6 text-green-400/20 animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md glass-strong animate-scale-fade">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center glow-blue">
            <Stethoscope className="w-10 h-10 text-white animate-pulse" />
          </div>
          
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              RepoMed IA
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Sistema Médico Enterprise v3.0
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                label="Email Médico"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                placeholder="dr.silva@repomed.com.br"
                required
                className="input-modern"
              />
            </div>

            <div className="space-y-2">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="••••••••••••"
                required
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                <span className="text-muted-foreground">Lembrar de mim</span>
              </label>
              <button type="button" className="text-blue-600 hover:text-blue-700 transition-colors">
                Esqueci a senha
              </button>
            </div>

            <Button
              type="submit"
              variant="medical"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Autenticando...</span>
                </div>
              ) : (
                'Entrar no Sistema'
              )}
            </Button>
          </form>

          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Demo Credentials</span>
              </div>
            </div>

            <div className="glass p-4 rounded-lg space-y-2 text-xs">
              <p><strong>Email:</strong> dr.silva@repomed.com.br</p>
              <p><strong>Senha:</strong> RepomMed2025!</p>
              <p className="text-muted-foreground">Já preenchidos automaticamente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Pattern Background */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-blue-600/5 to-transparent"></div>
    </div>
  );
}