// CORREÇÃO CRÍTICA 6: VALIDADOR CLÍNICO ROBUSTO
// Data: 31/08/2025 - Prioridade: P0

import { logger } from '../core/logger.js'

export class ClinicalValidatorService {
  constructor() {
    // Feature flags mock - usar serviço real em produção
    this.featureFlags = new Map([
      ['clinical_validator', { enabled: false, rollout: 0.1 }],
      ['strict_validation', { enabled: false, rollout: 0.05 }],
      ['anvisa_integration', { enabled: false, rollout: 0.0 }]
    ])
    
    // Base local de interações conhecidas
    this.knownInteractions = [
      { drug1: 'Varfarina', drug2: 'AAS', severity: 'MAJOR', reference: 'DrugBank' },
      { drug1: 'Varfarina', drug2: 'Aspirina', severity: 'MAJOR', reference: 'DrugBank' },
      { drug1: 'Metformina', drug2: 'Contraste iodado', severity: 'CONTRAINDICATED', reference: 'ANVISA' },
      { drug1: 'Digoxina', drug2: 'Furosemida', severity: 'MAJOR', reference: 'FDA' },
      { drug1: 'Sinvastatina', drug2: 'Amiodarona', severity: 'MAJOR', reference: 'DrugBank' }
    ]
    
    // Alergias comuns
    this.commonAllergens = [
      { substance: 'Dipirona', triggers: ['dipirona', 'metamizol'] },
      { substance: 'Penicilina', triggers: ['penicilina', 'amoxicilina', 'ampicilina'] },
      { substance: 'AAS', triggers: ['ácido acetilsalicílico', 'aspirina', 'aas'] },
      { substance: 'Sulfa', triggers: ['sulfametoxazol', 'sulfadiazina'] }
    ]
  }
  
  async isEnabled(feature, tenantId, options = {}) {
    const flag = this.featureFlags.get(feature)
    if (!flag) return options.default || false
    
    // Feature flag com rollout gradual
    if (!flag.enabled) return false
    
    // Hash do tenant para rollout consistente
    const tenantHash = this.hashString(tenantId || 'default')
    const rolloutThreshold = flag.rollout * 100
    const tenantScore = (tenantHash % 100)
    
    return tenantScore < rolloutThreshold
  }
  
  hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
  }
  
  async validatePrescription(prescription, context) {
    const startTime = Date.now()
    
    try {
      // Feature flag com fallback
      const isEnabled = await this.isEnabled(
        'clinical_validator',
        context.tenantId,
        { default: false }
      )
      
      if (!isEnabled) {
        logger.info({
          event: 'validation_skipped',
          reason: 'feature_disabled',
          tenantId: context.tenantId
        })
        return { 
          valid: true, 
          skipped: true,
          message: 'Validação clínica desabilitada'
        }
      }
      
      const issues = []
      const warnings = []
      
      // 1. Validar alergias (CRÍTICO - sempre bloqueia)
      const allergyIssues = await this.checkAllergies(
        prescription.medications,
        context.patient?.allergies || []
      )
      
      for (const allergy of allergyIssues) {
        issues.push({
          type: 'allergy',
          severity: 'critical',
          message: `🚨 ALERGIA CONHECIDA: ${allergy.medication} contém ${allergy.allergen}`,
          action: 'block',
          code: `ALLERGY_${allergy.allergen.toUpperCase()}`
        })
      }
      
      // 2. Interações medicamentosas (com fallback local)
      let interactions = []
      try {
        const anvisaEnabled = await this.isEnabled('anvisa_integration', context.tenantId)
        if (anvisaEnabled) {
          // TODO: Integrar com ANVISA real
          interactions = await this.mockAnvisaCheck(prescription.medications)
        } else {
          interactions = await this.checkInteractionsLocal(prescription.medications)
        }
      } catch (error) {
        logger.warn({
          event: 'anvisa_api_failed',
          error: error.message,
          fallback: 'local_database'
        })
        interactions = await this.checkInteractionsLocal(prescription.medications)
      }
      
      for (const interaction of interactions) {
        const issue = {
          type: 'drug_interaction',
          severity: interaction.severity === 'CONTRAINDICATED' ? 'critical' : 'high',
          message: `⚠️ Interação ${interaction.severity}: ${interaction.drug1} + ${interaction.drug2}`,
          action: interaction.severity === 'CONTRAINDICATED' ? 'require_confirmation' : 'warn',
          reference: interaction.reference,
          code: `INT_${interaction.drug1}_${interaction.drug2}`.replace(/\s+/g, '_')
        }
        
        if (issue.severity === 'critical') {
          issues.push(issue)
        } else {
          warnings.push(issue)
        }
      }
      
      // 3. Validar doses (com margem de segurança)
      for (const med of prescription.medications) {
        const doseValidation = await this.validateDosage(med, context.patient)
        
        if (doseValidation.exceedsMax) {
          const ratio = doseValidation.prescribed / doseValidation.maxDose
          
          if (ratio > 2) {
            // Dose perigosamente alta
            issues.push({
              type: 'dosage',
              severity: 'critical',
              message: `⚠️ DOSE PERIGOSA: ${med.name} está ${ratio.toFixed(1)}x acima do máximo`,
              action: 'require_confirmation',
              code: `DOSE_EXCEED_${med.name}`.replace(/\s+/g, '_')
            })
          } else if (ratio > 1.2) {
            // Dose acima mas aceitável com justificativa
            warnings.push({
              type: 'dosage',
              severity: 'medium',
              message: `Dose elevada: ${med.name} (máx: ${doseValidation.maxDose})`,
              code: `DOSE_HIGH_${med.name}`.replace(/\s+/g, '_')
            })
          }
        }
      }
      
      // 4. Medicamentos controlados
      const controlled = prescription.medications.filter(m => 
        this.isControlledSubstance(m.name)
      )
      
      if (controlled.length > 0) {
        warnings.push({
          type: 'controlled',
          severity: 'medium',
          message: `📋 Receita controlada: ${controlled.map(m => m.name).join(', ')}`,
          action: 'warn',
          code: 'CONTROLLED_MEDS'
        })
      }
      
      // Resultado final
      const hasBlockers = issues.some(i => i.action === 'block')
      const needsConfirmation = issues.some(i => i.action === 'require_confirmation')
      
      const result = {
        valid: !hasBlockers,
        requiresConfirmation: needsConfirmation,
        issues,
        warnings,
        metadata: {
          validatedAt: new Date().toISOString(),
          validationTime: Date.now() - startTime,
          validatorVersion: '2.0.0',
          sources: ['LocalDB', 'BuiltIn'],
          tenantId: context.tenantId
        }
      }
      
      // Audit log
      await this.auditValidation(result, context)
      
      return result
      
    } catch (error) {
      // Em caso de erro crítico, permitir mas logar
      logger.error({
        event: 'validation_error',
        error: error.message,
        stack: error.stack,
        context: {
          tenantId: context.tenantId,
          patientId: context.patient?.id,
          medicationCount: prescription.medications?.length
        }
      })
      
      return {
        valid: true,
        skipped: true,
        error: 'Validação indisponível temporariamente',
        message: 'Por segurança, revise manualmente a prescrição'
      }
    }
  }
  
  async checkAllergies(medications, allergies) {
    const allergyIssues = []
    
    for (const med of medications) {
      const medName = med.name?.toLowerCase() || ''
      
      for (const allergy of allergies) {
        const allergyName = allergy.toLowerCase()
        
        // Verificar alergenos conhecidos
        for (const allergen of this.commonAllergens) {
          if (allergen.triggers.some(trigger => 
            medName.includes(trigger) && allergyName.includes(allergen.substance.toLowerCase())
          )) {
            allergyIssues.push({
              medication: med.name,
              allergen: allergen.substance,
              confidence: 'high'
            })
          }
        }
        
        // Verificar match direto
        if (medName.includes(allergyName) || allergyName.includes(medName)) {
          allergyIssues.push({
            medication: med.name,
            allergen: allergy,
            confidence: 'medium'
          })
        }
      }
    }
    
    return allergyIssues
  }
  
  async checkInteractionsLocal(medications) {
    const interactions = []
    
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i].name.toLowerCase()
        const med2 = medications[j].name.toLowerCase()
        
        const known = this.knownInteractions.find(int => 
          (int.drug1.toLowerCase().includes(med1) && int.drug2.toLowerCase().includes(med2)) ||
          (int.drug1.toLowerCase().includes(med2) && int.drug2.toLowerCase().includes(med1))
        )
        
        if (known) {
          interactions.push({
            ...known,
            drug1: medications[i].name,
            drug2: medications[j].name
          })
        }
      }
    }
    
    return interactions
  }
  
  async validateDosage(medication, patient) {
    // Doses máximas padrão (mg/dia)
    const maxDoses = {
      'dipirona': 4000,
      'paracetamol': 4000,
      'ibuprofeno': 2400,
      'omeprazol': 40,
      'sinvastatina': 80,
      'metformina': 2000
    }
    
    const medName = medication.name?.toLowerCase() || ''
    let maxDose = null
    
    for (const [drug, max] of Object.entries(maxDoses)) {
      if (medName.includes(drug)) {
        maxDose = max
        break
      }
    }
    
    if (!maxDose) {
      return { exceedsMax: false, reason: 'Unknown medication' }
    }
    
    // Extrair dose prescrita (simplificado)
    const doseMatch = medication.dosage?.match(/(\d+)\s*mg/)
    if (!doseMatch) {
      return { exceedsMax: false, reason: 'Cannot parse dosage' }
    }
    
    const prescribedDose = parseInt(doseMatch[1])
    const exceedsMax = prescribedDose > maxDose
    
    return {
      exceedsMax,
      prescribed: prescribedDose,
      maxDose,
      ratio: prescribedDose / maxDose
    }
  }
  
  isControlledSubstance(medicationName) {
    const controlled = [
      'morfina', 'codeína', 'tramadol', 'clonazepam', 'diazepam',
      'alprazolam', 'lorazepam', 'zolpidem', 'metilfenidato', 'anfetamina'
    ]
    
    const medName = medicationName?.toLowerCase() || ''
    return controlled.some(drug => medName.includes(drug))
  }
  
  async mockAnvisaCheck(medications) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock de resposta da ANVISA
    return this.checkInteractionsLocal(medications)
  }
  
  async auditValidation(result, context) {
    const audit = {
      action: 'prescription_validated',
      result: result.valid ? 'approved' : 'blocked',
      issueCount: result.issues?.length || 0,
      warningCount: result.warnings?.length || 0,
      tenantId: context.tenantId,
      userId: context.userId,
      patientId: context.patient?.id,
      validationTime: result.metadata?.validationTime,
      timestamp: new Date().toISOString()
    }
    
    logger.info({
      event: 'clinical_validation_audit',
      audit
    })
  }
}