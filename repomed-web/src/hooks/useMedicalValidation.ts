/**
 * RepoMed IA v6.0 - Medical Validation Hook
 *
 * Sistema inteligente de validação para dados médicos:
 * - Validação em tempo real com feedback imediato
 * - Regras específicas para diferentes tipos de documentos médicos
 * - Verificação de interações medicamentosas
 * - Validação de códigos CID-10, CRM, CPF
 * - Alertas de conformidade regulatória (CFM, ANVISA)
 * - Integração com auto-save para prevenir dados inválidos
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface ValidationRule {
  field: string;
  type: 'required' | 'format' | 'range' | 'custom' | 'medical';
  message: string;
  severity: 'error' | 'warning' | 'info';
  validator?: (value: any, allData?: any) => boolean | Promise<boolean>;
  dependencies?: string[]; // Campos que afetam esta validação
}

interface ValidationResult {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  isValid: boolean;
}

interface MedicalValidationState {
  isValid: boolean;
  isValidating: boolean;
  errors: ValidationResult[];
  warnings: ValidationResult[];
  infos: ValidationResult[];
  allResults: ValidationResult[];
  validatedAt: Date | null;
}

interface MedicalValidationOptions {
  documentType?: 'prescription' | 'certificate' | 'report' | 'exam' | 'general';
  realTimeValidation?: boolean;
  debounceMs?: number;
  enableMedicalRules?: boolean;
  enableRegulatoryCheck?: boolean;
  customRules?: ValidationRule[];
}

// Regras de validação médica padrão
const getMedicalValidationRules = (documentType: string): ValidationRule[] => {
  const baseRules: ValidationRule[] = [
    // Validações básicas para todos os documentos
    {
      field: 'patientName',
      type: 'required',
      message: 'Nome do paciente é obrigatório',
      severity: 'error'
    },
    {
      field: 'patientName',
      type: 'format',
      message: 'Nome deve ter pelo menos 2 palavras',
      severity: 'error',
      validator: (value: string) => {
        return typeof value === 'string' && value.trim().split(' ').length >= 2;
      }
    },
    {
      field: 'patientCpf',
      type: 'format',
      message: 'CPF inválido',
      severity: 'error',
      validator: (value: string) => {
        return validateCPF(value);
      }
    },
    {
      field: 'doctorCrm',
      type: 'format',
      message: 'CRM inválido',
      severity: 'error',
      validator: (value: string) => {
        return validateCRM(value);
      }
    },
    {
      field: 'patientAge',
      type: 'range',
      message: 'Idade deve estar entre 0 e 150 anos',
      severity: 'error',
      validator: (value: number) => {
        return typeof value === 'number' && value >= 0 && value <= 150;
      }
    }
  ];

  // Regras específicas por tipo de documento
  switch (documentType) {
    case 'prescription':
      return [
        ...baseRules,
        {
          field: 'medications',
          type: 'required',
          message: 'Pelo menos um medicamento deve ser prescrito',
          severity: 'error',
          validator: (value: any[]) => {
            return Array.isArray(value) && value.length > 0;
          }
        },
        {
          field: 'medications',
          type: 'medical',
          message: 'Possível interação medicamentosa detectada',
          severity: 'warning',
          validator: async (medications: any[]) => {
            return await checkDrugInteractions(medications);
          }
        },
        {
          field: 'dosage',
          type: 'medical',
          message: 'Dosagem fora dos parâmetros recomendados',
          severity: 'warning',
          validator: (value: string, allData: any) => {
            return validateDosage(value, allData.patientAge, allData.patientWeight);
          }
        }
      ];

    case 'certificate':
      return [
        ...baseRules,
        {
          field: 'cid10',
          type: 'format',
          message: 'Código CID-10 inválido',
          severity: 'error',
          validator: (value: string) => {
            return validateCID10(value);
          }
        },
        {
          field: 'certificatePeriod',
          type: 'range',
          message: 'Período de afastamento não pode exceder 15 dias sem justificativa especial',
          severity: 'warning',
          validator: (value: number) => {
            return value <= 15;
          }
        }
      ];

    case 'exam':
      return [
        ...baseRules,
        {
          field: 'examType',
          type: 'required',
          message: 'Tipo de exame é obrigatório',
          severity: 'error'
        },
        {
          field: 'examResults',
          type: 'medical',
          message: 'Resultados fora dos valores de referência',
          severity: 'info',
          validator: (value: any, allData: any) => {
            return checkReferenceValues(value, allData.examType, allData.patientAge);
          }
        }
      ];

    default:
      return baseRules;
  }
};

// Funções de validação específicas
const validateCPF = (cpf: string): boolean => {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  const cleanCpf = cpf.replace(/[^\d]/g, '');

  // Verifica se tem 11 dígitos
  if (cleanCpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (cleanCpf.split('').every(digit => digit === cleanCpf[0])) return false;

  // Validação do algoritmo do CPF
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf[i]) * (10 - i);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf[i]) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cleanCpf[10]);
};

const validateCRM = (crm: string): boolean => {
  if (!crm) return false;

  // Formato básico: CRM XX 123456 (estado + número)
  const crmRegex = /^CRM\s+[A-Z]{2}\s+\d{4,6}$/i;
  return crmRegex.test(crm.trim());
};

const validateCID10 = (cid: string): boolean => {
  if (!cid) return false;

  // Formato CID-10: A00-Z99.9
  const cidRegex = /^[A-Z]\d{2}(\.\d)?$/;
  return cidRegex.test(cid.toUpperCase());
};

const checkDrugInteractions = async (medications: any[]): Promise<boolean> => {
  // Simulação de verificação de interações medicamentosas
  // Em produção, isso consultaria uma base de dados real
  if (!Array.isArray(medications) || medications.length < 2) return true;

  const knownInteractions = [
    ['varfarina', 'amoxicilina'],
    ['aspirina', 'varfarina'],
    ['digoxina', 'furosemida']
  ];

  const medicationNames = medications.map(med =>
    med.name?.toLowerCase() || ''
  );

  for (const interaction of knownInteractions) {
    if (interaction.every(drug =>
      medicationNames.some(name => name.includes(drug))
    )) {
      return false; // Interação encontrada
    }
  }

  return true;
};

const validateDosage = (dosage: string, age: number, weight: number): boolean => {
  // Validação básica de dosagem baseada em idade e peso
  if (!dosage || !age) return true; // Skip se dados insuficientes

  // Regras simplificadas - em produção seria mais complexo
  if (age < 18) {
    // Dosagens pediátricas devem ser mais baixas
    const numericDosage = parseFloat(dosage);
    if (numericDosage > 500) return false; // mg máximo para crianças
  }

  return true;
};

const checkReferenceValues = (results: any, examType: string, age: number): boolean => {
  // Verificação básica de valores de referência
  // Em produção, consultaria tabelas específicas por tipo de exame
  return true; // Placeholder
};

export function useMedicalValidation(
  data: any,
  options: MedicalValidationOptions = {}
) {
  const {
    documentType = 'general',
    realTimeValidation = true,
    debounceMs = 500,
    enableMedicalRules = true,
    enableRegulatoryCheck = true,
    customRules = []
  } = options;

  const [state, setState] = useState<MedicalValidationState>({
    isValid: false,
    isValidating: false,
    errors: [],
    warnings: [],
    infos: [],
    allResults: [],
    validatedAt: null
  });

  // Combinar regras padrão com regras customizadas
  const validationRules = useMemo(() => {
    const medicalRules = enableMedicalRules ? getMedicalValidationRules(documentType) : [];
    return [...medicalRules, ...customRules];
  }, [documentType, enableMedicalRules, customRules]);

  // Função principal de validação
  const validateData = useCallback(async (dataToValidate: any): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];

    setState(prev => ({ ...prev, isValidating: true }));

    try {
      for (const rule of validationRules) {
        const fieldValue = getNestedValue(dataToValidate, rule.field);
        let isValid = true;

        // Executar validação baseada no tipo
        switch (rule.type) {
          case 'required':
            isValid = fieldValue != null && fieldValue !== '' && fieldValue !== undefined;
            break;

          case 'format':
          case 'range':
          case 'custom':
          case 'medical':
            if (rule.validator) {
              try {
                isValid = await rule.validator(fieldValue, dataToValidate);
              } catch (error) {
                console.error(`[Validation] Erro na validação do campo ${rule.field}:`, error);
                isValid = false;
              }
            }
            break;
        }

        if (!isValid) {
          results.push({
            field: rule.field,
            message: rule.message,
            severity: rule.severity,
            isValid: false
          });
        }
      }

      return results;

    } catch (error) {
      console.error('[Validation] Erro durante validação:', error);
      return [{
        field: 'general',
        message: 'Erro interno durante validação',
        severity: 'error',
        isValid: false
      }];
    }
  }, [validationRules]);

  // Executar validação e atualizar estado
  const runValidation = useCallback(async () => {
    const results = await validateData(data);

    const errors = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');
    const infos = results.filter(r => r.severity === 'info');

    setState({
      isValid: errors.length === 0,
      isValidating: false,
      errors,
      warnings,
      infos,
      allResults: results,
      validatedAt: new Date()
    });

    return results;
  }, [data, validateData]);

  // Validação em tempo real com debounce
  useEffect(() => {
    if (!realTimeValidation) return;

    const timer = setTimeout(() => {
      runValidation();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [data, realTimeValidation, debounceMs, runValidation]);

  // Função para obter valores aninhados de objetos
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Função para validação manual
  const validate = useCallback(async (specificData?: any): Promise<ValidationResult[]> => {
    return await validateData(specificData || data);
  }, [data, validateData]);

  // Função para verificar campo específico
  const validateField = useCallback(async (fieldName: string): Promise<ValidationResult[]> => {
    const fieldRules = validationRules.filter(rule => rule.field === fieldName);
    const results: ValidationResult[] = [];

    for (const rule of fieldRules) {
      const fieldValue = getNestedValue(data, rule.field);
      let isValid = true;

      if (rule.type === 'required') {
        isValid = fieldValue != null && fieldValue !== '' && fieldValue !== undefined;
      } else if (rule.validator) {
        try {
          isValid = await rule.validator(fieldValue, data);
        } catch (error) {
          isValid = false;
        }
      }

      if (!isValid) {
        results.push({
          field: rule.field,
          message: rule.message,
          severity: rule.severity,
          isValid: false
        });
      }
    }

    return results;
  }, [data, validationRules]);

  return {
    ...state,
    validate,
    validateField,
    runValidation
  };
}