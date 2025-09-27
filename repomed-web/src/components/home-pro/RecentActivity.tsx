'use client';

import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, TestTube, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'prescription' | 'patient' | 'appointment' | 'exam';
  title: string;
  subtitle: string;
  timestamp: Date;
  priority?: 'high' | 'medium' | 'low';
}

const defaultActivities: ActivityItem[] = [
  { id: '1', type: 'prescription', title: 'Receita Digital - Maria Silva', subtitle: 'Assinada e enviada com CFM válido', timestamp: new Date('2025-09-22T14:15:00'), priority: 'high' },
  { id: '2', type: 'patient', title: 'Prontuário Digital - João Santos', subtitle: 'LGPD: dados criptografados', timestamp: new Date('2025-09-22T13:45:00'), priority: 'medium' },
  { id: '3', type: 'exam', title: 'Atestado Médico - Ana Costa', subtitle: 'Template personalizado CFM', timestamp: new Date('2025-09-22T12:30:00'), priority: 'low' },
  { id: '4', type: 'appointment', title: 'Consulta Agendada - Pedro Lima', subtitle: 'Documentos preparados', timestamp: new Date('2025-09-22T11:30:00'), priority: 'medium' }
];

export function RecentActivity({
  activities = defaultActivities,
  maxItems = 8,
  onActivityClick
}: {
  activities?: ActivityItem[];
  maxItems?: number;
  onActivityClick?: (activityId: string) => void;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'prescription': return <FileText size={18} />;
      case 'patient': return <User size={18} />;
      case 'appointment': return <Calendar size={18} />;
      case 'exam': return <TestTube size={18} />;
      default: return <Clock size={18} />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    if (!isClient) return 'há poucos minutos';

    const now = new Date();
    const diff = Math.abs(now.getTime() - timestamp.getTime());
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (minutes < 60) return `${minutes}min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return timestamp.toLocaleDateString();
  };

  return (
    <section className="activity-section">
      <h2>Atividade Recente</h2>
      <div className="activity-list">
        {activities.slice(0, maxItems).map((activity, index) => (
          <div
            key={activity.id}
            className="activity-item"
            data-priority={activity.priority}
            onClick={() => onActivityClick?.(activity.id)}
            tabIndex={0}
            role="button"
            aria-label={`${activity.title} - ${activity.subtitle} - ${formatTimestamp(activity.timestamp)}`}
          >
            <div className="activity-icon">{getIcon(activity.type)}</div>
            <div className="activity-content">
              <div className="activity-title">{activity.title}</div>
              <div className="activity-subtitle">{activity.subtitle}</div>
              <div className="activity-time">{formatTimestamp(activity.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}