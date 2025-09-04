import React, { useState, useMemo } from 'react'
import { useMetricsDashboard, useDetailedMetrics, usePerformanceMetrics, useCacheStats } from '../hooks/useApi'
import { RefreshCw, TrendingUp, TrendingDown, Activity, Database, Zap, AlertCircle } from 'lucide-react'

const MetricsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days')
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Usando TanStack Query hooks otimizados
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading, 
    error: dashboardError,
    refetch: refetchDashboard
  } = useMetricsDashboard()

  const { 
    data: detailedData, 
    isLoading: detailedLoading 
  } = useDetailedMetrics(selectedPeriod)

  const { 
    data: performanceData, 
    isLoading: performanceLoading 
  } = usePerformanceMetrics()

  const { 
    data: cacheStats, 
    isLoading: cacheLoading 
  } = useCacheStats()

  // Computar métricas derivadas
  const computedMetrics = useMemo(() => {
    if (!dashboardData) return null

    return {
      totalDocuments: dashboardData.totalDocuments || 0,
      signedDocuments: dashboardData.signedDocuments || 0,
      pendingDocuments: dashboardData.pendingDocuments || 0,
      activePatients: dashboardData.activePatients || 0,
      signingRate: dashboardData.totalDocuments > 0 
        ? ((dashboardData.signedDocuments / dashboardData.totalDocuments) * 100).toFixed(1)
        : 0,
      growthRate: dashboardData.growthRate || 0
    }
  }, [dashboardData])

  // Loading state
  if (dashboardLoading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <RefreshCw className="animate-spin" size={32} color="#6366f1" />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Carregando métricas...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (dashboardError) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '32px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Erro ao carregar métricas</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {dashboardError.message || 'Não foi possível conectar com o servidor'}
          </p>
          <button
            onClick={() => refetchDashboard()}
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  }

  const metricCardStyle = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden'
  }

  return (
    <div style={{ 
      padding: '32px', 
      background: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* Header com controles */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: '24px', fontWeight: '600' }}>
            📊 Métricas do Sistema
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Monitoramento em tempo real do RepoMed IA
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value="24hours">Últimas 24h</option>
            <option value="7days">Últimos 7 dias</option>
            <option value="30days">Últimos 30 dias</option>
            <option value="90days">Últimos 90 dias</option>
          </select>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '8px 12px',
              background: autoRefresh ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Activity size={16} />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </button>

          <button
            onClick={() => refetchDashboard()}
            style={{
              padding: '8px 12px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>
        </div>
      </div>

      {/* KPIs Principais */}
      {computedMetrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <div style={metricCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Total de Documentos</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                  {computedMetrics.totalDocuments.toLocaleString()}
                </p>
              </div>
              <Database size={32} style={{ opacity: 0.8 }} />
            </div>
            {computedMetrics.growthRate !== 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginTop: '12px',
                fontSize: '14px',
                opacity: 0.9
              }}>
                {computedMetrics.growthRate > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                {Math.abs(computedMetrics.growthRate)}% vs período anterior
              </div>
            )}
          </div>

          <div style={{
            ...metricCardStyle,
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Documentos Assinados</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                  {computedMetrics.signedDocuments.toLocaleString()}
                </p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{computedMetrics.signingRate}%</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Taxa de Assinatura</div>
              </div>
            </div>
          </div>

          <div style={{
            ...metricCardStyle,
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Documentos Pendentes</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                  {computedMetrics.pendingDocuments.toLocaleString()}
                </p>
              </div>
              <AlertCircle size={32} style={{ opacity: 0.8 }} />
            </div>
          </div>

          <div style={{
            ...metricCardStyle,
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9 }}>Pacientes Ativos</h3>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold' }}>
                  {computedMetrics.activePatients.toLocaleString()}
                </p>
              </div>
              <Activity size={32} style={{ opacity: 0.8 }} />
            </div>
          </div>

        </div>
      )}

      {/* Performance do Sistema */}
      <div style={cardStyle}>
        <h3 style={{ 
          margin: '0 0 24px 0', 
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Zap size={20} />
          Performance do Sistema
          {performanceLoading && <RefreshCw size={16} className="animate-spin" />}
        </h3>
        
        {performanceData && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Tempo de Resposta</span>
                <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                  {performanceData.summary?.averageResponseTime || 0}ms
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#e0f2fe', borderRadius: '2px' }}>
                <div style={{ 
                  width: `${Math.min((performanceData.summary?.averageResponseTime || 0) / 10, 100)}%`, 
                  height: '100%', 
                  background: '#0ea5e9', 
                  borderRadius: '2px' 
                }} />
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Taxa de Sucesso</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>
                  {((1 - (performanceData.summary?.errorRate || 0)) * 100).toFixed(1)}%
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#dcfce7', borderRadius: '2px' }}>
                <div style={{ 
                  width: `${((1 - (performanceData.summary?.errorRate || 0)) * 100)}%`, 
                  height: '100%', 
                  background: '#10b981', 
                  borderRadius: '2px' 
                }} />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Cache Performance */}
      <div style={cardStyle}>
        <h3 style={{ 
          margin: '0 0 24px 0', 
          color: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Database size={20} />
          Performance do Cache
          {cacheLoading && <RefreshCw size={16} className="animate-spin" />}
        </h3>
        
        {cacheStats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Total de Chaves</span>
                <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                  {cacheStats.totalKeys || 0}
                </span>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#e0f2fe', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Uso de Memória</span>
                <span style={{ color: '#0ea5e9', fontWeight: 'bold' }}>
                  {cacheStats.memoryUsed || 'N/A'}
                </span>
              </div>
            </div>

            <div style={{ padding: '16px', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: '500' }}>Status</span>
                <span style={{ 
                  color: cacheStats.connected ? '#10b981' : '#ef4444', 
                  fontWeight: 'bold' 
                }}>
                  {cacheStats.connected ? '✅ Conectado' : '❌ Desconectado'}
                </span>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Ações de Exportação */}
      <div style={{ ...cardStyle, textAlign: 'center' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>📥 Exportar Relatórios</h3>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          Baixe relatórios detalhados das métricas do sistema
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => console.log('Export PDF')}
          >
            📄 Exportar PDF
          </button>
          <button
            style={{
              padding: '12px 24px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onClick={() => console.log('Export Excel')}
          >
            📊 Exportar Excel
          </button>
        </div>
      </div>

    </div>
  )
}

export default MetricsPage