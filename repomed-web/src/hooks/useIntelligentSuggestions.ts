'use client';

/**
 * RepoMed IA v5.1 - Intelligent Suggestions Hook
 *
 * Sistema preditivo de IA para reduzir carga cognitiva médica:
 * - Sugestões baseadas em padrões de prescrição
 * - Autofill inteligente de dosagens
 * - Alertas de interações medicamentosas
 * - Lembretes de protocolos clínicos
 */

import { useState, useEffect, useCallback } from 'react';
import { useFeatureFlag } from '@/components/providers/FeatureFlagProvider';

export interface MedicalSuggestion {
  id: string;
  type: 'dosage' | 'interaction' | 'protocol' | 'frequency' | 'contraindication';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  suggestion: string;
  confidence: number; // 0-100
  sources?: string[];
  actions?: {
    apply?: () => void;
    dismiss?: () => void;
    learnMore?: () => void;
  };
}

export interface PatientContext {
  age?: number;
  weight?: number;
  allergies?: string[];
  currentMedications?: string[];
  conditions?: string[];
  lastVisit?: Date;
}

export interface PrescriptionContext {
  medication?: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  indication?: string;
}

interface UseIntelligentSuggestionsProps {
  patientContext?: PatientContext;
  prescriptionContext?: PrescriptionContext;
  enabled?: boolean;
}

// Simulação de base de conhecimento médico
const MEDICAL_KNOWLEDGE_BASE = {
  // Interações medicamentosas comuns
  interactions: [
    {
      medications: ['warfarina', 'aspirina'],
      severity: 'critical' as const,
      description: 'Alto risco de sangramento',
      recommendation: 'Considerar reduçãoo da dose ou monitoramento INR mais frequente'
    },
    {
      medications: ['metformina', 'insulina'],
      severity: 'warning' as const,
      description: 'Risco de hipoglicemia',
      recommendation: 'Monitorar glicemia e ajustar doses conforme necessário'
    }
  ],

  // Dosagens recomendadas por idade/peso
  dosageGuidelines: {
    'amoxicilina': {
      adult: '500mg 8/8h',
      pediatric: '25-45mg/kg/dia dividido em 3 doses',
      conditions: {
        'infecção leve': '500mg 8/8h',
        'infecção grave': '875mg 12/12h'
      }
    },
    'paracetamol': {
      adult: '500-1000mg 6/6h (máx 4g/dia)',
      pediatric: '10-15mg/kg/dose 6/6h',
      conditions: {
        'dor leve': '500mg 6/6h',
        'febre alta': '1000mg 6/6h'
      }
    }
  },

  // Protocolos clínicos comuns
  protocols: {
    'hipertensão': {
      firstLine: ['losartana', 'enalapril', 'hidroclorotiazida'],
      monitoring: 'Verificar pressão arterial em 2-4 semanas',
      lifestyle: 'Dieta hipossódica, exercícios, controle de peso'
    },
    'diabetes': {
      firstLine: ['metformina'],
      monitoring: 'HbA1c a cada 3 meses',
      lifestyle: 'Dieta para diabetes, exercícios regulares'
    }
  }
};

export function useIntelligentSuggestions({
  patientContext,
  prescriptionContext,
  enabled = true
}: UseIntelligentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<MedicalSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const isAiEnabled = useFeatureFlag('FF_AI_SUGGESTIONS');

  // Analisar interações medicamentosas
  const analyzeInteractions = useCallback((currentMeds: string[], newMed?: string) => {
    const allMeds = newMed ? [...currentMeds, newMed] : currentMeds;
    const interactionSuggestions: MedicalSuggestion[] = [];

    MEDICAL_KNOWLEDGE_BASE.interactions.forEach((interaction, index) => {
      const hasInteraction = interaction.medications.every(med =>
        allMeds.some(currentMed =>
          currentMed.toLowerCase().includes(med.toLowerCase())
        )
      );

      if (hasInteraction) {
        interactionSuggestions.push({
          id: `interaction-${index}`,
          type: 'interaction',
          severity: interaction.severity,
          title: `Interação: ${interaction.medications.join(' + ')}`,
          description: interaction.description,
          suggestion: interaction.recommendation,
          confidence: 95,
          sources: ['Micromedex', 'UpToDate'],
          actions: {
            dismiss: () => dismissSuggestion(`interaction-${index}`)
          }
        });
      }
    });

    return interactionSuggestions;
  }, []);

  // Sugerir dosagem baseada no contexto
  const suggestDosage = useCallback((medication: string, patient?: PatientContext) => {
    const medLower = medication.toLowerCase();
    const dosageSuggestions: MedicalSuggestion[] = [];

    Object.entries(MEDICAL_KNOWLEDGE_BASE.dosageGuidelines).forEach(([med, guidelines]) => {
      if (medLower.includes(med)) {
        const isAdult = !patient?.age || patient.age >= 18;
        const recommendedDose = isAdult ? guidelines.adult : guidelines.pediatric;

        dosageSuggestions.push({
          id: `dosage-${med}`,
          type: 'dosage',
          severity: 'info',
          title: `Dosagem sugerida para ${medication}`,
          description: `Baseado na idade ${patient?.age ? `(${patient.age} anos)` : '(adulto)'}`,
          suggestion: recommendedDose,
          confidence: 88,
          actions: {
            apply: () => applyDosageSuggestion(recommendedDose),
            dismiss: () => dismissSuggestion(`dosage-${med}`)
          }
        });
      }
    });

    return dosageSuggestions;
  }, []);

  // Sugerir protocolos clínicos
  const suggestProtocols = useCallback((conditions: string[]) => {
    const protocolSuggestions: MedicalSuggestion[] = [];

    conditions.forEach(condition => {
      const protocol = MEDICAL_KNOWLEDGE_BASE.protocols[condition.toLowerCase()];
      if (protocol) {
        protocolSuggestions.push({
          id: `protocol-${condition}`,
          type: 'protocol',
          severity: 'info',
          title: `Protocolo para ${condition}`,
          description: `Primeira linha: ${protocol.firstLine.join(', ')}`,
          suggestion: `${protocol.monitoring}. ${protocol.lifestyle}`,
          confidence: 92,
          actions: {
            learnMore: () => openProtocolDetails(condition),
            dismiss: () => dismissSuggestion(`protocol-${condition}`)
          }
        });
      }
    });

    return protocolSuggestions;
  }, []);

  // Analisar contexto e gerar sugestões
  const analyzeMedicalContext = useCallback(async () => {
    if (!enabled || !isAiEnabled) return;

    setIsAnalyzing(true);
    const newSuggestions: MedicalSuggestion[] = [];

    try {
      // Analisar interações
      if (patientContext?.currentMedications) {
        const interactions = analyzeInteractions(
          patientContext.currentMedications,
          prescriptionContext?.medication
        );
        newSuggestions.push(...interactions);
      }

      // Sugerir dosagem
      if (prescriptionContext?.medication) {
        const dosages = suggestDosage(prescriptionContext.medication, patientContext);
        newSuggestions.push(...dosages);
      }

      // Sugerir protocolos
      if (patientContext?.conditions) {
        const protocols = suggestProtocols(patientContext.conditions);
        newSuggestions.push(...protocols);
      }

      // Verificar contraindicações por idade
      if (patientContext?.age && patientContext.age >= 65) {
        newSuggestions.push({
          id: 'elderly-warning',
          type: 'contraindication',
          severity: 'warning',
          title: 'Paciente idoso - Atenção especial',
          description: 'Considerar redução de doses e monitoramento renal',
          suggestion: 'Iniciar com doses menores e titular conforme tolerância',
          confidence: 85,
          actions: {
            dismiss: () => dismissSuggestion('elderly-warning')
          }
        });
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.warn('Erro ao analisar contexto médico:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [patientContext, prescriptionContext, enabled, isAiEnabled, analyzeInteractions, suggestDosage, suggestProtocols]);

  // Actions
  const applyDosageSuggestion = (dosage: string) => {
    // Disparar evento customizado para componentes ouvirem
    window.dispatchEvent(new CustomEvent('applyDosageSuggestion', {
      detail: { dosage }
    }));
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const openProtocolDetails = (condition: string) => {
    // Abrir modal ou página com detalhes do protocolo
    window.dispatchEvent(new CustomEvent('openProtocolDetails', {
      detail: { condition }
    }));
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  // Executar análise quando contexto mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeMedicalContext();
    }, 500); // Debounce para evitar muitas chamadas

    return () => clearTimeout(timeoutId);
  }, [analyzeMedicalContext]);

  return {
    suggestions,
    isAnalyzing,
    analyzeMedicalContext,
    clearSuggestions,
    dismissSuggestion,
    // Métricas para analytics
    metrics: {
      totalSuggestions: suggestions.length,
      criticalSuggestions: suggestions.filter(s => s.severity === 'critical').length,
      averageConfidence: suggestions.length > 0
        ? Math.round(suggestions.reduce((acc, s) => acc + s.confidence, 0) / suggestions.length)
        : 0
    }
  };
}