import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8090'

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatients, setSelectedPatients] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState(null)
  const [ageFilter, setAgeFilter] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState('asc')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch patients from API
  const { data: patientsData, isLoading, error } = useQuery({
    queryKey: ['patients', searchTerm, ageFilter, genderFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        ageFilter,
        genderFilter,
        sortBy,
        sortOrder,
        limit: '100'
      })
      const response = await fetch(`${API_BASE}/api/patients?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar pacientes')
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
      setShowDeleteModal(false)
      setPatientToDelete(null)
    }
  })

  const rawPatients = patientsData?.data || []

  // Client-side filtering and sorting
  const patients = rawPatients
    .filter(patient => {
      const matchesSearch = !searchTerm || 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf?.includes(searchTerm) ||
        patient.email?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGender = !genderFilter || patient.gender === genderFilter
      
      const matchesAge = !ageFilter || (() => {
        if (!patient.birthDate) return false
        const age = new Date().getFullYear() - new Date(patient.birthDate).getFullYear()
        switch(ageFilter) {
          case '0-17': return age >= 0 && age <= 17
          case '18-30': return age >= 18 && age <= 30
          case '31-50': return age >= 31 && age <= 50
          case '51-70': return age >= 51 && age <= 70
          case '70+': return age > 70
          default: return true
        }
      })()
      
      return matchesSearch && matchesGender && matchesAge
    })
    .sort((a, b) => {
      let aValue, bValue
      switch(sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'age':
          aValue = a.birthDate ? new Date().getFullYear() - new Date(a.birthDate).getFullYear() : 0
          bValue = b.birthDate ? new Date().getFullYear() - new Date(b.birthDate).getFullYear() : 0
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a[sortBy]
          bValue = b[sortBy]
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

  const handleEditPatient = (patientId) => {
    navigate(`/patients/${patientId}/edit`)
  }

  const handleDeletePatient = (patient) => {
    setPatientToDelete(patient)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (patientToDelete) {
      deletePatientMutation.mutate(patientToDelete.id)
    }
  }

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    )
  }

  const handleViewPatient = (patientId) => {
    navigate(`/patients/${patientId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444' }}>Erro ao carregar pacientes</h2>
        <p>{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
              👥 Gerenciar Pacientes
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {isLoading ? 'Carregando...' : `${patients.length} pacientes encontrados`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link 
              to="/patients/create" 
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span>
              Novo Paciente
            </Link>
            <Link 
              to="/" 
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

      {/* Search and Filters */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="🔍 Pesquisar por nome, CPF ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
            
            {/* Filters Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Gênero</label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Todos os gêneros</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
                  <option value="nao_informar">Não informado</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Faixa Etária</label>
                <select
                  value={ageFilter}
                  onChange={(e) => setAgeFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="">Todas as idades</option>
                  <option value="0-17">0-17 anos</option>
                  <option value="18-30">18-30 anos</option>
                  <option value="31-50">31-50 anos</option>
                  <option value="51-70">51-70 anos</option>
                  <option value="70+">Acima de 70 anos</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="name">Nome</option>
                  <option value="age">Idade</option>
                  <option value="createdAt">Data de cadastro</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>Ordem</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
            </div>
            
            {/* Clear Filters */}
            {(searchTerm || genderFilter || ageFilter || sortBy !== 'name' || sortOrder !== 'asc') && (
              <div style={{ textAlign: 'right' }}>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setGenderFilter('')
                    setAgeFilter('')
                    setSortBy('name')
                    setSortOrder('asc')
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  🗑️ Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedPatients.length > 0 && (
          <div style={{ 
            marginTop: '16px',
            padding: '16px 20px', 
            background: '#fef3c7', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontWeight: '500' }}>
              {selectedPatients.length} pacientes selecionados
            </span>
            <button 
              style={{
                padding: '8px 16px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500'
              }}
              onClick={() => console.log('Bulk delete:', selectedPatients)}
            >
              🗑️ Excluir Selecionados
            </button>
          </div>
        )}
      </div>

      {/* Patients List */}
      <div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
            <h3>Carregando pacientes...</h3>
            <p style={{ color: '#6b7280' }}>Aguarde um momento</p>
          </div>
        ) : patients.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👥</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {searchTerm ? 
                `Não encontramos pacientes com "${searchTerm}"` : 
                'Comece cadastrando o primeiro paciente do sistema'
              }
            </p>
            <Link 
              to="/patients/create" 
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              + Cadastrar Primeiro Paciente
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {patients.map(patient => (
              <div 
                key={patient.id} 
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)'
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)'
                  e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedPatients.includes(patient.id)}
                  onChange={() => handleSelectPatient(patient.id)}
                  style={{ transform: 'scale(1.2)' }}
                />

                {/* Avatar */}
                <div 
                  style={{ 
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: patient.avatar ? 'transparent' : '#6366f1',
                    backgroundImage: patient.avatar ? `url(${patient.avatar})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {!patient.avatar && getInitials(patient.name)}
                </div>

                {/* Patient Info */}
                <div 
                  style={{ flex: 1 }}
                  onClick={() => handleViewPatient(patient.id)}
                >
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#1f2937' }}>
                    {patient.name}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
                    <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                      📋 {patient.cpf || 'CPF não informado'}
                    </span>
                    {patient.email && (
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        📧 {patient.email}
                      </span>
                    )}
                    {patient.phone && (
                      <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                        📱 {patient.phone}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                    {patient.birthDate && (
                      <span>🎂 {formatDate(patient.birthDate)} • </span>
                    )}
                    <span>🕒 Atualizado em {formatDate(patient.updatedAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleViewPatient(patient.id)}
                    title="Ver detalhes"
                    style={{
                      padding: '10px',
                      background: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                    onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => handleEditPatient(patient.id)}
                    title="Editar"
                    style={{
                      padding: '10px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#059669'}
                    onMouseLeave={(e) => e.target.style.background = '#10b981'}
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDeletePatient(patient)}
                    title="Excluir"
                    style={{
                      padding: '10px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚨</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#ef4444', fontSize: '1.5rem' }}>
                Confirmar Exclusão
              </h3>
              <p style={{ margin: 0, color: '#6b7280' }}>
                Tem certeza que deseja excluir o paciente <strong>{patientToDelete?.name}</strong>? 
                Esta ação não pode ser desfeita.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{
                  padding: '12px 24px',
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
                onClick={confirmDelete}
                disabled={deletePatientMutation.isPending}
                style={{
                  padding: '12px 24px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: deletePatientMutation.isPending ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  opacity: deletePatientMutation.isPending ? 0.7 : 1
                }}
              >
                {deletePatientMutation.isPending ? 'Excluindo...' : 'Excluir Paciente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}