import React, { useState, useMemo } from 'react'
import { 
  useDocuments, 
  useInfiniteDocuments, 
  useCreateDocument,
  useSignDocument 
} from '../hooks/useApi'
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Download,
  Eye,
  RefreshCw,
  ArrowDown
} from 'lucide-react'

const DocumentsOptimizedPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('infinite') // 'paginated' | 'infinite'
  
  // Filters for API
  const filters = useMemo(() => {
    const params = {}
    if (searchQuery) params.search = searchQuery
    if (statusFilter !== 'all') params.status = statusFilter
    return params
  }, [searchQuery, statusFilter])

  // TanStack Query hooks
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments
  } = useDocuments(filters, { enabled: viewMode === 'paginated' })

  const {
    data: infiniteData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: infiniteLoading,
    error: infiniteError
  } = useInfiniteDocuments(filters, { enabled: viewMode === 'infinite' })

  const createDocumentMutation = useCreateDocument()
  const signDocumentMutation = useSignDocument()

  // Flatten infinite data
  const allDocuments = useMemo(() => {
    if (viewMode === 'infinite' && infiniteData) {
      return infiniteData.pages.flatMap(page => page.data || page)
    }
    return documents || []
  }, [infiniteData, documents, viewMode])

  const isLoading = viewMode === 'infinite' ? infiniteLoading : documentsLoading
  const error = viewMode === 'infinite' ? infiniteError : documentsError

  // Statistics
  const stats = useMemo(() => {
    const total = allDocuments.length
    const signed = allDocuments.filter(doc => doc.isSigned).length
    const pending = allDocuments.filter(doc => !doc.isSigned).length
    const signingRate = total > 0 ? ((signed / total) * 100).toFixed(1) : 0

    return { total, signed, pending, signingRate }
  }, [allDocuments])

  const handleSignDocument = async (documentId) => {
    try {
      await signDocumentMutation.mutateAsync({
        documentId,
        doctorName: 'Dr. Sistema', // Mock - pegar do contexto de auth
      })
    } catch (error) {
      console.error('Error signing document:', error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (doc) => {
    if (doc.isSigned) return <CheckCircle size={16} color="#10b981" />
    return <Clock size={16} color="#f59e0b" />
  }

  const getStatusText = (doc) => {
    if (doc.isSigned) return 'Assinado'
    return 'Pendente'
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px'
  }

  const documentCardStyle = {
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  }

  if (isLoading && allDocuments.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <RefreshCw className="animate-spin" size={32} color="#6366f1" />
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Carregando documentos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        minHeight: '100vh', 
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          background: 'white', 
          padding: '32px', 
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '400px'
        }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ color: '#1f2937', marginBottom: '8px' }}>Erro ao carregar documentos</h3>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            {error.message || 'Não foi possível conectar com o servidor'}
          </p>
          <button
            onClick={() => refetchDocuments()}
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <RefreshCw size={16} />
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ 
      padding: '32px', 
      background: '#f8fafc', 
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, color: '#1f2937', fontSize: '24px', fontWeight: '600' }}>
            📄 Documentos Médicos
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
            Gestão completa de documentos com TanStack Query
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white'
            }}
          >
            <option value="infinite">Scroll Infinito</option>
            <option value="paginated">Paginado</option>
          </select>
          
          <button
            onClick={() => console.log('Create document')}
            style={{
              padding: '8px 16px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={16} />
            Novo Documento
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        <div style={{ ...cardStyle, textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6366f1' }}>
            {stats.total}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Total de Documentos</div>
        </div>

        <div style={{ ...cardStyle, textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {stats.signed}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Documentos Assinados</div>
        </div>

        <div style={{ ...cardStyle, textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.pending}
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Aguardando Assinatura</div>
        </div>

        <div style={{ ...cardStyle, textAlign: 'center', margin: 0 }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#8b5cf6' }}>
            {stats.signingRate}%
          </div>
          <div style={{ color: '#6b7280', fontSize: '14px' }}>Taxa de Assinatura</div>
        </div>

      </div>

      {/* Filters */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '1', minWidth: '200px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Buscar por paciente, médico ou conteúdo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                background: 'white',
                minWidth: '120px'
              }}
            >
              <option value="all">Todos</option>
              <option value="signed">Assinados</option>
              <option value="pending">Pendentes</option>
            </select>
          </div>

          <button
            onClick={() => refetchDocuments()}
            style={{
              padding: '12px 16px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={16} />
            Atualizar
          </button>

        </div>
      </div>

      {/* Documents List */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>
          Documentos ({allDocuments.length})
        </h3>

        {allDocuments.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <p>Nenhum documento encontrado</p>
            {searchQuery && (
              <p style={{ fontSize: '14px' }}>
                Tente ajustar os filtros de busca
              </p>
            )}
          </div>
        ) : (
          <div>
            {allDocuments.map((doc, index) => (
              <div
                key={doc.id || index}
                style={documentCardStyle}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                  e.target.style.borderColor = '#6366f1'
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = 'none'
                  e.target.style.borderColor = '#e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <FileText size={16} color="#6366f1" />
                      <h4 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>
                        {doc.title || `Documento para ${doc.patientName}`}
                      </h4>
                      {getStatusIcon(doc)}
                    </div>
                    
                    <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>
                      <strong>Paciente:</strong> {doc.patientName} | 
                      <strong> Médico:</strong> {doc.doctorName} ({doc.doctorCrm})
                    </div>
                    
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      Criado em {formatDate(doc.createdAt)}
                      {doc.isSigned && doc.signedAt && (
                        <span> • Assinado em {formatDate(doc.signedAt)}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    
                    <div style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      background: doc.isSigned ? '#dcfce7' : '#fef3c7',
                      color: doc.isSigned ? '#166534' : '#92400e',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {getStatusText(doc)}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      
                      <button
                        style={{
                          padding: '6px 8px',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Visualizar"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        style={{
                          padding: '6px 8px',
                          background: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Download PDF"
                      >
                        <Download size={14} />
                      </button>

                      {!doc.isSigned && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSignDocument(doc.id)
                          }}
                          disabled={signDocumentMutation.isPending}
                          style={{
                            padding: '6px 12px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: signDocumentMutation.isPending ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            opacity: signDocumentMutation.isPending ? 0.7 : 1
                          }}
                        >
                          {signDocumentMutation.isPending ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            'Assinar'
                          )}
                        </button>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            ))}

            {/* Infinite scroll load more button */}
            {viewMode === 'infinite' && hasNextPage && (
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  style={{
                    padding: '12px 24px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: isFetchingNextPage ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto',
                    opacity: isFetchingNextPage ? 0.7 : 1
                  }}
                >
                  {isFetchingNextPage ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  {isFetchingNextPage ? 'Carregando...' : 'Carregar Mais'}
                </button>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  )
}

export default DocumentsOptimizedPage