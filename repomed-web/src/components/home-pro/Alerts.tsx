'use client';

import React from 'react';
import { AlertTriangle, Clock, Calendar, X } from 'lucide-react';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp?: Date;
}

const defaultAlerts: Alert[] = [
  {
    id: 'alert-1',
    type: 'critical',
    title: 'Assinatura Digital Pendente',
    message: 'Receita de Maria Silva aguarda validação CFM há 15 min.',
    timestamp: new Date('2025-09-22T14:30:00')
  },
  {
    id: 'alert-2',
    type: 'warning',
    title: 'Backup LGPD Automático',
    message: 'Backup dos dados será executado em 30 minutos.',
    timestamp: new Date('2025-09-22T12:30:00')
  },
  {
    id: 'alert-3',
    type: 'info',
    title: 'Template Atualizado',
    message: 'Novos modelos CFM disponíveis para download.',
    timestamp: new Date('2025-09-22T10:15:00')
  }
];

export function Alerts({
  alerts = defaultAlerts,
  maxAlerts = 3,
  onDismissAlert,
  onAlertAction
}: {
  alerts?: Alert[];
  maxAlerts?: number;
  onDismissAlert?: (id: string) => void;
  onAlertAction?: (id: string) => void;
}) {
  const limitedAlerts = alerts.slice(0, maxAlerts);

  return (
    <section className="alerts-section">
      {limitedAlerts.map((alert) => (
        <div
          key={alert.id}
          className="alert-card"
          data-type={alert.type}
          onClick={() => onAlertAction?.(alert.id)}
          style={{ cursor: onAlertAction ? 'pointer' : 'default' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>{alert.title}</h3>
              <p>{alert.message}</p>
              {alert.timestamp && (
                <time>
                  {alert.timestamp.toLocaleTimeString()}
                </time>
              )}
            </div>
            {onDismissAlert && (
              <button
                className="dismiss-btn"
                onClick={() => onDismissAlert(alert.id)}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}