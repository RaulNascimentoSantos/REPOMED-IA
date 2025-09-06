'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar, 
  FileText, 
  Activity,
  BarChart3,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  // Mock data for analytics
  const consultationData = [
    { name: 'Jan', consultas: 65, receitas: 45, retornos: 20 },
    { name: 'Fev', consultas: 78, receitas: 52, retornos: 26 },
    { name: 'Mar', consultas: 90, receitas: 68, retornos: 22 },
    { name: 'Abr', consultas: 85, receitas: 61, retornos: 24 },
    { name: 'Mai', consultas: 95, receitas: 72, retornos: 23 },
    { name: 'Jun', consultas: 105, receitas: 78, retornos: 27 },
  ];

  const specialtyData = [
    { name: 'Cardiologia', value: 35, color: '#3b82f6' },
    { name: 'Neurologia', value: 25, color: '#06d6a0' },
    { name: 'Pediatria', value: 20, color: '#f59e0b' },
    { name: 'Ortopedia', value: 15, color: '#ef4444' },
    { name: 'Outros', value: 5, color: '#8b5cf6' },
  ];

  const performanceMetrics = [
    { metric: 'Taxa de Satisfação', value: '98.5%', change: '+2.1%', trend: 'up' },
    { metric: 'Tempo Médio de Consulta', value: '28 min', change: '-3 min', trend: 'down' },
    { metric: 'Taxa de Retorno', value: '22%', change: '+5%', trend: 'up' },
    { metric: 'Cancelamentos', value: '3.2%', change: '-1.1%', trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Analytics & Relatórios
            </h1>
            <p className="text-muted-foreground">Insights detalhados sobre sua prática médica</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtrar Período</span>
            </Button>
            
            <Button variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Atualizar</span>
            </Button>
            
            <Button variant="medical" className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar Relatório</span>
            </Button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceMetrics.map((metric, index) => (
            <Card key={index} className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.metric}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consultation Trends */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Evolução das Consultas</span>
                </CardTitle>
                <Badge variant="outline">Últimos 6 meses</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={consultationData}>
                    <defs>
                      <linearGradient id="consultasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="receitasGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06d6a0" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06d6a0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="consultas" 
                      stroke="#3b82f6" 
                      fillOpacity={1}
                      fill="url(#consultasGradient)" 
                      name="Consultas"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="receitas" 
                      stroke="#06d6a0" 
                      fillOpacity={1}
                      fill="url(#receitasGradient)" 
                      name="Receitas"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Specialty Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <PieChart className="w-5 h-5" />
                <span>Distribuição por Especialidade</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={specialtyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {specialtyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {specialtyData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Consulta concluída</p>
                    <p className="text-xs text-muted-foreground">Maria Silva - há 15 minutos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Receita assinada</p>
                    <p className="text-xs text-muted-foreground">João Santos - há 32 minutos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-yellow-50">
                  <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Agendamento confirmado</p>
                    <p className="text-xs text-muted-foreground">Ana Costa - há 1 hora</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Relatório gerado</p>
                    <p className="text-xs text-muted-foreground">Relatório mensal - há 2 horas</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total de Pacientes</h3>
            <p className="text-3xl font-bold">1,247</p>
            <p className="text-sm opacity-80">+12% este mês</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Receitas Emitidas</h3>
            <p className="text-3xl font-bold">3,892</p>
            <p className="text-sm opacity-80">+18% este mês</p>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-purple-500 to-violet-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Horas Trabalhadas</h3>
            <p className="text-3xl font-bold">156h</p>
            <p className="text-sm opacity-80">Meta: 160h/mês</p>
          </Card>
        </div>
      </div>
    </div>
  );
}