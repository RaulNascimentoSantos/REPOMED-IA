import { useState } from 'react';
import { api } from '@/lib/api';

interface AIRequest {
  type: 'prescription' | 'document' | 'diagnosis';
  prompt: string;
  context?: Record<string, any>;
}

interface AIResponse {
  content: string;
  suggestions?: string[];
  confidence?: number;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateContent = async (request: AIRequest): Promise<AIResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post<AIResponse>('/api/ai/generate', request);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar conteúdo');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generatePrescription = async (symptoms: string, patientInfo?: any) => {
    return generateContent({
      type: 'prescription',
      prompt: `Gerar prescrição para paciente com os seguintes sintomas: ${symptoms}`,
      context: { patient: patientInfo }
    });
  };

  const generateDocument = async (type: string, content: string) => {
    return generateContent({
      type: 'document',
      prompt: `Gerar ${type} com base no conteúdo: ${content}`
    });
  };

  const suggestDiagnosis = async (symptoms: string) => {
    return generateContent({
      type: 'diagnosis',
      prompt: `Sugerir possíveis diagnósticos para os sintomas: ${symptoms}`
    });
  };

  return {
    loading,
    error,
    generateContent,
    generatePrescription,
    generateDocument,
    suggestDiagnosis
  };
};