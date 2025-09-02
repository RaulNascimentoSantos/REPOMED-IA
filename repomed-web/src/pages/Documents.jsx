import React, { useState } from 'react'
import { Link } from 'react-router-dom'

export function Documents() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const mockDocuments = [
    {
      id: 1,
      title: 'Receita Médica - Maria Silva Santos',
      type: 'receita',
      patient: 'Maria Silva Santos',
      doctor: 'Dr. João Silva',
      date: '2025-01-09',
      status: 'Assinado',
      description: 'Prescrição de Paracetamol 500mg para dor de cabeça'
    },
    {
      id: 2,
      title: 'Atestado Médico - José Santos',
      type: 'atestado',
      patient: 'José Santos',
      doctor: 'Dra. Ana Costa',
      date: '2025-01-08',
      status: 'Pendente',
      description: 'Atestado para afastamento por 3 dias'
    },
    {
      id: 3,
      title: 'Laudo de Exames - Carlos Oliveira',
      type: 'laudo',
      patient: 'Carlos Oliveira',
      doctor: 'Dr. Pedro Lima',
      date: '2025-01-07',
      status: 'Assinado',
      description: 'Resultado de exames de sangue - glicemia elevada'
    },
    {
      id: 4,
      title: 'Receita Médica - Ana Ferreira',
      type: 'receita',
      patient: 'Ana Ferreira',
      doctor: 'Dr. João Silva',
      date: '2025-01-06',
      status: 'Rascunho',
      description: 'Medicação para hipertensão arterial'
    },
    {
      id: 5,
      title: 'Relatório Médico - Roberto Costa',
      type: 'relatorio',
      patient: 'Roberto Costa',
      doctor: 'Dra. Marina Santos',
      date: '2025-01-05',
      status: 'Assinado',
      description: 'Relatório de acompanhamento pós-cirúrgico'
    }
  ]

  const getTypeIcon = (type) => {
    const icons = {
      receita: '💊',
      atestado: '📋',
      laudo: '🔬',
      relatorio: '📊'
    }
    return icons[type] || '📄'
  }

  const getStatusColor = (status) => {
    const colors = {
      'Assinado': '#10b981',
      'Pendente': '#f59e0b',
      'Rascunho': '#6b7280'
    }
    return colors[status] || '#6b7280'
  }

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesFilter
  }).sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date)
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    if (sortBy === 'patient') return a.patient.localeCompare(b.patient)
    return 0
  })

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
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '600', color: '#1f2937' }}>Documentos Médicos</h1>
              <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Gerencie todos os documentos do sistema</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Link 
              to="/documents/create"
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              ➕ Novo Documento
            </Link>
            <Link 
              to="/workspace"
              style={{
                background: '#10b981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
            >
              🏥 Workspace
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Filters and Search */}
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end'
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '4px',
                color: '#374151'
              }}>
                🔍 Buscar documentos
              </label>
              <input
                type="text"
                placeholder="Buscar por título, paciente ou médico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                📋 Tipo de documento
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="all">Todos os tipos</option>
                <option value="receita">💊 Receitas</option>
                <option value="atestado">📋 Atestados</option>
                <option value="laudo">🔬 Laudos</option>
                <option value="relatorio">📊 Relatórios</option>
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
                🗂️ Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="date">📅 Data (mais recente)</option>
                <option value="title">📝 Título (A-Z)</option>
                <option value="patient">👤 Paciente (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div style={{
          display: 'grid',
          gap: '16px'
        }}>
          {filteredDocuments.map(doc => (
            <div key={doc.id} style={{
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '16px',
                alignItems: 'center'
              }}>
                {/* Document Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{getTypeIcon(doc.type)}</span>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                      {doc.title}
                    </h3>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <div>
                      <strong>👤 Paciente:</strong> {doc.patient}
                    </div>
                    <div>
                      <strong>👨‍⚕️ Médico:</strong> {doc.doctor}
                    </div>
                    <div>
                      <strong>📅 Data:</strong> {new Date(doc.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <p style={{ 
                    margin: '8px 0 0 0', 
                    fontSize: '14px', 
                    color: '#4b5563',
                    fontStyle: 'italic'
                  }}>
                    {doc.description}
                  </p>
                </div>

                {/* Status */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    background: getStatusColor(doc.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap'
                  }}>
                    {doc.status}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    👁️ Ver
                  </button>
                  <button style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    ✏️ Editar
                  </button>
                  <button style={{
                    background: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    color: '#374151',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    📥 Baixar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div style={{
            background: 'white',
            padding: '60px 20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
              Nenhum documento encontrado
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              Não foram encontrados documentos com os filtros aplicados.
            </p>
            <Link 
              to="/documents/create"
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ➕ Criar primeiro documento
            </Link>
          </div>
        )}

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '32px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#3b82f6', marginBottom: '4px' }}>
              {mockDocuments.length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total de Documentos</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
              {mockDocuments.filter(doc => doc.status === 'Assinado').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Documentos Assinados</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#f59e0b', marginBottom: '4px' }}>
              {mockDocuments.filter(doc => doc.status === 'Pendente').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Pendentes</div>
          </div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '24px', fontWeight: '700', color: '#6b7280', marginBottom: '4px' }}>
              {mockDocuments.filter(doc => doc.status === 'Rascunho').length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Rascunhos</div>
          </div>
        </div>
      </div>
    </div>
  )
}