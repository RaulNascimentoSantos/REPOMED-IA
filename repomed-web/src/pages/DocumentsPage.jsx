import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  FileText, 
  Plus, 
  Eye, 
  Download, 
  Share2,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { documentsApi } from '../lib/api'

export default function DocumentsPage() {
  // Mock documents for now - replace with real API when ready
  const mockDocuments = [
    {
      id: 'doc_001',
      templateName: 'Receita Simples',
      patient: { name: 'João Silva', cpf: '123.456.789-00' },
      status: 'draft',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: 'doc_002', 
      templateName: 'Atestado Médico',
      patient: { name: 'Maria Santos', cpf: '987.654.321-00' },
      status: 'signed',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:25:00Z'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'draft':
        return 'Rascunho'
      case 'signed':
        return 'Assinado'
      case 'error':
        return 'Erro'
      default:
        return 'Desconhecido'
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Meus Documentos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie todos os seus documentos médicos
          </p>
        </div>
        <Link
          to="/documents/create"
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Documento
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900">
            {mockDocuments.length}
          </h3>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        
        <div className="card text-center">
          <Clock className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900">
            {mockDocuments.filter(d => d.status === 'draft').length}
          </h3>
          <p className="text-sm text-gray-600">Rascunhos</p>
        </div>
        
        <div className="card text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900">
            {mockDocuments.filter(d => d.status === 'signed').length}
          </h3>
          <p className="text-sm text-gray-600">Assinados</p>
        </div>
        
        <div className="card text-center">
          <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h3 className="text-2xl font-bold text-gray-900">0</h3>
          <p className="text-sm text-gray-600">Compartilhados</p>
        </div>
      </div>

      {/* Documents List */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Documentos Recentes
        </h2>
        
        {mockDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Comece criando seu primeiro documento médico
            </p>
            <Link
              to="/documents/create"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Documento
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Documento
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Paciente
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Criado em
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {doc.templateName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {doc.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {doc.patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          CPF: {doc.patient.cpf}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(doc.status)}
                        <span className="text-sm font-medium">
                          {getStatusText(doc.status)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/documents/${doc.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Ver documento"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Download PDF"
                          onClick={() => {
                            // TODO: Implement PDF download
                            alert('Download PDF - Em desenvolvimento')
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="Compartilhar"
                          onClick={() => {
                            // TODO: Implement sharing
                            alert('Compartilhar - Em desenvolvimento')
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}