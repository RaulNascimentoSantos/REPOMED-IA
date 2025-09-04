import React from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [apiStatus, setApiStatus] = React.useState('checking')
  const [stats, setStats] = React.useState(null)
  
  React.useEffect(() => {
    // Test API connection and get stats
    Promise.all([
      fetch('http://localhost:8085/api/templates'),
      fetch('http://localhost:8085/documentation').catch(() => null)
    ]).then(async ([templatesRes, docsRes]) => {
      if (templatesRes.ok) {
        setApiStatus('online')
        const templates = await templatesRes.json()
        setStats({ templates: templates.total || 0 })
      } else {
        setApiStatus('error')
      }
    }).catch(() => setApiStatus('offline'))
  }, [])
  
  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)'
  }

  const buttonStyle = (bgColor, hoverColor) => ({
    padding: '16px 24px',
    background: bgColor,
    color: 'white',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none'
  })
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 'bold',
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 4px 8px rgba(0,0,0,0.3)'
          }}>
            🏥 RepoMed IA
          </h1>
          
          <p style={{ fontSize: '1.5rem', color: '#e0e7ff', marginBottom: '8px' }}>
            Sistema Médico Inteligente
          </p>
          <p style={{ fontSize: '1rem', color: '#c7d2fe' }}>
            Gerencie pacientes, documentos e métricas em tempo real
          </p>
        </div>

        {/* Status Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          
          {/* System Status */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#1f2937' }}>
              🔧 Status do Sistema
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>🌐 Frontend</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✅ Online</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                <span style={{ fontWeight: '500' }}>⚡ Backend API</span>
                <span style={{ 
                  color: apiStatus === 'online' ? '#10b981' : apiStatus === 'checking' ? '#f59e0b' : '#ef4444',
                  fontWeight: 'bold'
                }}>
                  {apiStatus === 'online' ? '✅ Online' : 
                   apiStatus === 'checking' ? '⏳ Verificando...' : '❌ Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div style={cardStyle}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', color: '#1f2937' }}>
                📊 Estatísticas Rápidas
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ textAlign: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>
                    {stats.summary?.totalDocuments || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Documentos</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                    {stats.summary?.totalPatients || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Pacientes</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                    {stats.summary?.totalTemplates || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Templates</div>
                </div>
                <div style={{ textAlign: 'center', padding: '12px', background: '#f3f4f6', borderRadius: '8px' }}>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                    {stats.today?.documents || 0}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Hoje</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          
          <Link to="/patients" style={buttonStyle('linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)')}>
            <span style={{ fontSize: '2rem' }}>👥</span>
            <div>
              <div style={{ fontSize: '1.1rem' }}>Pacientes</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Gerenciar pacientes</div>
            </div>
          </Link>
          
          <Link to="/templates" style={buttonStyle('linear-gradient(135deg, #10b981 0%, #059669 100%)')}>
            <span style={{ fontSize: '2rem' }}>📋</span>
            <div>
              <div style={{ fontSize: '1.1rem' }}>Templates</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Modelos médicos</div>
            </div>
          </Link>
          
          <Link to="/documents-new" style={buttonStyle('linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)')}>
            <span style={{ fontSize: '2rem' }}>📄</span>
            <div>
              <div style={{ fontSize: '1.1rem' }}>Documentos</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Criar e gerenciar</div>
            </div>
          </Link>
          
          <Link to="/metrics" style={buttonStyle('linear-gradient(135deg, #f59e0b 0%, #d97706 100%)')}>
            <span style={{ fontSize: '2rem' }}>📊</span>
            <div>
              <div style={{ fontSize: '1.1rem' }}>Métricas</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Dashboard analítico</div>
            </div>
          </Link>
          
          <Link to="/prescription/create" style={buttonStyle('linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')}>
            <span style={{ fontSize: '2rem' }}>💊</span>
            <div>
              <div style={{ fontSize: '1.1rem' }}>Prescrições</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Criar receitas</div>
            </div>
          </Link>
          
          <Link to="/documents-list" style={buttonStyle('linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)')}>
            <span style={{ fontSize: '2rem' }}>📁</span>
            <div>
              <div style={{ fontSize: '1.1rem' }}>Arquivos</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Listar documentos</div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: '48px', 
          textAlign: 'center',
          padding: '24px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <p style={{ color: '#e0e7ff', marginBottom: '16px' }}>
            🚀 <strong>Sistema em produção</strong> - Todos os módulos funcionais
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <a 
              href="http://localhost:8085/documentation" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#c7d2fe', textDecoration: 'none' }}
            >
              📚 Documentação API
            </a>
            <Link to="/test" style={{ color: '#c7d2fe', textDecoration: 'none' }}>
              🧪 Página de Testes
            </Link>
            <Link to="/auth/login" style={{ color: '#c7d2fe', textDecoration: 'none' }}>
              🔐 Área de Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}