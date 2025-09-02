import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export function Navigation() {
  const location = useLocation()
  
  const navItems = [
    { path: '/', label: '🏠 Home', description: 'Página inicial' },
    { path: '/workspace', label: '🏥 Workspace', description: 'Ambiente médico' },
    { path: '/documents', label: '📄 Documentos', description: 'Gerenciar documentos' },
    { path: '/documents/create', label: '➕ Criar', description: 'Novo documento' },
    { path: '/test', label: '🧪 Testes', description: 'Diagnóstico do sistema' }
  ]

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      padding: '8px 0',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              🏥
            </div>
            <span style={{
              fontSize: '20px',
              fontWeight: '600',
              background: 'linear-gradient(to right, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              RepoMed IA
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center'
        }}>
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '500',
                color: isActive(item.path) ? 'white' : '#6b7280',
                background: isActive(item.path) ? '#3b82f6' : 'transparent',
                transition: 'all 0.2s',
                position: 'relative',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.background = '#f3f4f6'
                  e.target.style.color = '#374151'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.background = 'transparent'
                  e.target.style.color = '#6b7280'
                }
              }}
              title={item.description}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '12px',
          color: '#10b981'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            animation: 'pulse 2s infinite'
          }}></div>
          Sistema Online
        </div>
      </div>

      {/* CSS for pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </nav>
  )
}

export function NavigationBreadcrumb() {
  const location = useLocation()
  
  const getBreadcrumb = () => {
    const path = location.pathname
    
    if (path === '/') return [{ label: '🏠 Home', path: '/' }]
    if (path === '/workspace') return [
      { label: '🏠 Home', path: '/' },
      { label: '🏥 Workspace', path: '/workspace' }
    ]
    if (path === '/documents') return [
      { label: '🏠 Home', path: '/' },
      { label: '📄 Documentos', path: '/documents' }
    ]
    if (path === '/documents/create') return [
      { label: '🏠 Home', path: '/' },
      { label: '📄 Documentos', path: '/documents' },
      { label: '➕ Criar', path: '/documents/create' }
    ]
    if (path === '/test') return [
      { label: '🏠 Home', path: '/' },
      { label: '🧪 Testes', path: '/test' }
    ]
    
    return [{ label: '🏠 Home', path: '/' }]
  }

  const breadcrumbs = getBreadcrumb()

  if (breadcrumbs.length <= 1) return null

  return (
    <div style={{
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0',
      padding: '8px 0'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px'
      }}>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <span style={{ color: '#d1d5db' }}>→</span>
            )}
            {index === breadcrumbs.length - 1 ? (
              <span style={{ color: '#1f2937', fontWeight: '500' }}>
                {crumb.label}
              </span>
            ) : (
              <Link 
                to={crumb.path}
                style={{
                  color: '#6b7280',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#3b82f6'
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#6b7280'
                }}
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}