import { useState, useRef, useEffect } from 'react';
import {
  FileText, Save, Share2, FileSignature, Mic, MicOff, 
  Brain, Zap, Eye, Download, Settings, MoreHorizontal,
  Bold, Italic, Underline, List, CheckSquare, Calendar,
  User, Stethoscope, Pill, AlertCircle, CheckCircle,
  Sparkles, Wand2, Languages, Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface EditorPanelProps {
  className?: string;
}

interface AIAssistantSuggestion {
  id: string;
  type: 'diagnosis' | 'medication' | 'text' | 'template';
  title: string;
  description: string;
  confidence: number;
  data: any;
}

interface VoiceRecording {
  isRecording: boolean;
  duration: number;
  audioBlob?: Blob;
  transcription?: string;
  medicalInfo?: any;
}

export const EditorPanel = ({ className }: EditorPanelProps) => {
  const [document, setDocument] = useState({
    id: 'new',
    title: 'Novo Documento',
    type: 'receita',
    status: 'draft',
    content: '',
    patient: null,
    template: null
  });

  const [isEditing, setIsEditing] = useState(true);
  const [aiMode, setAiMode] = useState<'off' | 'suggestions' | 'copilot'>('suggestions');
  const [aiSuggestions, setAiSuggestions] = useState<AIAssistantSuggestion[]>([]);
  const [voiceRecording, setVoiceRecording] = useState<VoiceRecording>({
    isRecording: false,
    duration: 0
  });
  
  const [selectedText, setSelectedText] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const editorRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Simulação de dados do paciente ativo
  const [activePatient] = useState({
    id: '1',
    name: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    age: 45,
    birthDate: '1978-03-15',
    allergies: ['Penicilina', 'Dipirona'],
    conditions: ['Hipertensão', 'Diabetes Tipo 2'],
    lastVisit: '2024-01-15'
  });

  // Hooks para IA e gravação de voz
  useEffect(() => {
    if (aiMode === 'copilot' && document.content) {
      // Simular sugestões da IA baseadas no conteúdo
      const suggestions = generateAISuggestions(document.content, activePatient);
      setAiSuggestions(suggestions);
    }
  }, [document.content, aiMode, activePatient]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (voiceRecording.isRecording) {
      interval = setInterval(() => {
        setVoiceRecording(prev => ({
          ...prev,
          duration: prev.duration + 1
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [voiceRecording.isRecording]);

  // Funções de manipulação de texto
  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    document.execCommand(format, false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const insertTemplate = (templateType: string) => {
    let templateContent = '';
    
    switch (templateType) {
      case 'receita':
        templateContent = `
**RECEITA MÉDICA**

Paciente: ${activePatient.name}
CPF: ${activePatient.cpf}
Data de Nascimento: ${activePatient.birthDate}

**Prescrição:**
□ Medicamento: ________________
   Dosagem: ___________________
   Posologia: __________________
   Quantidade: _________________

**Orientações:**
• Tomar conforme orientação médica
• Em caso de efeitos adversos, suspender e procurar atendimento

Data: ${new Date().toLocaleDateString()}
Médico: Dr. João Silva - CRM: 123456-SP
        `;
        break;
      case 'atestado':
        templateContent = `
**ATESTADO MÉDICO**

Atesto que o(a) paciente ${activePatient.name}, CPF ${activePatient.cpf}, esteve sob meus cuidados médicos e necessita de afastamento de suas atividades por ___ dias, a partir de ${new Date().toLocaleDateString()}.

CID-10: _______

Data: ${new Date().toLocaleDateString()}
Médico: Dr. João Silva - CRM: 123456-SP
        `;
        break;
      default:
        templateContent = 'Template não encontrado';
    }

    setDocument(prev => ({
      ...prev,
      content: templateContent,
      type: templateType
    }));
  };

  // Funcionalidade de gravação de voz
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        
        // Simular transcrição (integração com OpenAI Whisper)
        const transcription = await simulateTranscription(audioBlob);
        const medicalInfo = await extractMedicalInfo(transcription);
        
        setVoiceRecording(prev => ({
          ...prev,
          audioBlob,
          transcription,
          medicalInfo
        }));
        
        // Auto-inserir transcrição no documento
        if (transcription) {
          setDocument(prev => ({
            ...prev,
            content: prev.content + '\n\n' + transcription
          }));
        }
      };
      
      mediaRecorder.start();
      setVoiceRecording(prev => ({
        ...prev,
        isRecording: true,
        duration: 0
      }));
      
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      alert('Erro ao acessar microfone. Verifique as permissões.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && voiceRecording.isRecording) {
      mediaRecorderRef.current.stop();
      audioStreamRef.current?.getTracks().forEach(track => track.stop());
      
      setVoiceRecording(prev => ({
        ...prev,
        isRecording: false
      }));
    }
  };

  const applySuggestion = (suggestion: AIAssistantSuggestion) => {
    switch (suggestion.type) {
      case 'text':
        setDocument(prev => ({
          ...prev,
          content: prev.content + '\n' + suggestion.data.text
        }));
        break;
      case 'medication':
        const medication = `□ ${suggestion.data.name}\n   Dosagem: ${suggestion.data.dosage}\n   Posologia: ${suggestion.data.frequency}\n`;
        setDocument(prev => ({
          ...prev,
          content: prev.content + medication
        }));
        break;
      case 'diagnosis':
        const diagnosis = `Diagnóstico: ${suggestion.data.name} (CID-10: ${suggestion.data.cid10})\n`;
        setDocument(prev => ({
          ...prev,
          content: prev.content + diagnosis
        }));
        break;
    }
    
    // Remover sugestão aplicada
    setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  // Funções auxiliares de IA
  const generateAISuggestions = (content: string, patient: any): AIAssistantSuggestion[] => {
    const suggestions: AIAssistantSuggestion[] = [];
    
    // Sugestões baseadas no histórico do paciente
    if (patient.conditions.includes('Hipertensão') && !content.includes('pressão')) {
      suggestions.push({
        id: '1',
        type: 'text',
        title: 'Monitoramento de Pressão',
        description: 'Adicionar orientação sobre monitoramento da pressão arterial',
        confidence: 0.9,
        data: {
          text: 'Orientação: Manter controle diário da pressão arterial, preferencialmente pela manhã.'
        }
      });
    }
    
    if (patient.allergies.length > 0 && content.includes('medicamento')) {
      suggestions.push({
        id: '2',
        type: 'text',
        title: 'Alerta de Alergia',
        description: 'Lembrete sobre alergias do paciente',
        confidence: 0.95,
        data: {
          text: `⚠️ ATENÇÃO: Paciente alérgico a ${patient.allergies.join(', ')}`
        }
      });
    }
    
    // Sugestões de medicamentos baseadas no conteúdo
    if (content.toLowerCase().includes('dor') && !content.includes('dipirona')) {
      suggestions.push({
        id: '3',
        type: 'medication',
        title: 'Analgésico',
        description: 'Sugestão de analgésico seguro',
        confidence: 0.8,
        data: {
          name: 'Paracetamol 500mg',
          dosage: '500mg',
          frequency: '8/8h por 3 dias'
        }
      });
    }
    
    return suggestions;
  };

  const simulateTranscription = async (audioBlob: Blob): Promise<string> => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return "Paciente relata dor de cabeça há 3 dias, principalmente pela manhã. Sem febre. Sono preservado. Apetite normal. Solicita medicação para alívio da dor.";
  };

  const extractMedicalInfo = async (text: string): Promise<any> => {
    // Simular extração de informações médicas
    return {
      symptoms: ['dor de cabeça'],
      duration: '3 dias',
      severity: 'moderada',
      associatedSymptoms: [],
      requests: ['medicação para dor']
    };
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex flex-col h-full bg-white', className)}>
      {/* Header do Editor */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            <input
              type="text"
              value={document.title}
              onChange={(e) => setDocument(prev => ({ ...prev, title: e.target.value }))}
              className="text-lg font-semibold bg-transparent border-none outline-none"
            />
          </div>
          
          {/* Status do documento */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'px-2 py-1 text-xs rounded-full',
              document.status === 'draft' && 'bg-amber-100 text-amber-700',
              document.status === 'signed' && 'bg-green-100 text-green-700'
            )}>
              {document.status === 'draft' ? 'Rascunho' : 'Assinado'}
            </span>
            
            {activePatient && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <User className="w-4 h-4" />
                {activePatient.name}
              </div>
            )}
          </div>
        </div>

        {/* Ações do header */}
        <div className="flex items-center gap-2">
          {/* Gravação de voz */}
          <Button
            variant={voiceRecording.isRecording ? 'danger' : 'ghost'}
            size="sm"
            leftIcon={voiceRecording.isRecording ? <MicOff /> : <Mic />}
            onClick={voiceRecording.isRecording ? stopVoiceRecording : startVoiceRecording}
            className="relative"
          >
            {voiceRecording.isRecording ? (
              <span>Parar ({formatDuration(voiceRecording.duration)})</span>
            ) : (
              'Ditar'
            )}
            {voiceRecording.isRecording && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </Button>

          {/* Modo IA */}
          <Button
            variant={aiMode !== 'off' ? 'primary' : 'ghost'}
            size="sm"
            leftIcon={<Brain />}
            onClick={() => setAiMode(aiMode === 'off' ? 'suggestions' : aiMode === 'suggestions' ? 'copilot' : 'off')}
          >
            {aiMode === 'off' && 'IA Off'}
            {aiMode === 'suggestions' && 'IA Sugestões'}
            {aiMode === 'copilot' && 'IA Copilot'}
          </Button>

          <Button variant="ghost" size="sm" leftIcon={<Save />}>
            Salvar
          </Button>
          
          <Button variant="ghost" size="sm" leftIcon={<Share2 />}>
            Compartilhar
          </Button>
          
          <Button variant="primary" size="sm" leftIcon={<FileSignature />}>
            Assinar
          </Button>
        </div>
      </div>

      {/* Barra de ferramentas */}
      <div className="flex items-center gap-1 p-2 border-b border-neutral-100 bg-neutral-50">
        {/* Templates rápidos */}
        <select
          onChange={(e) => e.target.value && insertTemplate(e.target.value)}
          className="px-3 py-1 text-sm border border-neutral-200 rounded bg-white"
          value=""
        >
          <option value="">Inserir Template</option>
          <option value="receita">Receita Médica</option>
          <option value="atestado">Atestado</option>
          <option value="laudo">Laudo</option>
          <option value="evolucao">Evolução</option>
        </select>

        <div className="w-px h-6 bg-neutral-200 mx-2" />

        {/* Formatação */}
        <Button variant="ghost" size="xs" onClick={() => handleTextFormat('bold')}>
          <Bold className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => handleTextFormat('italic')}>
          <Italic className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => handleTextFormat('underline')}>
          <Underline className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-neutral-200 mx-2" />

        {/* Listas */}
        <Button variant="ghost" size="xs">
          <List className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="xs">
          <CheckSquare className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        {/* Contadores */}
        <div className="text-xs text-neutral-500">
          {document.content.length} caracteres
        </div>
      </div>

      {/* Área principal do editor */}
      <div className="flex-1 flex">
        {/* Editor de conteúdo */}
        <div className="flex-1 flex flex-col">
          {/* Transcrição de voz (se disponível) */}
          {voiceRecording.transcription && (
            <div className="p-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-start gap-3">
                <Volume2 className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900">Transcrição de Voz:</div>
                  <div className="text-sm text-blue-700 mt-1">{voiceRecording.transcription}</div>
                  {voiceRecording.medicalInfo && (
                    <div className="mt-2">
                      <div className="text-xs text-blue-600">Informações extraídas:</div>
                      <div className="text-xs text-blue-600">
                        Sintomas: {voiceRecording.medicalInfo.symptoms?.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setVoiceRecording(prev => ({ ...prev, transcription: undefined }))}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Editor principal */}
          <div className="flex-1 p-4">
            <textarea
              ref={editorRef as any}
              value={document.content}
              onChange={(e) => setDocument(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Comece a escrever ou use um template..."
              className="w-full h-full resize-none border-none outline-none text-sm leading-relaxed font-mono"
              style={{ fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Monaco, monospace' }}
            />
          </div>
        </div>

        {/* Painel de IA Copilot */}
        {aiMode === 'copilot' && aiSuggestions.length > 0 && (
          <div className="w-80 border-l border-neutral-200 bg-gradient-to-b from-blue-50 to-indigo-50">
            <div className="p-3 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-900">Assistente IA</span>
              </div>
            </div>
            
            <div className="p-3 space-y-3 max-h-full overflow-y-auto">
              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {suggestion.type === 'medication' && <Pill className="w-4 h-4 text-green-500" />}
                      {suggestion.type === 'diagnosis' && <Stethoscope className="w-4 h-4 text-purple-500" />}
                      {suggestion.type === 'text' && <FileText className="w-4 h-4 text-blue-500" />}
                      <span className="text-sm font-medium">{suggestion.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        suggestion.confidence >= 0.9 ? 'bg-green-500' :
                        suggestion.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                      )} />
                      <span className="text-xs text-neutral-500">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-neutral-600 mb-3">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="xs"
                      leftIcon={<CheckCircle />}
                      onClick={() => applySuggestion(suggestion)}
                      fullWidth
                    >
                      Aplicar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer com informações do paciente */}
      {activePatient && (
        <div className="p-3 border-t border-neutral-200 bg-neutral-50">
          <div className="flex items-center justify-between text-xs text-neutral-600">
            <div className="flex items-center gap-4">
              <span>Paciente: {activePatient.name}</span>
              <span>Idade: {activePatient.age} anos</span>
              {activePatient.allergies.length > 0 && (
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-500" />
                  <span className="text-red-600">
                    Alergias: {activePatient.allergies.join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div>Última atualização: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      )}
    </div>
  );
};