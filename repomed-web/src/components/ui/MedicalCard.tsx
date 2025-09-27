'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MedicalCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'emerald' | 'indigo';
  onClick?: () => void;
  loading?: boolean;
  urgency?: 'low' | 'medium' | 'high' | 'critical';
  subtitle?: string;
  trend?: Array<number>;
}

const MedicalCard = React.memo(function MedicalCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  onClick,
  loading = false,
  urgency,
  subtitle,
  trend
}: MedicalCardProps) {
  // Theme-aware semantic color mapping
  const colorClasses = {
    blue: {
      bg: 'semantic-action-primary',
      text: 'semantic-action-primary',
      border: 'semantic-border-focus',
      contextVar: '--semantic-prescription'
    },
    green: {
      bg: 'semantic-status-normal',
      text: 'semantic-status-normal',
      border: 'semantic-border-success',
      contextVar: '--semantic-patient'
    },
    purple: {
      bg: 'semantic-action-secondary',
      text: 'semantic-action-secondary',
      border: 'semantic-border-focus',
      contextVar: '--semantic-appointment'
    },
    orange: {
      bg: 'semantic-status-warning',
      text: 'semantic-status-warning',
      border: 'semantic-border-error',
      contextVar: '--semantic-document'
    },
    red: {
      bg: 'semantic-status-critical',
      text: 'semantic-status-critical',
      border: 'semantic-border-error',
      contextVar: '--semantic-emergency'
    },
    emerald: {
      bg: 'semantic-status-normal',
      text: 'semantic-status-normal',
      border: 'semantic-border-success',
      contextVar: '--clinical-vitals'
    },
    indigo: {
      bg: 'semantic-action-primary',
      text: 'semantic-action-primary',
      border: 'semantic-border-focus',
      contextVar: '--clinical-lab'
    }
  };

  const urgencyClasses = {
    low: 'border-l-4',
    medium: 'border-l-4',
    high: 'border-l-4',
    critical: 'border-l-4 animate-pulse'
  };

  const changeTypeClasses = {
    positive: 'semantic-status-normal',
    negative: 'semantic-status-critical',
    neutral: 'semantic-text-secondary'
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`
        semantic-card
        hover:border-opacity-80 hover:shadow-lg
        transform hover:scale-105 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${urgency ? urgencyClasses[urgency] : ''}
        group relative overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Background gradient effect */}
      <div
        className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
        style={{ backgroundColor: `var(${classes.contextVar})` }}
      />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center" style={{backgroundColor: 'var(--semantic-bg-secondary)'}}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: 'var(--semantic-action-primary)'}} />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: `var(${classes.contextVar})` }}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>

          {urgency && (
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${urgency === 'critical' ? 'animate-pulse' : ''}`}
              style={{
                backgroundColor: urgency === 'critical' ? 'var(--semantic-status-critical)' :
                               urgency === 'high' ? 'var(--semantic-status-warning)' :
                               urgency === 'medium' ? 'var(--semantic-status-warning)' :
                               'var(--semantic-status-normal)'
              }}
            >
              {urgency.toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className={`space-y-2 ${urgency ? urgencyClasses[urgency] : ''}`}
          style={{
            borderLeftColor: urgency === 'critical' ? 'var(--semantic-status-critical)' :
                           urgency === 'high' ? 'var(--semantic-status-warning)' :
                           urgency === 'medium' ? 'var(--semantic-status-warning)' :
                           urgency === 'low' ? 'var(--semantic-status-normal)' : undefined
          }}
        >
          <h3 className="text-sm font-medium transition-colors" style={{color: 'var(--semantic-text-secondary)'}}>
            {title}
          </h3>

          <p className="text-3xl font-bold transition-colors" style={{color: 'var(--semantic-text-primary)'}}>
            {value}
          </p>

          {subtitle && (
            <p className="text-xs transition-colors" style={{color: 'var(--semantic-text-secondary)'}}>
              {subtitle}
            </p>
          )}

          {/* Change indicator */}
          {change && (
            <div className="flex items-center gap-1">
              <span
                className="text-sm font-medium"
                style={{
                  color: changeType === 'positive' ? 'var(--semantic-status-normal)' :
                         changeType === 'negative' ? 'var(--semantic-status-critical)' :
                         'var(--semantic-text-secondary)'
                }}
              >
                {changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→'} {change}
              </span>
            </div>
          )}

          {/* Mini trend chart */}
          {trend && (
            <div className="mt-3 flex items-end space-x-1 h-8">
              {trend.map((value, index) => (
                <div
                  key={index}
                  className="w-1 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{
                    height: `${(value / Math.max(...trend)) * 100}%`,
                    backgroundColor: `var(${classes.contextVar})`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default MedicalCard;