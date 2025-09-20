'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DocumentTemplateCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: 'receita' | 'atestado' | 'laudo' | 'relatorio' | 'encaminhamento' | 'declaracao';
  usageCount: number;
  aiAssisted?: boolean;
  legalCompliant?: boolean;
  onClick?: () => void;
  lastUsed?: string;
  estimatedTime?: string;
}

export default function DocumentTemplateCard({
  title,
  description,
  icon: Icon,
  category,
  usageCount,
  aiAssisted = false,
  legalCompliant = true,
  onClick,
  lastUsed,
  estimatedTime
}: DocumentTemplateCardProps) {
  const categoryColors = {
    receita: { bg: 'bg-green-600', text: 'text-green-400', border: 'border-green-500' },
    atestado: { bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
    laudo: { bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
    relatorio: { bg: 'bg-orange-600', text: 'text-orange-400', border: 'border-orange-500' },
    encaminhamento: { bg: 'bg-indigo-600', text: 'text-indigo-400', border: 'border-indigo-500' },
    declaracao: { bg: 'bg-teal-600', text: 'text-teal-400', border: 'border-teal-500' }
  };

  const colors = categoryColors[category];

  return (
    <div
      onClick={onClick}
      className={`
        bg-slate-800 rounded-xl p-6 border border-slate-700
        hover:${colors.border} hover:shadow-lg hover:shadow-${category === 'receita' ? 'green' : category === 'atestado' ? 'blue' : category === 'laudo' ? 'purple' : category === 'relatorio' ? 'orange' : category === 'encaminhamento' ? 'indigo' : 'teal'}-500/20
        transform hover:scale-105 transition-all duration-300
        cursor-pointer group relative overflow-hidden
      `}
    >
      {/* Background glow effect */}
      <div className={`absolute inset-0 ${colors.bg} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>

          <div className="flex flex-col items-end gap-2">
            {aiAssisted && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                IA Assistida
              </span>
            )}
            {legalCompliant && (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                CFM Validado
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h3 className={`font-semibold ${colors.text} group-hover:text-white transition-colors text-lg`}>
            {title}
          </h3>

          <p className="text-slate-300 text-sm group-hover:text-white transition-colors">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="text-slate-400 text-xs">
              <span>Usado {usageCount}x</span>
              {lastUsed && <span className="ml-2">• {lastUsed}</span>}
            </div>

            {estimatedTime && (
              <div className="text-slate-400 text-xs">
                ~{estimatedTime}
              </div>
            )}
          </div>

          {/* Category badge */}
          <div className="flex items-center justify-between">
            <span className={`text-xs px-3 py-1 rounded-full ${colors.bg} text-white font-medium`}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </span>

            <button className="text-slate-400 hover:text-white transition-colors text-sm">
              Criar Documento →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}