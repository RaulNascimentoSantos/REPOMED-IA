'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
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
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Stethoscope
} from 'lucide-react';


export default function DocumentosPage() {
  const router = useRouter();
  const { theme, isDarkMode, isMedicalTheme } = useTheme();
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

  const handleCreateDocument = (template: any) => {
    try {
      console.log('[DocumentosPage] Criando documento:', template.category);
      router.push(`/documentos/criar/${template.category}`);
    } catch (error) {
      console.error('[DocumentosPage] Erro na criação de documento:', error);
      try {
        window.location.href = `/documentos/criar/${template.category}`;
      } catch (fallbackError) {
        console.error('[DocumentosPage] Fallback de criação falhou:', fallbackError);
      }
    }
  };

  return (
    <div className={`min-h-screen p-6 ${
      isMedicalTheme ? 'bg-slate-900 text-white' :
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 text-gray-900'
    }`}>
      {/* Header Premium */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
                isMedicalTheme ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white' :
                isDarkMode ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white' :
                'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>
            <div>
              <h1 className={`text-4xl font-bold mb-2 flex items-center gap-3 ${
                isMedicalTheme ? 'text-white' :
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>
                📋 Documentos Médicos Inteligentes
                <span className="text-sm bg-green-500 text-white px-3 py-1 rounded-full font-medium shadow-sm">
                  {templates.length} Templates Pro
                </span>
              </h1>
              <p className={`text-lg ${
                isMedicalTheme ? 'text-slate-300' :
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Sistema avançado de documentação médica com IA • Validação automática CFM/CRM
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-400 font-medium">Sistema de assinatura digital ativo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              <Plus className="w-5 h-5" />
              Novo Template Personalizado
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              <Brain className="w-5 h-5" />
              Assistente IA Médica
            </button>

            <button className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md ${
              isMedicalTheme ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white' :
              isDarkMode ? 'bg-slate-800/80 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white' :
              'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-800'
            }`}>
              <Shield className="w-5 h-5" />
              Validação CFM
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Médicas Premium */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isMedicalTheme ? 'bg-slate-800/80 border-slate-600' :
          isDarkMode ? 'bg-slate-800/80 border-slate-600' :
          'bg-white/80 border-white/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Hoje</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            isMedicalTheme ? 'text-white' :
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>45</div>
          <div className={`text-sm mb-2 ${
            isMedicalTheme ? 'text-slate-300' :
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>Documentos Gerados</div>
          <div className="flex items-center text-xs text-green-600 font-medium">
            <Zap className="w-3 h-3 mr-1" />
            +23% vs ontem
          </div>
        </div>

        <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isMedicalTheme ? 'bg-slate-800/80 border-slate-600' :
          isDarkMode ? 'bg-slate-800/80 border-slate-600' :
          'bg-white/80 border-white/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Eficiência</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            isMedicalTheme ? 'text-white' :
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>1.8min</div>
          <div className={`text-sm mb-2 ${
            isMedicalTheme ? 'text-slate-300' :
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>Tempo Médio/Doc</div>
          <div className="flex items-center text-xs text-blue-600 font-medium">
            <Brain className="w-3 h-3 mr-1" />
            60% mais rápido com IA
          </div>
        </div>

        <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isMedicalTheme ? 'bg-slate-800/80 border-slate-600' :
          isDarkMode ? 'bg-slate-800/80 border-slate-600' :
          'bg-white/80 border-white/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Star className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Favoritos</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            isMedicalTheme ? 'text-white' :
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>8</div>
          <div className={`text-sm mb-2 ${
            isMedicalTheme ? 'text-slate-300' :
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>Templates Preferidos</div>
          <div className="flex items-center text-xs text-purple-600 font-medium">
            <User className="w-3 h-3 mr-1" />
            Personalização médica
          </div>
        </div>

        <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 ${
          isMedicalTheme ? 'bg-slate-800/80 border-slate-600' :
          isDarkMode ? 'bg-slate-800/80 border-slate-600' :
          'bg-white/80 border-white/20'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">CFM</span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${
            isMedicalTheme ? 'text-white' :
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>100%</div>
          <div className={`text-sm mb-2 ${
            isMedicalTheme ? 'text-slate-300' :
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>Conformidade Legal</div>
          <div className="flex items-center text-xs text-green-600 font-medium">
            <Stethoscope className="w-3 h-3 mr-1" />
            Validação automática
          </div>
        </div>
      </div>

      {/* Controles Avançados de Busca Premium */}
      <div className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl mb-8 ${
        isMedicalTheme ? 'bg-slate-800/80 border-slate-600' :
        isDarkMode ? 'bg-slate-800/80 border-slate-600' :
        'bg-white/80 border-white/20'
      }`}>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="🔍 Buscar templates médicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  isMedicalTheme ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' :
                  isDarkMode ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400' :
                  'bg-white/50 border-slate-200 text-slate-700 placeholder-slate-400'
                }`}
              />
            </div>
            <div className="text-sm bg-blue-100 text-blue-700 px-3 py-2 rounded-full font-medium">
              {filteredTemplates.length} encontrados
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                isMedicalTheme ? 'bg-slate-700/50 border-slate-600 text-white' :
                isDarkMode ? 'bg-slate-700/50 border-slate-600 text-white' :
                'bg-white/50 border-slate-200 text-slate-700'
              }`}
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
              isMedicalTheme ? 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white' :
              isDarkMode ? 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white' :
              'bg-white/50 border-slate-200 text-slate-600 hover:bg-white hover:text-slate-800'
            }`}>
              <Settings className="w-4 h-4" />
              Filtros Avançados
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:shadow-2xl cursor-pointer group hover:scale-105 transition-all duration-300 relative overflow-hidden ${
              isMedicalTheme ? 'bg-slate-800/80 border-slate-600' :
              isDarkMode ? 'bg-slate-800/80 border-slate-600' :
              'bg-white/80 border-white/20'
            }`}
            onClick={() => handleCreateDocument(template)}
          >
            {/* Premium gradient background */}
            <div className={`absolute inset-0 transition-all duration-300 ${
              isMedicalTheme ? 'bg-gradient-to-br from-slate-800/30 to-slate-700/30 group-hover:from-slate-700/40 group-hover:to-slate-600/40' :
              isDarkMode ? 'bg-gradient-to-br from-slate-800/30 to-slate-700/30 group-hover:from-slate-700/40 group-hover:to-slate-600/40' :
              'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 group-hover:from-blue-100/50 group-hover:to-indigo-100/50'
            }`} />

            {/* Header */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg ${
                  template.category === 'receita' ? 'bg-gradient-to-r from-emerald-500 to-green-600' :
                  template.category === 'atestado' ? 'bg-gradient-to-r from-blue-500 to-cyan-600' :
                  template.category === 'laudo' ? 'bg-gradient-to-r from-purple-500 to-pink-600' :
                  template.category === 'relatorio' ? 'bg-gradient-to-r from-orange-500 to-red-600' :
                  template.category === 'encaminhamento' ? 'bg-gradient-to-r from-indigo-500 to-purple-600' :
                  'bg-gradient-to-r from-slate-500 to-slate-600'
                }`}>
                  <template.icon className="w-7 h-7 text-white" />
                </div>

                <div className="flex flex-col items-end gap-2">
                  {template.aiAssisted && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      🤖 IA Pro
                    </span>
                  )}
                  {template.legalCompliant && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      ✅ CFM Valid
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3">
                <h3 className={`text-lg font-semibold transition-colors ${
                  isMedicalTheme ? 'text-white group-hover:text-slate-100' :
                  isDarkMode ? 'text-white group-hover:text-slate-100' :
                  'text-slate-800 group-hover:text-slate-900'
                }`}>
                  {template.title}
                </h3>

                <p className={`text-sm transition-colors ${
                  isMedicalTheme ? 'text-slate-300 group-hover:text-slate-200' :
                  isDarkMode ? 'text-slate-300 group-hover:text-slate-200' :
                  'text-slate-600 group-hover:text-slate-700'
                }`}>
                  {template.description}
                </p>

                {/* Fields Preview */}
                <div className="flex flex-wrap gap-2">
                  {template.fields.slice(0, 3).map((field, index) => (
                    <span key={index} className={`text-xs px-2 py-1 rounded-md font-medium ${
                      isMedicalTheme ? 'bg-slate-600 text-slate-200' :
                      isDarkMode ? 'bg-slate-600 text-slate-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {field}
                    </span>
                  ))}
                  {template.fields.length > 3 && (
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                      isMedicalTheme ? 'bg-slate-600 text-slate-200' :
                      isDarkMode ? 'bg-slate-600 text-slate-200' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      +{template.fields.length - 3} campos
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className={`flex items-center justify-between pt-3 ${
                  isMedicalTheme ? 'border-t border-slate-600' :
                  isDarkMode ? 'border-t border-slate-600' : 'border-t border-slate-200'
                }`}>
                  <div className={`text-xs ${
                    isMedicalTheme ? 'text-slate-400' :
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <div className="flex items-center gap-1 mb-1">
                      <Eye className="w-3 h-3" />
                      {template.usageCount} usos
                    </div>
                    <span className="text-green-400 font-medium">• {template.lastUsed}</span>
                  </div>

                  <div className={`text-xs flex items-center gap-1 ${
                    isMedicalTheme ? 'text-slate-400' :
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Clock className="w-3 h-3" />
                    ~{template.estimatedTime}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-between">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    template.category === 'receita' ? 'bg-green-100 text-green-700' :
                    template.category === 'atestado' ? 'bg-blue-100 text-blue-700' :
                    template.category === 'laudo' ? 'bg-purple-100 text-purple-700' :
                    template.category === 'relatorio' ? 'bg-orange-100 text-orange-700' :
                    template.category === 'encaminhamento' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                  </span>

                  <div className={`flex items-center text-sm transition-colors gap-2 ${
                    isMedicalTheme ? 'text-slate-400 hover:text-slate-200 group-hover:text-green-400' :
                    isDarkMode ? 'text-slate-400 hover:text-slate-200 group-hover:text-green-400' :
                    'text-slate-500 hover:text-slate-700 group-hover:text-green-600'
                  }`}>
                    <span>Criar Agora</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Premium */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h3 className={`text-xl font-semibold mb-3 ${
            isMedicalTheme ? 'text-white' :
            isDarkMode ? 'text-white' : 'text-slate-800'
          }`}>Nenhum template encontrado</h3>
          <p className={`mb-6 max-w-md mx-auto ${
            isMedicalTheme ? 'text-slate-300' :
            isDarkMode ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Tente ajustar sua busca ou filtros, ou crie um novo template personalizado para suas necessidades médicas.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setSearchTerm('')}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                isMedicalTheme ? 'bg-slate-700/80 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white' :
                isDarkMode ? 'bg-slate-700/80 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white' :
                'bg-white/80 border-slate-200 text-slate-700 hover:bg-white hover:text-slate-800'
              }`}
            >
              Limpar Busca
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all duration-200">
              <Plus className="w-4 h-4" />
              Criar Template Personalizado
            </button>
          </div>
        </div>
      )}
    </div>
  );
}