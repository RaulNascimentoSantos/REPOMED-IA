import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthLoginRequest, type AuthLoginDTO } from '@repomed/contracts';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FormField } from '../../components/ui/FormField';
import { ToastContainer } from '../../components/ui/Toast';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { toasts, push: showToast, remove: removeToast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<AuthLoginDTO>({
    resolver: zodResolver(AuthLoginRequest)
  });

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: AuthLoginDTO) => {
    setLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        showToast('success', 'Login realizado com sucesso!');
      }
    } catch (error: any) {
      showToast('error', error?.problem?.detail || error?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">RepoMed IA</h1>
          <p className="text-slate-600 mt-2">Sistema médico digital</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
            />
          </FormField>

          <FormField label="Senha" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register('password')}
            />
          </FormField>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Demo: qualquer email e senha funcionam</p>
        </div>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}