'use client';

import BackButton from '@/app/components/BackButton';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { EmptyState } from '@/components/ui/empty-state';

export default function SettingsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Configurações
              </h1>
              <p className="text-gray-600 mt-2">
                Gerencie configurações
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <EmptyState
              title="Funcionalidade em desenvolvimento"
              description="Esta página será implementada em breve"
              action={
                <Button onClick={() => router.back()}>
                  Voltar
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}