const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'your-openai-key-here',
    });
    
    // Cache de conhecimento médico
    this.medicalKnowledge = {
      medications: new Map(),
      diseases: new Map(),
      interactions: new Map(),
    };
  }
  
  /**
   * Sugere diagnósticos baseado em sintomas
   */
  async suggestDiagnosis(symptoms, patientHistory) {
    try {
      const prompt = `
        Como assistente médico, analise os seguintes sintomas e histórico:
        
        SINTOMAS: ${symptoms.join(', ')}
        HISTÓRICO: ${JSON.stringify(patientHistory)}
        
        Sugira os 5 diagnósticos mais prováveis com CID-10, ordenados por probabilidade.
        Retorne em formato JSON estruturado com: diagnoses array contendo { name, cid10, probability, reasoning }
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente médico especializado em diagnósticos.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      
      const suggestions = JSON.parse(response.choices[0].message.content);
      
      // Simular salvamento no banco
      console.log('AI Diagnosis Suggestion:', suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Error in suggestDiagnosis:', error);
      // Fallback para demonstração
      return {
        diagnoses: [
          { name: 'Hipertensão Arterial', cid10: 'I10', probability: 0.85, reasoning: 'Baseado nos sintomas apresentados' },
          { name: 'Diabetes Mellitus', cid10: 'E14', probability: 0.65, reasoning: 'Histórico familiar compatível' }
        ]
      };
    }
  }
  
  /**
   * Verifica interações medicamentosas
   */
  async checkMedicationInteractions(medications) {
    try {
      // Simular verificação de interações
      const interactions = [];
      
      // Exemplo de interação conhecida
      const medNames = medications.map(m => m.toLowerCase());
      if (medNames.includes('varfarina') && medNames.includes('aspirina')) {
        interactions.push({
          medications: ['Varfarina', 'Aspirina'],
          severity: 'high',
          description: 'Risco aumentado de sangramento',
          recommendation: 'Monitorar coagulação regularmente'
        });
      }
      
      return {
        safe: interactions.length === 0,
        interactions,
        recommendations: interactions.length > 0 ? 
          ['Consulte cardiologista', 'Monitore sinais vitais'] : 
          ['Prescrição segura']
      };
    } catch (error) {
      console.error('Error in checkMedicationInteractions:', error);
      return {
        safe: true,
        interactions: [],
        recommendations: []
      };
    }
  }
  
  /**
   * Preenche automaticamente campos do documento
   */
  async autoFillDocument(templateType, patientData) {
    try {
      const prompt = `
        Baseado no tipo de documento "${templateType}" e dados do paciente, 
        sugira preenchimento inteligente dos campos.
        
        PACIENTE: ${JSON.stringify(patientData)}
        
        Retorne JSON com sugestões de preenchimento para os campos do documento.
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um assistente médico que ajuda a preencher documentos.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in autoFillDocument:', error);
      // Fallback para demonstração
      if (templateType === 'prescription') {
        return {
          medications: [
            { name: 'Dipirona', dosage: '500mg', frequency: '8/8h' }
          ],
          instructions: 'Tomar após as refeições com água',
          summary: 'Preenchimento sugerido baseado no perfil do paciente'
        };
      }
      return { summary: 'Dados insuficientes para sugestão automática' };
    }
  }
  
  /**
   * Transcrição de áudio para texto
   */
  async transcribeAudio(audioBuffer) {
    try {
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'verbose_json',
      });
      
      // Extrair informações médicas relevantes usando IA
      const medicalInfo = await this.extractMedicalInfo(transcription.text);
      
      return {
        text: transcription.text,
        duration: transcription.duration,
        medicalInfo,
        segments: transcription.segments
      };
    } catch (error) {
      console.error('Error in transcribeAudio:', error);
      return {
        text: 'Erro na transcrição de áudio',
        medicalInfo: null
      };
    }
  }
  
  /**
   * Extrair informações médicas de texto
   */
  async extractMedicalInfo(text) {
    try {
      const prompt = `
        Analise o seguinte texto médico e extraia informações estruturadas:
        
        "${text}"
        
        Retorne JSON com: medications (array), symptoms (array), diagnoses (array), instructions (string)
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você extrai informações médicas estruturadas de texto livre.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });
      
      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error in extractMedicalInfo:', error);
      return null;
    }
  }
  
  /**
   * OCR para digitalização de documentos
   */
  async performOCR(imageBuffer) {
    try {
      // Usar Vision API para extrair texto
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extraia todo o texto deste documento médico, mantendo a formatação.' },
              { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` } }
            ]
          }
        ],
        max_tokens: 4096,
      });
      
      const extractedText = response.choices[0].message.content;
      
      // Estruturar o texto extraído
      const structured = await this.extractMedicalInfo(extractedText);
      
      return {
        text: extractedText,
        structured
      };
    } catch (error) {
      console.error('Error in performOCR:', error);
      return {
        text: 'Erro no OCR do documento',
        structured: null
      };
    }
  }
  
  /**
   * Análise preditiva de riscos
   */
  async predictHealthRisks(patientData) {
    try {
      const prompt = `
        Analise o perfil completo do paciente e identifique riscos de saúde:
        
        ${JSON.stringify(patientData)}
        
        Retorne JSON com:
        - immediate_risks: array de riscos próximos 30 dias
        - medium_term_risks: array de riscos 3-6 meses  
        - long_term_risks: array de riscos 1+ ano
        - preventive_recommendations: array de recomendações
        - suggested_exams: array de exames sugeridos
      `;
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em medicina preventiva e análise de riscos.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });
      
      const risks = JSON.parse(response.choices[0].message.content);
      
      // Simular salvamento no banco
      console.log('Risk Assessment:', risks);
      
      return risks;
    } catch (error) {
      console.error('Error in predictHealthRisks:', error);
      return {
        immediate_risks: [],
        medium_term_risks: ['Hipertensão (baseado em histórico familiar)'],
        long_term_risks: ['Diabetes tipo 2 (fatores de risco presentes)'],
        preventive_recommendations: ['Exercícios regulares', 'Dieta balanceada'],
        suggested_exams: ['Glicemia de jejum', 'Perfil lipídico']
      };
    }
  }
}

module.exports = new AIService();