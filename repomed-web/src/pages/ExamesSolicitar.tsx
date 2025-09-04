import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';

export default function ExamesSolicitar() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Solicitar Exame"
        description="Criar nova solicitação de exame"
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Exames', href: '/exames' },
          { label: 'Solicitar' }
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
                Tipo de Exame
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="">Selecione o tipo</option>
                <option value="sangue">Exames de Sangue</option>
                <option value="imagem">Exames de Imagem</option>
                <option value="urina">Exames de Urina</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exames Específicos
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Hemograma completo
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Glicemia em jejum
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Colesterol total
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  TSH
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suspeita Clínica / Indicação
              </label>
              <textarea 
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Descreva a suspeita clínica ou indicação para os exames..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Urgência
              </label>
              <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
                <option value="emergencia">Emergência</option>
              </select>
            </div>
            
            <div className="flex gap-4">
              <Button type="submit">
                Solicitar Exames
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/exames')}
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