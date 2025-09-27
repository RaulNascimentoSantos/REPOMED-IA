import { useState, useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import {
  Search, FileText, User, Calendar, Pill,
  Stethoscope, Edit3, Send, Brain,
  Clock, ArrowRight, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAI } from '@/hooks/useAI';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette = ({ open, onClose }: CommandPaletteProps) => {
  const [search, setSearch] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const router = useRouter();
  const { getSuggestions } = useAI();

  const actions = [
    {
      category: 'Documentos',
      items: [
        { icon: FileText, label: 'Nova Receita', shortcut: '⌘R', action: () => router.push('/documentos/criar/receita') },
        { icon: Edit3, label: 'Novo Atestado', shortcut: '⌘A', action: () => router.push('/documentos/criar/atestado') },
        { icon: Stethoscope, label: 'Solicitação de Exames', shortcut: '⌘E', action: () => router.push('/documentos/criar/exames') },
      ]
    },
    {
      category: 'Pacientes',
      items: [
        { icon: User, label: 'Buscar Paciente', shortcut: '⌘P', action: () => router.push('/pacientes') },
        { icon: User, label: 'Novo Paciente', shortcut: '⌘N', action: () => router.push('/pacientes/novo') },
      ]
    },
    {
      category: 'IA Assistente',
      items: [
        { icon: Brain, label: 'Sugerir Diagnóstico', shortcut: '⌘D', action: () => setAiMode(true) },
        { icon: Pill, label: 'Verificar Interações', shortcut: '⌘I', action: () => {} },
        { icon: Sparkles, label: 'Preencher com IA', shortcut: '⌘F', action: () => {} },
      ]
    }
  ];
  
  return (
    <Command.Dialog
      open={open}
      onOpenChange={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]"
    >
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b border-neutral-200 px-4">
          <Search className="w-5 h-5 text-neutral-400" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder={aiMode ? "Descreva o que precisa..." : "Buscar comandos, pacientes ou documentos..."}
            className="w-full px-3 py-4 text-base bg-transparent outline-none"
          />
          {aiMode && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-base font-medium text-purple-600">IA Mode</span>
            </div>
          )}
        </div>
        
        {/* Results */}
        <Command.List className="max-h-96 overflow-y-auto p-2">
          {!aiMode ? (
            <>
              {/* Recent Items */}
              <Command.Group heading="Recentes" className="text-base text-neutral-500 px-2 py-1.5">
                <Command.Item className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-pointer">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span className="flex-1">Maria Silva - Receita</span>
                  <span className="text-base text-neutral-400">2 min atrás</span>
                </Command.Item>
              </Command.Group>
              
              {/* Actions */}
              {actions.map((group) => (
                <Command.Group key={group.category} heading={group.category} className="text-base text-neutral-500 px-2 py-1.5 mt-3">
                  {group.items.map((item) => (
                    <Command.Item
                      key={item.label}
                      onSelect={item.action}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-pointer group"
                    >
                      <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center group-hover:bg-primary-100">
                        <item.icon className="w-4 h-4 text-neutral-600 group-hover:text-primary-600" />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      <kbd className="px-2 py-0.5 text-base bg-neutral-100 border border-neutral-200 rounded">
                        {item.shortcut}
                      </kbd>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </>
          ) : (
            /* AI Suggestions */
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <Brain className="w-5 h-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-lg font-medium">Sugestão de IA</p>
                  <p className="text-base text-neutral-600">Baseado no histórico do paciente</p>
                </div>
              </div>
              
              {/* AI Results would go here */}
            </div>
          )}
        </Command.List>
        
        {/* Footer */}
        <div className="border-t border-neutral-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4 text-base text-neutral-500">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded">↑↓</kbd>
              Navegar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded">↵</kbd>
              Selecionar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 rounded">esc</kbd>
              Fechar
            </span>
          </div>
          
          <button
            onClick={() => setAiMode(!aiMode)}
            className="flex items-center gap-2 px-3 py-1 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-base font-medium">IA Mode</span>
          </button>
        </div>
      </div>
    </Command.Dialog>
  );
};