/**
 * RepoMed IA v6.0 - Advanced Medical Form Wrapper
 *
 * Componente wrapper avançado para formulários médicos que integra:
 * - Auto-save inteligente com versionamento
 * - Validação em tempo real específica para medicina
 * - Tema clínico otimizado para profissionais de saúde
 * - Indicadores visuais de status e progresso
 * - Accessibilidade WCAG AA para equipamentos médicos
 * - Offline-first com sincronização automática
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  RotateCcw,
  Shield,
  Activity,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useMedicalAutoSave } from '@/hooks/useMedicalAutoSave';
import { useMedicalValidation } from '@/hooks/useMedicalValidation';

interface MedicalFormWrapperProps {
  children: React.ReactNode;
  formId: string;
  documentType: 'prescription' | 'certificate' | 'report' | 'exam' | 'general';
  formData: any;
  onDataChange: (data: any) => void;
  onSubmit?: (data: any) => Promise<boolean>;
  className?: string;
  criticalData?: boolean;
  enableAutoSave?: boolean;
  enableValidation?: boolean;
  showStatusBar?: boolean;
}

export default function MedicalFormWrapper({
  children,
  formId,
  documentType,
  formData,
  onDataChange,
  onSubmit,
  className = '',
  criticalData = false,
  enableAutoSave = true,
  enableValidation = true,
  showStatusBar = true
}: MedicalFormWrapperProps) {
  const [submitting, setSubmitting] = useState(false);
  const [lastUserAction, setLastUserAction] = useState<Date>(new Date());

  // Auto-save hook
  const autoSave = useMedicalAutoSave(formData, {
    key: `${documentType}_${formId}`,
    criticalData,
    enableVersioning: true,
    onSave: async (data, version) => {
      console.log(`[MedicalForm] Auto-save executado - v${version}`);
      // Em produção, enviaria para o servidor
      return true;
    },
    onRestore: (data) => {
      console.log('[MedicalForm] Dados restaurados do auto-save');
      onDataChange(data);
    },
    onError: (error) => {
      console.error('[MedicalForm] Erro no auto-save:', error);
    }
  });

  // Validation hook
  const validation = useMedicalValidation(formData, {
    documentType,
    realTimeValidation: enableValidation,
    enableMedicalRules: true,
    enableRegulatoryCheck: true
  });

  // Atualizar timestamp da última ação do usuário
  const updateUserAction = useCallback(() => {
    setLastUserAction(new Date());
  }, []);

  // Manipular mudanças no formulário
  const handleFormChange = useCallback((newData: any) => {
    onDataChange(newData);
    updateUserAction();
  }, [onDataChange, updateUserAction]);

  // Submissão manual do formulário
  const handleSubmit = useCallback(async () => {
    if (!onSubmit || submitting) return;

    setSubmitting(true);

    try {
      // Validar antes de submeter
      const validationResults = await validation.validate();
      const hasErrors = validationResults.some(r => r.severity === 'error');

      if (hasErrors) {
        console.warn('[MedicalForm] Formulário possui erros, não será submetido');
        return false;
      }

      // Forçar save antes de submeter
      await autoSave.forceSave();

      // Submeter
      const success = await onSubmit(formData);

      if (success) {
        console.log('[MedicalForm] Formulário submetido com sucesso');
        autoSave.clearData(); // Limpar auto-save após sucesso
      }

      return success;

    } catch (error) {
      console.error('[MedicalForm] Erro na submissão:', error);
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [onSubmit, submitting, validation, autoSave, formData]);

  // Status geral do formulário
  const getFormStatus = () => {
    if (submitting) return 'submitting';
    if (autoSave.isSaving) return 'saving';
    if (!validation.isValid && validation.errors.length > 0) return 'invalid';
    if (validation.warnings.length > 0) return 'warning';
    if (autoSave.hasUnsavedChanges) return 'unsaved';
    return 'valid';
  };

  const formStatus = getFormStatus();

  // Componente de indicador de status
  const StatusIndicator = () => {
    const getStatusConfig = () => {
      switch (formStatus) {
        case 'submitting':
          return {
            icon: Activity,
            text: 'Enviando...',
            className: 'text-blue-600 bg-blue-50 border-blue-200'
          };
        case 'saving':
          return {
            icon: Save,
            text: 'Salvando...',
            className: 'text-indigo-600 bg-indigo-50 border-indigo-200'
          };
        case 'invalid':
          return {
            icon: AlertTriangle,
            text: `${validation.errors.length} erro(s)`,
            className: 'text-red-600 bg-red-50 border-red-200'
          };
        case 'warning':
          return {
            icon: AlertCircle,
            text: `${validation.warnings.length} aviso(s)`,
            className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
          };
        case 'unsaved':
          return {
            icon: Clock,
            text: 'Alterações não salvas',
            className: 'text-gray-600 bg-gray-50 border-gray-200'
          };
        case 'valid':
          return {
            icon: CheckCircle,
            text: 'Formulário válido',
            className: 'text-green-600 bg-green-50 border-green-200'
          };
        default:
          return {
            icon: FileText,
            text: 'Carregando...',
            className: 'text-gray-600 bg-gray-50 border-gray-200'
          };
      }
    };

    const config = getStatusConfig();
    const IconComponent = config.icon;

    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${config.className}`}>
        <IconComponent className="w-4 h-4" />
        <span className="text-sm font-medium">{config.text}</span>
      </div>
    );
  };

  // Componente de barra de status
  const StatusBar = () => {
    if (!showStatusBar) return null;

    return (
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <StatusIndicator />

            {/* Indicador de conectividade */}
            <div className="flex items-center space-x-2">
              {autoSave.isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-600">
                {autoSave.isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Última vez salvo */}
            {autoSave.lastSaved && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Salvo: {autoSave.lastSaved.toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}

            {/* Versioning info */}
            {autoSave.currentVersion > 1 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <RotateCcw className="w-4 h-4" />
                <span>v{autoSave.currentVersion}</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {/* Botão de save manual */}
            <button
              onClick={() => autoSave.forceSave()}
              disabled={autoSave.isSaving || !autoSave.hasUnsavedChanges}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                autoSave.hasUnsavedChanges && !autoSave.isSaving
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </button>

            {/* Botão de submissão */}
            {onSubmit && (
              <button
                onClick={handleSubmit}
                disabled={submitting || !validation.isValid || autoSave.isSaving}
                className={`flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  validation.isValid && !submitting && !autoSave.isSaving
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{submitting ? 'Enviando...' : 'Finalizar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mensagens de validação */}
        {(validation.errors.length > 0 || validation.warnings.length > 0) && (
          <div className="mt-3 space-y-2">
            {validation.errors.map((error, index) => (
              <div key={`error-${index}`} className="flex items-center space-x-2 text-sm text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span><strong>{error.field}:</strong> {error.message}</span>
              </div>
            ))}
            {validation.warnings.map((warning, index) => (
              <div key={`warning-${index}`} className="flex items-center space-x-2 text-sm text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span><strong>{warning.field}:</strong> {warning.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`clinical-card clinical-form-wrapper ${className}`}>
      {/* Header com informações do documento */}
      <div className="clinical-card-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              criticalData
                ? 'clinical-priority-critical'
                : 'bg-blue-100 text-blue-800'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {documentType === 'prescription' && 'Prescrição Médica'}
                {documentType === 'certificate' && 'Atestado Médico'}
                {documentType === 'report' && 'Relatório Médico'}
                {documentType === 'exam' && 'Exame Médico'}
                {documentType === 'general' && 'Documento Médico'}
              </h3>
              <p className="text-sm text-gray-600">
                ID: {formId} | {criticalData ? 'Crítico' : 'Normal'}
              </p>
            </div>
          </div>

          {/* Status rápido */}
          <StatusIndicator />
        </div>
      </div>

      {/* Conteúdo do formulário */}
      <div className="clinical-card-content clinical-font-primary">
        <div
          onChange={updateUserAction}
          onInput={updateUserAction}
          onClick={updateUserAction}
          onKeyDown={updateUserAction}
        >
          {children}
        </div>
      </div>

      {/* Barra de status */}
      <StatusBar />
    </div>
  );
}