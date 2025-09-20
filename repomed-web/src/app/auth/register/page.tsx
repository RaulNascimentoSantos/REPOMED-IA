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
          <p className="text-gray-600 mt-2">
            Crie sua conta profissional
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cadastrar Novo Médico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input placeholder="Nome completo" />
              <Input placeholder="CRM" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Senha" type="password" />
              <Button className="w-full">Cadastrar</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}