'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'

interface RouteTest {
  path: string
  name: string
  description: string
  tested: boolean
  working: boolean
}

export default function TestRoutesPage() {
  const [routes, setRoutes] = useState<RouteTest[]>([
    { path: '/', name: 'Homepage', description: 'Página inicial do sistema', tested: false, working: false },
    { path: '/documents', name: 'Documentos', description: 'Lista de documentos médicos', tested: false, working: false },
    { path: '/documents/create', name: 'Criar Documento', description: 'Formulário de criação', tested: false, working: false },
    { path: '/documents/1', name: 'Documento Detalhe', description: 'Página de detalhes do documento', tested: false, working: false },
    { path: '/workspace', name: 'Workspace', description: 'Ambiente de trabalho médico', tested: false, working: false },
    { path: '/templates', name: 'Templates', description: 'Gerenciamento de templates', tested: false, working: false },
    { path: '/templates/create', name: 'Criar Template', description: 'Formulário de criação de template', tested: false, working: false },
    { path: '/templates/1', name: 'Template Detalhe', description: 'Página de detalhes do template', tested: false, working: false },
    { path: '/patients', name: 'Pacientes', description: 'Lista de pacientes', tested: false, working: false },
    { path: '/patients/create', name: 'Criar Paciente', description: 'Formulário de cadastro', tested: false, working: false },
    { path: '/patients/1', name: 'Paciente Detalhe', description: 'Página de detalhes do paciente', tested: false, working: false },
    { path: '/metrics', name: 'Métricas', description: 'Dashboard de métricas', tested: false, working: false },
    { path: '/settings', name: 'Configurações', description: 'Configurações do sistema', tested: false, working: false },
    { path: '/share/test-token', name: 'Compartilhamento', description: 'Página de documento compartilhado', tested: false, working: false },
    { path: '/verify/test-hash', name: 'Verificação', description: 'Página de verificação de documento', tested: false, working: false }
  ])

  const markAllAsTested = () => {
    setRoutes(routes.map(route => ({ ...route, tested: true, working: true })))
  }

  const testRoute = (routePath: string) => {
    setRoutes(routes.map(route => 
      route.path === routePath 
        ? { ...route, tested: true, working: true }
        : route
    ))
  }

  const getStatusBadge = (route: RouteTest) => {
    if (!route.tested) {
      return <Badge variant="outline" className="text-gray-500">⏳ Não testado</Badge>
    }
    return route.working 
      ? <Badge className="bg-green-500">✅ Funcionando</Badge>
      : <Badge className="bg-red-500">❌ Com problemas</Badge>
  }

  const testedRoutes = routes.filter(r => r.tested).length
  const workingRoutes = routes.filter(r => r.tested && r.working).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🧪 Teste de Rotas</h1>
              <p className="text-gray-600 mt-1">Validação de todas as rotas do sistema</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="outline">← Início</Button>
              </Link>
              <Button onClick={markAllAsTested} className="bg-green-600 hover:bg-green-700">
                ✓ Marcar Todas como OK
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📊 Progresso dos Testes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{routes.length}</div>
                <div className="text-sm text-gray-600">Total de Rotas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600">{testedRoutes}</div>
                <div className="text-sm text-gray-600">Testadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{workingRoutes}</div>
                <div className="text-sm text-gray-600">Funcionando</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progresso geral</span>
                <span className="text-sm text-gray-500">{Math.round((workingRoutes / routes.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(workingRoutes / routes.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Routes List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {routes.map((route, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{route.name}</h3>
                      {getStatusBadge(route)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{route.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <code className="bg-gray-100 px-2 py-1 rounded">{route.path}</code>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link href={route.path} target="_blank">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Testar</span>
                        </Button>
                      </Link>
                      <Button 
                        size="sm"
                        onClick={() => testRoute(route.path)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Marcar OK
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Como usar este teste</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Clique em "Testar" para abrir cada rota em uma nova aba</li>
              <li>Verifique se a página carrega corretamente sem erros</li>
              <li>Teste a funcionalidade básica (botões, formulários, navegação)</li>
              <li>Se tudo estiver funcionando, clique em "Marcar OK"</li>
              <li>Repita para todas as rotas para ter uma visão completa do sistema</li>
              <li>Use "Marcar Todas como OK" se todas as rotas estiverem funcionando</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}