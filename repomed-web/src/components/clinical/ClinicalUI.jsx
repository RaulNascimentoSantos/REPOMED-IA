// CORREÇÃO CRÍTICA 8: UI/UX MEDICAL-GRADE FINAL
// Data: 31/08/2025 - Prioridade: P0

import React, { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Shield, 
  Info, 
  WifiOff, 
  RefreshCw, 
  Cloud, 
  CheckCircle 
} from 'lucide-react'

// Tema medical-grade com OKLCH
export const medicalTheme = {
  colors: {
    primary: 'oklch(59% 0.15 237)',      // Azul médico
    secondary: 'oklch(65% 0.12 163)',    // Verde menta
    danger: 'oklch(53% 0.21 25)',        // Vermelho crítico
    warning: 'oklch(70% 0.15 85)',       // Âmbar alerta
    success: 'oklch(64% 0.17 145)',      // Verde sucesso
    surface: 'oklch(98% 0.01 247)',      // Branco azulado
    text: 'oklch(20% 0.02 247)',         // Quase preto
    muted: 'oklch(60% 0.03 247)'         // Cinza médio
  },
  shadows: {
    sm: '0 1px 3px oklch(0% 0 0 / 0.08)',
    md: '0 4px 12px oklch(0% 0 0 / 0.12)',
    lg: '0 8px 24px oklch(0% 0 0 / 0.16)'
  }
}

// Componente de validação com dupla confirmação
export function ValidationModal({ 
  issues = [], 
  onConfirm, 
  onCancel 
}) {
  const [reason, setReason] = useState('')
  const [reasonType, setReasonType] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [password, setPassword] = useState('')
  
  const criticalIssues = issues.filter(i => i.severity === 'critical')
  const canProceed = reason.length > 20 && reasonType && acknowledged && password
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 text-red-600 mb-6">
          <AlertTriangle className="h-5 w-5" />
          <h2 className="text-xl font-bold">Atenção: Riscos Identificados na Prescrição</h2>
        </div>
        
        <div className="space-y-4">
          {/* Issues críticas */}
          {criticalIssues.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-bold text-red-800 mb-2">Problemas Críticos Detectados</h3>
              <ul className="space-y-2">
                {criticalIssues.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-600 font-bold text-lg">⚠</span>
                    <div>
                      <p className="font-medium text-red-800">{issue.message}</p>
                      {issue.reference && (
                        <p className="text-xs text-red-600 mt-1">
                          Ref: {issue.reference}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Motivo padronizado */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Motivo para prosseguir <span className="text-red-500">*</span>
            </label>
            <select 
              value={reasonType} 
              onChange={(e) => setReasonType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione o motivo</option>
              <option value="benefit_risk">Benefício supera o risco</option>
              <option value="monitored">Paciente será monitorado</option>
              <option value="alternative_unavailable">Sem alternativa disponível</option>
              <option value="compassionate">Uso compassivo</option>
              <option value="clinical_trial">Protocolo de pesquisa</option>
              <option value="other">Outro (especificar)</option>
            </select>
          </div>
          
          {/* Justificativa detalhada */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Justificativa clínica detalhada <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Descreva a justificativa clínica para prosseguir com esta prescrição apesar dos riscos identificados..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500">
              {reason.length}/500 caracteres (mínimo 20)
            </p>
          </div>
          
          {/* Confirmação de responsabilidade */}
          <div className="flex items-start gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="acknowledge" className="text-sm font-medium cursor-pointer">
              Declaro estar ciente dos riscos identificados e assumo total 
              responsabilidade pela prescrição, garantindo o monitoramento 
              adequado do paciente.
            </label>
          </div>
          
          {/* Senha para confirmação */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Digite sua senha para confirmar <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Informação de auditoria */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-800">
                Esta ação será registrada em log de auditoria permanente com seu 
                CRM, data/hora e justificativa fornecida. O registro poderá ser 
                solicitado por autoridades regulatórias.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar e Revisar
          </button>
          <button
            onClick={() => onConfirm({
              reason,
              reasonType,
              password,
              acknowledgedAt: new Date().toISOString()
            })}
            disabled={!canProceed}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
              canProceed 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Shield className="h-4 w-4" />
            Confirmar Sob Minha Responsabilidade
          </button>
        </div>
      </div>
    </div>
  )
}

// Status de sincronização offline
export function OfflineStatus({ 
  isOnline = true, 
  pendingCount = 0, 
  isSyncing = false, 
  lastSyncAt = null 
}) {
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null // Não mostrar quando tudo está ok
  }
  
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return 'Nunca'
    
    const now = Date.now()
    const diff = now - timestamp
    
    if (diff < 60000) return 'Agora mesmo'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min atrás`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`
    return `${Math.floor(diff / 86400000)}d atrás`
  }
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <div className={`bg-white rounded-lg shadow-lg border-2 p-3 ${
        !isOnline ? 'border-orange-500 bg-orange-50' :
        isSyncing ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}>
        <div className="flex items-center gap-3">
          {/* Ícone de status */}
          <div className="relative">
            {!isOnline ? (
              <WifiOff className="h-5 w-5 text-orange-600" />
            ) : isSyncing ? (
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            ) : (
              <Cloud className="h-5 w-5 text-gray-600" />
            )}
            
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
          
          {/* Mensagem de status */}
          <div>
            <p className="text-sm font-medium">
              {!isOnline ? 'Modo Offline' : 
               isSyncing ? 'Sincronizando...' : 
               'Sincronização pendente'}
            </p>
            {pendingCount > 0 && (
              <p className="text-xs text-gray-600">
                {pendingCount} {pendingCount === 1 ? 'ação' : 'ações'} pendente{pendingCount > 1 ? 's' : ''}
              </p>
            )}
            {lastSyncAt && (
              <p className="text-xs text-gray-500">
                Última sync: {formatRelativeTime(lastSyncAt)}
              </p>
            )}
          </div>
        </div>
        
        {/* Barra de progresso */}
        {isSyncing && (
          <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
        )}
      </div>
    </div>
  )
}

// Hook para atalhos globais de teclado
export function useGlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorar se estiver digitando
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return
      }
      
      // Atalho para busca (/)
      if (e.key === '/') {
        e.preventDefault()
        const searchInput = document.getElementById('global-search')
        if (searchInput) {
          searchInput.focus()
        }
      }
      
      // Atalhos com 'g' (go to)
      if (e.key === 'g') {
        e.preventDefault()
        window.shortcutMode = 'goto'
        return
      }
      
      if (window.shortcutMode === 'goto') {
        switch(e.key) {
          case 'd': // go to documents
            window.location.href = '/documents'
            break
          case 't': // go to templates
            window.location.href = '/templates'
            break
          case 'p': // go to patients
            window.location.href = '/patients'
            break
          case 's': // go to settings
            window.location.href = '/settings'
            break
        }
        window.shortcutMode = null
      }
      
      // Atalho para assinar (.)
      if (e.key === '.') {
        e.preventDefault()
        const signButton = document.querySelector('[data-action="sign"]')
        if (signButton) {
          signButton.click()
        }
      }
      
      // Atalho para novo documento (Ctrl/Cmd + N)
      if (e.key === 'n' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        window.location.href = '/documents/create'
      }
      
      // Atalho para salvar (Ctrl/Cmd + S)
      if (e.key === 's' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const saveButton = document.querySelector('[data-action="save"]')
        if (saveButton) {
          saveButton.click()
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
}

// Componente de feedback visual para ações críticas
export function CriticalActionFeedback({ 
  message, 
  type = 'success', 
  onClose 
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose()
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [onClose])
  
  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />
      default: return <Info className="h-5 w-5 text-blue-600" />
    }
  }
  
  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200'
      case 'error': return 'bg-red-50 border-red-200'
      case 'warning': return 'bg-orange-50 border-orange-200'
      default: return 'bg-blue-50 border-blue-200'
    }
  }
  
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
      <div className={`${getBgColor()} border rounded-lg p-4 shadow-lg max-w-md`}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// CSS classes utilities
export const medicalStyles = {
  button: {
    primary: "bg-[oklch(59%_0.15_237)] text-white px-4 py-2 rounded-md font-medium hover:bg-[oklch(54%_0.15_237)] transition-colors",
    secondary: "bg-[oklch(98%_0.01_247)] text-[oklch(20%_0.02_247)] px-4 py-2 rounded-md font-medium hover:bg-[oklch(96%_0.01_247)] border border-gray-300 transition-colors",
    danger: "bg-[oklch(53%_0.21_25)] text-white px-4 py-2 rounded-md font-medium hover:bg-[oklch(48%_0.21_25)] transition-colors"
  },
  input: "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[oklch(59%_0.15_237)] focus:border-transparent",
  card: "bg-[oklch(98%_0.01_247)] rounded-lg shadow-[0_1px_3px_oklch(0%_0_0_/_0.08)] border border-gray-200 p-6"
}

export default {
  ValidationModal,
  OfflineStatus,
  useGlobalShortcuts,
  CriticalActionFeedback,
  medicalTheme,
  medicalStyles
}