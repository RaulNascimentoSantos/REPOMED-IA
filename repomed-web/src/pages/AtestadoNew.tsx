import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function AtestadoNew() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Novo Atestado Médico"
        description="Criar novo atestado médico"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Atestados', href: '/atestados' },
          { label: 'Novo' }
        ]}
      />
      
      <Card className="mt-6">
        <div className="p-6">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Selecione um paciente</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período de Afastamento
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Data início"
                />
                <input 
                  type="date" 
                  className="border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Data fim"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CID-10
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Ex: M54.5"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observações
              </label>
              <textarea 
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Observações adicionais (opcional)"
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit">
                Criar Atestado
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/atestados')}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}