'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  FileText
} from 'lucide-react';

export default function FinanceiroPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');

  const financialMetrics = {
    receitaTotal: 45680,
    receitaMes: 15890,
    despesasTotal: 12340,
    lucroLiquido: 33340,
    crescimentoReceita: 15,
    crescimentoDespesas: -8,
    margemLucro: 73,
    ticketMedio: 180
  };

  const transacoes = [
    {
      id: 1,
      tipo: 'Receita',
      descricao: 'Consulta - Maria Silva Santos',
      valor: 180,
      data: '2024-01-15',
      status: 'Pago',
      categoria: 'Consulta',
      paciente: 'Maria Silva Santos',
      metodoPagamento: 'Cartão'
    },
    {
      id: 2,
      tipo: 'Receita',
      descricao: 'Consulta - João Carlos Oliveira',
      valor: 180,
      data: '2024-01-15',
      status: 'Pendente',
      categoria: 'Consulta',
      paciente: 'João Carlos Oliveira',
      metodoPagamento: 'PIX'
    },
    {
      id: 3,
      tipo: 'Despesa',
      descricao: 'Equipamento Médico',
      valor: -850,
      data: '2024-01-14',
      status: 'Pago',
      categoria: 'Equipamento',
      fornecedor: 'MedTech Brasil',
      metodoPagamento: 'Transferência'
    },
    {
      id: 4,
      tipo: 'Receita',
      descricao: 'Exame - Ana Paula Costa',
      valor: 120,
      data: '2024-01-14',
      status: 'Pago',
      categoria: 'Exame',
      paciente: 'Ana Paula Costa',
      metodoPagamento: 'Dinheiro'
    },
    {
      id: 5,
      tipo: 'Despesa',
      descricao: 'Aluguel da Clínica',
      valor: -2500,
      data: '2024-01-13',
      status: 'Atrasado',
      categoria: 'Infraestrutura',
      fornecedor: 'Imobiliária Central',
      metodoPagamento: 'Boleto'
    }
  ];

  const categorias = [
    { nome: 'Consultas', valor: 28500, cor: 'bg-blue-500', porcentagem: 62 },
    { nome: 'Exames', valor: 8900, cor: 'bg-green-500', porcentagem: 19 },
    { nome: 'Procedimentos', valor: 5600, cor: 'bg-purple-500', porcentagem: 12 },
    { nome: 'Outros', valor: 2680, cor: 'bg-orange-500', porcentagem: 7 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pago': return 'text-green-400';
      case 'Pendente': return 'text-yellow-400';
      case 'Atrasado': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pago': return 'bg-green-600';
      case 'Pendente': return 'bg-yellow-600';
      case 'Atrasado': return 'bg-red-600';
      default: return 'bg-slate-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pago': return CheckCircle;
      case 'Pendente': return Clock;
      case 'Atrasado': return AlertCircle;
      default: return XCircle;
    }
  };

  const filteredTransacoes = transacoes.filter(transacao =>
    transacao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transacao.paciente && transacao.paciente.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transacao.fornecedor && transacao.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Financeiro</h1>
              <p className="text-slate-400">Gestão financeira e faturamento</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nova Transação</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'dashboard'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('transacoes')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'transacoes'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transações
        </button>
        <button
          onClick={() => setActiveTab('relatorios')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'relatorios'
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Relatórios
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-400 text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +{financialMetrics.crescimentoReceita}%
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Receita Total</h3>
              <h2 className="text-3xl font-bold text-white">R$ {financialMetrics.receitaTotal.toLocaleString()}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <span className="text-red-400 text-sm flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  {financialMetrics.crescimentoDespesas}%
                </span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Despesas</h3>
              <h2 className="text-3xl font-bold text-white">R$ {financialMetrics.despesasTotal.toLocaleString()}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-purple-400 text-sm">{financialMetrics.margemLucro}%</span>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Lucro Líquido</h3>
              <h2 className="text-3xl font-bold text-white">R$ {financialMetrics.lucroLiquido.toLocaleString()}</h2>
            </div>

            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-slate-400 text-sm font-medium mb-1">Ticket Médio</h3>
              <h2 className="text-3xl font-bold text-white">R$ {financialMetrics.ticketMedio}</h2>
            </div>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Receita por Categoria */}
            <div className="lg:col-span-2 bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Receita por Categoria</h3>
                <PieChart className="w-5 h-5 text-blue-500" />
              </div>

              <div className="space-y-4">
                {categorias.map((categoria, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 ${categoria.cor} rounded`}></div>
                      <span className="text-white">{categoria.nome}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-32 h-2 bg-slate-700 rounded-full">
                        <div
                          className={`h-2 ${categoria.cor} rounded-full`}
                          style={{ width: `${categoria.porcentagem}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium text-sm w-16 text-right">
                        R$ {categoria.valor.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Mensal */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold text-white mb-6">Resumo Mensal</h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Receita do Mês</span>
                  <span className="text-green-400 font-medium">R$ {financialMetrics.receitaMes.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Meta Mensal</span>
                  <span className="text-blue-400 font-medium">R$ 18.000</span>
                </div>

                <div className="w-full h-2 bg-slate-700 rounded-full">
                  <div
                    className="h-2 bg-green-500 rounded-full"
                    style={{ width: `${(financialMetrics.receitaMes / 18000) * 100}%` }}
                  ></div>
                </div>

                <div className="text-center">
                  <span className="text-slate-400 text-sm">
                    {Math.round((financialMetrics.receitaMes / 18000) * 100)}% da meta atingida
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-white font-medium mb-3">Próximos Vencimentos</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Aluguel</span>
                    <span className="text-red-400">R$ 2.500</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Equipamentos</span>
                    <span className="text-yellow-400">R$ 680</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Seguros</span>
                    <span className="text-blue-400">R$ 320</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transações Tab */}
      {activeTab === 'transacoes' && (
        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
                />
              </div>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Últimos 7 dias</option>
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
              </select>
            </div>

            <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
              <Filter className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Lista de Transações */}
          <div className="space-y-4">
            {filteredTransacoes.map((transacao) => {
              const StatusIcon = getStatusIcon(transacao.status);

              return (
                <div
                  key={transacao.id}
                  className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        transacao.tipo === 'Receita' ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {transacao.tipo === 'Receita' ? (
                          <TrendingUp className="w-6 h-6 text-white" />
                        ) : (
                          <TrendingDown className="w-6 h-6 text-white" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-white font-semibold">{transacao.descricao}</h3>
                          <span className={`px-2 py-1 ${getStatusBadge(transacao.status)} text-white text-xs rounded-full`}>
                            {transacao.status}
                          </span>
                        </div>

                        <div className="flex items-center space-x-4 text-slate-400 text-sm">
                          <span>{transacao.categoria}</span>
                          <span>{new Date(transacao.data).toLocaleDateString('pt-BR')}</span>
                          <span>{transacao.metodoPagamento}</span>
                          {transacao.paciente && (
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {transacao.paciente}
                            </span>
                          )}
                          {transacao.fornecedor && (
                            <span>{transacao.fornecedor}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transacao.valor > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transacao.valor > 0 ? '+' : ''}R$ {Math.abs(transacao.valor).toLocaleString()}
                        </p>
                        <p className={`text-sm ${getStatusColor(transacao.status)}`}>
                          {transacao.status}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Relatórios Tab */}
      {activeTab === 'relatorios' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">Relatórios Financeiros</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Demonstrativo de Resultados', description: 'Receitas x Despesas', icon: BarChart3 },
              { title: 'Fluxo de Caixa', description: 'Entradas e saídas', icon: TrendingUp },
              { title: 'Análise de Categorias', description: 'Breakdown por categoria', icon: PieChart },
              { title: 'Contas a Receber', description: 'Pendências de pagamento', icon: Clock },
              { title: 'Contas a Pagar', description: 'Obrigações futuras', icon: Receipt },
              { title: 'Relatório Anual', description: 'Visão geral do ano', icon: Calendar }
            ].map((relatorio, index) => {
              const Icon = relatorio.icon;

              return (
                <div key={index} className="bg-slate-700 rounded-lg p-6 hover:bg-slate-600 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{relatorio.title}</h3>
                      <p className="text-slate-400 text-sm">{relatorio.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">Visualizar</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}