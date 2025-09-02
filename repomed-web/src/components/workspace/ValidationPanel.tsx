import { useState } from 'react';
import {
  Shield, AlertTriangle, CheckCircle, XCircle,
  FileSignature, QrCode, ExternalLink, Info,
  ChevronDown, ChevronUp, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ValidationPanelProps {
  collapsed: boolean;
}

export const ValidationPanel = ({ collapsed }: ValidationPanelProps) => {
  const [expanded, setExpanded] = useState({
    signature: true,
    compliance: true,
    interactions: false,
    risks: false
  });

  if (collapsed) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="transform -rotate-90 whitespace-nowrap text-sm font-medium text-neutral-500">
          Validação
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200">
        <h3 className="font-medium flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Validação e Compliance
        </h3>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Assinatura Digital */}
        <div className="border-b border-neutral-200">
          <button
            onClick={() => setExpanded({ ...expanded, signature: !expanded.signature })}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2">
              <FileSignature className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">Assinatura Digital</span>
            </div>
            {expanded.signature ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded.signature && (
            <div className="px-4 pb-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Documento não assinado</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Este documento precisa ser assinado digitalmente para ter validade legal.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  leftIcon={<FileSignature />}
                >
                  Assinar Documento
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Compliance */}
        <div className="border-b border-neutral-200">
          <button
            onClick={() => setExpanded({ ...expanded, compliance: !expanded.compliance })}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">Compliance Médico</span>
            </div>
            {expanded.compliance ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded.compliance && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {/* CFM */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">CFM</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Conforme</span>
                  </div>
                </div>

                {/* ANVISA */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">ANVISA</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Conforme</span>
                  </div>
                </div>

                {/* LGPD */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-600">LGPD</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-600">Conforme</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interações Medicamentosas */}
        <div className="border-b border-neutral-200">
          <button
            onClick={() => setExpanded({ ...expanded, interactions: !expanded.interactions })}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium">Interações</span>
            </div>
            {expanded.interactions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expanded.interactions && (
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">Nenhuma interação detectada</p>
                  <p className="text-xs text-green-700 mt-1">
                    Os medicamentos prescritos são compatíveis entre si.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};