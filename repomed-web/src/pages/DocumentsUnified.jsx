import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { 
  FileText, Download, Share, Edit, Trash2, Eye, 
  Filter, Search, Plus, RefreshCw, AlertCircle,
  Clock, CheckCircle, PenTool, Link as LinkIcon
} from 'lucide-react'

export default function DocumentsUnified() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [viewMode, setViewMode] = useState('grid') // grid ou list
  
  // Buscar documentos
  const { data: documents, isLoading, error, refetch } = useQuery({
    queryKey: ['documents', { search: searchTerm, type: filterType, status: filterStatus, sort: sortBy }],
    queryFn: async () => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (filterType !== 'all') params.append('type', filterType)
        if (filterStatus !== 'all') params.append('status', filterStatus)
        params.append('sort', sortBy)
        
        const response = await api.get(`/api/documents?${params}`)
        return response.data || response
      } catch {
        // Mock data se API não estiver disponível
        return generateMockDocuments()
      }
    }
  })
  
  // Mutations para ações
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/api/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      alert('Documento excluído com sucesso')
    },
    onError: () => alert('Erro ao excluir documento')
  })
  
  const signDocumentMutation = useMutation({
    mutationFn: async (id) => await api.post(`/api/documents/${id}/sign`),
    onSuccess: () => {
      queryClient.invalidateQueries(['documents'])
      alert('Documento assinado com sucesso')
    },
    onError: () => alert('Erro ao assinar documento')
  })
  
  const generateMockDocuments = () => [
    {
      id: '1',
      title: 'Receita Médica - Maria Silva Santos',
      type: 'prescription',
      patient: { name: 'Maria Silva Santos', id: 'p1' },
      doctor: { name: 'Dr. João Silva', crm: '12345-SP' },
      createdAt: '2025-01-09T10:30:00Z',
      status: 'signed',
      template: { name: 'Receita Simples' },
      description: 'Prescrição de Paracetamol 500mg'
    },
    {
      id: '2',
      title: 'Atestado Médico - José Santos',
      type: 'certificate',
      patient: { name: 'José Santos', id: 'p2' },
      doctor: { name: 'Dra. Ana Costa', crm: '54321-RJ' },
      createdAt: '2025-01-08T14:20:00Z',
      status: 'pending',
      template: { name: 'Atestado Médico' },
      description: 'Atestado para afastamento por 3 dias'
    },
    {
      id: '3',
      title: 'Laudo de Exames - Carlos Oliveira',
      type: 'report',
      patient: { name: 'Carlos Oliveira', id: 'p3' },
      doctor: { name: 'Dr. Pedro Lima', crm: '98765-MG' },
      createdAt: '2025-01-07T09:15:00Z',
      status: 'signed',
      template: { name: 'Laudo de Exames' },
      description: 'Resultado de exames de sangue'
    }
  ]
  
  const getTypeIcon = (type) => {
    const icons = {
      prescription: { icon: '💊', color: '#3B82F6', label: 'Receita' },
      certificate: { icon: '📋', color: '#10B981', label: 'Atestado' },
      report: { icon: '🔬', color: '#F59E0B', label: 'Laudo' },
      exam: { icon: '📊', color: '#8B5CF6', label: 'Exame' }
    }
    return icons[type] || { icon: '📄', color: '#6B7280', label: 'Documento' }
  }
  
  const getStatusInfo = (status) => {
    const statuses = {
      signed: { icon: CheckCircle, color: '#10B981', label: 'Assinado', bgColor: '#DCFCE7' },
      pending: { icon: Clock, color: '#F59E0B', label: 'Pendente', bgColor: '#FEF3C7' },
      draft: { icon: Edit, color: '#6B7280', label: 'Rascunho', bgColor: '#F3F4F6' },
      cancelled: { icon: AlertCircle, color: '#EF4444', label: 'Cancelado', bgColor: '#FEE2E2' }
    }
    return statuses[status] || statuses.draft
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
  
  const handleAction = async (action, document) => {
    switch (action) {
      case 'view':
        navigate(`/documents/${document.id}`)
        break
      case 'edit':
        if (document.status === 'signed') {
          alert('Documentos assinados não podem ser editados')
          return
        }
        navigate(`/documents/${document.id}/edit`)
        break
      case 'sign':
        if (document.status === 'signed') {
          alert('Documento já está assinado')
          return
        }
        navigate(`/documents/${document.id}/sign`)
        break
      case 'download':
        try {
          const response = await api.get(`/api/documents/${document.id}/pdf`, {
            responseType: 'blob'
          })
          const url = window.URL.createObjectURL(new Blob([response.data]))
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', `documento-${document.id}.pdf`)
          document.body.appendChild(link)
          link.click()
          link.remove()
        } catch {
          alert('Download será implementado em breve')
        }
        break
      case 'share':
        try {
          const response = await api.post(`/api/documents/${document.id}/share`)
          const shareUrl = `${window.location.origin}/share/${response.data.token || document.id}`
          navigator.clipboard.writeText(shareUrl)
          alert('Link de compartilhamento copiado para a área de transferência!')
        } catch {
          const shareUrl = `${window.location.origin}/share/${document.id}`
          navigator.clipboard.writeText(shareUrl)
          alert('Link de compartilhamento copiado (mock)')
        }
        break
      case 'delete':
        if (window.confirm('Tem certeza que deseja excluir este documento?')) {
          deleteDocumentMutation.mutate(document.id)
        }
        break
    }
  }
  
  const filteredDocuments = (documents || []).filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    const matchesStatus = filterStatus === 'all' || doc.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
  })
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Carregando documentos...</span>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Documentos Médicos</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Gerencie todos os documentos do sistema
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => refetch()}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </button>
              <Link
                to="/documents/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                         flex items-center gap-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Novo Documento
              </Link>
            </div>
          </div>
          
          {/* Filtros e Busca */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="prescription">Receitas</option>
              <option value="certificate">Atestados</option>
              <option value="report">Laudos</option>
              <option value="exam">Exames</option>
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="pending">Pendente</option>
              <option value="signed">Assinado</option>
              <option value="cancelled">Cancelado</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg 
                       bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Data (mais recente)</option>
              <option value="title">Título (A-Z)</option>
              <option value="patient">Paciente (A-Z)</option>
              <option value="status">Status</option>
            </select>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg ${viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-lg ${viewMode === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
        
        {/* Documents Grid/List */}
        {filteredDocuments.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
            <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece criando seu primeiro documento'}
            </p>
            <Link
              to="/documents/new"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 
                       inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Documento
            </Link>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredDocuments.map((document) => {
              const typeInfo = getTypeIcon(document.type)
              const statusInfo = getStatusInfo(document.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <div
                  key={document.id}
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow
                           ${viewMode === 'list' ? 'p-4' : 'p-6'}`}
                >
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                          >
                            {typeInfo.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">
                              {document.title}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              {typeInfo.label}
                            </p>
                          </div>
                        </div>
                        
                        <div 
                          className="px-2 py-1 rounded-lg flex items-center gap-1"
                          style={{ backgroundColor: statusInfo.bgColor }}
                        >
                          <StatusIcon className="h-3 w-3" style={{ color: statusInfo.color }} />
                          <span className="text-xs font-medium" style={{ color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Paciente:</span>
                          <span>{document.patient?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Médico:</span>
                          <span>{document.doctor?.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="font-medium">Data:</span>
                          <span>{formatDate(document.createdAt)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => handleAction('view', document)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs 
                                   border border-slate-200 dark:border-slate-600 rounded-lg 
                                   hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Eye className="h-3 w-3" />
                          Ver
                        </button>
                        <button
                          onClick={() => handleAction('download', document)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs 
                                   border border-slate-200 dark:border-slate-600 rounded-lg 
                                   hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </button>
                        <button
                          onClick={() => handleAction('share', document)}
                          className="flex items-center justify-center gap-1 px-3 py-2 text-xs 
                                   border border-slate-200 dark:border-slate-600 rounded-lg 
                                   hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Share className="h-3 w-3" />
                          Share
                        </button>
                      </div>
                      
                      {document.status !== 'signed' && (
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <button
                            onClick={() => handleAction('sign', document)}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-xs 
                                     bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <PenTool className="h-3 w-3" />
                            Assinar
                          </button>
                          <button
                            onClick={() => handleAction('delete', document)}
                            className="flex items-center justify-center gap-1 px-3 py-2 text-xs 
                                     bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            Excluir
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                            style={{ backgroundColor: typeInfo.color + '20', color: typeInfo.color }}
                          >
                            {typeInfo.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                              {document.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {document.patient?.name} • {document.doctor?.name} • {formatDate(document.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div 
                            className="px-3 py-1 rounded-lg flex items-center gap-1"
                            style={{ backgroundColor: statusInfo.bgColor }}
                          >
                            <StatusIcon className="h-4 w-4" style={{ color: statusInfo.color }} />
                            <span className="text-sm font-medium" style={{ color: statusInfo.color }}>
                              {statusInfo.label}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAction('view', document)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction('download', document)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAction('share', document)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            >
                              <Share className="h-4 w-4" />
                            </button>
                            {document.status !== 'signed' && (
                              <>
                                <button
                                  onClick={() => handleAction('sign', document)}
                                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                >
                                  <PenTool className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleAction('delete', document)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}