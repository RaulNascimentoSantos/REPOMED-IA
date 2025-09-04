import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8085'

export default function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch patient data
  const { data: patientData, isLoading, error } = useQuery({
    queryKey: ['patient', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/patients/${id}`)
      if (!response.ok) throw new Error('Erro ao carregar paciente')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Delete patient mutation
  const deletePatientMutation = useMutation({
    mutationFn: async (patientId) => {
      const response = await fetch(`${API_BASE}/api/patients/${patientId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro ao excluir paciente')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients'])
      navigate('/patients')
    }
  })

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatPhone = (phone) => {
    if (!phone) return 'Não informado'
    return phone
  }

  const getInitials = (name) => {
    if (!name) return 'N/A'
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A'
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return `${age} anos`
  }

  const handleDeleteClick = () => {
    if (window.confirm(`Tem certeza que deseja excluir o paciente ${patient.name}?`)) {
      deletePatientMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
          <h3>Carregando dados do paciente...</h3>
          <p style={{ color: '#6b7280' }}>Aguarde um momento</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
          <h3 style={{ color: '#ef4444' }}>Erro ao carregar paciente</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error.message}</p>
          <Link 
            to="/patients"
            style={{
              padding: '12px 24px',
              background: '#6366f1',
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

  const patient = patientData?.data

  if (!patient) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>👤</div>
          <h3>Paciente não encontrado</h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>O paciente solicitado não existe ou foi removido.</p>
          <Link 
            to="/patients"
            style={{
              padding: '12px 24px',
              background: '#6366f1',
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

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            
            {/* Avatar */}
            <div 
              style={{ 
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: patient.avatar ? 'transparent' : '#6366f1',
                backgroundImage: patient.avatar ? `url(${patient.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.8rem',
                fontWeight: 'bold'
              }}
            >
              {!patient.avatar && getInitials(patient.name)}
            </div>

            <div>
              <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
                {patient.name}
              </h1>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  👤 {calculateAge(patient.birthDate)}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  📋 {patient.cpf || 'CPF não informado'}
                </span>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                  📱 {formatPhone(patient.phone)}
                </span>
                {patient.email && (
                  <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    📧 {patient.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <Link
              to={`/patients/${id}/edit`}
              style={{
                padding: '12px 20px',
                background: '#10b981',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ✏️ Editar
            </Link>
            <button
              onClick={handleDeleteClick}
              disabled={deletePatientMutation.isPending}
              style={{
                padding: '12px 20px',
                background: deletePatientMutation.isPending ? '#9ca3af' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: deletePatientMutation.isPending ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {deletePatientMutation.isPending ? '⏳' : '🗑️'} Excluir
            </button>
            <Link 
              to="/patients"
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
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Basic Information */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📝 Informações Básicas
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Nome Completo:</span>
              <span style={{ color: '#1f2937' }}>{patient.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>CPF:</span>
              <span style={{ color: '#1f2937' }}>{patient.cpf || 'Não informado'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Data de Nascimento:</span>
              <span style={{ color: '#1f2937' }}>{formatDate(patient.birthDate)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Gênero:</span>
              <span style={{ color: '#1f2937' }}>{patient.gender || 'Não informado'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Email:</span>
              <span style={{ color: '#1f2937' }}>{patient.email || 'Não informado'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontWeight: '500', color: '#6b7280' }}>Telefone:</span>
              <span style={{ color: '#1f2937' }}>{formatPhone(patient.phone)}</span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🏠 Endereço
          </h2>
          
          {patient.address && (patient.address.street || patient.address.city) ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>CEP:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.zipCode || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Rua:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.street || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Número:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.number || 'S/N'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Complemento:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.complement || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Bairro:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.neighborhood || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Cidade:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.city || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Estado:</span>
                <span style={{ color: '#1f2937' }}>{patient.address.state || 'Não informado'}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nenhuma informação de endereço cadastrada.</p>
          )}
        </div>

        {/* Emergency Contact */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🚨 Contato de Emergência
          </h2>
          
          {patient.emergencyContact && patient.emergencyContact.name ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Nome:</span>
                <span style={{ color: '#1f2937' }}>{patient.emergencyContact.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Telefone:</span>
                <span style={{ color: '#1f2937' }}>{patient.emergencyContact.phone || 'Não informado'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Parentesco:</span>
                <span style={{ color: '#1f2937' }}>{patient.emergencyContact.relationship || 'Não informado'}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nenhum contato de emergência cadastrado.</p>
          )}
        </div>

        {/* Medical Information */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🩺 Informações Médicas
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Alergias:</h4>
              <p style={{ margin: 0, color: '#1f2937', background: '#f8fafc', padding: '12px', borderRadius: '6px', minHeight: '20px' }}>
                {patient.medicalInfo?.allergies || 'Nenhuma alergia conhecida'}
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Medicamentos em Uso:</h4>
              <p style={{ margin: 0, color: '#1f2937', background: '#f8fafc', padding: '12px', borderRadius: '6px', minHeight: '20px' }}>
                {patient.medicalInfo?.medications || 'Nenhum medicamento em uso'}
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Condições Médicas:</h4>
              <p style={{ margin: 0, color: '#1f2937', background: '#f8fafc', padding: '12px', borderRadius: '6px', minHeight: '20px' }}>
                {patient.medicalInfo?.conditions || 'Nenhuma condição médica conhecida'}
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.9rem', fontWeight: '500' }}>Observações:</h4>
              <p style={{ margin: 0, color: '#1f2937', background: '#f8fafc', padding: '12px', borderRadius: '6px', minHeight: '20px' }}>
                {patient.medicalInfo?.notes || 'Nenhuma observação adicional'}
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1f2937' }}>
          ⚡ Ações Rápidas
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          
          <Link
            to={`/prescription/create?patientId=${id}`}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            💊 Nova Prescrição
          </Link>

          <Link
            to={`/documents-new?patientId=${id}`}
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              textAlign: 'center',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📄 Novo Documento
          </Link>

          <button
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onClick={() => console.log('Ver histórico médico')}
          >
            📋 Histórico Médico
          </button>

          <button
            style={{
              padding: '16px',
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onClick={() => window.print()}
          >
            🖨️ Imprimir Ficha
          </button>

        </div>
      </div>

    </div>
  )
}