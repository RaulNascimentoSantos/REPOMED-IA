import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#6366f1"/>
              <path d="M16 8L20 12L16 16L12 12L16 8Z" fill="white"/>
              <path d="M16 16L20 20L16 24L12 20L16 16Z" fill="white" opacity="0.8"/>
            </svg>
            <span>repomed</span>
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
          
          <div className="user-menu">
            <button className="user-button">CM</button>
          </div>
        </div>
      </div>
    </header>
  );
}