import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8081'

export default function PrescriptionCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchParams] = useSearchParams()
  const preselectedPatientId = searchParams.get('patientId')

  const [prescriptionData, setPrescriptionData] = useState({
    patientId: preselectedPatientId || '',
    doctorName: 'Dr. Sistema',
    doctorCrm: '123456-SP',
    date: new Date().toISOString().split('T')[0],
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }
    ],
    diagnosis: '',
    observations: '',
    returnDate: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch patients for selection
  const { data: patientsData } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/patients?limit=100`)
      if (!response.ok) throw new Error('Erro ao carregar pacientes')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Fetch selected patient details
  const { data: selectedPatient } = useQuery({
    queryKey: ['patient', prescriptionData.patientId],
    queryFn: async () => {
      if (!prescriptionData.patientId) return null
      const response = await fetch(`${API_BASE}/api/patients/${prescriptionData.patientId}`)
      if (!response.ok) throw new Error('Erro ao carregar paciente')
      return response.json()
    },
    enabled: !!prescriptionData.patientId,
    staleTime: 1000 * 60 * 5,
  })

  const createPrescriptionMutation = useMutation({
    mutationFn: async (data) => {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE}/api/prescriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Erro ao criar prescrição')
      return response.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['prescriptions'])
      navigate(`/prescription/${data.data.id}`)
    },
    onError: (error) => {
      console.error('Error creating prescription:', error)
      setErrors({ submit: 'Erro ao criar prescrição. Tente novamente.' })
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setPrescriptionData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...prescriptionData.medications]
    newMedications[index][field] = value
    setPrescriptionData(prev => ({
      ...prev,
      medications: newMedications
    }))
  }

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: ''
      }]
    }))
  }

  const removeMedication = (index) => {
    if (prescriptionData.medications.length > 1) {
      const newMedications = prescriptionData.medications.filter((_, i) => i !== index)
      setPrescriptionData(prev => ({
        ...prev,
        medications: newMedications
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!prescriptionData.patientId) {
      newErrors.patientId = 'Paciente é obrigatório'
    }

    if (!prescriptionData.doctorName.trim()) {
      newErrors.doctorName = 'Nome do médico é obrigatório'
    }

    if (!prescriptionData.doctorCrm.trim()) {
      newErrors.doctorCrm = 'CRM é obrigatório'
    }

    if (!prescriptionData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnóstico é obrigatório'
    }

    // Validate at least one medication
    const validMedications = prescriptionData.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    )
    
    if (validMedications.length === 0) {
      newErrors.medications = 'Pelo menos um medicamento deve ser informado com nome, dosagem e frequência'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Filter out empty medications
    const validMedications = prescriptionData.medications.filter(med => 
      med.name.trim() && med.dosage.trim() && med.frequency.trim()
    )

    const dataToSubmit = {
      ...prescriptionData,
      medications: validMedications
    }

    createPrescriptionMutation.mutate(dataToSubmit)
  }

  const patients = patientsData?.data || []
  const patient = selectedPatient?.data

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  }

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
              💊 Nova Prescrição Médica
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Criar prescrição médica com medicamentos e orientações
            </p>
          </div>
          <Link 
            to={patient ? `/patients/${prescriptionData.patientId}` : "/patients"}
            style={{
              padding: '12px 20px',
              background: '#e5e7eb',
              color: '#374151',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            ← Voltar
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        
        {/* Patient and Doctor Information */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            👨‍⚕️ Informações Médicas
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            <div>
              <label style={labelStyle}>Paciente *</label>
              <select
                name="patientId"
                value={prescriptionData.patientId}
                onChange={handleInputChange}
                style={errors.patientId ? errorInputStyle : inputStyle}
              >
                <option value="">Selecione um paciente...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} - {patient.cpf || 'CPF não informado'}
                  </option>
                ))}
              </select>
              {errors.patientId && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.patientId}</span>}
            </div>

            <div>
              <label style={labelStyle}>Médico Responsável *</label>
              <input
                type="text"
                name="doctorName"
                value={prescriptionData.doctorName}
                onChange={handleInputChange}
                style={errors.doctorName ? errorInputStyle : inputStyle}
                placeholder="Nome do médico"
              />
              {errors.doctorName && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.doctorName}</span>}
            </div>

            <div>
              <label style={labelStyle}>CRM *</label>
              <input
                type="text"
                name="doctorCrm"
                value={prescriptionData.doctorCrm}
                onChange={handleInputChange}
                style={errors.doctorCrm ? errorInputStyle : inputStyle}
                placeholder="123456-SP"
              />
              {errors.doctorCrm && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.doctorCrm}</span>}
            </div>

            <div>
              <label style={labelStyle}>Data da Prescrição</label>
              <input
                type="date"
                name="date"
                value={prescriptionData.date}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Data de Retorno</label>
              <input
                type="date"
                name="returnDate"
                value={prescriptionData.returnDate}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </div>

          </div>

          {/* Patient Info Display */}
          {patient && (
            <div style={{ 
              marginTop: '20px', 
              padding: '16px', 
              background: '#f0f9ff', 
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1f2937' }}>
                👤 Dados do Paciente
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <strong>Nome:</strong> {patient.name}
                </div>
                <div>
                  <strong>CPF:</strong> {patient.cpf || 'Não informado'}
                </div>
                <div>
                  <strong>Telefone:</strong> {patient.phone || 'Não informado'}
                </div>
                <div>
                  <strong>Email:</strong> {patient.email || 'Não informado'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Medications */}
        <div style={sectionStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1f2937' }}>
              💉 Medicamentos
            </h2>
            <button
              type="button"
              onClick={addMedication}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              + Adicionar Medicamento
            </button>
          </div>

          {errors.medications && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {errors.medications}
            </div>
          )}

          {prescriptionData.medications.map((medication, index) => (
            <div key={index} style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px', 
              padding: '20px', 
              marginBottom: '16px',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>
                  Medicamento {index + 1}
                </h3>
                {prescriptionData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    style={{
                      padding: '4px 8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                
                <div>
                  <label style={labelStyle}>Nome do Medicamento *</label>
                  <input
                    type="text"
                    value={medication.name}
                    onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: Paracetamol 500mg"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Dosagem *</label>
                  <input
                    type="text"
                    value={medication.dosage}
                    onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: 1 comprimido"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Frequência *</label>
                  <select
                    value={medication.frequency}
                    onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Selecione...</option>
                    <option value="1x ao dia">1x ao dia</option>
                    <option value="2x ao dia">2x ao dia</option>
                    <option value="3x ao dia">3x ao dia</option>
                    <option value="4x ao dia">4x ao dia</option>
                    <option value="6x ao dia">6x ao dia</option>
                    <option value="8x ao dia">8x ao dia</option>
                    <option value="De 12 em 12 horas">De 12 em 12 horas</option>
                    <option value="De 8 em 8 horas">De 8 em 8 horas</option>
                    <option value="De 6 em 6 horas">De 6 em 6 horas</option>
                    <option value="De 4 em 4 horas">De 4 em 4 horas</option>
                    <option value="SOS">SOS (se necessário)</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Duração</label>
                  <input
                    type="text"
                    value={medication.duration}
                    onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                    style={inputStyle}
                    placeholder="Ex: 7 dias"
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Instruções Especiais</label>
                  <textarea
                    value={medication.instructions}
                    onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    style={{ ...inputStyle, height: '80px', resize: 'vertical' }}
                    placeholder="Ex: Tomar com alimentos, evitar álcool..."
                  />
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Diagnosis and Observations */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            🩺 Diagnóstico e Observações
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
            
            <div>
              <label style={labelStyle}>Diagnóstico/CID *</label>
              <textarea
                name="diagnosis"
                value={prescriptionData.diagnosis}
                onChange={handleInputChange}
                style={errors.diagnosis ? { ...inputStyle, ...errorInputStyle, height: '100px', resize: 'vertical' } : { ...inputStyle, height: '100px', resize: 'vertical' }}
                placeholder="Descreva o diagnóstico e código CID se aplicável..."
              />
              {errors.diagnosis && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.diagnosis}</span>}
            </div>

            <div>
              <label style={labelStyle}>Observações Gerais</label>
              <textarea
                name="observations"
                value={prescriptionData.observations}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                placeholder="Observações adicionais, recomendações, cuidados especiais..."
              />
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div style={sectionStyle}>
          {errors.submit && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {errors.submit}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link
              to={patient ? `/patients/${prescriptionData.patientId}` : "/patients"}
              style={{
                padding: '12px 24px',
                background: '#e5e7eb',
                color: '#374151',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 32px',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? '⏳ Salvando...' : '💊 Criar Prescrição'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}