import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from './button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive' | 'medical';
  isLoading?: boolean;
  error?: string;
  prescriptionSummary?: {
    patientName: string;
    medications: string[];
    totalItems: number;
  };
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  isLoading = false,
  error,
  prescriptionSummary
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus trap e gerenciamento de foco
  useEffect(() => {
    if (isOpen) {
      // Foco inicial no botão primário
      setTimeout(() => {
        if (variant === 'destructive') {
          cancelButtonRef.current?.focus();
        } else {
          confirmButtonRef.current?.focus();
        }
      }, 100);

      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';

      // Event listener para ESC
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      // Focus trap
      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (focusableElements && focusableElements.length > 0) {
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen, onClose, variant]);

  if (!isOpen) return null;

  const summaryId = prescriptionSummary ? 'prescription-summary' : undefined;

  const variantStyles = {
    default: {
      icon: CheckCircle,
      iconColor: 'text-blue-500',
      confirmVariant: 'default' as const
    },
    destructive: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      confirmVariant: 'destructive' as const
    },
    medical: {
      icon: CheckCircle,
      iconColor: 'text-green-500',
      confirmVariant: 'default' as const
    }
  };

  const currentVariant = variantStyles[variant];
  const Icon = currentVariant.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby={summaryId || 'dialog-description'}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className={cn(
          'relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl',
          'max-w-md w-full mx-4 p-6',
          'border border-slate-200 dark:border-slate-700',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={cn('flex-shrink-0 mt-1', currentVariant.iconColor)}>
            <Icon className="w-6 h-6" aria-hidden="true" />
          </div>

          <div className="flex-1">
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2"
            >
              {title}
            </h2>

            <p
              id="dialog-description"
              className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              {description}
            </p>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'flex-shrink-0 p-1 rounded-lg',
              'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
              'hover:bg-slate-100 dark:hover:bg-slate-700',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            )}
            aria-label="Fechar diálogo"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prescription Summary */}
        {prescriptionSummary && (
          <div
            id="prescription-summary"
            className={cn(
              'mb-4 p-4 rounded-lg',
              'bg-slate-50 dark:bg-slate-700/50',
              'border border-slate-200 dark:border-slate-600'
            )}
          >
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
              Resumo da Prescrição
            </h3>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <p><strong>Paciente:</strong> {prescriptionSummary.patientName}</p>
              <p><strong>Medicamentos:</strong> {prescriptionSummary.totalItems} item(s)</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                {prescriptionSummary.medications.slice(0, 3).map((med, index) => (
                  <li key={index}>{med}</li>
                ))}
                {prescriptionSummary.medications.length > 3 && (
                  <li>... e mais {prescriptionSummary.medications.length - 3} medicamento(s)</li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="min-w-[80px]"
          >
            {cancelText}
          </Button>

          {error ? (
            <Button
              variant="outline"
              onClick={onClose}
              className="min-w-[80px]"
            >
              Revisar
            </Button>
          ) : (
            <Button
              ref={confirmButtonRef}
              variant={currentVariant.confirmVariant}
              onClick={onConfirm}
              disabled={isLoading}
              className="min-w-[80px]"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Processando...
                </div>
              ) : (
                confirmText
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;