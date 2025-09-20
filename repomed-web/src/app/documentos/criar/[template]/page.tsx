'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Save,
  FileText,
  Brain,
  Shield,
  Eye,
  Edit3,
  Zap,
  Clock,
  User,
  Calendar,
  Pill,
  Stethoscope,
  Award,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  Copy,
  Download,
  Printer,
  RefreshCw,
  Settings,
  Lightbulb,
  BookOpen,
  Target
} from 'lucide-react';

interface TemplateField {
  id: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'select' | 'date' | 'number' | 'time';
  required: boolean;
  options?: string[];
  aiSuggested?: boolean;
  value?: string;
}

interface DocumentTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  template: string;
  fields: TemplateField[];
  aiAssisted: boolean;
  legalCompliant: boolean;
  estimatedTime: string;
}

export default function DocumentEditorPage() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.template as string;

  const [template, setTemplate] = useState<DocumentTemplate | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [documentContent, setDocumentContent] = useState('');
  const [aiMode, setAiMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});

  // Templates de documentos médicos completos
  const templates: Record<string, DocumentTemplate> = {
    'receita': {
      id: 'receita',
      title: 'Receita Médica Simples',
      category: 'Receita',
      description: 'Template padrão para prescrições de medicamentos controlados e simples',
      template: `RECEITA MÉDICA

Paciente: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
RG: [RG_PACIENTE]
CPF: [CPF_PACIENTE]

Data: [DATA_CONSULTA]

Prescrevo:

1. [MEDICAMENTO_1]
   Posologia: [POSOLOGIA_1]
   Quantidade: [QUANTIDADE_1]

2. [MEDICAMENTO_2]
   Posologia: [POSOLOGIA_2]
   Quantidade: [QUANTIDADE_2]

3. [MEDICAMENTO_3]
   Posologia: [POSOLOGIA_3]
   Quantidade: [QUANTIDADE_3]

Orientações Gerais:
[ORIENTACOES_GERAIS]

Retorno: [DATA_RETORNO]

_____________________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO] - [CRM_ESTADO]
Especialidade: [ESPECIALIDADE]

Assinatura Digital Certificada ICP-Brasil`,
      fields: [
        { id: 'NOME_PACIENTE', label: 'Nome do Paciente', placeholder: 'Digite o nome completo', type: 'text', required: true },
        { id: 'DATA_NASCIMENTO', label: 'Data de Nascimento', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'RG_PACIENTE', label: 'RG', placeholder: 'Número do RG', type: 'text', required: false },
        { id: 'CPF_PACIENTE', label: 'CPF', placeholder: '000.000.000-00', type: 'text', required: false },
        { id: 'DATA_CONSULTA', label: 'Data da Consulta', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'MEDICAMENTO_1', label: 'Medicamento Principal', placeholder: 'Nome do medicamento', type: 'text', required: true, aiSuggested: true },
        { id: 'POSOLOGIA_1', label: 'Posologia Principal', placeholder: 'Ex: 1 comprimido de 8/8h', type: 'text', required: true, aiSuggested: true },
        { id: 'QUANTIDADE_1', label: 'Quantidade Principal', placeholder: 'Ex: 30 comprimidos', type: 'text', required: true },
        { id: 'MEDICAMENTO_2', label: 'Medicamento Secundário', placeholder: 'Nome do medicamento', type: 'text', required: false, aiSuggested: true },
        { id: 'POSOLOGIA_2', label: 'Posologia Secundária', placeholder: 'Ex: 1 comprimido de 12/12h', type: 'text', required: false, aiSuggested: true },
        { id: 'QUANTIDADE_2', label: 'Quantidade Secundária', placeholder: 'Ex: 20 comprimidos', type: 'text', required: false },
        { id: 'MEDICAMENTO_3', label: 'Medicamento Adicional', placeholder: 'Nome do medicamento', type: 'text', required: false, aiSuggested: true },
        { id: 'POSOLOGIA_3', label: 'Posologia Adicional', placeholder: 'Ex: 1 comprimido ao dia', type: 'text', required: false, aiSuggested: true },
        { id: 'QUANTIDADE_3', label: 'Quantidade Adicional', placeholder: 'Ex: 15 comprimidos', type: 'text', required: false },
        { id: 'ORIENTACOES_GERAIS', label: 'Orientações Gerais', placeholder: 'Instruções adicionais para o paciente', type: 'textarea', required: false, aiSuggested: true },
        { id: 'DATA_RETORNO', label: 'Data de Retorno', placeholder: 'DD/MM/AAAA', type: 'date', required: false },
        { id: 'NOME_MEDICO', label: 'Nome do Médico', placeholder: 'Seu nome completo', type: 'text', required: true },
        { id: 'CRM_NUMERO', label: 'Número CRM', placeholder: '123456', type: 'text', required: true },
        { id: 'CRM_ESTADO', label: 'Estado CRM', placeholder: 'SP', type: 'select', required: true, options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE', 'PB', 'AL', 'SE', 'RN', 'PI', 'MA', 'PA', 'AM', 'RR', 'AP', 'TO', 'RO', 'AC', 'MT', 'MS', 'ES', 'DF'] },
        { id: 'ESPECIALIDADE', label: 'Especialidade', placeholder: 'Sua especialidade médica', type: 'text', required: true }
      ],
      aiAssisted: true,
      legalCompliant: true,
      estimatedTime: '3 min'
    },
    'atestado': {
      id: 'atestado',
      title: 'Atestado Médico',
      category: 'Atestado',
      description: 'Atestado de saúde e capacidade laboral com validação automática',
      template: `ATESTADO MÉDICO

Atesto para os devidos fins que o(a) Sr.(a) [NOME_PACIENTE], portador(a) do RG [RG_PACIENTE] e CPF [CPF_PACIENTE], esteve sob meus cuidados médicos no dia [DATA_CONSULTA], necessitando de afastamento de suas atividades [TIPO_ATIVIDADE] pelo período de [PERIODO_AFASTAMENTO] ([PERIODO_EXTENSO]).

CID-10: [CID_CODIGO]
Diagnóstico: [DIAGNOSTICO]

Observações: [OBSERVACOES]

Data de emissão: [DATA_EMISSAO]

_____________________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO] - [CRM_ESTADO]
Especialidade: [ESPECIALIDADE]

Assinatura Digital Certificada ICP-Brasil`,
      fields: [
        { id: 'NOME_PACIENTE', label: 'Nome do Paciente', placeholder: 'Digite o nome completo', type: 'text', required: true },
        { id: 'RG_PACIENTE', label: 'RG', placeholder: 'Número do RG', type: 'text', required: true },
        { id: 'CPF_PACIENTE', label: 'CPF', placeholder: '000.000.000-00', type: 'text', required: true },
        { id: 'DATA_CONSULTA', label: 'Data da Consulta', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'TIPO_ATIVIDADE', label: 'Tipo de Atividade', placeholder: 'Ex: laborais, escolares', type: 'select', required: true, options: ['laborais', 'escolares', 'esportivas', 'acadêmicas'] },
        { id: 'PERIODO_AFASTAMENTO', label: 'Período de Afastamento', placeholder: 'Ex: 3 dias', type: 'text', required: true, aiSuggested: true },
        { id: 'PERIODO_EXTENSO', label: 'Período por Extenso', placeholder: 'Ex: três dias', type: 'text', required: true, aiSuggested: true },
        { id: 'CID_CODIGO', label: 'Código CID-10', placeholder: 'Ex: Z76.1', type: 'text', required: false, aiSuggested: true },
        { id: 'DIAGNOSTICO', label: 'Diagnóstico', placeholder: 'Descrição do diagnóstico', type: 'textarea', required: false, aiSuggested: true },
        { id: 'OBSERVACOES', label: 'Observações', placeholder: 'Informações adicionais', type: 'textarea', required: false },
        { id: 'DATA_EMISSAO', label: 'Data de Emissão', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'NOME_MEDICO', label: 'Nome do Médico', placeholder: 'Seu nome completo', type: 'text', required: true },
        { id: 'CRM_NUMERO', label: 'Número CRM', placeholder: '123456', type: 'text', required: true },
        { id: 'CRM_ESTADO', label: 'Estado CRM', placeholder: 'SP', type: 'select', required: true, options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE', 'PB', 'AL', 'SE', 'RN', 'PI', 'MA', 'PA', 'AM', 'RR', 'AP', 'TO', 'RO', 'AC', 'MT', 'MS', 'ES', 'DF'] },
        { id: 'ESPECIALIDADE', label: 'Especialidade', placeholder: 'Sua especialidade médica', type: 'text', required: true }
      ],
      aiAssisted: true,
      legalCompliant: true,
      estimatedTime: '2 min'
    },
    'declaracao': {
      id: 'declaracao',
      title: 'Declaração de Óbito',
      category: 'Declaração',
      description: 'Declaração oficial de óbito com protocolo de registro',
      template: `DECLARAÇÃO DE ÓBITO

Declaro para os devidos fins legais que o(a) paciente [NOME_PACIENTE], portador(a) do RG [RG_PACIENTE] e CPF [CPF_PACIENTE], nascido(a) em [DATA_NASCIMENTO], residente em [ENDERECO_COMPLETO], veio a óbito no dia [DATA_OBITO], às [HORA_OBITO], no local denominado [LOCAL_OBITO].

Dados do Óbito:
- Causa da Morte: [CAUSA_MORTE]
- CID-10: [CID_CODIGO]
- Tipo de Morte: [TIPO_MORTE]
- Circunstância: [CIRCUNSTANCIA]

Dados do Declarante:
- Nome: [NOME_DECLARANTE]
- Parentesco: [PARENTESCO]
- RG: [RG_DECLARANTE]
- CPF: [CPF_DECLARANTE]

Observações: [OBSERVACOES]

Local e data: [LOCAL_EMISSAO], [DATA_EMISSAO]

_____________________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO] - [CRM_ESTADO]
Especialidade: [ESPECIALIDADE]

Assinatura Digital Certificada ICP-Brasil`,
      fields: [
        { id: 'NOME_PACIENTE', label: 'Nome do Paciente', placeholder: 'Nome completo do falecido', type: 'text', required: true },
        { id: 'RG_PACIENTE', label: 'RG do Paciente', placeholder: 'Número do RG', type: 'text', required: true },
        { id: 'CPF_PACIENTE', label: 'CPF do Paciente', placeholder: '000.000.000-00', type: 'text', required: true },
        { id: 'DATA_NASCIMENTO', label: 'Data de Nascimento', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'ENDERECO_COMPLETO', label: 'Endereço Completo', placeholder: 'Endereço residencial completo', type: 'textarea', required: true },
        { id: 'DATA_OBITO', label: 'Data do Óbito', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'HORA_OBITO', label: 'Hora do Óbito', placeholder: 'HH:MM', type: 'time', required: true },
        { id: 'LOCAL_OBITO', label: 'Local do Óbito', placeholder: 'Hospital, residência, etc.', type: 'text', required: true },
        { id: 'CAUSA_MORTE', label: 'Causa da Morte', placeholder: 'Descrição da causa', type: 'textarea', required: true, aiSuggested: true },
        { id: 'CID_CODIGO', label: 'Código CID-10', placeholder: 'Ex: I21.9', type: 'text', required: true, aiSuggested: true },
        { id: 'TIPO_MORTE', label: 'Tipo de Morte', placeholder: 'Natural, acidental, etc.', type: 'select', required: true, options: ['Natural', 'Acidental', 'Suicídio', 'Homicídio', 'Indeterminada'] },
        { id: 'CIRCUNSTANCIA', label: 'Circunstância', placeholder: 'Descrição das circunstâncias', type: 'textarea', required: false },
        { id: 'NOME_DECLARANTE', label: 'Nome do Declarante', placeholder: 'Quem está declarando', type: 'text', required: true },
        { id: 'PARENTESCO', label: 'Parentesco', placeholder: 'Relação com o falecido', type: 'select', required: true, options: ['Cônjuge', 'Filho(a)', 'Pai/Mãe', 'Irmão(ã)', 'Outro familiar', 'Não familiar'] },
        { id: 'RG_DECLARANTE', label: 'RG do Declarante', placeholder: 'Número do RG', type: 'text', required: true },
        { id: 'CPF_DECLARANTE', label: 'CPF do Declarante', placeholder: '000.000.000-00', type: 'text', required: true },
        { id: 'OBSERVACOES', label: 'Observações', placeholder: 'Informações adicionais', type: 'textarea', required: false },
        { id: 'LOCAL_EMISSAO', label: 'Local de Emissão', placeholder: 'Cidade da emissão', type: 'text', required: true },
        { id: 'DATA_EMISSAO', label: 'Data de Emissão', placeholder: 'DD/MM/AAAA', type: 'date', required: true },
        { id: 'NOME_MEDICO', label: 'Nome do Médico', placeholder: 'Seu nome completo', type: 'text', required: true },
        { id: 'CRM_NUMERO', label: 'Número CRM', placeholder: '123456', type: 'text', required: true },
        { id: 'CRM_ESTADO', label: 'Estado CRM', placeholder: 'SP', type: 'select', required: true, options: ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE', 'PB', 'AL', 'SE', 'RN', 'PI', 'MA', 'PA', 'AM', 'RR', 'AP', 'TO', 'RO', 'AC', 'MT', 'MS', 'ES', 'DF'] },
        { id: 'ESPECIALIDADE', label: 'Especialidade', placeholder: 'Sua especialidade médica', type: 'text', required: true }
      ],
      aiAssisted: false,
      legalCompliant: true,
      estimatedTime: '8 min'
    }
  };

  useEffect(() => {
    if (templateId && templates[templateId]) {
      setTemplate(templates[templateId]);
      // Inicializar valores padrão
      const defaultValues: Record<string, string> = {};
      templates[templateId].fields.forEach(field => {
        defaultValues[field.id] = field.value || '';
      });
      setFieldValues(defaultValues);
      updateDocumentContent(templates[templateId], defaultValues);

      // Simular sugestões de IA
      if (templates[templateId].aiAssisted) {
        generateAISuggestions(templates[templateId]);
      }
    }
  }, [templateId]);

  const generateAISuggestions = (template: DocumentTemplate) => {
    // Simular sugestões da IA baseadas em dados médicos reais
    const suggestions: Record<string, string[]> = {};

    if (template.id === 'receita') {
      suggestions['MEDICAMENTO_1'] = [
        'Dipirona 500mg',
        'Paracetamol 750mg',
        'Ibuprofeno 600mg',
        'Amoxicilina 500mg',
        'Omeprazol 20mg',
        'Losartana 50mg',
        'Metformina 850mg',
        'Sinvastatina 20mg'
      ];
      suggestions['POSOLOGIA_1'] = [
        '1 comprimido de 8/8h por 7 dias',
        '1 comprimido de 6/6h por 10 dias',
        '1 comprimido de 12/12h por 5 dias',
        '2 comprimidos de 8/8h por 3 dias',
        '1 comprimido ao dia por 30 dias',
        '1 comprimido pela manhã em jejum'
      ];
      suggestions['ORIENTACOES_GERAIS'] = [
        'Tomar preferencialmente com alimentos para reduzir irritação gástrica',
        'Evitar exposição solar excessiva durante o tratamento',
        'Manter repouso relativo e hidratação adequada',
        'Retornar em caso de piora dos sintomas ou efeitos colaterais',
        'Não interromper o medicamento sem orientação médica',
        'Evitar bebidas alcoólicas durante o tratamento'
      ];
      suggestions['NOME_MEDICO'] = ['Dr. João Silva', 'Dra. Maria Santos', 'Dr. Pedro Oliveira'];
      suggestions['ESPECIALIDADE'] = ['Clínica Médica', 'Cardiologia', 'Endocrinologia', 'Gastroenterologia'];
    } else if (template.id === 'atestado') {
      suggestions['PERIODO_AFASTAMENTO'] = ['1 dia', '3 dias', '5 dias', '7 dias', '15 dias', '30 dias'];
      suggestions['PERIODO_EXTENSO'] = ['um dia', 'três dias', 'cinco dias', 'sete dias', 'quinze dias', 'trinta dias'];
      suggestions['CID_CODIGO'] = [
        'Z76.1 - Pessoa em contato com os serviços de saúde',
        'R50.9 - Febre não especificada',
        'K59.1 - Diarreia funcional',
        'M79.1 - Mialgia',
        'J00 - Nasofaringite aguda',
        'K30 - Dispepsia funcional',
        'R51 - Cefaleia',
        'R06.0 - Dispneia'
      ];
      suggestions['DIAGNOSTICO'] = [
        'Síndrome gripal em tratamento',
        'Gastroenterite aguda',
        'Cefaleia tensional',
        'Lombalgia aguda',
        'Hipertensão arterial em acompanhamento',
        'Diabetes mellitus em controle'
      ];
      suggestions['TIPO_ATIVIDADE'] = ['laborais', 'escolares', 'esportivas', 'acadêmicas'];
    } else if (template.id === 'declaracao') {
      suggestions['CAUSA_MORTE'] = [
        'Parada cardiorrespiratória',
        'Insuficiência respiratória aguda',
        'Choque séptico',
        'Infarto agudo do miocárdio',
        'Acidente vascular cerebral',
        'Neoplasia maligna',
        'Complicações de diabetes mellitus',
        'Insuficiência renal crônica'
      ];
      suggestions['CID_CODIGO'] = [
        'I46.9 - Parada cardíaca, não especificada',
        'J96.0 - Insuficiência respiratória aguda',
        'R57.0 - Choque cardiogênico',
        'I21.9 - Infarto agudo do miocárdio, não especificado',
        'I64 - Acidente vascular cerebral, não especificado',
        'C80.1 - Neoplasia maligna, não especificada',
        'E14.9 - Diabetes mellitus não especificado',
        'N18.6 - Doença renal crônica terminal'
      ];
    }

    setAiSuggestions(suggestions);
  };

  const updateDocumentContent = (template: DocumentTemplate, values: Record<string, string>) => {
    let content = template.template;
    template.fields.forEach(field => {
      const value = values[field.id] || `[${field.id}]`;
      content = content.replace(new RegExp(`\\[${field.id}\\]`, 'g'), value);
    });
    setDocumentContent(content);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    const newValues = { ...fieldValues, [fieldId]: value };
    setFieldValues(newValues);
    if (template) {
      updateDocumentContent(template, newValues);
    }
  };

  const applySuggestion = (fieldId: string, suggestion: string) => {
    handleFieldChange(fieldId, suggestion);

    // IA inteligente: auto-preencher campos relacionados
    if (fieldId === 'PERIODO_AFASTAMENTO' && suggestion.includes('dia')) {
      const numero = suggestion.match(/\d+/)?.[0];
      if (numero) {
        const numerosPorExtenso = {
          '1': 'um dia',
          '3': 'três dias',
          '5': 'cinco dias',
          '7': 'sete dias',
          '15': 'quinze dias',
          '30': 'trinta dias'
        };
        const extenso = numerosPorExtenso[numero as keyof typeof numerosPorExtenso];
        if (extenso) {
          handleFieldChange('PERIODO_EXTENSO', extenso);
        }
      }
    }

    // Auto-completar datas
    if (fieldId === 'DATA_CONSULTA' || fieldId === 'DATA_EMISSAO') {
      const hoje = new Date().toLocaleDateString('pt-BR');
      if (!fieldValues['DATA_CONSULTA']) {
        handleFieldChange('DATA_CONSULTA', hoje);
      }
      if (!fieldValues['DATA_EMISSAO']) {
        handleFieldChange('DATA_EMISSAO', hoje);
      }
    }
  };

  // Função para auto-preencher dados do médico
  const autoFillDoctorData = () => {
    const doctorData = {
      'NOME_MEDICO': 'Dr. João Silva',
      'CRM_NUMERO': '123456',
      'CRM_ESTADO': 'SP',
      'ESPECIALIDADE': 'Clínica Médica'
    };

    Object.entries(doctorData).forEach(([field, value]) => {
      if (!fieldValues[field]) {
        handleFieldChange(field, value);
      }
    });
  };

  // Função para validação inteligente de campos
  const validateField = (fieldId: string, value: string): string | null => {
    if (fieldId === 'CPF_PACIENTE' && value) {
      const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
      if (!cpfPattern.test(value)) {
        return 'CPF deve estar no formato 000.000.000-00';
      }
    }

    if (fieldId === 'CRM_NUMERO' && value) {
      const crmPattern = /^\d{4,6}$/;
      if (!crmPattern.test(value)) {
        return 'CRM deve conter apenas números (4-6 dígitos)';
      }
    }

    return null;
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    alert('Documento salvo com sucesso!');
  };

  const handlePreview = () => {
    setPreviewMode(!previewMode);
  };

  const handleSign = () => {
    alert('Redirecionando para assinatura digital...');
    router.push('/assinatura');
  };

  if (!template) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-3xl font-bold text-white">Carregando Template...</h1>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-white">Carregando template...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                📝 {template.title}
              </h1>
              <p className="text-slate-400 text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {template.description}
                <span className="text-green-400">• {template.estimatedTime}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* AI Mode Toggle */}
            <button
              onClick={() => setAiMode(!aiMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                aiMode
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Brain className="w-5 h-5" />
              IA {aiMode ? 'Ativa' : 'Inativa'}
            </button>

            {/* Preview Toggle */}
            <button
              onClick={handlePreview}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                previewMode
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <Eye className="w-5 h-5" />
              {previewMode ? 'Editando' : 'Visualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-400" />
                Preencher Dados
              </h3>
              <div className="flex items-center gap-2">
                {template.aiAssisted && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">IA Assistida</span>
                )}
                {template.legalCompliant && (
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">CFM Validado</span>
                )}
                <button
                  onClick={autoFillDoctorData}
                  className="flex items-center gap-1 text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  Auto-preencher Médico
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {template.fields.map((field) => {
                const fieldError = validateField(field.id, fieldValues[field.id] || '');

                return (
                  <div key={field.id} className="space-y-2">
                    <label className="block text-white font-medium">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                      {field.aiSuggested && aiMode && (
                        <span className="ml-2 text-blue-400 text-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          IA
                        </span>
                      )}
                    </label>

                    {field.type === 'textarea' ? (
                      <textarea
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors resize-none ${
                          fieldError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-green-500 focus:ring-green-500'
                        }`}
                        rows={3}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white focus:ring-1 transition-colors ${
                          fieldError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-green-500 focus:ring-green-500'
                        }`}
                      >
                        <option value="">{field.placeholder}</option>
                        {field.options?.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={fieldValues[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-white placeholder-slate-400 focus:ring-1 transition-colors ${
                          fieldError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-600 focus:border-green-500 focus:ring-green-500'
                        }`}
                      />
                    )}

                    {/* Field Error Message */}
                    {fieldError && (
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {fieldError}
                      </p>
                    )}

                    {/* AI Suggestions */}
                    {field.aiSuggested && aiMode && aiSuggestions[field.id] && (
                      <div className="space-y-2">
                        <p className="text-blue-400 text-sm flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          Sugestões da IA:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {aiSuggestions[field.id].map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => applySuggestion(field.id, suggestion)}
                              className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-3 rounded-lg transition-colors font-medium"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Rascunho
                </>
              )}
            </button>

            <button
              onClick={handleSign}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium"
            >
              <Shield className="w-4 h-4" />
              Assinar Digital
            </button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Visualização do Documento
              </h3>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                </button>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-8 text-black font-mono text-sm leading-relaxed max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap">{documentContent}</pre>
            </div>

            {/* Legal Notice */}
            <div className="mt-4 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
              <p className="text-green-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Documento em conformidade com as normas do CFM e legislação vigente
              </p>
            </div>
          </div>

          {/* Template Info */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-orange-400" />
              Informações do Template
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Categoria:</span>
                <span className="text-white">{template.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Tempo Estimado:</span>
                <span className="text-white">{template.estimatedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Campos Obrigatórios:</span>
                <span className="text-white">{template.fields.filter(f => f.required).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Assistência IA:</span>
                <span className={template.aiAssisted ? 'text-green-400' : 'text-slate-400'}>
                  {template.aiAssisted ? 'Ativa' : 'Inativa'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}