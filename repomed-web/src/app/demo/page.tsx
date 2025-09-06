'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Play,
  ArrowRight,
  FileText,
  Users,
  Calendar,
  Activity,
  Shield,
  Stethoscope,
  Brain,
  Heart,
  Monitor,
  CheckCircle
} from 'lucide-react';

export default function DemoPage() {
  const demoFeatures = [
    {
      id: 'login',
      title: 'Sistema de Login',
      description: 'Autenticação segura com credenciais demo',
      icon: Shield,
      route: '/auth/login',
      duration: '1 min',
      status: 'available'
    },
    {
      id: 'patient',
      title: 'Cadastro de Pacientes',
      description: 'Criação completa de ficha médica',
      icon: Users,
      route: '/patients/create',
      duration: '3 min',
      status: 'available'
    },
    {
      id: 'prescription',
      title: 'Prescrição Médica',
      description: 'Geração de receitas com IA',
      icon: FileText,
      route: '/patients/prescriptions/create',
      duration: '5 min',
      status: 'available'
    },
    {
      id: 'signature',
      title: 'Assinatura Digital',
      description: 'Certificação ICP-Brasil simulada',
      icon: CheckCircle,
      route: '/prescriptions/sign',
      duration: '2 min',
      status: 'available'
    },
    {
      id: 'calendar',
      title: 'Agenda Médica',
      description: 'Gestão de consultas e horários',
      icon: Calendar,
      route: '/calendar',
      duration: '3 min',
      status: 'available'
    },
    {
      id: 'analytics',
      title: 'Dashboard Analytics',
      description: 'Relatórios e métricas médicas',
      icon: Activity,
      route: '/dashboard/analytics',
      duration: '4 min',
      status: 'available'
    }
  ];

  const demoFlow = [
    { step: 1, title: 'Login no Sistema', description: 'Use as credenciais demo fornecidas' },
    { step: 2, title: 'Crie um Paciente', description: 'Cadastre um novo paciente completo' },
    { step: 3, title: 'Gere uma Prescrição', description: 'Use a IA para criar receita médica' },
    { step: 4, title: 'Assine Digitalmente', description: 'Finalize com certificação digital' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                RepoMed IA Demo
              </h1>
              <p className="text-lg text-muted-foreground">
                Experimente todas as funcionalidades do sistema médico
              </p>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Explore o sistema completo de gestão médica com IA integrada, assinatura digital 
              e interface otimizada para profissionais da saúde.
            </p>
          </div>

          {/* Quick Start */}
          <div className="flex items-center justify-center space-x-4">
            <Link href="/auth/login">
              <Button variant="medical" size="lg" className="flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Iniciar Demo</span>
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" size="lg" className="flex items-center space-x-2">
                <ArrowRight className="w-5 h-5" />
                <span>Voltar ao Início</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Demo Flow */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-6 h-6" />
              <span>Fluxo da Demonstração</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {demoFlow.map((item, index) => (
                <div key={item.step} className="text-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto text-white font-bold text-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                  {index < demoFlow.length - 1 && (
                    <div className="hidden lg:block absolute top-6 -right-3">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Funcionalidades Disponíveis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoFeatures.map((feature) => (
              <Card key={feature.id} className="medical-card hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {feature.duration}
                          </Badge>
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            Disponível
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                  
                  <Link href={feature.route}>
                    <Button variant="medical" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Testar Agora
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Technical Info */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6" />
              <span>Tecnologias Utilizadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">N</span>
                </div>
                <p className="text-sm font-medium">Next.js 14.2+</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold">T</span>
                </div>
                <p className="text-sm font-medium">TypeScript</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Framer Motion</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm font-medium">Segurança ICP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800 dark:text-yellow-200">
              Credenciais Demo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> dr.silva@repomed.com.br</p>
            <p><strong>Senha:</strong> RepomMed2025!</p>
            <p className="text-sm text-muted-foreground">
              Estas credenciais já estão preenchidas automaticamente no formulário de login.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}