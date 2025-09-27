'use client';

import React from 'react';
import { Brain, BarChart3 } from 'lucide-react';

interface Insight {
  id: string;
  title: string;
  description: string;
  data?: { primary: string | number; secondary?: string; };
  icon: React.ReactNode;
}

const defaultInsights: Insight[] = [
  {
    id: 'document-analytics',
    title: 'Eficiência Documental',
    description: 'Tempo médio de criação e assinatura de documentos',
    data: { primary: '2.3min', secondary: 'tempo médio' },
    icon: <BarChart3 size={24} />
  },
  {
    id: 'compliance-score',
    title: 'Score de Conformidade',
    description: 'Aderência às normas CFM e LGPD em tempo real',
    data: { primary: '98.5%', secondary: 'conformidade total' },
    icon: <Brain size={24} />
  }
];

export function Insights({
  insights = defaultInsights,
  onInsightAction
}: {
  insights?: Insight[];
  onInsightAction?: (insightId: string) => void;
}) {
  return (
    <section>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Insights Médicos</h2>
      <div className="insights-grid">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="insight-card"
            onClick={() => onInsightAction?.(insight.id)}
          >
            <div className="insight-header">
              <div className="insight-icon">{insight.icon}</div>
              <div>
                <h3>{insight.title}</h3>
                <p>{insight.description}</p>
              </div>
            </div>
            {insight.data && (
              <div className="insight-data">
                <div className="primary-metric">
                  {insight.data.primary}
                </div>
                {insight.data.secondary && (
                  <div className="secondary-metric">
                    {insight.data.secondary}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}