'use client';

import React from 'react';
import { UserPlus, FileText, Calendar, ClipboardList, TestTube, Stethoscope } from 'lucide-react';

interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
}

const defaultActions: QuickAction[] = [
  { id: 'new-patient', label: 'Novo Paciente', description: 'Cadastrar paciente', icon: <UserPlus size={20} /> },
  { id: 'new-prescription', label: 'Nova Prescrição', description: 'Receita médica', icon: <FileText size={20} /> },
  { id: 'schedule', label: 'Agendamento', description: 'Consultas e exames', icon: <Calendar size={20} /> },
  { id: 'records', label: 'Prontuários', description: 'Histórico médico', icon: <ClipboardList size={20} /> },
  { id: 'exams', label: 'Exames', description: 'Resultados e laudos', icon: <TestTube size={20} /> },
  { id: 'consultations', label: 'Consultas', description: 'Atendimento médico', icon: <Stethoscope size={20} /> }
];

export function QuickActions({
  actions = defaultActions,
  onActionClick
}: {
  actions?: QuickAction[];
  onActionClick?: (actionId: string) => void;
}) {
  return (
    <section>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Ações Rápidas</h2>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <div
            key={action.id}
            className="quick-action-card"
            data-action={action.id}
            onClick={() => onActionClick?.(action.id)}
            tabIndex={0}
            role="button"
            aria-label={`${action.label} - ${action.description}`}
          >
            <div className="icon">{action.icon}</div>
            <h3>{action.label}</h3>
            <p>{action.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}