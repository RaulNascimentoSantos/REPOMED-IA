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

export default function MedicalCard({
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
  const colorClasses = {
    blue: {
      bg: 'bg-blue-600',
      text: 'text-blue-400',
      border: 'border-blue-500',
      shadow: 'shadow-blue-500/20'
    },
    green: {
      bg: 'bg-green-600',
      text: 'text-green-400',
      border: 'border-green-500',
      shadow: 'shadow-green-500/20'
    },
    purple: {
      bg: 'bg-purple-600',
      text: 'text-purple-400',
      border: 'border-purple-500',
      shadow: 'shadow-purple-500/20'
    },
    orange: {
      bg: 'bg-orange-600',
      text: 'text-orange-400',
      border: 'border-orange-500',
      shadow: 'shadow-orange-500/20'
    },
    red: {
      bg: 'bg-red-600',
      text: 'text-red-400',
      border: 'border-red-500',
      shadow: 'shadow-red-500/20'
    },
    emerald: {
      bg: 'bg-emerald-600',
      text: 'text-emerald-400',
      border: 'border-emerald-500',
      shadow: 'shadow-emerald-500/20'
    },
    indigo: {
      bg: 'bg-indigo-600',
      text: 'text-indigo-400',
      border: 'border-indigo-500',
      shadow: 'shadow-indigo-500/20'
    }
  };

  const urgencyClasses = {
    low: 'border-l-4 border-l-green-500',
    medium: 'border-l-4 border-l-yellow-500',
    high: 'border-l-4 border-l-orange-500',
    critical: 'border-l-4 border-l-red-500 animate-pulse'
  };

  const changeTypeClasses = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-slate-400'
  };

  const classes = colorClasses[color];

  return (
    <div
      className={`
        card-primary rounded-xl p-6
        hover:border-opacity-80 hover:shadow-lg
        transform hover:scale-105 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${urgency ? urgencyClasses[urgency] : ''}
        group relative overflow-hidden
      `}
      onClick={onClick}
    >
      {/* Background gradient effect */}
      <div className={`absolute inset-0 ${classes.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 backdrop-blur-sm flex items-center justify-center" style={{backgroundColor: 'var(--bg-secondary)'}}>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderColor: 'var(--accent-primary)'}} />
        </div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${classes.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          {urgency && (
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              urgency === 'critical' ? 'bg-red-600 text-white' :
              urgency === 'high' ? 'bg-orange-600 text-white' :
              urgency === 'medium' ? 'bg-yellow-600 text-black' :
              'bg-green-600 text-white'
            }`}>
              {urgency.toUpperCase()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium transition-colors" style={{color: 'var(--text-muted)'}}>
            {title}
          </h3>

          <p className="text-3xl font-bold transition-colors" style={{color: 'var(--text-primary)'}}>
            {value}
          </p>

          {subtitle && (
            <p className="text-xs transition-colors" style={{color: 'var(--text-muted)'}}>
              {subtitle}
            </p>
          )}

          {/* Change indicator */}
          {change && (
            <div className="flex items-center gap-1">
              <span className={`text-sm font-medium ${changeTypeClasses[changeType]}`}>
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
                  className={`w-1 ${classes.bg} rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity`}
                  style={{ height: `${(value / Math.max(...trend)) * 100}%` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}