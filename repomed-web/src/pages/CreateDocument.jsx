import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function CreateDocument() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type: '',
    patient: '',
    doctor: 'Dr. João Silva',
    title: '',
    content: '',
    priority: 'normal',
    tags: ''
  })
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  const documentTypes = [
    { value: 'receita', label: '💊 Receita Médica', description: 'Prescrição de medicamentos' },
    { value: 'atestado', label: '📋 Atestado Médico', description: 'Atestado para afastamento' },
    { value: 'laudo', label: '🔬 Laudo Médico', description: 'Resultado de exames' },
    { value: 'relatorio', label: '📊 Relatório Médico', description: 'Relatório de consulta' },
    { value: 'encaminhamento', label: '🔄 Encaminhamento', description: 'Encaminhamento para especialista' }
  ]

  const templates = {
    receita: `**RECEITA MÉDICA**

Paciente: {patient}
CPF: ___________________

**Prescrição:**
□ Medicamento: ________________
   Dosagem: ___________________
   Posologia: __________________
   Quantidade: _________________

**Orientações:**
• Tomar conforme orientação médica
• Em caso de efeitos adversos, suspender uso
• Não exceder a dose recomendada

Data: ${new Date().toLocaleDateString('pt-BR')}
Médico: {doctor} - CRM: 123456-SP`,

    atestado: `**ATESTADO MÉDICO**

Paciente: {patient}
RG: ___________________
CPF: ___________________

**Atesto que o(a) paciente acima identificado(a):**
Encontra-se sob meus cuidados médicos e necessita afastar-se de suas atividades por ____ dias, no período de ____/____/____ a ____/____/____.

**CID-10:** _________
**Observações:** _________________________________

Para os devidos fins.

Data: ${new Date().toLocaleDateString('pt-BR')}
Médico: {doctor} - CRM: 123456-SP`,

    laudo: `**LAUDO MÉDICO**

Paciente: {patient}
Data de nascimento: ___________________
Exame realizado: ___________________
Data do exame: ${new Date().toLocaleDateString('pt-BR')}

**Descrição do Exame:**
_________________________________________________
_________________________________________________

**Resultados:**
_________________________________________________
_________________________________________________

**Conclusão:**
_________________________________________________
_________________________________________________

**Observações:**
_________________________________________________

Responsável técnico: {doctor} - CRM: 123456-SP`,

    relatorio: `**RELATÓRIO MÉDICO**

Paciente: {patient}
Data da consulta: ${new Date().toLocaleDateString('pt-BR')}

**História Clínica:**
_________________________________________________
_________________________________________________

**Exame Físico:**
_________________________________________________
_________________________________________________

**Hipótese Diagnóstica:**
_________________________________________________

**Conduta:**
_________________________________________________
_________________________________________________

**Retorno:**
Retorno em ____ dias/semanas/meses

Médico: {doctor} - CRM: 123456-SP`,

    encaminhamento: `**ENCAMINHAMENTO MÉDICO**

Paciente: {patient}
Data: ${new Date().toLocaleDateString('pt-BR')}

**Encaminho para:**
Especialidade: ___________________
Médico: ___________________

**Motivo do Encaminhamento:**
_________________________________________________
_________________________________________________

**História Clínica Resumida:**
_________________________________________________
_________________________________________________

**Exames Realizados:**
_________________________________________________

**Urgência:** □ Rotina □ Urgente □ Muito Urgente

Médico responsável: {doctor} - CRM: 123456-SP`
  }

  const mockPatients = [
    'Maria Silva Santos',
    'José Santos Oliveira',
    'Carlos Oliveira Lima',
    'Ana Ferreira Costa',
    'Roberto Costa Silva'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Auto-generate title based on type and patient
    if (field === 'type' || field === 'patient') {
      const newData = { ...formData, [field]: value }
      if (newData.type && newData.patient) {
        const typeLabel = documentTypes.find(t => t.value === newData.type)?.label || ''
        setFormData(prev => ({
          ...prev,
          title: `${typeLabel} - ${newData.patient}`,
          [field]: value
        }))
      }
    }
  }

  const handleTemplateSelect = (type) => {
    const template = templates[type]
    if (template) {
      const populatedTemplate = template
        .replace(/\{patient\}/g, formData.patient || '__________________')
        .replace(/\{doctor\}/g, formData.doctor)
      
      setFormData(prev => ({
        ...prev,
        content: populatedTemplate
      }))
      setSelectedTemplate(type)
    }
  }

  const handleSave = (status = 'draft') => {
    console.log('Saving document:', { ...formData, status })
    alert(`Documento salvo como ${status === 'draft' ? 'rascunho' : 'finalizado'}!`)
    navigate('/documents')
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      normal: '#6b7280',
      high: '#f59e0b',
      urgent: '#ef4444'
    }
    return colors[priority] || '#6b7280'
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px'
              }}>
                🏥
              </div>
            </Link>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>
                Criar Novo Documento
              </h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                Crie documentos médicos usando templates ou do zero
              </p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link 
              to="/documents"
              style={{
                background: '#f3f4f6',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                border: '1px solid #d1d5db',
                fontSize: '14px'
              }}
            >
              ← Voltar
            </Link>
            <button
              onClick={() => setIsPreview(!isPreview)}
              style={{
                background: '#6b7280',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {isPreview ? '✏️ Editar' : '👁️ Preview'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: isPreview ? '1fr' : '1fr 300px',
        gap: '24px'
      }}>
        {/* Form / Preview */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {!isPreview ? (
            <>
              {/* Document Type Selection */}
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                  Tipo de Documento
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  {documentTypes.map(type => (
                    <div
                      key={type.value}
                      onClick={() => handleInputChange('type', type.value)}
                      style={{
                        padding: '12px',
                        border: `2px solid ${formData.type === type.value ? '#3b82f6' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: formData.type === type.value ? '#eff6ff' : 'white',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{type.label}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{type.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Basic Information */}
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                  Informações Básicas
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      👤 Paciente *
                    </label>
                    <select
                      value={formData.patient}
                      onChange={(e) => handleInputChange('patient', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="">Selecione um paciente</option>
                      {mockPatients.map(patient => (
                        <option key={patient} value={patient}>{patient}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      👨‍⚕️ Médico responsável
                    </label>
                    <input
                      type="text"
                      value={formData.doctor}
                      onChange={(e) => handleInputChange('doctor', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      🏷️ Título do documento
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Ex: Receita Médica - Maria Silva"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      🚨 Prioridade
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="low">🟢 Baixa</option>
                      <option value="normal">🔵 Normal</option>
                      <option value="high">🟡 Alta</option>
                      <option value="urgent">🔴 Urgente</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              {formData.type && (
                <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                    Template
                  </h2>
                  <button
                    onClick={() => handleTemplateSelect(formData.type)}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      marginBottom: '12px'
                    }}
                  >
                    📋 Usar template padrão
                  </button>
                  {selectedTemplate && (
                    <div style={{
                      background: '#eff6ff',
                      padding: '12px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#1e40af'
                    }}>
                      ✅ Template aplicado! Você pode editar o conteúdo abaixo.
                    </div>
                  )}
                </div>
              )}

              {/* Content Editor */}
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                  Conteúdo do Documento
                </h2>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Digite o conteúdo do documento ou use um template..."
                  rows={20}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'ui-monospace, monospace',
                    lineHeight: '1.6',
                    resize: 'vertical'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <span>Caracteres: {formData.content.length}</span>
                  <span>Linhas: {formData.content.split('\n').length}</span>
                </div>
              </div>
            </>
          ) : (
            /* Preview Mode */
            <div style={{ padding: '40px' }}>
              <div style={{
                background: '#f8fafc',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <strong>Preview do documento:</strong> {formData.title || 'Sem título'}
              </div>
              <div style={{
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                fontFamily: 'serif',
                color: '#1f2937'
              }}>
                {formData.content || 'Conteúdo vazio...'}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!isPreview && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Actions */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                Ações
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => handleSave('draft')}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  💾 Salvar como rascunho
                </button>
                <button
                  onClick={() => handleSave('pending')}
                  style={{
                    background: '#3b82f6',
                    color: 'white',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  📝 Finalizar documento
                </button>
                <button
                  style={{
                    background: '#f3f4f6',
                    color: '#374151',
                    padding: '10px 16px',
                    borderRadius: '6px',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  ✍️ Enviar para assinatura
                </button>
              </div>
            </div>

            {/* Document Info */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                Informações
              </h3>
              <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Status:</strong> Novo documento
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Criado em:</strong> {new Date().toLocaleDateString('pt-BR')}
                </div>
                <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>Prioridade:</strong>
                  <span style={{
                    background: getPriorityColor(formData.priority),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {formData.priority === 'low' ? '🟢 Baixa' : 
                     formData.priority === 'normal' ? '🔵 Normal' :
                     formData.priority === 'high' ? '🟡 Alta' : '🔴 Urgente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                Ações Rápidas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '4px 0'
                }}>
                  🎤 Ditar conteúdo
                </button>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '4px 0'
                }}>
                  📷 Anexar imagem
                </button>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '4px 0'
                }}>
                  🧠 Sugestões da IA
                </button>
                <button style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: '4px 0'
                }}>
                  📋 Copiar template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}