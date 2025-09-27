'use client';

/**
 * 🏠 Home PRO V9 - Re-arquitetura Visual & UX
 *
 * Novo dashboard médico com:
 * - Eliminação de branding duplicado
 * - Hierarquia visual melhorada
 * - Design theme-aware (dark/light/medical/clinical)
 * - Layout otimizado: above/below fold
 * - Navegação funcional integrada
 * - Modular e testável
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isFeatureEnabled } from '@/config/feature-flags';
import { Header } from './Header';
import { KpiRail } from './KpiRail';
import { Alerts } from './Alerts';
import { QuickActions } from './QuickActions';
import { Insights } from './Insights';
import { RecentActivity } from './RecentActivity';
import '../../styles/home-pro.css';

interface HomeProV9Props {
  className?: string;
}

export function HomeProV9({ className = '' }: HomeProV9Props) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Verificar se a feature flag está ativada
  if (!isFeatureEnabled('FF_HOME_PRO_V9')) {
    return null;
  }

  // Enhanced navigation with safety checks
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

  // Medical navigation handlers
  const handleQuickAction = (actionId: string) => {
    const actionRoutes: Record<string, string> = {
      'new-patient': '/pacientes/novo',
      'new-prescription': '/prescricoes/nova',
      'schedule': '/agendamento',
      'records': '/pacientes/prontuarios',
      'exams': '/exames',
      'consultations': '/consultas'
    };

    const route = actionRoutes[actionId];
    if (route) {
      handleNavigation(route);
    }
  };

  const handleInsightAction = (insightId: string) => {
    const insightRoutes: Record<string, string> = {
      'patient-analytics': '/relatorios',
      'ai-recommendations': '/prescricoes'
    };

    const route = insightRoutes[insightId];
    if (route) {
      handleNavigation(route);
    }
  };

  const handleActivityClick = (activityId: string) => {
    // Navigate to relevant section based on activity type
    const activityRoutes: Record<string, string> = {
      '1': '/prescricoes',    // Prescription
      '2': '/pacientes',      // Patient
      '3': '/exames',         // Exam
      '4': '/consultas'       // Appointment
    };

    const route = activityRoutes[activityId];
    if (route) {
      handleNavigation(route);
    }
  };

  const handleAlertAction = (alertId: string) => {
    // Navigate based on alert priority
    if (alertId === 'alert-1') {
      handleNavigation('/pacientes'); // Critical patient alert
    } else if (alertId === 'alert-2') {
      handleNavigation('/exames');    // Exam pending alert
    }
  };

  return (
    <div className={`home-pro ${className}`}>
      {/* Above the Fold - Critical Information */}
      <div className="above-fold">
        {/* Header - NO duplicate branding */}
        <Header
          userName="Dr. João Silva"
          crmNumber="CRM SP 123456"
          systemStatus="online"
          unreadNotifications={3}
        />

        {/* KPI Rail - Large numbers (48px) */}
        <KpiRail />

        {/* Alerts - Max 3 with colored top borders */}
        <Alerts
          maxAlerts={3}
          onDismissAlert={(id) => console.log('Dismiss alert:', id)}
          onAlertAction={handleAlertAction}
        />
      </div>

      {/* Below the Fold - Secondary Content */}
      <div className="below-fold">
        {/* Quick Actions - 3×2 grid with navigation */}
        <QuickActions
          onActionClick={handleQuickAction}
        />

        {/* Insights - 2 large cards with navigation */}
        <Insights
          onInsightAction={handleInsightAction}
        />

        {/* Recent Activity - Zebra-striped list with navigation */}
        <RecentActivity
          maxItems={8}
          onActivityClick={handleActivityClick}
        />
      </div>
    </div>
  );
}