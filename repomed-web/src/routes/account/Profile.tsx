import * as React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';

export default function Profile(){
  const { logout } = useAuth();
  
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Perfil</h1>
      <div className="mt-4 bg-white rounded-2xl border p-4 max-w-md">
        <p className="text-slate-500 mb-4">Ajuste seus dados básicos aqui.</p>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> demo@repomed.ia</p>
          <p><strong>Nome:</strong> Usuário Demo</p>
          <p><strong>Função:</strong> Médico</p>
          <p><strong>CRM:</strong> 12345-SP</p>
        </div>
        <div className="mt-4 pt-4 border-t">
          <Button variant="secondary" onClick={logout}>
            Sair da conta
          </Button>
        </div>
      </div>
    </div>
  );
}