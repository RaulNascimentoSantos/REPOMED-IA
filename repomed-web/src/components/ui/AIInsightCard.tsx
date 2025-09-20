'use client';

import React, { useState } from 'react';
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Lightbulb,
  Zap,
  Eye,
  MessageCircle
} from 'lucide-react';

interface AIInsightProps {
  type: 'prediction' | 'alert' | 'recommendation' | 'trend' | 'success';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable?: boolean;
  onAction?: () => void;
  timestamp?: string;
  data?: any;
}

export default function AIInsightCard({
  type,
  title,
  description,
  confidence,
  priority,
  actionable = false,
  onAction,
  timestamp,
  data
}: AIInsightProps) {
  const [expanded, setExpanded] = useState(false);

  const typeConfig = {
    prediction: {
      icon: Brain,
      color: 'blue',
      bgColor: 'bg-blue-600',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500'
    },
    alert: {
      icon: AlertTriangle,
      color: 'red',
      bgColor: 'bg-red-600',
      textColor: 'text-red-400',
      borderColor: 'border-red-500'
    },
    recommendation: {
      icon: Lightbulb,
      color: 'yellow',
      bgColor: 'bg-yellow-600',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500'
    },
    trend: {
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-600',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500'
    },
    success: {
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-600',
      textColor: 'text-green-400',
      borderColor: 'border-green-500'
    }
  };

  const priorityConfig = {
    low: { intensity: 'opacity-60', pulse: '' },
    medium: { intensity: 'opacity-80', pulse: '' },
    high: { intensity: 'opacity-100', pulse: 'animate-pulse' },
    critical: { intensity: 'opacity-100', pulse: 'animate-pulse ring-2 ring-red-500' }
  };

  const config = typeConfig[type];
  const priorityStyle = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <div className={`
      card-primary rounded-xl p-6
      hover:border-opacity-80 hover:shadow-lg
      transform hover:scale-[1.02] transition-all duration-300
      ${priorityStyle.pulse}
      group relative overflow-hidden
    `}>
      {/* AI Glow Effect */}
      <div className={`absolute inset-0 ${config.bgColor} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className={`font-semibold ${config.textColor} group-hover:text-white transition-colors`}>
              {title}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <Zap className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-slate-400">IA Confiança: {confidence}%</span>
            </div>
          </div>
        </div>

        {/* Priority Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
          priority === 'critical' ? 'bg-red-600 text-white' :
          priority === 'high' ? 'bg-orange-600 text-white' :
          priority === 'medium' ? 'bg-yellow-600 text-black' :
          'bg-green-600 text-white'
        }`}>
          {priority.toUpperCase()}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-3">
        <p className="text-slate-300 text-sm group-hover:text-white transition-colors">
          {description}
        </p>

        {/* Confidence Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Confiança da IA</span>
            <span className={config.textColor}>{confidence}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className={`h-2 ${config.bgColor} rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${confidence}%` }}
            />
          </div>
        </div>

        {/* Timestamp */}
        {timestamp && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            {timestamp}
          </div>
        )}

        {/* Expandable Details */}
        {data && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <Eye className="w-3 h-3" />
            {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>
        )}

        {expanded && data && (
          <div className="mt-3 p-3 bg-slate-900 rounded-lg border border-slate-600">
            <pre className="text-xs text-slate-300 whitespace-pre-wrap">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {/* Action Button */}
        {actionable && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={onAction}
              className={`flex items-center gap-2 px-4 py-2 ${config.bgColor} hover:opacity-90 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm font-medium`}
            >
              <Target className="w-4 h-4" />
              Aplicar Recomendação
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm">
              <MessageCircle className="w-4 h-4" />
              Feedback
            </button>
          </div>
        )}
      </div>

      {/* AI Processing Animation */}
      <div className="absolute top-2 right-2">
        <div className={`w-2 h-2 ${config.bgColor} rounded-full animate-ping ${priorityStyle.intensity}`} />
      </div>
    </div>
  );
}