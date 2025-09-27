'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  crmNumber?: string;
  systemStatus?: 'online' | 'maintenance' | 'offline';
  unreadNotifications?: number;
}

export function Header({
  userName = 'Dr. Usuário',
  crmNumber = 'CRM 12345',
  systemStatus = 'online',
  unreadNotifications = 0
}: HeaderProps) {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Bom dia');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentHour = new Date().getHours();
    if (currentHour < 12) setGreeting('Bom dia');
    else if (currentHour < 18) setGreeting('Boa tarde');
    else setGreeting('Boa noite');
  }, []);

  const handleNavigation = (route: string) => {
    try {
      if (isClient && router && router.push) {
        router.push(route);
      } else if (typeof window !== 'undefined') {
        window.location.href = route;
      }
    } catch (error) {
      console.error('Navigation error:', error);
      if (typeof window !== 'undefined') {
        window.location.href = route;
      }
    }
  };

  return (
    <header className="header">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>
            {greeting}, {userName}
          </h1>
          <div className="header-subtitle">
            <span>{crmNumber}</span>
            <span>•</span>
            <span>Sistema {systemStatus === 'online' ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={() => handleNavigation('/notificacoes')} title="Notificações">
            <Bell size={20} />
            {unreadNotifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                background: 'var(--error)',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {unreadNotifications}
              </span>
            )}
          </button>
          <button onClick={() => handleNavigation('/configuracoes')} title="Configurações">
            <Settings size={20} />
          </button>
          <button onClick={() => handleNavigation('/profile')} title="Perfil">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}