'use client';



import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Search,
  Bell,
  Settings,
  UserCircle,
  Filter,
  Download,
  Activity,
  DollarSign,
  Heart,
  Brain,
  Stethoscope,
  Pill,
  Clock,
  UserPlus,
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Zap,
  Shield,
  Globe,
  Target,
  BookOpen,
  MessageSquare,
  Lightbulb,
  Award,
  Star,
  Bookmark,
  FileCheck,
  Plus
} from 'lucide-react';

import MedicalCard from '@/components/ui/MedicalCard';
import AIInsightCard from '@/components/ui/AIInsightCard';
import DocumentTemplateCard from '@/components/ui/DocumentTemplateCard';
import DigitalSignatureCard from '@/components/ui/DigitalSignatureCard';

export default function HomePage() {
  const router = useRouter();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    setCurrentTime(new Date());
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      // Simular ativação de comando de voz
      setTimeout(() => {
        console.log('Comando de voz ativado: "Mostrar pacientes críticos"');
      }, 1000);
    }
  };

  // Templates de documentos médicos
  const documentTemplates = [
    {
      title: 'Receita Médica Simples',
      description: 'Template padrão para prescrições de medicamentos controlados e simples',
      icon: Pill,
      category: 'receita' as const,
      usageCount: 156,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '2 min'
    },
    {
      title: 'Atestado Médico',
      description: 'Atestado de saúde e capacidade laboral com validação automática',
      icon: FileCheck,
      category: 'atestado' as const,
      usageCount: 89,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'ontem',
      estimatedTime: '1 min'
    },
    {
      title: 'Laudo Médico',
      description: 'Laudo completo com diagnóstico e recomendações terapêuticas',
      icon: BookOpen,
      category: 'laudo' as const,
      usageCount: 45,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: '2 dias',
      estimatedTime: '5 min'
    },
    {
      title: 'Relatório de Consulta',
      description: 'Relatório detalhado da consulta médica realizada',
      icon: FileText,
      category: 'relatorio' as const,
      usageCount: 234,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '3 min'
    },
    {
      title: 'Encaminhamento Médico',
      description: 'Encaminhamento para especialista ou exame complementar',
      icon: UserPlus,
      category: 'encaminhamento' as const,
      usageCount: 67,
      aiAssisted: true,
      legalCompliant: true,
      lastUsed: 'hoje',
      estimatedTime: '2 min'
    },
    {
      title: 'Declaração de Óbito',
      description: 'Declaração oficial de óbito com protocolo de registro',
      icon: Shield,
      category: 'declaracao' as const,
      usageCount: 12,
      aiAssisted: false,
      legalCompliant: true,
      lastUsed: '1 semana',
      estimatedTime: '8 min'
    }
  ];

  // Insights de IA focados em documentos
  const aiInsights = [
    {
      type: 'recommendation' as const,
      title: 'Template de Receita Otimizado',
      description: 'IA sugere usar template específico para diabetes que reduz tempo de preenchimento em 40% e melhora aderência.',
      confidence: 94,
      priority: 'medium' as const,
      actionable: true,
      timestamp: '5 min atrás'
    },
    {
      type: 'alert' as const,
      title: 'Documentos Pendentes de Assinatura',
      description: '8 documentos criados hoje ainda não foram assinados digitalmente. Recomenda-se processar para validade jurídica.',
      confidence: 100,
      priority: 'high' as const,
      actionable: true,
      timestamp: '10 min atrás'
    }
  ];

  return (
    <main className="p-6 relative" role="main">
      {/* Header com informações médicas profissionais */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              📄 RepoMed IA - Documentos Médicos
              <span className="ml-3 text-lg text-blue-400 font-normal">
                {currentTime ? currentTime.toLocaleTimeString('pt-BR') : '--:--:--'}
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Bom dia, Dr. João Silva • CRM SP 123456 • Sistema de Documentação Digital
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Controle de voz */}
            <button
              onClick={toggleVoice}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                voiceEnabled
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              {voiceEnabled ? 'Escutando...' : 'Ativar Voz'}
            </button>

            {/* Status de notificações */}
            <div className="relative">
              <Bell className="w-6 h-6 text-slate-400 hover:text-white transition-colors cursor-pointer" />
              {notifications > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {notifications}
                </span>
              )}
            </div>

            {/* Status online */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de ação rápida para documentos médicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MedicalCard
          title="Receita Médica"
          value="Criar Nova"
          icon={Pill}
          color="green"
          onClick={() => navigateTo('/documentos/criar/receita')}
          subtitle="Template com IA e validação automática"
          change="156 criadas"
          changeType="positive"
        />

        <MedicalCard
          title="Atestado Médico"
          value="Gerar Agora"
          icon={FileCheck}
          color="blue"
          onClick={() => navigateTo('/documentos/criar/atestado')}
          subtitle="Atestado de saúde com validade jurídica"
          change="89 emitidos"
          changeType="positive"
        />

        <MedicalCard
          title="Assinatura Digital"
          value="Assinar Docs"
          icon={Shield}
          color="purple"
          urgency="high"
          onClick={() => navigateTo('/assinatura')}
          subtitle="8 documentos aguardando assinatura"
          change="12 hoje"
          changeType="positive"
        />

        <MedicalCard
          title="Templates IA"
          value="Personalizar"
          icon={Brain}
          color="orange"
          onClick={() => navigateTo('/templates')}
          subtitle="Templates inteligentes personalizáveis"
          change="+40% eficiência"
          changeType="positive"
        />
      </div>

      {/* Métricas de documentação médica */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MedicalCard
          title="Documentos Hoje"
          value="23"
          icon={FileText}
          color="blue"
          change="+8 vs ontem"
          changeType="positive"
          trend={[15, 17, 19, 21, 23]}
          subtitle="Receitas, atestados e laudos"
        />

        <MedicalCard
          title="Assinados Hoje"
          value="15"
          icon={Shield}
          color="green"
          change="65% do total"
          changeType="positive"
          subtitle="Validação jurídica completa"
        />

        <MedicalCard
          title="Templates Ativos"
          value="12"
          icon={BookOpen}
          color="purple"
          change="+3 este mês"
          changeType="positive"
          subtitle="Personalizados para sua prática"
        />

        <MedicalCard
          title="Tempo Médio"
          value="2.3 min"
          icon={Clock}
          color="emerald"
          change="-40% com IA"
          changeType="positive"
          subtitle="Por documento criado"
        />
      </div>

      {/* Layout principal com Templates e Assinatura Digital */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Templates de Documentos - 2 colunas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-green-400" />
              Templates de Documentos
              <span className="text-sm bg-green-600 text-white px-2 py-1 rounded-full">6 Ativos</span>
            </h3>
            <button
              onClick={() => navigateTo('/templates')}
              className="text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Novo Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentTemplates.map((template, index) => (
              <DocumentTemplateCard
                key={index}
                {...template}
                onClick={() => navigateTo(`/documentos/criar/${template.category}`)}
              />
            ))}
          </div>
        </div>

        {/* Assinatura Digital e AI Insights - 1 coluna */}
        <div className="space-y-6">
          <DigitalSignatureCard
            onClick={() => navigateTo('/assinatura')}
          />

          {/* AI Insights para Documentos */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                IA Assistente
              </h4>
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">2 Insights</span>
            </div>

            <div className="space-y-4">
              {aiInsights.map((insight, index) => (
                <AIInsightCard
                  key={index}
                  {...insight}
                  onAction={() => console.log(`Aplicando insight: ${insight.title}`)}
                />
              ))}
            </div>
          </div>

          {/* Documentos Recentes */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-400" />
                Documentos Recentes
              </h4>
              <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded-full">Hoje</span>
            </div>

            <div className="space-y-3">
              {[
                { name: "Receita - Maria Silva", type: "Receita", time: "14:30", status: "assinado" },
                { name: "Atestado - João Costa", type: "Atestado", time: "13:15", status: "pendente" },
                { name: "Laudo - Pedro Santos", type: "Laudo", time: "11:45", status: "assinado" },
                { name: "Encaminhamento - Ana Lima", type: "Encaminhamento", time: "10:20", status: "pendente" }
              ].map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <div>
                    <p className="text-white text-sm font-medium">{doc.name}</p>
                    <p className="text-slate-400 text-xs">{doc.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-blue-400 text-sm font-medium">{doc.time}</span>
                    <div className={`text-xs px-2 py-1 rounded mt-1 ${
                      doc.status === 'assinado' ? 'bg-green-600 text-white' :
                      'bg-orange-600 text-white'
                    }`}>
                      {doc.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigateTo('/documentos')}
              className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Ver Todos os Documentos
            </button>
          </div>
        </div>
      </div>

      {/* Ações rápidas para documentação médica */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigateTo('/templates')}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3"
        >
          <FileText className="w-6 h-6" />
          Gerenciar Templates
        </button>

        <button
          onClick={() => navigateTo('/assinatura')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3"
        >
          <Shield className="w-6 h-6" />
          Central de Assinatura
        </button>

        <button
          onClick={() => navigateTo('/documentos')}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-6 px-6 rounded-xl transition-all transform hover:scale-105 duration-200 flex items-center justify-center gap-3"
        >
          <BookOpen className="w-6 h-6" />
          Histórico de Documentos
        </button>
      </div>
    </main>
  );
}