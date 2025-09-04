import React, { useState } from 'react'

export default function WorkspaceSimple() {
  const [activePanel, setActivePanel] = useState('editor')
  const [aiMode, setAiMode] = useState('off')
  const [document, setDocument] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  const activePatient = {
    name: 'Maria Silva Santos',
    cpf: '123.456.789-00',
    age: 45,
    allergies: ['Penicilina', 'Dipirona'],
    conditions: ['Hipertensão', 'Diabetes Tipo 2']
  }

  const insertTemplate = (type) => {
    let template = ''
    if (type === 'receita') {
      template = `**RECEITA MÉDICA**

Paciente: ${activePatient.name}
CPF: ${activePatient.cpf}

**Prescrição:**
□ Medicamento: ________________
   Dosagem: ___________________
   Posologia: __________________

**Orientações:**
• Tomar conforme orientação médica
• Em caso de efeitos adversos, suspender

Data: ${new Date().toLocaleDateString()}
Médico: Dr. João Silva - CRM: 123456-SP`
    }
    setDocument(template)
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      setTimeout(() => {
        setDocument(document + '\n\nTranscrição: Paciente relata dor de cabeça há 3 dias. Sem febre. Solicita medicação.')
        setIsRecording(false)
      }, 3000)
    }
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      background: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>RepoMed IA</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleRecording}
            style={{
              background: isRecording ? '#ef4444' : '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🎤 {isRecording ? `Gravando...` : 'Ditar'}
          </button>
          
          <button
            onClick={() => setAiMode(aiMode === 'off' ? 'on' : 'off')}
            style={{
              background: aiMode === 'off' ? '#6b7280' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            🧠 IA {aiMode === 'off' ? 'Off' : 'On'}
          </button>
          
          <button style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            💾 Salvar
          </button>
          
          <button style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            ✍️ Assinar
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <select 
          onChange={(e) => e.target.value && insertTemplate(e.target.value)}
          style={{
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            background: 'white'
          }}
          value=""
        >
          <option value="">Inserir Template</option>
          <option value="receita">Receita Médica</option>
          <option value="atestado">Atestado</option>
          <option value="laudo">Laudo</option>
        </select>
        
        <div style={{ height: '20px', width: '1px', background: '#d1d5db', margin: '0 8px' }} />
        
        <button style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          <strong>B</strong>
        </button>
        <button style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          <em>I</em>
        </button>
        <button style={{ padding: '4px 8px', border: '1px solid #d1d5db', background: 'white', borderRadius: '4px', cursor: 'pointer' }}>
          <u>U</u>
        </button>
      </div>

      {/* Main Workspace */}
      <div style={{ flex: 1, display: 'flex' }}>
        {/* Patient Panel */}
        <div style={{
          width: activePanel === 'patient' ? '320px' : '60px',
          background: 'white',
          borderRight: '1px solid #e2e8f0',
          transition: 'width 0.3s ease',
          padding: activePanel === 'patient' ? '16px' : '8px'
        }}>
          <button
            onClick={() => setActivePanel(activePanel === 'patient' ? 'editor' : 'patient')}
            style={{
              width: '100%',
              padding: '8px',
              background: activePanel === 'patient' ? '#3b82f6' : '#f3f4f6',
              color: activePanel === 'patient' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            👤 {activePanel === 'patient' ? 'Paciente' : ''}
          </button>
          
          {activePanel === 'patient' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Paciente Ativo</h3>
              <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                <p><strong>Nome:</strong> {activePatient.name}</p>
                <p><strong>CPF:</strong> {activePatient.cpf}</p>
                <p><strong>Idade:</strong> {activePatient.age} anos</p>
                
                <div style={{ marginTop: '16px' }}>
                  <strong>⚠️ Alergias:</strong>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    {activePatient.allergies.map(allergy => (
                      <li key={allergy} style={{ color: '#ef4444' }}>{allergy}</li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ marginTop: '16px' }}>
                  <strong>🏥 Condições:</strong>
                  <ul style={{ margin: '4px 0', paddingLeft: '20px' }}>
                    {activePatient.conditions.map(condition => (
                      <li key={condition} style={{ color: '#f59e0b' }}>{condition}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {isRecording && (
            <div style={{
              background: '#dbeafe',
              border: '1px solid #3b82f6',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ color: '#3b82f6', fontSize: '18px' }}>🎤</div>
              <div>
                <div style={{ fontWeight: '600', color: '#1e40af' }}>Gravando áudio...</div>
                <div style={{ fontSize: '14px', color: '#3730a3' }}>Fale naturalmente. A transcrição aparecerá automaticamente.</div>
              </div>
            </div>
          )}
          
          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Comece a escrever ou use um template..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '24px',
              fontSize: '14px',
              lineHeight: '1.6',
              fontFamily: 'ui-monospace, "Cascadia Code", monospace',
              resize: 'none'
            }}
          />
        </div>

        {/* AI Panel */}
        {aiMode === 'on' && (
          <div style={{
            width: '300px',
            background: 'linear-gradient(to bottom, #dbeafe, #ede9fe)',
            borderLeft: '1px solid #e2e8f0',
            padding: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1e40af' }}>
                Assistente IA
              </h3>
            </div>
            
            <div style={{ space: '12px' }}>
              {activePatient.allergies.length > 0 && document.toLowerCase().includes('medicamento') && (
                <div style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #fbbf24',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>⚠️</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>Alerta de Alergia</span>
                    <span style={{ background: '#f59e0b', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '12px' }}>
                      95%
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>
                    Paciente alérgico a {activePatient.allergies.join(', ')}
                  </p>
                  <button style={{
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    ✓ Aplicar
                  </button>
                </div>
              )}
              
              {document.toLowerCase().includes('dor') && (
                <div style={{
                  background: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #10b981',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span>💊</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>Analgésico</span>
                    <span style={{ background: '#10b981', color: 'white', padding: '2px 6px', borderRadius: '12px', fontSize: '12px' }}>
                      80%
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#374151' }}>
                    Sugestão: Paracetamol 500mg - 8/8h por 3 dias
                  </p>
                  <button 
                    onClick={() => setDocument(document + '\n\n□ Paracetamol 500mg\n   Dosagem: 500mg\n   Posologia: 8/8h por 3 dias')}
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ✓ Aplicar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>Paciente: {activePatient.name}</span>
          <span>Idade: {activePatient.age} anos</span>
          {activePatient.allergies.length > 0 && (
            <span style={{ color: '#ef4444' }}>
              ⚠️ Alergias: {activePatient.allergies.join(', ')}
            </span>
          )}
        </div>
        <div>Caracteres: {document.length}</div>
      </div>
    </div>
  )
}