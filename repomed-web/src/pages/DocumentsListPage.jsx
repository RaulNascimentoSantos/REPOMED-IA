import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8085'

export default function DocumentsListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')

  const queryClient = useQueryClient()

  // Fetch documents from API
  const { data: documentsData, isLoading, error } = useQuery({
    queryKey: ['documents', searchTerm, statusFilter, typeFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : '',
        type: typeFilter !== 'all' ? typeFilter : '',
        sortBy,
        sortOrder,
        limit: '100'
      })
      const response = await fetch(`${API_BASE}/api/documents?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar documentos')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Delete document mutation
  const deleteDocumentMutation = useMutation({
    mutationFn: async (documentId) => {
      const response = await fetch(`${API_BASE}/api/documents/${documentId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro ao excluir documento')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
    }
  })

  const documents = documentsData?.data || []

  // Client-side filtering and sorting
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = !searchTerm || 
        doc.templateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'signed' && doc.isSigned) ||
        (statusFilter === 'unsigned' && !doc.isSigned)
      
      const matchesType = typeFilter === 'all' || doc.templateName?.toLowerCase().includes(typeFilter.toLowerCase())
      
      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      let aValue, bValue
      switch(sortBy) {
        case 'patientName':
          aValue = a.patientName?.toLowerCase() || ''
          bValue = b.patientName?.toLowerCase() || ''
          break
        case 'doctorName':
          aValue = a.doctorName?.toLowerCase() || ''
          bValue = b.doctorName?.toLowerCase() || ''
          break
        case 'createdAt':
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a[sortBy] || ''
          bValue = b[sortBy] || ''
      }
      
      if (sortOrder === 'desc') {
        return aValue < bValue ? 1 : -1
      }
      return aValue > bValue ? 1 : -1
    })

  const getStatusDisplay = (document) => {
    if (document.isSigned) {
      return {
        label: 'Assinado',
        color: '#10b981',
        bgColor: '#dcfce7',
        icon: '✅'
      }
    }
    return {
      label: 'Não Assinado',
      color: '#f59e0b',
      bgColor: '#fef3c7',
      icon: '⏳'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownloadPDF = async (documentId) => {
    try {
      const response = await fetch(`${API_BASE}/api/documents/${documentId}/pdf`)
      if (!response.ok) throw new Error('Erro ao gerar PDF')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `documento-${documentId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Erro ao baixar PDF. Tente novamente.')
    }
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#f8fafc', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={sectionStyle}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
            <h2 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>Erro ao carregar documentos</h2>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>{error.message}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔄 Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
              📄 Documentos Médicos
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {isLoading ? 'Carregando...' : `${filteredDocuments.length} documentos encontrados`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link 
              to="/templates" 
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
              📝 Criar Documento
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

      {/* Filters */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Pesquisar por paciente, médico, tipo de documento ou ID..."
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
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">Todos os status</option>
                <option value="signed">Assinados</option>
                <option value="unsigned">Não assinados</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Tipo de Documento
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                <option value="all">Todos os tipos</option>
                <option value="receita">Receitas</option>
                <option value="atestado">Atestados</option>
                <option value="laudo">Laudos</option>
                <option value="solicitacao">Solicitações</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Ordenar por
              </label>
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
                <option value="createdAt">Data de criação</option>
                <option value="patientName">Nome do paciente</option>
                <option value="doctorName">Nome do médico</option>
                <option value="templateName">Tipo de documento</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                Ordem
              </label>
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
                <option value="desc">Mais recentes</option>
                <option value="asc">Mais antigos</option>
              </select>
            </div>
          </div>
          
          {/* Clear Filters */}
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
            <div style={{ textAlign: 'right' }}>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                  setTypeFilter('all')
                  setSortBy('createdAt')
                  setSortOrder('desc')
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

      {/* Documents List */}
      <div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={sectionStyle}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>Carregando documentos...</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>Aguarde um momento</p>
            </div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div style={sectionStyle}>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📄</div>
              <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
                {documents.length === 0 ? 'Nenhum documento cadastrado' : 'Nenhum documento encontrado'}
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '24px' }}>
                {documents.length === 0 ? 
                  'Comece criando o primeiro documento médico' : 
                  'Tente ajustar os filtros para encontrar documentos'
                }
              </p>
              <Link 
                to="/templates" 
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
                📝 Criar Primeiro Documento
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredDocuments.map(document => {
              const status = getStatusDisplay(document)
              return (
                <div 
                  key={document.id} 
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#1f2937' }}>
                        📄 {document.templateName || 'Documento'}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
                        ID: {document.id}
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: status.bgColor,
                      color: status.color,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{status.icon}</span>
                      {status.label}
                    </div>
                  </div>

                  {/* Document Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                        PACIENTE
                      </div>
                      <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                        👤 {document.patientName || 'Nome não informado'}
                      </div>
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                        MÉDICO RESPONSÁVEL
                      </div>
                      <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                        👨‍⚕️ {document.doctorName || 'Nome não informado'}
                      </div>
                      {document.doctorCrm && (
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          CRM: {document.doctorCrm}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                        DATA DE CRIAÇÃO
                      </div>
                      <div style={{ fontSize: '14px', color: '#1f2937', fontWeight: '500' }}>
                        🕒 {formatDate(document.createdAt)}
                      </div>
                    </div>
                    
                    {document.signedAt && (
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>
                          DATA DE ASSINATURA
                        </div>
                        <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>
                          ✍️ {formatDate(document.signedAt)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '12px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <Link
                      to={`/documents/${document.id}`}
                      style={{
                        padding: '10px 16px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                      onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                    >
                      👁️ Visualizar
                    </Link>
                    
                    <button
                      onClick={() => handleDownloadPDF(document.id)}
                      style={{
                        padding: '10px 16px',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#059669'}
                      onMouseLeave={(e) => e.target.style.background = '#10b981'}
                    >
                      📄 Baixar PDF
                    </button>
                    
                    {!document.isSigned && (
                      <button
                        onClick={() => {
                          // Implement signature logic
                          alert('Funcionalidade de assinatura será implementada em breve')
                        }}
                        style={{
                          padding: '10px 16px',
                          background: '#8b5cf6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#7c3aed'}
                        onMouseLeave={(e) => e.target.style.background = '#8b5cf6'}
                      >
                        ✍️ Assinar
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o documento ${document.id}?`)) {
                          deleteDocumentMutation.mutate(document.id)
                        }
                      }}
                      style={{
                        padding: '10px 16px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#dc2626'}
                      onMouseLeave={(e) => e.target.style.background = '#ef4444'}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Statistics */}
      {documents.length > 0 && (
        <div style={sectionStyle}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            📊 Estatísticas
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#f0f9ff',
              borderRadius: '12px',
              border: '2px solid #bae6fd'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '8px' }}>
                {documents.length}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Total de Documentos
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#dcfce7',
              borderRadius: '12px',
              border: '2px solid #86efac'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                {documents.filter(d => d.isSigned).length}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Documentos Assinados
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#fef3c7',
              borderRadius: '12px',
              border: '2px solid #fbbf24'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                {documents.filter(d => !d.isSigned).length}
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Aguardando Assinatura
              </div>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#fce7f3',
              borderRadius: '12px',
              border: '2px solid #f9a8d4'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ec4899', marginBottom: '8px' }}>
                {Math.round((documents.filter(d => d.isSigned).length / documents.length) * 100)}%
              </div>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                Taxa de Assinatura
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}