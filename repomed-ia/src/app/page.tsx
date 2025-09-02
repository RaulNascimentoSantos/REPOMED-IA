'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const features = [
    { name: "Next.js 15 + tRPC", status: "active" },
    { name: "5 Templates Médicos", status: "active" },
    { name: "PDF + QR Code", status: "active" },
    { name: "PWA Offline", status: "active" },
    { name: "Compartilhamento Seguro", status: "active" },
    { name: "Banco de dados", status: "pending" }
  ]

  const quickActions = [
    {
      title: "📄 Documentos",
      description: "Gerenciar documentos médicos",
      href: "/documents",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "🏥 Workspace",
      description: "Criar prescrições e documentos",
      href: "/workspace",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "📋 Templates",
      description: "Modelos de documentos médicos",
      href: "/templates",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "👥 Pacientes",
      description: "Cadastro e gestão de pacientes",
      href: "/patients",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "📊 Métricas",
      description: "Dashboard e relatórios",
      href: "/metrics",
      color: "bg-indigo-500 hover:bg-indigo-600"
    },
    {
      title: "⚙️ Criar Documento",
      description: "Criar novo documento médico",
      href: "/documents/create",
      color: "bg-teal-500 hover:bg-teal-600"
    },
    {
      title: "🔧 Configurações",
      description: "Configurar sistema e perfil",
      href: "/settings",
      color: "bg-gray-500 hover:bg-gray-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                RepoMed IA
              </h1>
              <Badge variant="secondary">V1 MVP</Badge>
            </div>
            <nav className="flex space-x-4">
              <Link href="/documents">
                <Button variant="ghost" size="sm">Documentos</Button>
              </Link>
              <Link href="/workspace">
                <Button variant="ghost" size="sm">Workspace</Button>
              </Link>
              <Link href="/templates">
                <Button variant="ghost" size="sm">Templates</Button>
              </Link>
              <Link href="/patients">
                <Button variant="ghost" size="sm">Pacientes</Button>
              </Link>
              <Link href="/settings">
                <Button variant="ghost" size="sm">⚙️</Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Documentos Médicos
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma completa para criação, gestão e assinatura de documentos médicos com inteligência artificial
          </p>
          
          {/* Status Badge */}
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-600 font-semibold">Sistema Online</span>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {quickActions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                    <span>{action.title}</span>
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className={`w-full ${action.color} text-white`}>
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Features Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔧</span>
                <span>Status do Sistema</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{feature.name}</span>
                    <Badge 
                      variant={feature.status === 'active' ? 'default' : 'secondary'}
                      className={feature.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}
                    >
                      {feature.status === 'active' ? '✅ Ativo' : '⏳ Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎯</span>
                <span>Próximos Passos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Configurar Banco de Dados</h4>
                  <p className="text-sm text-blue-700">Inicializar PostgreSQL e executar migrações</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-1">Testar Funcionalidades</h4>
                  <p className="text-sm text-green-700">Validar criação e assinatura de documentos</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-1">Implementar IA</h4>
                  <p className="text-sm text-purple-700">Integrar OpenAI para sugestões médicas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start */}
        <div className="text-center mt-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Começar Agora</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/documents/create">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                🆕 Criar Documento
              </Button>
            </Link>
            <Link href="/workspace">
              <Button size="lg" variant="outline">
                🏥 Acessar Workspace
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              RepoMed IA - Sistema de Documentos Médicos
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Desenvolvido com ❤️ para revolucionar a área médica
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}