import axios from 'axios'

/**
 * Serviço de Validação de CRM
 * Integração com API do CFM (Conselho Federal de Medicina)
 */
export class CrmValidationService {
  private readonly CFM_API_BASE = 'https://portal.cfm.org.br/api'
  private readonly timeout = 10000 // 10 segundos
  
  /**
   * Valida CRM junto ao CFM
   */
  async validateCRM(crm: string, uf: string): Promise<{
    isValid: boolean
    data?: {
      nome: string
      situacao: string
      uf: string
      crm: string
      inscricao: Date
      especialidades?: string[]
    }
    error?: string
  }> {
    try {
      // Sanitizar inputs
      const cleanCRM = crm.replace(/\D/g, '') // Remove não-numéricos
      const cleanUF = uf.toUpperCase().trim()
      
      if (!cleanCRM || cleanCRM.length < 3) {
        return { isValid: false, error: 'CRM inválido' }
      }
      
      if (!cleanUF || cleanUF.length !== 2) {
        return { isValid: false, error: 'UF inválida' }
      }
      
      // Em desenvolvimento, usar mock
      if (process.env.NODE_ENV === 'development') {
        return this.mockCRMValidation(cleanCRM, cleanUF)
      }
      
      // Fazer requisição à API do CFM
      const response = await axios.get(
        `${this.CFM_API_BASE}/medicos/${cleanCRM}/${cleanUF}`,
        {
          timeout: this.timeout,
          headers: {
            'User-Agent': 'RepoMed-IA/1.0',
            'Accept': 'application/json'
          }
        }
      )
      
      const data = response.data
      
      return {
        isValid: data.situacao === 'Ativo',
        data: {
          nome: data.nome,
          situacao: data.situacao,
          uf: data.uf,
          crm: data.crm,
          inscricao: new Date(data.inscricao),
          especialidades: data.especialidades || []
        }
      }
      
    } catch (error: any) {
      console.warn('CRM validation failed:', error.message)
      
      // Em produção, falhar com validação
      if (process.env.NODE_ENV === 'production') {
        return { 
          isValid: false, 
          error: 'Não foi possível validar o CRM. Tente novamente.' 
        }
      }
      
      // Em desenvolvimento, permitir com aviso
      return this.mockCRMValidation(crm, uf)
    }
  }
  
  /**
   * Mock para desenvolvimento
   */
  private mockCRMValidation(crm: string, uf: string) {
    // Simular alguns CRMs inválidos para teste
    const invalidCRMs = ['00000', '11111', '99999']
    
    if (invalidCRMs.includes(crm)) {
      return {
        isValid: false,
        error: 'CRM não encontrado no sistema CFM'
      }
    }
    
    return {
      isValid: true,
      data: {
        nome: 'Dr. Mock Development',
        situacao: 'Ativo',
        uf: uf.toUpperCase(),
        crm: crm,
        inscricao: new Date('2020-01-01'),
        especialidades: ['Clínica Médica']
      }
    }
  }
  
  /**
   * Valida formato do CRM (sem consulta externa)
   */
  validateCRMFormat(crm: string, uf: string): {
    isValid: boolean
    error?: string
  } {
    const cleanCRM = crm.replace(/\D/g, '')
    const cleanUF = uf.toUpperCase().trim()
    
    if (!cleanCRM || cleanCRM.length < 3 || cleanCRM.length > 6) {
      return { isValid: false, error: 'CRM deve ter entre 3 e 6 dígitos' }
    }
    
    const validUFs = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]
    
    if (!validUFs.includes(cleanUF)) {
      return { isValid: false, error: 'UF inválida' }
    }
    
    return { isValid: true }
  }
  
  /**
   * Cache de validações recentes
   */
  private validationCache = new Map<string, {
    result: any
    timestamp: number
  }>()
  
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas
  
  private getCachedValidation(crm: string, uf: string) {
    const key = `${crm}-${uf}`
    const cached = this.validationCache.get(key)
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      return cached.result
    }
    
    return null
  }
  
  private setCachedValidation(crm: string, uf: string, result: any) {
    const key = `${crm}-${uf}`
    this.validationCache.set(key, {
      result,
      timestamp: Date.now()
    })
    
    // Limpar cache antigo
    if (this.validationCache.size > 1000) {
      const oldestEntries = Array.from(this.validationCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 500)
      
      oldestEntries.forEach(([key]) => {
        this.validationCache.delete(key)
      })
    }
  }
  
  /**
   * Validação com cache
   */
  async validateCRMWithCache(crm: string, uf: string) {
    // Verificar cache primeiro
    const cached = this.getCachedValidation(crm, uf)
    if (cached) {
      return cached
    }
    
    // Fazer validação e cachear resultado
    const result = await this.validateCRM(crm, uf)
    this.setCachedValidation(crm, uf, result)
    
    return result
  }
}

// Exportar instância singleton
export const crmValidationService = new CrmValidationService()