'use client';

import React from 'react';
import {
  Shield,
  FileCheck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Key,
  Lock,
  Stamp,
  Award
} from 'lucide-react';

interface DigitalSignatureCardProps {
  certificateValid?: boolean;
  expiryDate?: string;
  documentsSignedToday?: number;
  pendingSignatures?: number;
  legalCompliance?: boolean;
  onClick?: () => void;
}

export default function DigitalSignatureCard({
  certificateValid = true,
  expiryDate = '15/12/2025',
  documentsSignedToday = 12,
  pendingSignatures = 3,
  legalCompliance = true,
  onClick
}: DigitalSignatureCardProps) {
  return (
    <div onClick={onClick} className="semantic-card hover:border-opacity-80 hover:shadow-lg transform hover:scale-105 transition-all duration-300 cursor-pointer group relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-green-600 opacity-5 group-hover:opacity-10 transition-opacity duration-300" />

      {/* Header */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold transition-colors" style={{color: 'var(--text-primary)'}}>
                Assinatura Digital
              </h3>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Certificado ICP-Brasil</p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {certificateValid ? (
              <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Válido
              </span>
            ) : (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Expirado
              </span>
            )}

            {legalCompliance && (
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <Award className="w-3 h-3" />
                CFM/CRM
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-green-400" />
              <span className="text-slate-400 text-sm">Hoje</span>
            </div>
            <p className="text-2xl font-bold text-white">{documentsSignedToday}</p>
            <p className="text-green-400 text-xs">documentos assinados</p>
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span className="text-slate-400 text-sm">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-white">{pendingSignatures}</p>
            <p className="text-orange-400 text-xs">aguardando assinatura</p>
          </div>
        </div>

        {/* Certificate Info */}
        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">Certificado Digital</span>
            </div>
            <Lock className="w-4 h-4 text-green-400" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Validade:</span>
              <span className="text-white">{expiryDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Tipo:</span>
              <span className="text-white">A3 - ICP-Brasil</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Emissor:</span>
              <span className="text-white">Serpro</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg transition-colors font-medium">
            <Stamp className="w-4 h-4" />
            Assinar Documentos
          </button>

          <button className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Shield className="w-4 h-4" />
          </button>
        </div>

        {/* Legal Notice */}
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
          <p className="text-blue-300 text-xs">
            ✓ Assinaturas válidas juridicamente conforme MP 2.200-2/2001
          </p>
        </div>
      </div>
    </div>
  );
}