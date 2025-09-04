import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationsBell } from './notifications/NotificationsBell';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const [isAssinaturaDigital, setIsAssinaturaDigital] = useState(false);

  const navItems = [
    { path: '/patients', label: 'Pacientes' },
    { path: '/templates', label: 'Templates' },
    { path: '/documents-list', label: 'Documentos' },
    { path: '/metrics', label: 'Métricas' },
    { path: '/help', label: 'Ajuda' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <div style={{ 
              width: '40px', 
              height: '40px', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px',
              marginRight: '12px'
            }}>
              🏥
            </div>
            <span style={{
              fontSize: '24px',
              fontWeight: '600',
              background: 'linear-gradient(to right, #3b82f6, #10b981)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              RepoMed IA
            </span>
          </Link>
          
          <nav className="main-nav">
            {navItems.map(item => (
              <Link 
                key={item.path}
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <div className="toggle-container">
            <label className="toggle">
              <span className="toggle-label">Assinatura Digital</span>
              <input 
                type="checkbox" 
                checked={isAssinaturaDigital}
                onChange={(e) => setIsAssinaturaDigital(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          <Link to="/prescription/create" className="btn-primary">
            Criar prescrição
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M8 3V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </Link>
          
          <NotificationsBell />
          
          <div className="user-menu">
            <button className="user-button">CM</button>
          </div>
        </div>
      </div>
    </header>
  );
}