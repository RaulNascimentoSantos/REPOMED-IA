// CORREÇÃO CRÍTICA 6: UI/UX 2025 MEDICAL-GRADE
// Data: 31/08/2025 - Prioridade: P0
// WORKSPACE MÉDICO UNIFICADO 2025

import { useState, useEffect, useCallback } from 'react'
import { cn } from '../../lib/design-tokens.js'

export function MedicalWorkspace() {
  const [panels, setPanels] = useState({
    patient: true,
    editor: true,
    validation: true
  })
  
  const [commandOpen, setCommandOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Gerenciar conectividade
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey)) {
        switch (e.key) {
          case 'k':
            e.preventDefault()
            setCommandOpen(true)
            break
          case 'p':
            e.preventDefault()
            setPanels(p => ({ ...p, patient: !p.patient }))
            break
          case 'e':
            e.preventDefault()
            setPanels(p => ({ ...p, editor: !p.editor }))
            break
          case 'v':
            e.preventDefault()
            setPanels(p => ({ ...p, validation: !p.validation }))
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  // Persistir estado dos painéis
  useEffect(() => {
    const saved = localStorage.getItem('repomed:panels')
    if (saved) {
      try {
        setPanels(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to restore panels state:', error)
      }
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('repomed:panels', JSON.stringify(panels))
  }, [panels])
  
  const togglePanel = useCallback((panel) => {
    setPanels(prev => ({ ...prev, [panel]: !prev[panel] }))
  }, [])
  
  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--color-surface-50)' }}>
      {/* Header minimalista */}
      <WorkspaceHeader 
        onCommandOpen={() => setCommandOpen(true)}
        isOnline={isOnline}
        panels={panels}
        onTogglePanel={togglePanel}
      />
      
      {/* Workspace com 3 painéis */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel do Paciente */}
        <PatientSidebar 
          isOpen={panels.patient}
          selectedPatient={selectedPatient}
          onSelectPatient={setSelectedPatient}
        />
        
        {/* Editor Central */}
        <DocumentEditor 
          isOpen={panels.editor}
          patient={selectedPatient}
          document={currentDocument}
          onDocumentChange={setCurrentDocument}
        />
        
        {/* Painel de Validação/Assinatura */}
        <ValidationSidebar 
          isOpen={panels.validation}
          document={currentDocument}
          patient={selectedPatient}
        />
      </div>
      
      {/* Dock de Ações Flutuante */}
      <ActionDock 
        patient={selectedPatient}
        document={currentDocument}
        isOnline={isOnline}
      />
      
      {/* Command Palette */}
      <CommandPalette 
        open={commandOpen} 
        onOpenChange={setCommandOpen}
        patient={selectedPatient}
      />
    </div>
  )
}

function WorkspaceHeader({ onCommandOpen, isOnline, panels, onTogglePanel }) {
  return (
    <header 
      className="h-14 border-b flex items-center px-4"
      style={{
        borderColor: 'var(--color-border-tertiary)',
        backgroundColor: 'var(--color-surface-0)'
      }}
    >
      <div className="flex-1 flex items-center gap-4">
        {/* Logo/Title */}
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: 'var(--color-primary-600)' }}
          >
            R
          </div>
          <span 
            className="font-semibold text-lg"
            style={{ color: 'var(--color-text-primary)' }}
          >
            RepoMed IA
          </span>
        </div>
        
        {/* Search/Command */}
        <button
          onClick={onCommandOpen}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors hover:bg-opacity-80"
          style={{
            color: 'var(--color-text-secondary)',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--color-surface-100)'
            e.target.style.color = 'var(--color-text-primary)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
            e.target.style.color = 'var(--color-text-secondary)'
          }}
        >
          <span>Buscar ou executar comando</span>
          <kbd 
            className="px-1.5 py-0.5 text-xs rounded border"
            style={{
              backgroundColor: 'var(--color-surface-100)',
              borderColor: 'var(--color-border-primary)',
              color: 'var(--color-text-tertiary)'
            }}
          >
            ⌘K
          </kbd>
        </button>
      </div>
      
      {/* Panel Toggles */}
      <div className="flex items-center gap-2 mr-4">
        <PanelToggle 
          active={panels.patient}
          onClick={() => onTogglePanel('patient')}
          icon="👤"
          title="Paciente (⌘P)"
        />
        <PanelToggle 
          active={panels.editor}
          onClick={() => onTogglePanel('editor')}
          icon="📝"
          title="Editor (⌘E)"
        />
        <PanelToggle 
          active={panels.validation}
          onClick={() => onTogglePanel('validation')}
          icon="✓"
          title="Validação (⌘V)"
        />
      </div>
      
      <div className="flex items-center gap-3">
        <OfflineIndicator isOnline={isOnline} />
        <UserMenu />
      </div>
    </header>
  )
}

function PanelToggle({ active, onClick, icon, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
      style={{
        backgroundColor: active ? 'var(--color-primary-100)' : 'transparent',
        color: active ? 'var(--color-primary-700)' : 'var(--color-text-tertiary)'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.target.style.backgroundColor = 'var(--color-surface-100)'
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
    >
      {icon}
    </button>
  )
}

function PatientSidebar({ isOpen, selectedPatient, onSelectPatient }) {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    // Mock patients data
    setPatients([
      {
        id: '1',
        name: 'Maria Silva Santos',
        cpf: '123.456.789-00',
        birthDate: '1985-03-15',
        phone: '(11) 99999-9999',
        status: 'active'
      },
      {
        id: '2',
        name: 'João Oliveira',
        cpf: '987.654.321-00',
        birthDate: '1972-08-22',
        phone: '(11) 88888-8888',
        status: 'active'
      }
    ])
  }, [])
  
  if (!isOpen) return null
  
  return (
    <div 
      className="w-80 border-r overflow-hidden flex flex-col"
      style={{
        borderColor: 'var(--color-border-tertiary)',
        backgroundColor: 'var(--color-surface-0)'
      }}
    >
      {/* Search */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border-tertiary)' }}>
        <input
          type="text"
          placeholder="Buscar paciente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-md border"
          style={{
            borderColor: 'var(--color-border-primary)',
            backgroundColor: 'var(--color-surface-50)',
            color: 'var(--color-text-primary)'
          }}
        />
      </div>
      
      {/* Patient List */}
      <div className="flex-1 overflow-y-auto">
        {patients
          .filter(patient => 
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.cpf.includes(searchTerm)
          )
          .map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              isSelected={selectedPatient?.id === patient.id}
              onSelect={() => onSelectPatient(patient)}
            />
          ))
        }
      </div>
      
      {/* Add Patient */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border-tertiary)' }}>
        <button 
          className="w-full btn btn-primary btn-sm"
          onClick={() => {/* TODO: Open add patient modal */}}
        >
          + Novo Paciente
        </button>
      </div>
    </div>
  )
}

function PatientCard({ patient, isSelected, onSelect }) {
  return (
    <div
      className="p-4 border-b cursor-pointer transition-colors"
      style={{
        borderColor: 'var(--color-border-tertiary)',
        backgroundColor: isSelected ? 'var(--color-primary-50)' : 'transparent'
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.target.style.backgroundColor = 'var(--color-surface-50)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.target.style.backgroundColor = 'transparent'
        }
      }}
    >
      <div className="font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
        {patient.name}
      </div>
      <div className="text-sm mb-1" style={{ color: 'var(--color-text-secondary)' }}>
        CPF: {patient.cpf}
      </div>
      <div className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        Nascimento: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
      </div>
    </div>
  )
}

function DocumentEditor({ isOpen, patient, document, onDocumentChange }) {
  if (!isOpen) return null
  
  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--color-surface-0)' }}>
      {patient ? (
        <>
          {/* Document Header */}
          <div 
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--color-border-tertiary)' }}
          >
            <div>
              <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {document?.title || 'Novo Documento'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Paciente: {patient.name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusIndicator status={document?.status || 'draft'} />
              <button className="btn btn-sm btn-secondary">
                📋 Templates
              </button>
            </div>
          </div>
          
          {/* Editor Area */}
          <div className="flex-1 p-6">
            <div 
              className="w-full h-full min-h-96 p-4 border rounded-lg resize-none"
              style={{
                borderColor: 'var(--color-border-primary)',
                backgroundColor: 'var(--color-surface-50)'
              }}
              contentEditable
              placeholder="Digite o conteúdo do documento..."
            />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏥</div>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Selecione um paciente
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Escolha um paciente na lateral para começar a criar documentos
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ValidationSidebar({ isOpen, document, patient }) {
  if (!isOpen) return null
  
  return (
    <div 
      className="w-96 border-l flex flex-col"
      style={{
        borderColor: 'var(--color-border-tertiary)',
        backgroundColor: 'var(--color-surface-0)'
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: 'var(--color-border-tertiary)' }}>
        <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Validação e Assinatura
        </h3>
      </div>
      
      {document && patient ? (
        <div className="flex-1 p-4 space-y-4">
          {/* Validation Checks */}
          <ValidationChecks document={document} />
          
          {/* Digital Signature */}
          <DigitalSignature document={document} />
          
          {/* Actions */}
          <div className="space-y-2">
            <button className="w-full btn btn-success">
              ✓ Validar Documento
            </button>
            <button className="w-full btn btn-primary">
              ✍️ Assinar Digitalmente
            </button>
            <button className="w-full btn btn-secondary">
              📤 Enviar por WhatsApp
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl mb-2">📋</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Abra um documento para ver opções de validação
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ValidationChecks({ document }) {
  const checks = [
    { id: 'patient', label: 'Dados do paciente', status: 'success' },
    { id: 'doctor', label: 'Dados do médico', status: 'success' },
    { id: 'content', label: 'Conteúdo obrigatório', status: 'warning' },
    { id: 'dosage', label: 'Dosagens válidas', status: 'success' }
  ]
  
  return (
    <div>
      <h4 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Verificações Automáticas
      </h4>
      <div className="space-y-2">
        {checks.map(check => (
          <div key={check.id} className="flex items-center gap-3">
            <CheckIcon status={check.status} />
            <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function CheckIcon({ status }) {
  const colors = {
    success: 'var(--color-success-600)',
    warning: 'var(--color-warning-600)',
    error: 'var(--color-danger-600)'
  }
  
  const icons = {
    success: '✓',
    warning: '⚠',
    error: '✗'
  }
  
  return (
    <div 
      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
      style={{ backgroundColor: colors[status] }}
    >
      {icons[status]}
    </div>
  )
}

function DigitalSignature({ document }) {
  return (
    <div>
      <h4 className="font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
        Assinatura Digital
      </h4>
      <div className="text-sm space-y-2" style={{ color: 'var(--color-text-secondary)' }}>
        <div>Certificado: A3 ICP-Brasil</div>
        <div>Válido até: 15/03/2026</div>
        <div>CRM: 123456-SP</div>
      </div>
    </div>
  )
}

function StatusIndicator({ status }) {
  const config = {
    draft: { label: 'Rascunho', color: 'var(--color-text-secondary)' },
    pending: { label: 'Pendente', color: 'var(--color-warning-600)' },
    validated: { label: 'Validado', color: 'var(--color-success-600)' },
    signed: { label: 'Assinado', color: 'var(--color-primary-600)' },
    expired: { label: 'Expirado', color: 'var(--color-danger-600)' }
  }
  
  const { label, color } = config[status] || config.draft
  
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-medium"
      style={{
        backgroundColor: color.replace('600)', '100)'),
        color: color
      }}
    >
      {label}
    </span>
  )
}

function OfflineIndicator({ isOnline }) {
  return (
    <div 
      className="flex items-center gap-2 px-2 py-1 rounded text-xs"
      style={{
        backgroundColor: isOnline ? 'var(--color-success-100)' : 'var(--color-warning-100)',
        color: isOnline ? 'var(--color-success-800)' : 'var(--color-warning-800)'
      }}
    >
      <div 
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: isOnline ? 'var(--color-success-600)' : 'var(--color-warning-600)'
        }}
      />
      {isOnline ? 'Online' : 'Offline'}
    </div>
  )
}

function UserMenu() {
  return (
    <div className="relative">
      <button 
        className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center"
        style={{ backgroundColor: 'var(--color-primary-600)', color: 'white' }}
      >
        👨‍⚕️
      </button>
    </div>
  )
}

function ActionDock({ patient, document, isOnline }) {
  if (!patient) return null
  
  return (
    <div 
      className="fixed bottom-6 right-6 flex items-center gap-2 p-3 rounded-xl shadow-lg"
      style={{
        backgroundColor: 'var(--color-surface-0)',
        boxShadow: 'var(--shadow-xl)',
        borderColor: 'var(--color-border-tertiary)'
      }}
    >
      <ActionButton icon="🧪" label="Solicitar Exames" />
      <ActionButton icon="💊" label="Nova Receita" />
      <ActionButton icon="📄" label="Novo Atestado" />
      <ActionButton icon="📱" label="WhatsApp" disabled={!isOnline} />
    </div>
  )
}

function ActionButton({ icon, label, disabled = false, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
      style={{
        backgroundColor: disabled ? 'var(--color-surface-200)' : 'var(--color-primary-100)',
        color: disabled ? 'var(--color-text-disabled)' : 'var(--color-primary-700)'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = 'var(--color-primary-200)'
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.backgroundColor = 'var(--color-primary-100)'
        }
      }}
    >
      {icon}
    </button>
  )
}

function CommandPalette({ open, onOpenChange, patient }) {
  const [search, setSearch] = useState('')
  
  const commands = [
    { id: 'new-prescription', label: 'Nova Receita', shortcut: 'nr', icon: '💊' },
    { id: 'new-certificate', label: 'Novo Atestado', shortcut: 'na', icon: '📄' },
    { id: 'new-exam', label: 'Solicitar Exames', shortcut: 'se', icon: '🧪' },
    { id: 'validate', label: 'Validar Documento', shortcut: 'vd', icon: '✓' },
    { id: 'sign', label: 'Assinar Documento', shortcut: 'ad', icon: '✍️' },
    { id: 'whatsapp', label: 'Enviar por WhatsApp', shortcut: 'wa', icon: '📱' }
  ]
  
  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(search.toLowerCase()) ||
    cmd.shortcut.toLowerCase().includes(search.toLowerCase())
  )
  
  if (!open) return null
  
  return (
    <div 
      className="fixed inset-0 flex items-start justify-center pt-32 z-50"
      style={{ backgroundColor: 'oklch(0% 0 0 / 0.5)' }}
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="w-full max-w-lg mx-4 rounded-xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-0)',
          boxShadow: 'var(--shadow-2xl)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border-tertiary)' }}>
          <input
            type="text"
            placeholder="Digite um comando ou busque..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-lg border-none outline-none"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--color-text-primary)'
            }}
            autoFocus
          />
        </div>
        
        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredCommands.length > 0 ? (
            filteredCommands.map(command => (
              <div
                key={command.id}
                className="px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-100)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
                onClick={() => {
                  // Execute command
                  console.log('Execute:', command.id)
                  onOpenChange(false)
                }}
              >
                <span className="text-lg">{command.icon}</span>
                <div className="flex-1">
                  <div style={{ color: 'var(--color-text-primary)' }}>
                    {command.label}
                  </div>
                </div>
                <span 
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-surface-200)',
                    color: 'var(--color-text-tertiary)'
                  }}
                >
                  {command.shortcut}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
              Nenhum comando encontrado
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div 
          className="px-4 py-2 border-t text-xs flex justify-between"
          style={{
            borderColor: 'var(--color-border-tertiary)',
            color: 'var(--color-text-tertiary)',
            backgroundColor: 'var(--color-surface-50)'
          }}
        >
          <span>Use as setas para navegar</span>
          <span>Enter para executar • Esc para fechar</span>
        </div>
      </div>
    </div>
  )
}

export default MedicalWorkspace