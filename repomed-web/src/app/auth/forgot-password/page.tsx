'use client';

import BackButton from '@/app/components/BackButton';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data logic here
    setLoading(false);
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorBoundary>{error}</ErrorBoundary>;

  return (
    <>
      <BackButton href="/" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Recuperar Senha
          </h1>
          <p className="text-base mt-2" style={{color: 'var(--text-aaa-secondary)'}}>
            Digite seu email para recuperar o acesso
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recuperar Senha</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                // Add password recovery logic here
                alert('Link de recuperação enviado para seu email!');
                router.push('/auth/login');
              }}
            >
              <div>
                <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-2">
                  Email Cadastrado *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="dr.silva@hospital.com.br"
                  required
                  aria-describedby="email-help"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
                <p id="email-help" className="text-base mt-1" style={{color: 'var(--text-aaa-secondary)'}}>
                  Enviaremos instruções para redefinir sua senha
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  Enviar Link de Recuperação
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Voltar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}