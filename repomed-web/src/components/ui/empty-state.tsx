'use client';
import { ReactNode } from 'react';
import { FileX, Search, Users, Calendar, FileText } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  type?: 'default' | 'search' | 'patients' | 'appointments' | 'documents';
}

const typeIcons = {
  default: FileX,
  search: Search,
  patients: Users,
  appointments: Calendar,
  documents: FileText,
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  type = 'default'
}: EmptyStateProps) {
  const IconComponent = typeIcons[type];
  const displayIcon = icon || <IconComponent className="h-12 w-12" style={{ color: 'var(--text-aaa-secondary)' }} />;

  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-8 text-center',
      'min-h-[300px] rounded-lg border-2 border-dashed border-gray-200',
      'bg-gray-50/50',
      className
    )}>
      <div className="mb-4">
        {displayIcon}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="mb-6 max-w-sm" style={{ color: 'var(--text-aaa-secondary)' }}>
          {description}
        </p>
      )}
      
      {action}
    </div>
  );
}

// Componentes pré-configurados para casos comuns
export function EmptyPatients({ onAddPatient }: { onAddPatient?: () => void }) {
  return (
    <EmptyState
      type="patients"
      title="Nenhum paciente cadastrado"
      description="Comece adicionando seu primeiro paciente para gerenciar consultas e prescrições."
      action={
        onAddPatient && (
          <Button onClick={onAddPatient}>
            Adicionar Primeiro Paciente
          </Button>
        )
      }
    />
  );
}

export function EmptyDocuments({ onCreateDocument }: { onCreateDocument?: () => void }) {
  return (
    <EmptyState
      type="documents"
      title="Nenhum documento encontrado"
      description="Crie seu primeiro documento médico ou prescrição."
      action={
        onCreateDocument && (
          <Button onClick={onCreateDocument}>
            Criar Novo Documento
          </Button>
        )
      }
    />
  );
}

export function EmptySearchResults({ query, onClearSearch }: { query?: string; onClearSearch?: () => void }) {
  return (
    <EmptyState
      type="search"
      title={`Nenhum resultado para "${query}"`}
      description="Tente ajustar os termos de busca ou limpar os filtros."
      action={
        onClearSearch && (
          <Button variant="outline" onClick={onClearSearch}>
            Limpar Busca
          </Button>
        )
      }
    />
  );
}