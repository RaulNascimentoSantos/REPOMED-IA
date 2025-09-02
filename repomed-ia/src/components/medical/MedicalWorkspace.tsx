import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useHotkeys } from '@/hooks/use-hotkeys'
import { CommandPalette } from './CommandPalette'
import { PatientPanel } from './PatientPanel'
import { DocumentEditor } from './DocumentEditor'
import { ValidationPanel } from './ValidationPanel'
import { OfflineIndicator } from './OfflineIndicator'
import { ActionDock } from './ActionDock'

export function MedicalWorkspace() {
  const [panels, setPanels] = useState({
    patient: true,
    editor: true,
    validation: true
  })
  
  const [commandOpen, setCommandOpen] = useState(false)
  
  // Atalhos globais
  useHotkeys('cmd+k', () => setCommandOpen(true))
  useHotkeys('cmd+p', () => setPanels(p => ({ ...p, patient: !p.patient })))
  useHotkeys('cmd+e', () => setPanels(p => ({ ...p, editor: !p.editor })))
  useHotkeys('cmd+v', () => setPanels(p => ({ ...p, validation: !p.validation })))
  
  // Persistir estado dos painéis
  useEffect(() => {
    const saved = localStorage.getItem('repomed:panels')
    if (saved) {
      setPanels(JSON.parse(saved))
    }
  }, [])
  
  useEffect(() => {
    localStorage.setItem('repomed:panels', JSON.stringify(panels))
  }, [panels])
  
  return (
    <div className="h-screen flex flex-col bg-surface-50">
      {/* Header minimalista */}
      <header className="h-14 border-b border-surface-200 bg-surface-0 flex items-center px-4">
        <div className="flex-1 flex items-center gap-4">
          <button
            onClick={() => setCommandOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-100 rounded-lg transition-colors"
          >
            <span>Buscar ou executar comando</span>
            <kbd className="px-1.5 py-0.5 text-xs bg-surface-100 rounded border border-surface-300">
              ⌘K
            </kbd>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <OfflineIndicator />
          <UserMenu />
        </div>
      </header>
      
      {/* Workspace com 3 painéis */}
      <div className="flex-1 flex overflow-hidden">
        {/* Painel do Paciente */}
        <div
          className={cn(
            "border-r border-surface-200 bg-surface-0 transition-all duration-300",
            panels.patient ? "w-80" : "w-0"
          )}
        >
          {panels.patient && <PatientPanel />}
        </div>
        
        {/* Editor Central */}
        <div className="flex-1 flex flex-col">
          {panels.editor && <DocumentEditor />}
        </div>
        
        {/* Painel de Validação/Assinatura */}
        <div
          className={cn(
            "border-l border-surface-200 bg-surface-0 transition-all duration-300",
            panels.validation ? "w-96" : "w-0"
          )}
        >
          {panels.validation && <ValidationPanel />}
        </div>
      </div>
      
      {/* Dock de Ações Flutuante */}
      <ActionDock />
      
      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}

// Command Palette com IA
function CommandPalette({ open, onOpenChange }) {
  const [search, setSearch] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState([])
  
  // Buscar sugestões de IA
  useEffect(() => {
    if (search.length > 2) {
      fetchAISuggestions(search).then(setAiSuggestions)
    }
  }, [search])
  
  const commands = [
    {
      category: 'Documentos',
      items: [
        { id: 'new-prescription', label: 'Nova Receita', shortcut: 'nr' },
        { id: 'new-certificate', label: 'Novo Atestado', shortcut: 'na' },
        { id: 'new-exam', label: 'Solicitar Exames', shortcut: 'se' }
      ]
    },
    {
      category: 'Ações',
      items: [
        { id: 'validate', label: 'Validar Prescrição', shortcut: 'vp' },
        { id: 'sign', label: 'Assinar Documento', shortcut: 'ad' },
        { id: 'share-whatsapp', label: 'Enviar por WhatsApp', shortcut: 'wa' }
      ]
    },
    {
      category: 'Navegação',
      items: [
        { id: 'go-documents', label: 'Ir para Documentos', shortcut: 'gd' },
        { id: 'go-patients', label: 'Ir para Pacientes', shortcut: 'gp' },
        { id: 'go-templates', label: 'Ir para Templates', shortcut: 'gt' }
      ]
    }
  ]
  
  // Adicionar sugestões de IA
  if (aiSuggestions.length > 0) {
    commands.unshift({
      category: 'Sugestões IA',
      items: aiSuggestions
    })
  }
  
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Digite um comando ou busque..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
        
        {commands.map((group) => (
          <CommandGroup key={group.category} heading={group.category}>
            {group.items.map((command) => (
              <CommandItem
                key={command.id}
                value={command.label}
                onSelect={() => {
                  executeCommand(command.id)
                  onOpenChange(false)
                }}
              >
                <span>{command.label}</span>
                {command.shortcut && (
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  )
}