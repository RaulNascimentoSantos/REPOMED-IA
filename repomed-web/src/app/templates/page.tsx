'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Pill,
  FileCheck,
  BookOpen,
  UserPlus,
  Shield,
  ClipboardList,
  Star,
  Clock,
  TrendingUp,
  Brain,
  Zap
} from 'lucide-react';

export default function TemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('usage');

  // Templates médicos disponíveis
  const templates = [
    {
      id: 1,
      title: 'Receita Médica Simples',
      description: 'Template padrão para prescrições de medicamentos controlados e simples com validação automática',
      category: 'receita',
      icon: Pill,
      usageCount: 156,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '2 min',
      rating: 4.8,
      version: '2.1',
      color: 'green'
    },
    {
      id: 2,
      title: 'Atestado Médico',
      description: 'Atestado de saúde e capacidade laboral com validação automática e cálculo de dias',
      category: 'atestado',
      icon: FileCheck,
      usageCount: 89,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'ontem',
      estimatedTime: '1 min',
      rating: 4.9,
      version: '1.8',
      color: 'blue'
    },
    {
      id: 3,
      title: 'Laudo Médico Completo',
      description: 'Laudo médico detalhado com diagnóstico, prognóstico e recomendações terapêuticas',
      category: 'laudo',
      icon: BookOpen,
      usageCount: 45,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: '2 dias',
      estimatedTime: '5 min',
      rating: 4.7,
      version: '1.5',
      color: 'orange'
    },
    {
      id: 4,
      title: 'Relatório de Consulta',
      description: 'Relatório detalhado da consulta médica com anamnese, exame físico e conduta',
      category: 'relatorio',
      icon: ClipboardList,
      usageCount: 234,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '3 min',
      rating: 4.6,
      version: '3.2',
      color: 'green'
    },
    {
      id: 5,
      title: 'Encaminhamento Médico',
      description: 'Encaminhamento para especialista ou exame complementar com dados completos',
      category: 'encaminhamento',
      icon: UserPlus,
      usageCount: 67,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '2 min',
      rating: 4.5,
      version: '1.3',
      color: 'blue'
    },
    {
      id: 6,
      title: 'Declaração de Óbito',
      description: 'Declaração oficial de óbito com protocolo de registro e validação jurídica',
      category: 'declaracao',
      icon: Shield,
      usageCount: 12,
      aiAssisted: false,
      legalCompliant: true,
      lastUsed: '1 semana',
      estimatedTime: '8 min',
      rating: 4.9,
      version: '1.0',
      color: 'red'
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos', count: templates.length },
    { id: 'receita', name: 'Receitas', count: templates.filter(t => t.category === 'receita').length },
    { id: 'atestado', name: 'Atestados', count: templates.filter(t => t.category === 'atestado').length },
    { id: 'laudo', name: 'Laudos', count: templates.filter(t => t.category === 'laudo').length },
    { id: 'relatorio', name: 'Relatórios', count: templates.filter(t => t.category === 'relatorio').length },
    { id: 'encaminhamento', name: 'Encaminhamentos', count: templates.filter(t => t.category === 'encaminhamento').length },
    { id: 'declaracao', name: 'Declarações', count: templates.filter(t => t.category === 'declaracao').length }
  ];

  // Filtrar e ordenar templates
  const filteredTemplates = templates
    .filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.title.localeCompare(b.title);
        case 'recent':
          return new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime();
        default:
          return 0;
      }
    });

  const handleCreateTemplate = () => {
    router.push('/templates/new');
  };

  const handleEditTemplate = (templateId: number) => {
    router.push(`/templates/${templateId}/edit`);
  };

  const handleUseTemplate = (category: string) => {
    router.push(`/documentos/criar/${category}`);
  };

  const getColorClasses = (color: string) => {
    const colors = {
      green: 'from-green-600 to-emerald-600 border-green-500',
      blue: 'from-blue-600 to-cyan-600 border-blue-500',
      orange: 'from-orange-600 to-red-600 border-orange-500',
      red: 'from-red-600 to-red-700 border-red-500',
      purple: 'from-purple-600 to-indigo-600 border-purple-500'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-6 relative">
      <BackButton />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                Templates de Documentos
              </h1>
              <p className="text-slate-400 text-lg">
                Gerencie e personalize templates médicos inteligentes
              </p>
            </div>

            <button
              onClick={handleCreateTemplate}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105 font-semibold"
            >
              <Plus className="w-5 h-5" />
              Novo Template
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Templates Ativos</p>
                  <p className="text-2xl font-bold text-white">{templates.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total de Usos</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Com IA</p>
                  <p className="text-2xl font-bold text-white">
                    {templates.filter(t => t.aiAssisted).length}
                  </p>
                </div>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Avaliação Média</p>
                  <p className="text-2xl font-bold text-white">
                    {(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}
                  </p>
                </div>
                <Star className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setFilterCategory(category.id)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filterCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {category.name}
                <span className="bg-slate-600 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="usage">Mais Usados</option>
              <option value="rating">Melhor Avaliados</option>
              <option value="name">Nome A-Z</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            return (
              <div
                key={template.id}
                className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 transform hover:scale-105"
              >
                {/* Header */}
                <div className={`bg-gradient-to-r ${getColorClasses(template.color)} p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <IconComponent className="w-6 h-6 text-white" />
                      <div>
                        <h3 className="text-white font-semibold">{template.title}</h3>
                        <p className="text-white/80 text-sm">v{template.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-300" />
                      <span className="text-white text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Usos</p>
                      <p className="text-white font-semibold">{template.usageCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-slate-400 text-xs">Tempo</p>
                      <p className="text-white font-semibold">{template.estimatedTime}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.aiAssisted && (
                      <span className="bg-purple-600/20 text-purple-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        IA Assistida
                      </span>
                    )}
                    {template.legalCompliant && (
                      <span className="bg-green-600/20 text-green-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        CFM Compliant
                      </span>
                    )}
                    <span className="bg-blue-600/20 text-blue-300 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Rápido
                    </span>
                  </div>

                  {/* Last Used */}
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
                    <Clock className="w-4 h-4" />
                    Usado {template.lastUsed}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUseTemplate(template.category)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg transition-all font-medium"
                    >
                      Usar Template
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template.id)}
                      className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              Nenhum template encontrado
            </h3>
            <p className="text-slate-500 mb-6">
              Tente ajustar os filtros de busca ou criar um novo template.
            </p>
            <button
              onClick={handleCreateTemplate}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Criar Primeiro Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}