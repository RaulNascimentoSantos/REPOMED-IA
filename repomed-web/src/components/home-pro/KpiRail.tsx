'use client';

import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface KpiData {
  label: string;
  value: string | number;
  subtitle?: string;
  metric?: string;
  isVital?: boolean;
}

const defaultKpis: KpiData[] = [
  { label: 'Documentos Hoje', value: 23, subtitle: 'receitas e atestados', metric: 'documents' },
  { label: 'Conformidade LGPD', value: '100%', subtitle: 'dados protegidos', metric: 'compliance' },
  { label: 'Assinatura Digital', value: 45, subtitle: 'documentos assinados', metric: 'signatures' },
  { label: 'Próxima Consulta', value: '14:30', subtitle: 'em 25 minutos', metric: 'next-appointment' }
];

export function KpiRail({ kpis = defaultKpis }: { kpis?: KpiData[] }) {
  return (
    <section className="kpi-rail">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className="kpi-card"
          data-metric={kpi.metric}
          data-vital={kpi.isVital}
        >
          <h3>{kpi.label}</h3>
          <div className="kpi-value">{kpi.value}</div>
          {kpi.subtitle && (
            <p className="kpi-subtitle">{kpi.subtitle}</p>
          )}
        </div>
      ))}
    </section>
  );
}