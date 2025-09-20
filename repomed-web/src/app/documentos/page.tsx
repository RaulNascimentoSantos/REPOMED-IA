'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Pill,
  FileCheck,
  BookOpen,
  UserPlus,
  Shield,
  Search,
  Filter,
  Plus,
  Edit3,
  Save,
  Download,
  Printer,
  Eye,
  Clock,
  Brain,
  Zap,
  Star,
  Copy,
  Settings,
  ChevronRight,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';


export default function DocumentosPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [viewMode, setViewMode] = useState('cards');

  const templates = [
    {
      id: 1,
      title: 'Receita Médica Simples',
      description: 'Template padrão para prescrições de medicamentos controlados e não controlados',
      icon: Pill,
      category: 'receita' as const,
      usageCount: 156,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '2 min',
      fields: ['Paciente', 'Medicamento', 'Posologia', 'Quantidade', 'Orientações'],
      template: `RECEITA MÉDICA

Paciente: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
Endereço: [ENDERECO_PACIENTE]

Prescrevo:

1. [MEDICAMENTO_1]
   Posologia: [POSOLOGIA_1]
   Quantidade: [QUANTIDADE_1]

2. [MEDICAMENTO_2]
   Posologia: [POSOLOGIA_2]
   Quantidade: [QUANTIDADE_2]

Orientações Gerais:
[ORIENTACOES_MEDICAS]

Data: [DATA_CONSULTA]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]`
    },
    {
      id: 2,
      title: 'Atestado Médico',
      description: 'Atestado de saúde e capacidade laboral com validação automática',
      icon: FileCheck,
      category: 'atestado' as const,
      usageCount: 89,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'ontem',
      estimatedTime: '1 min',
      fields: ['Paciente', 'Dias de Afastamento', 'CID', 'Motivo'],
      template: `ATESTADO MÉDICO

Atesto para os devidos fins que o(a) paciente [NOME_PACIENTE], portador(a) do RG nº [RG_PACIENTE], esteve sob meus cuidados médicos no dia [DATA_CONSULTA].

O paciente apresenta [CONDICAO_MEDICA] (CID: [CODIGO_CID]), necessitando de afastamento de suas atividades laborais por [DIAS_AFASTAMENTO] dias, a partir de [DATA_INICIO].

Recomenda-se [RECOMENDACOES_MEDICAS].

Data: [DATA_EMISSAO]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]
Especialidade: [ESPECIALIDADE]`
    },
    {
      id: 3,
      title: 'Laudo Médico Completo',
      description: 'Laudo detalhado com diagnóstico e recomendações terapêuticas',
      icon: BookOpen,
      category: 'laudo' as const,
      usageCount: 45,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: '2 dias',
      estimatedTime: '5 min',
      fields: ['Paciente', 'Exame Realizado', 'Diagnóstico', 'Tratamento'],
      template: `LAUDO MÉDICO

DADOS DO PACIENTE:
Nome: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
Sexo: [SEXO_PACIENTE]
Data do Exame: [DATA_EXAME]

HISTÓRIA CLÍNICA:
[HISTORIA_CLINICA]

EXAME FÍSICO:
[EXAME_FISICO]

EXAMES COMPLEMENTARES:
[EXAMES_COMPLEMENTARES]

DIAGNÓSTICO:
[DIAGNOSTICO_PRINCIPAL]
CID: [CODIGO_CID]

CONDUTA TERAPÊUTICA:
[TRATAMENTO_RECOMENDADO]

PROGNÓSTICO:
[PROGNOSTICO]

Data: [DATA_LAUDO]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]
Especialidade: [ESPECIALIDADE]`
    },
    {
      id: 4,
      title: 'Relatório de Consulta',
      description: 'Relatório detalhado da consulta médica realizada',
      icon: FileText,
      category: 'relatorio' as const,
      usageCount: 234,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '3 min',
      fields: ['Paciente', 'Queixa Principal', 'Conduta', 'Retorno'],
      template: `RELATÓRIO DE CONSULTA MÉDICA

DADOS DO PACIENTE:
Nome: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
Data da Consulta: [DATA_CONSULTA]

ANAMNESE:
Queixa Principal: [QUEIXA_PRINCIPAL]
História da Doença Atual: [HDA]
Antecedentes Pessoais: [ANTECEDENTES_PESSOAIS]
Antecedentes Familiares: [ANTECEDENTES_FAMILIARES]

EXAME FÍSICO:
[EXAME_FISICO_DETALHADO]

HIPÓTESE DIAGNÓSTICA:
[HIPOTESE_DIAGNOSTICA]

CONDUTA:
[CONDUTA_MEDICA]

ORIENTAÇÕES:
[ORIENTACOES_PACIENTE]

RETORNO:
[DATA_RETORNO]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]`
    },
    {
      id: 5,
      title: 'Encaminhamento Médico',
      description: 'Encaminhamento para especialista ou exame complementar',
      icon: UserPlus,
      category: 'encaminhamento' as const,
      usageCount: 67,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '2 min',
      fields: ['Paciente', 'Especialidade', 'Motivo', 'Urgência'],
      template: `ENCAMINHAMENTO MÉDICO

DADOS DO PACIENTE:
Nome: [NOME_PACIENTE]
Data de Nascimento: [DATA_NASCIMENTO]
Convênio: [CONVENIO_PACIENTE]

ENCAMINHO o paciente acima identificado para avaliação em [ESPECIALIDADE_DESTINO].

MOTIVO DO ENCAMINHAMENTO:
[MOTIVO_ENCAMINHAMENTO]

HISTÓRIA CLÍNICA RESUMIDA:
[HISTORIA_RESUMIDA]

EXAMES JÁ REALIZADOS:
[EXAMES_REALIZADOS]

MEDICAÇÕES EM USO:
[MEDICACOES_ATUAIS]

URGÊNCIA: [NIVEL_URGENCIA]

Agradeço a atenção dispensada.

Data: [DATA_ENCAMINHAMENTO]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]
Contato: [TELEFONE_MEDICO]`
    },
    {
      id: 6,
      title: 'Declaração de Comparecimento',
      description: 'Declaração de comparecimento à consulta médica',
      icon: Clock,
      category: 'declaracao' as const,
      usageCount: 98,
      aiAssisted: false,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '1 min',
      fields: ['Paciente', 'Horário', 'Duração'],
      template: `DECLARAÇÃO DE COMPARECIMENTO

Declaro para os devidos fins que o(a) Sr(a). [NOME_PACIENTE], portador(a) do RG nº [RG_PACIENTE], compareceu a consulta médica no dia [DATA_CONSULTA], das [HORARIO_INICIO] às [HORARIO_FIM].

O tempo de permanência foi de aproximadamente [DURACAO_CONSULTA] minutos.

Esta declaração é emitida a pedido do interessado.

Data: [DATA_EMISSAO]

_____________________________
Dr. [NOME_MEDICO]
CRM: [CRM_NUMERO]`
    }
  ];

  const categories = [
    { id: 'todos', name: 'Todos os Templates', count: templates.length },
    { id: 'receita', name: 'Receitas', count: templates.filter(t => t.category === 'receita').length },
    { id: 'atestado', name: 'Atestados', count: templates.filter(t => t.category === 'atestado').length },
    { id: 'laudo', name: 'Laudos', count: templates.filter(t => t.category === 'laudo').length },
    { id: 'relatorio', name: 'Relatórios', count: templates.filter(t => t.category === 'relatorio').length },
    { id: 'encaminhamento', name: 'Encaminhamentos', count: templates.filter(t => t.category === 'encaminhamento').length },
    { id: 'declaracao', name: 'Declarações', count: templates.filter(t => t.category === 'declaracao').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateDocument = (template) => {
    router.push(`/documentos/criar/${template.category}`);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                📄 Criar Documentos Médicos
                <span className="text-lg bg-green-600 text-white px-3 py-1 rounded-full">
                  {templates.length} Templates
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Templates inteligentes com IA para criar documentos médicos rapidamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105">
              <Plus className="w-5 h-5" />
              Novo Template
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all transform hover:scale-105">
              <Brain className="w-5 h-5" />
              IA Assistente
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Documentos Hoje</p>
              <p className="text-3xl font-bold text-white">23</p>
            </div>
            <FileText className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Tempo Médio</p>
              <p className="text-3xl font-bold text-white">2.3min</p>
            </div>
            <Clock className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Templates Favoritos</p>
              <p className="text-3xl font-bold text-white">4</p>
            </div>
            <Star className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">IA Economia</p>
              <p className="text-3xl font-bold text-white">40%</p>
            </div>
            <Zap className="w-12 h-12 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name} ({category.count})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transform hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            onClick={() => handleCreateDocument(template)}
          >
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-green-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />

            {/* Header */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <template.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex flex-col items-end gap-2">
                  {template.aiAssisted && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      IA Assistida
                    </span>
                  )}
                  {template.legalCompliant && (
                    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      CFM Validado
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="font-semibold text-green-400 group-hover:text-white transition-colors text-lg">
                  {template.title}
                </h3>

                <p className="text-slate-300 text-sm group-hover:text-white transition-colors">
                  {template.description}
                </p>

                {/* Fields Preview */}
                <div className="flex flex-wrap gap-1">
                  {template.fields.slice(0, 3).map((field, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                      {field}
                    </span>
                  ))}
                  {template.fields.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded-full">
                      +{template.fields.length - 3}
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                  <div className="text-slate-400 text-xs">
                    <span>Usado {template.usageCount}x</span>
                    <span className="ml-2">• {template.lastUsed}</span>
                  </div>

                  <div className="text-slate-400 text-xs">
                    ~{template.estimatedTime}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <span className="text-xs px-3 py-1 rounded-full bg-green-600 text-white font-medium">
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </span>

                  <div className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
                    <span>Criar Documento</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">Nenhum template encontrado</h3>
          <p className="text-slate-400 mb-4">Tente ajustar sua busca ou filtros</p>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors">
            Limpar Filtros
          </button>
        </div>
      )}
    </div>
  );
}