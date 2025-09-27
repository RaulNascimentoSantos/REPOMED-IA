'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) return <ErrorBoundary>{error}</ErrorBoundary>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Registro Médico
              </h1>
            </div>
          </div>
          <p className="text-base mt-2" style={{color: 'var(--text-aaa-secondary)'}}>
            Crie sua conta profissional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                // Add registration logic here
                router.push('/auth/login');
              }}
            >
              <div>
                <label htmlFor="fullName" className="block text-gray-700 text-base font-medium mb-2">
                  Nome Completo *
                </label>
                <Input
                  id="fullName"
                  placeholder="Dr. João Silva"
                  required
                  aria-describedby="fullName-help"
                />
              </div>

              <div>
                <label htmlFor="crm" className="block text-gray-700 text-base font-medium mb-2">
                  CRM *
                </label>
                <Input
                  id="crm"
                  placeholder="CRM SP 123456"
                  required
                  aria-describedby="crm-help"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 text-base font-medium mb-2">
                  Email Profissional *
                </label>
                <Input
                  id="email"
                  placeholder="dr.silva@hospital.com.br"
                  type="email"
                  required
                  aria-describedby="email-help"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 text-base font-medium mb-2">
                  Senha *
                </label>
                <Input
                  id="password"
                  placeholder="Mínimo 8 caracteres"
                  type="password"
                  required
                  aria-describedby="password-help"
                  minLength={8}
                />
              </div>

              <Button type="submit" className="w-full">Cadastrar Médico</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}