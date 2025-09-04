import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8081'

export default function PrescriptionViewPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [showSignatureModal, setShowSignatureModal] = useState(false)

  // Fetch prescription data
  const { data: prescription, isLoading, error } = useQuery({
    queryKey: ['prescription', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/prescriptions/${id}`)
      if (!response.ok) throw new Error('Erro ao buscar prescrição')
      return response.json()
    },
    enabled: !!id
  })

  // Fetch patient data
  const { data: patient } = useQuery({
    queryKey: ['patient', prescription?.data?.patientId],
    queryFn: async () => {
      if (!prescription?.data?.patientId) return null
      const response = await fetch(`${API_BASE}/api/patients/${prescription.data.patientId}`)
      if (!response.ok) throw new Error('Erro ao buscar paciente')
      return response.json()
    },
    enabled: !!prescription?.data?.patientId
  })

  // Sign prescription mutation
  const signPrescriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/api/prescriptions/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorName: prescription.data.doctorName
        })
      })
      if (!response.ok) throw new Error('Erro ao assinar prescrição')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prescription', id])
      setShowSignatureModal(false)
    },
    onError: (error) => {
      console.error('Error signing prescription:', error)
      alert('Erro ao assinar prescrição. Tente novamente.')
    }
  })

  const handleSign = () => {
    signPrescriptionMutation.mutate()
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/prescriptions/${id}/pdf`)
      if (!response.ok) throw new Error('Erro ao gerar PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `prescricao-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Erro ao baixar PDF. Tente novamente.')
    }
  }

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ margin: '0', color: '#1f2937' }}>Carregando prescrição...</h2>
        </div>
      </div>
    )
  }

  if (error || !prescription?.data) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          background: 'white', 
          padding: '40px', 
          borderRadius: '12px', 
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
          <h2 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>Prescrição não encontrada</h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            A prescrição solicitada não existe ou não pôde ser carregada.
          </p>
          <Link 
            to="/patients" 
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            ← Voltar para Pacientes
          </Link>
        </div>
      </div>
    )
  }

  const prescData = prescription.data
  const patientData = patient?.data

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }

  const labelStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px'
  }

  const valueStyle = {
    fontSize: '16px',
    color: '#1f2937',
    fontWeight: '500'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
              💊 Prescrição Médica
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Visualização completa da prescrição {id}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link 
              to={patientData ? `/patients/${prescData.patientId}` : "/patients"}
              style={{
                padding: '8px 16px',
                background: '#e5e7eb',
                color: '#374151',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              ← Voltar
            </Link>
            
            <button
              onClick={handlePrint}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              🖨️ Imprimir
            </button>
            
            <button
              onClick={handleDownloadPDF}
              style={{
                padding: '8px 16px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              📄 PDF
            </button>

            {!prescData.isSigned && (
              <button
                onClick={() => setShowSignatureModal(true)}
                style={{
                  padding: '8px 16px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                ✍️ Assinar
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            background: prescData.isSigned ? '#dcfce7' : '#fef3c7',
            color: prescData.isSigned ? '#166534' : '#92400e'
          }}>
            {prescData.isSigned ? '✅ ASSINADA' : '⏳ PENDENTE ASSINATURA'}
          </span>
          {prescData.isSigned && prescData.signedAt && (
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              Assinada em {new Date(prescData.signedAt).toLocaleDateString('pt-BR')} às {new Date(prescData.signedAt).toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Patient and Doctor Information */}
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
          👨‍⚕️ Informações Gerais
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          
          {/* Patient Info */}
          <div>
            <div style={labelStyle}>Paciente</div>
            <div style={valueStyle}>{patientData?.name || 'Carregando...'}</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              {patientData?.cpf && `CPF: ${patientData.cpf}`}
              {patientData?.phone && ` • Tel: ${patientData.phone}`}
            </div>
          </div>

          {/* Doctor Info */}
          <div>
            <div style={labelStyle}>Médico Responsável</div>
            <div style={valueStyle}>{prescData.doctorName}</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
              CRM: {prescData.doctorCrm}
            </div>
          </div>

          {/* Date */}
          <div>
            <div style={labelStyle}>Data da Prescrição</div>
            <div style={valueStyle}>
              {new Date(prescData.date).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Return Date */}
          {prescData.returnDate && (
            <div>
              <div style={labelStyle}>Data de Retorno</div>
              <div style={valueStyle}>
                {new Date(prescData.returnDate).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Medications */}
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
          💉 Medicamentos Prescritos
        </h2>
        
        {prescData.medications && prescData.medications.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {prescData.medications.map((medication, index) => (
              <div key={index} style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                background: '#fafafa'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    marginRight: '12px'
                  }}>
                    {index + 1}
                  </div>
                  <h3 style={{ margin: '0', fontSize: '1.2rem', color: '#1f2937' }}>
                    {medication.name}
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  
                  <div>
                    <div style={labelStyle}>Dosagem</div>
                    <div style={valueStyle}>{medication.dosage}</div>
                  </div>

                  <div>
                    <div style={labelStyle}>Frequência</div>
                    <div style={valueStyle}>{medication.frequency}</div>
                  </div>

                  {medication.duration && (
                    <div>
                      <div style={labelStyle}>Duração</div>
                      <div style={valueStyle}>{medication.duration}</div>
                    </div>
                  )}

                </div>

                {medication.instructions && (
                  <div style={{ marginTop: '16px' }}>
                    <div style={labelStyle}>Instruções Especiais</div>
                    <div style={{
                      ...valueStyle,
                      background: '#f0f9ff',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #bae6fd',
                      fontStyle: 'italic'
                    }}>
                      {medication.instructions}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280',
            border: '2px dashed #d1d5db',
            borderRadius: '12px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💊</div>
            <p style={{ margin: '0', fontSize: '16px' }}>Nenhum medicamento prescrito</p>
          </div>
        )}
      </div>

      {/* Diagnosis and Observations */}
      <div style={sectionStyle}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
          🩺 Diagnóstico e Observações
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          
          <div>
            <div style={labelStyle}>Diagnóstico/CID</div>
            <div style={{
              ...valueStyle,
              background: '#fef3c7',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #fbbf24',
              minHeight: '60px',
              whiteSpace: 'pre-wrap'
            }}>
              {prescData.diagnosis || 'Não informado'}
            </div>
          </div>

          {prescData.observations && (
            <div>
              <div style={labelStyle}>Observações Gerais</div>
              <div style={{
                ...valueStyle,
                background: '#f0f9ff',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #bae6fd',
                minHeight: '60px',
                whiteSpace: 'pre-wrap'
              }}>
                {prescData.observations}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Digital Signature Modal */}
      {showSignatureModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: '#1f2937' }}>
              ✍️ Assinatura Digital
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Você está prestes a assinar digitalmente esta prescrição médica. 
              Esta ação não pode ser desfeita.
            </p>
            <div style={{
              background: '#f9fafb',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px',
              border: '1px solid #d1d5db'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                <strong>Médico:</strong> {prescData.doctorName}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                <strong>CRM:</strong> {prescData.doctorCrm}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSignatureModal(false)}
                style={{
                  padding: '12px 20px',
                  background: '#e5e7eb',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSign}
                disabled={signPrescriptionMutation.isLoading}
                style={{
                  padding: '12px 20px',
                  background: signPrescriptionMutation.isLoading ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: signPrescriptionMutation.isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600'
                }}
              >
                {signPrescriptionMutation.isLoading ? '⏳ Assinando...' : '✍️ Confirmar Assinatura'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}