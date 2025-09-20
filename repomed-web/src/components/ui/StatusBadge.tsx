import React from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
  showIcon?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
}

const statusConfig = {
  success: {
    className: 'text-green-800',
    style: {
      backgroundColor: 'var(--status-success-bg)',
      color: 'var(--status-success-text)',
      borderColor: 'var(--status-success-border)'
    },
    icon: CheckCircle,
    ariaLabel: 'Sucesso'
  },
  warning: {
    className: 'text-yellow-800',
    style: {
      backgroundColor: 'var(--status-warning-bg)',
      color: 'var(--status-warning-text)',
      borderColor: 'var(--status-warning-border)'
    },
    icon: AlertTriangle,
    ariaLabel: 'Atenção'
  },
  error: {
    className: 'text-red-800',
    style: {
      backgroundColor: 'var(--status-error-bg)',
      color: 'var(--status-error-text)',
      borderColor: 'var(--status-error-border)'
    },
    icon: XCircle,
    ariaLabel: 'Erro crítico'
  },
  info: {
    className: 'text-blue-800',
    style: {
      backgroundColor: 'var(--status-info-bg)',
      color: 'var(--status-info-text)',
      borderColor: 'var(--status-info-border)'
    },
    icon: Info,
    ariaLabel: 'Informação'
  }
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  children,
  className,
  showIcon = true,
  'aria-live': ariaLive = 'polite',
  ...props
}) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium',
        'transition-all duration-200 ease-in-out',
        className
      )}
      style={config.style}
      role="status"
      aria-live={ariaLive}
      aria-label={`${config.ariaLabel}: ${typeof children === 'string' ? children : ''}`}
      {...props}
    >
      {showIcon && (
        <Icon
          className="w-4 h-4 flex-shrink-0"
          aria-hidden="true"
        />
      )}
      <span className="flex-1">{children}</span>
    </div>
  );
};

// Componentes especializados para contextos médicos
export const DoseBadge: React.FC<{ dose: string; frequency: string }> = ({ dose, frequency }) => (
  <StatusBadge status="info" aria-live="polite">
    <span className="font-mono">{dose}</span> - {frequency}
  </StatusBadge>
);

export const RequiredFieldBadge: React.FC<{ fieldName: string }> = ({ fieldName }) => (
  <StatusBadge status="warning" aria-live="polite">
    Campo obrigatório: {fieldName}
  </StatusBadge>
);

export const ReadyToSignBadge: React.FC = () => (
  <StatusBadge status="success" aria-live="polite">
    Documento pronto para assinatura
  </StatusBadge>
);

export const CriticalAlertBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <StatusBadge status="error" aria-live="assertive">
    {children}
  </StatusBadge>
);

export default StatusBadge;