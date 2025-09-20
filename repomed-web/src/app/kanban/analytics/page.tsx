'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingStates';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Activity,
  Download,
  RefreshCw,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { format, startOfWeek, startOfMonth, startOfYear, subDays, subWeeks, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  estimatedHours: number;
  actualHours: number;
}

interface Analytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageTimeToComplete: number;
  throughput: number;
  velocityByWeek: Array<{ week: string; completed: number; added: number }>;
  tasksByStatus: Array<{ status: string; count: number; percentage: number }>;
  tasksByPriority: Array<{ priority: string; count: number; percentage: number }>;
  tasksByAssignee: Array<{ assignee: string; tasks: number; completed: number; efficiency: number }>;
  burndownData: Array<{ date: string; remaining: number; ideal: number }>;
  cycleTimeData: Array<{ task: string; days: number; status: string }>;
  leadTimeData: Array<{ date: string; leadTime: number; target: number }>;
}

const STORAGE_KEY = 'kanban_board_data';

export default function KanbanAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Load and calculate analytics
  useEffect(() => {
    calculateAnalytics();
  }, [timeRange, selectedTeam]);

  const calculateAnalytics = async () => {
    setIsLoading(true);

    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Load tasks from localStorage
      const savedData = localStorage.getItem(STORAGE_KEY);
      const columns = savedData ? JSON.parse(savedData) : [];
      const allTasks: Task[] = columns.flatMap((col: any) => col.tasks || []);

      // Filter tasks by time range
      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case 'week':
          startDate = startOfWeek(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          break;
        case 'quarter':
          startDate = startOfMonth(subMonths(now, 3));
          break;
        case 'year':
          startDate = startOfYear(now);
          break;
      }

      const filteredTasks = allTasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= startDate && taskDate <= now;
      });

      // Calculate metrics
      const totalTasks = filteredTasks.length;
      const completedTasks = filteredTasks.filter(task => task.status === 'done').length;
      const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress').length;
      const overdueTasks = filteredTasks.filter(task => {
        if (!task.dueDate) return false;
        return new Date(task.dueDate) < now && task.status !== 'done';
      }).length;

      // Calculate average time to complete (mock data for demo)
      const averageTimeToComplete = Math.round(Math.random() * 5 + 3); // 3-8 days

      // Throughput (tasks completed per week)
      const throughput = Math.round(completedTasks / 4); // monthly average

      // Velocity by week
      const velocityByWeek = Array.from({ length: 4 }, (_, i) => {
        const weekStart = subWeeks(now, 3 - i);
        return {
          week: format(weekStart, 'dd/MM', { locale: ptBR }),
          completed: Math.round(Math.random() * 8 + 2),
          added: Math.round(Math.random() * 10 + 5)
        };
      });

      // Tasks by status
      const statusGroups = {
        backlog: filteredTasks.filter(t => t.status === 'backlog').length,
        todo: filteredTasks.filter(t => t.status === 'todo').length,
        in_progress: filteredTasks.filter(t => t.status === 'in_progress').length,
        review: filteredTasks.filter(t => t.status === 'review').length,
        done: filteredTasks.filter(t => t.status === 'done').length
      };

      const tasksByStatus = Object.entries(statusGroups).map(([status, count]) => ({
        status: status.replace('_', ' ').toUpperCase(),
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
      }));

      // Tasks by priority
      const priorityGroups = {
        low: filteredTasks.filter(t => t.priority === 'low').length,
        medium: filteredTasks.filter(t => t.priority === 'medium').length,
        high: filteredTasks.filter(t => t.priority === 'high').length
      };

      const tasksByPriority = Object.entries(priorityGroups).map(([priority, count]) => ({
        priority: priority.toUpperCase(),
        count,
        percentage: totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0
      }));

      // Tasks by assignee
      const assigneeGroups = filteredTasks.reduce((acc, task) => {
        const assignee = task.assignee || 'Unassigned';
        if (!acc[assignee]) {
          acc[assignee] = { total: 0, completed: 0 };
        }
        acc[assignee].total++;
        if (task.status === 'done') {
          acc[assignee].completed++;
        }
        return acc;
      }, {} as Record<string, { total: number; completed: number }>);

      const tasksByAssignee = Object.entries(assigneeGroups).map(([assignee, data]) => ({
        assignee,
        tasks: data.total,
        completed: data.completed,
        efficiency: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0
      })).sort((a, b) => b.tasks - a.tasks);

      // Burndown data (mock)
      const burndownData = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(now, 29 - i);
        const remaining = Math.max(0, totalTasks - Math.round((i / 29) * completedTasks));
        const ideal = Math.round(totalTasks - (totalTasks * i) / 29);
        return {
          date: format(date, 'dd/MM', { locale: ptBR }),
          remaining,
          ideal: Math.max(0, ideal)
        };
      });

      // Cycle time data
      const cycleTimeData = filteredTasks
        .filter(task => task.status === 'done')
        .slice(0, 10)
        .map(task => ({
          task: task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title,
          days: Math.round(Math.random() * 10 + 1),
          status: 'completed'
        }));

      // Lead time data
      const leadTimeData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(now, 6 - i);
        return {
          date: format(date, 'dd/MM', { locale: ptBR }),
          leadTime: Math.round(Math.random() * 5 + 2),
          target: 5
        };
      });

      const analyticsData: Analytics = {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        averageTimeToComplete,
        throughput,
        velocityByWeek,
        tasksByStatus,
        tasksByPriority,
        tasksByAssignee,
        burndownData,
        cycleTimeData,
        leadTimeData
      };

      setAnalytics(analyticsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error calculating analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const data = {
      generatedAt: new Date().toISOString(),
      timeRange,
      analytics
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kanban-analytics-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="page-container">
          <div className="content-wrapper">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p className="text-lg text-gray-600">Calculando analytics...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6 bg-slate-900 min-h-screen">
        <div className="page-container">
          <div className="content-wrapper">
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar analytics</h2>
              <p className="text-gray-600 mb-4">Não foi possível calcular as métricas do Kanban</p>
              <Button onClick={calculateAnalytics}>Tentar novamente</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="page-container">
        <div className="content-wrapper">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <BackButton href="/" inline />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Kanban</h1>
                  </div>
                </div>
                <p className="text-gray-600">
                  Análise detalhada de performance e produtividade do time
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Última atualização: {format(lastUpdated, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Time Range Filter */}
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">Última semana</option>
                  <option value="month">Último mês</option>
                  <option value="quarter">Último trimestre</option>
                  <option value="year">Último ano</option>
                </select>

                <Button
                  onClick={calculateAnalytics}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>

                <Button
                  onClick={exportAnalytics}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📋</div>
                <CheckCircle className="h-8 w-8 opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Total de Tarefas</h3>
              <div className="text-3xl font-bold">{analytics.totalTasks}</div>
              <p className="text-sm opacity-90 mt-2">No período selecionado</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">✅</div>
                <TrendingUp className="h-8 w-8 opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Concluídas</h3>
              <div className="text-3xl font-bold">{analytics.completedTasks}</div>
              <p className="text-sm opacity-90 mt-2">
                {analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0}% do total
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⚡</div>
                <Activity className="h-8 w-8 opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Em Progresso</h3>
              <div className="text-3xl font-bold">{analytics.inProgressTasks}</div>
              <p className="text-sm opacity-90 mt-2">Ativas no momento</p>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">⏰</div>
                <Clock className="h-8 w-8 opacity-80" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Atrasadas</h3>
              <div className="text-3xl font-bold">{analytics.overdueTasks}</div>
              <p className="text-sm opacity-90 mt-2">Prazo vencido</p>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Tempo Médio
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {analytics.averageTimeToComplete}
                </div>
                <p className="text-gray-600">dias para conclusão</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Throughput
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {analytics.throughput}
                </div>
                <p className="text-gray-600">tarefas/semana</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Eficiência do Time
              </h3>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {analytics.completedTasks > 0 && analytics.totalTasks > 0
                    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
                    : 0}%
                </div>
                <p className="text-gray-600">taxa de conclusão</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* Tasks by Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Distribuição por Status
              </h3>
              <div className="space-y-4">
                {analytics.tasksByStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium">{item.status}</span>
                        <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks by Priority */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Distribuição por Prioridade
              </h3>
              <div className="space-y-4">
                {analytics.tasksByPriority.map((item, index) => {
                  const colors = {
                    HIGH: 'bg-red-500',
                    MEDIUM: 'bg-yellow-500',
                    LOW: 'bg-green-500'
                  };
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{item.priority}</span>
                          <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all duration-300 ${colors[item.priority as keyof typeof colors] || 'bg-gray-400'}`}
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Performance por Membro
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Membro</th>
                    <th className="text-left py-3 px-4">Tarefas Totais</th>
                    <th className="text-left py-3 px-4">Concluídas</th>
                    <th className="text-left py-3 px-4">Eficiência</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.tasksByAssignee.map((member, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{member.assignee}</td>
                      <td className="py-3 px-4">{member.tasks}</td>
                      <td className="py-3 px-4">{member.completed}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${member.efficiency}%` }}
                            />
                          </div>
                          <span className="text-sm">{member.efficiency}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Items */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center text-yellow-800">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Recomendações
            </h3>
            <div className="space-y-3">
              {analytics.overdueTasks > 0 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm">
                    <strong>Atenção:</strong> {analytics.overdueTasks} tarefa(s) em atraso.
                    Revisar prazos e redistribuir se necessário.
                  </p>
                </div>
              )}

              {analytics.inProgressTasks > 5 && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                  <p className="text-sm">
                    <strong>WIP Alto:</strong> {analytics.inProgressTasks} tarefas em progresso.
                    Considere limitar o work-in-progress.
                  </p>
                </div>
              )}

              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm">
                  <strong>Performance:</strong> Taxa de conclusão de {" "}
                  {analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0}%.
                  Meta: manter acima de 80%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}