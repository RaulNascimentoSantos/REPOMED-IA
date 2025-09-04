import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function LaudoNew() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Novo Laudo Médico"
        description="Criar novo laudo médico"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Laudos', href: '/laudos' },
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
                Tipo de Laudo
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Selecione o tipo</option>
                <option value="clinico">Laudo Clínico</option>
                <option value="exame">Laudo de Exame</option>
                <option value="cirurgico">Laudo Cirúrgico</option>
                <option value="pericial">Laudo Pericial</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico Principal
              </label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Diagnóstico principal"
              />
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
                Descrição Detalhada
              </label>
              <textarea 
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Descrição completa do laudo..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conclusão
              </label>
              <textarea 
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Conclusão do laudo..."
              />
            </div>
            
            <div className="flex gap-4">
              <Button type="submit">
                Criar Laudo
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/laudos')}
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