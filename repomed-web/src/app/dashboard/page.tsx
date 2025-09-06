'use client'

import { motion } from 'framer-motion'
import { 
  Activity, 
  Users, 
  Calendar, 
  FileText, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Heart,
  Brain,
  Stethoscope,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Bell,
  Settings,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line } from 'recharts'
import Link from 'next/link'

// Mock data for dashboard
const dashboardMetrics = {
  patients: {
    total: 1247,
    change: 12,
    trend: 'up'
  },
  appointments: {
    today: 24,
    thisWeek: 156,
    change: 8,
    trend: 'up'
  },
  documents: {
    total: 3891,
    thisMonth: 127,
    change: 23,
    trend: 'up'
  },
  revenue: {
    thisMonth: 45680,
    change: 15,
    trend: 'up'
  }
}

const recentActivities = [
  {
    id: '1',
    type: 'patient',
    title: 'Novo paciente cadastrado',
    description: 'Maria Silva, 45 anos',
    time: '5 min atrás',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    type: 'appointment',
    title: 'Consulta concluída',
    description: 'João Santos - Cardiologia',
    time: '12 min atrás',
    icon: Stethoscope,
    color: 'bg-green-500'
  },
  {
    id: '3',
    type: 'document',
    title: 'Prescrição gerada',
    description: 'Receituário #PR-2024-0156',
    time: '25 min atrás',
    icon: FileText,
    color: 'bg-purple-500'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Resultado crítico',
    description: 'Exame laboratorial - Ana Costa',
    time: '1 hora atrás',
    icon: AlertTriangle,
    color: 'bg-red-500'
  }
]

const upcomingAppointments = [
  {
    id: '1',
    patient: 'Carlos Oliveira',
    time: '14:30',
    type: 'Cardiologia',
    status: 'confirmed',
    duration: 30
  },
  {
    id: '2',
    patient: 'Ana Silva',
    time: '15:00',
    type: 'Retorno',
    status: 'confirmed',
    duration: 20
  },
  {
    id: '3',
    patient: 'Pedro Costa',
    time: '15:30',
    type: 'Primeira consulta',
    status: 'pending',
    duration: 45
  },
  {
    id: '4',
    patient: 'Maria Santos',
    time: '16:15',
    type: 'Exame',
    status: 'confirmed',
    duration: 30
  }
]

const chartData = [
  { name: 'Jan', consultas: 156, receitas: 89, exames: 45 },
  { name: 'Fev', consultas: 178, receitas: 102, exames: 52 },
  { name: 'Mar', consultas: 145, receitas: 87, exames: 38 },
  { name: 'Abr', consultas: 203, receitas: 121, exames: 67 },
  { name: 'Mai', consultas: 189, receitas: 114, exames: 58 },
  { name: 'Jun', consultas: 234, receitas: 142, exames: 73 }
]

const patientDistribution = [
  { name: 'Cardiologia', value: 35, color: '#0088FE' },
  { name: 'Clínica Geral', value: 28, color: '#00C49F' },
  { name: 'Neurologia', value: 22, color: '#FFBB28' },
  { name: 'Ortopedia', value: 15, color: '#FF8042' }
]

const performanceData = [
  { month: 'Jan', eficiencia: 85, satisfacao: 92 },
  { month: 'Fev', eficiencia: 88, satisfacao: 94 },
  { month: 'Mar', eficiencia: 82, satisfacao: 89 },
  { month: 'Abr', eficiencia: 91, satisfacao: 96 },
  { month: 'Mai', eficiencia: 87, satisfacao: 93 },
  { month: 'Jun', eficiencia: 94, satisfacao: 97 }
]

const criticalAlerts = [
  {
    id: '1',
    patient: 'João Silva',
    alert: 'Pressão arterial crítica',
    value: '180/110',
    time: '30 min atrás',
    severity: 'critical'
  },
  {
    id: '2',
    patient: 'Maria Costa',
    alert: 'Glicemia alterada',
    value: '280 mg/dL',
    time: '2 horas atrás',
    severity: 'high'
  },
  {
    id: '3',
    patient: 'Pedro Santos',
    alert: 'Medicação vencida',
    value: 'Losartana 50mg',
    time: '4 horas atrás',
    severity: 'medium'
  }
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="relative">
                <Stethoscope className="w-8 h-8 text-blue-600" />
                <div className="absolute inset-0 w-8 h-8 bg-blue-600/20 rounded-full blur-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Dashboard Médico
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link href="/patients/create">
              <Card className="medical-card hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Novo Paciente</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Cadastrar</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/patients/prescriptions/create">
              <Card className="medical-card hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nova Prescrição</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Criar</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/calendar">
              <Card className="medical-card hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Agendar</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Consulta</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/dashboard/analytics">
              <Card className="medical-card hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Ver Relatórios</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pacientes Ativos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardMetrics.patients.total.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{dashboardMetrics.patients.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">este mês</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Consultas Hoje</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardMetrics.appointments.today}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{dashboardMetrics.appointments.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">esta semana</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Documentos Gerados</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {dashboardMetrics.documents.total.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{dashboardMetrics.documents.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">este mês</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receita Mensal</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      R$ {dashboardMetrics.revenue.thisMonth.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600 font-medium">
                        +{dashboardMetrics.revenue.change}%
                      </span>
                      <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Main Chart Area */}
          <div className="col-span-8 space-y-6">
            {/* Activity Chart */}
            <Card className="medical-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Atividade Mensal</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="consultas" 
                        stackId="1" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="receitas" 
                        stackId="1" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="exames" 
                        stackId="1" 
                        stroke="#8B5CF6" 
                        fill="#8B5CF6" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Performance e Satisfação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="eficiencia" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="satisfacao" 
                        stroke="#10B981" 
                        strokeWidth={3}
                        dot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">94%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Eficiência Média</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">97%</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Satisfação Pacientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="col-span-4 space-y-6">
            {/* Critical Alerts */}
            <Card className="medical-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Alertas Críticos
                  </CardTitle>
                  <Badge variant="destructive">{criticalAlerts.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'critical' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                        : alert.severity === 'high'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                        : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{alert.patient}</p>
                      <span className="text-xs text-gray-500">{alert.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{alert.alert}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.value}</p>
                  </motion.div>
                ))}
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Todos os Alertas
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="medical-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    Próximas Consultas
                  </CardTitle>
                  <Badge variant="secondary">{upcomingAppointments.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm">{appointment.patient}</p>
                        <span className="text-sm font-medium text-blue-600">{appointment.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{appointment.type}</p>
                      <div className="flex items-center mt-2">
                        <Badge 
                          variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {appointment.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-2">{appointment.duration} min</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                <Link href="/calendar">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Calendar className="w-4 h-4 mr-2" />
                    Ver Agenda Completa
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Patient Distribution */}
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Distribuição por Especialidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={patientDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {patientDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {patientDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities */}
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Atividades Recentes</CardTitle>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className={`p-2 rounded-full ${activity.color} text-white`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{activity.description}</p>
                  </div>
                  <div className="text-xs text-gray-500">{activity.time}</div>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}