'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MetricsPage() {
  const [timeRange, setTimeRange] = useState('30d')
  
  // Dados mockados para métricas
  const metrics = {
    documents: {
      total: 1247,
      this_month: 156,
      growth: '+23%',
      by_type: {
        prescription: 687,
        certificate: 312,
        exam_request: 156,
        report: 92
      }
    },
    patients: {
      total: 423,
      active: 387,
      new_this_month: 34,
      growth: '+8.7%'
    },
    signatures: {
      total: 1098,
      pending: 23,
      success_rate: 98.2,
      avg_time: '2.3min'
    },
    performance: {
      avg_document_time: '4.2min',
      ai_usage: '67%',
      template_usage: '89%',
      error_rate: '0.12%'
    },
    revenue: {
      mrr: 'R$ 12.460',
      arr: 'R$ 149.520',
      growth: '+15.4%',
      churn: '2.1%'
    }
  }

  const recentActivity = [
    { time: '10:30', action: 'Documento assinado', patient: 'Maria Silva', type: 'Receita Médica' },
    { time: '10:15', action: 'Nova prescrição', patient: 'José Santos', type: 'Receita Controlada' },
    { time: '09:45', action: 'Atestado criado', patient: 'Ana Costa', type: 'Atestado Médico' },
    { time: '09:30', action: 'Paciente cadastrado', patient: 'Carlos Lima', type: 'Novo Cadastro' },
    { time: '09:15', action: 'Template usado', patient: 'Beatriz Souza', type: 'Solicitação Exames' }
  ]

  const topTemplates = [
    { name: 'Receita Médica Simples', usage: 234, percentage: 34 },
    { name: 'Atestado Repouso', usage: 156, percentage: 23 },
    { name: 'Solicitação Exames Sangue', usage: 89, percentage: 13 },
    { name: 'Receita Controlada', usage: 67, percentage: 10 },
    { name: 'Encaminhamento Especialista', usage: 45, percentage: 7 }
  ]

  const timeRanges = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '1y', label: 'Último ano' }
  ]

  const getGrowthColor = (growth: string) => {
    return growth.startsWith('+') ? 'text-green-600' : 'text-red-600'
  }

  const getActivityIcon = (action: string) => {
    if (action.includes('assinado')) return '✅'
    if (action.includes('prescrição')) return '💊'
    if (action.includes('atestado') || action.includes('Atestado')) return '📋'
    if (action.includes('cadastrado')) return '👤'
    if (action.includes('Template')) return '📝'
    return '📄'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📊 Dashboard de Métricas</h1>
              <p className="text-gray-600 mt-1">Acompanhe o desempenho do seu sistema médico</p>
            </div>
            <div className="flex space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Link href="/">
                <Button variant="outline">← Início</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">📄 Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.documents.total.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Este mês: {metrics.documents.this_month}</span>
                <Badge className={`${getGrowthColor(metrics.documents.growth)} bg-transparent border-0 p-0`}>
                  {metrics.documents.growth}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">👥 Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.patients.total}</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Ativos: {metrics.patients.active}</span>
                <Badge className={`${getGrowthColor(metrics.patients.growth)} bg-transparent border-0 p-0`}>
                  {metrics.patients.growth}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">✍️ Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.signatures.total.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">Taxa: {metrics.signatures.success_rate}%</span>
                <Badge className="bg-green-100 text-green-800">
                  {metrics.signatures.pending} pendentes
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">💰 Receita</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{metrics.revenue.mrr}</div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-600">ARR: {metrics.revenue.arr}</span>
                <Badge className={`${getGrowthColor(metrics.revenue.growth)} bg-transparent border-0 p-0`}>
                  {metrics.revenue.growth}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Documents by Type */}
          <Card>
            <CardHeader>
              <CardTitle>📊 Documentos por Tipo</CardTitle>
              <CardDescription>Distribuição dos tipos de documentos criados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>💊</span>
                    <span className="text-sm">Receitas</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '55%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">{metrics.documents.by_type.prescription}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>📋</span>
                    <span className="text-sm">Atestados</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">{metrics.documents.by_type.certificate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>🔬</span>
                    <span className="text-sm">Exames</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '13%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">{metrics.documents.by_type.exam_request}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>📊</span>
                    <span className="text-sm">Relatórios</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{width: '7%'}}></div>
                    </div>
                    <span className="text-sm font-medium w-12">{metrics.documents.by_type.report}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>⚡ Performance</CardTitle>
              <CardDescription>Métricas de eficiência do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.performance.avg_document_time}</div>
                  <div className="text-xs text-gray-600">Tempo médio/doc</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.performance.ai_usage}</div>
                  <div className="text-xs text-gray-600">Uso de IA</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{metrics.performance.template_usage}</div>
                  <div className="text-xs text-gray-600">Uso de Templates</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{metrics.performance.error_rate}</div>
                  <div className="text-xs text-gray-600">Taxa de erro</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>🕒 Atividade Recente</CardTitle>
              <CardDescription>Últimas ações realizadas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                    <div className="text-lg">{getActivityIcon(activity.action)}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                      <div className="text-xs text-gray-600">
                        {activity.patient} • {activity.type}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Templates */}
          <Card>
            <CardHeader>
              <CardTitle>🏆 Templates Mais Usados</CardTitle>
              <CardDescription>Ranking dos templates mais populares</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTemplates.map((template, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{template.name}</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full" 
                          style={{width: `${template.percentage}%`}}
                        ></div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600">{template.usage}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>⚡ Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/documents">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  📄 Ver Documentos
                </Button>
              </Link>
              <Link href="/patients">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  👥 Gerenciar Pacientes
                </Button>
              </Link>
              <Link href="/templates">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  📋 Ver Templates
                </Button>
              </Link>
              <Link href="/workspace">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  🏥 Ir para Workspace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Export Options */}
        <div className="text-center mt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline">
              📊 Exportar Relatório PDF
            </Button>
            <Button variant="outline">
              📈 Exportar Dados Excel
            </Button>
            <Button variant="outline">
              📧 Enviar por Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}