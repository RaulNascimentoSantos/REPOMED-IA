import { User, FileText, Calendar } from 'lucide-react';

interface PatientPanelProps {
  collapsed: boolean;
}

export const PatientPanel = ({ collapsed }: PatientPanelProps) => {
  if (collapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="transform -rotate-90 whitespace-nowrap text-sm font-medium text-neutral-500">
          Paciente
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <h3 className="font-medium flex items-center gap-2">
          <User className="w-4 h-4" />
          Dados do Paciente
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-900">Maria Silva Santos</p>
          <p className="text-xs text-neutral-500">CPF: 123.456.789-00</p>
          <p className="text-xs text-neutral-500">Nascimento: 15/03/1980</p>
          <p className="text-xs text-neutral-500">Idade: 44 anos</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Contato</h4>
          <p className="text-xs text-neutral-500">(11) 99999-9999</p>
          <p className="text-xs text-neutral-500">maria@email.com</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Plano de Saúde</h4>
          <p className="text-xs text-neutral-500">Unimed Nacional</p>
          <p className="text-xs text-neutral-500">Cartão: 123456789</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Alergias</h4>
          <div className="flex flex-wrap gap-1">
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              Penicilina
            </span>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
              Dipirona
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-medium text-neutral-700">Últimas Consultas</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Calendar className="w-3 h-3" />
              <span>12/01/2024 - Consulta Geral</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <FileText className="w-3 h-3" />
              <span>10/01/2024 - Receita</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};