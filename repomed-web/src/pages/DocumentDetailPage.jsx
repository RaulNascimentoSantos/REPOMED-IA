import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Eye, 
  FileText,
  PenTool,
  QrCode,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { documentsApi } from '../lib/api'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Mock document for now
  const mockDocument = {
    id,
    templateName: 'Receita Simples',
    templateId: 'tpl_receita_simples',
    patient: {
      name: 'João Silva',
      cpf: '123.456.789-00'
    },
    fields: {
      medications: [
        {
          name: 'Dipirona 500mg',
          dosage: '1 comprimido',
          frequency: 'de 6/6 horas',
          instructions: 'Tomar com água'
        }
      ],
      instructions: 'Tomar os medicamentos conforme prescrição médica',
      valid_days: 30
    },
    status: 'draft',
    hash: 'abc123hash',
    qrCode: 'data:image/png;base64,mock-qr-code',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    pdfUrl: `/api/documents/${id}/pdf`,
    shareUrl: null,
    signatureId: null
  }

  const signDocumentMutation = useMutation({
    mutationFn: (data) => documentsApi.sign(id, data),
    onSuccess: () => {
      alert('Documento assinado com sucesso!')
      // Refresh document data
    },
    onError: (error) => {
      console.error('Error signing document:', error)
      alert('Erro ao assinar documento. Tente novamente.')
    }
  })

  const handleDownloadPDF = () => {
    // TODO: Implement actual PDF download
    const link = document.createElement('a')
    link.href = `http://localhost:3001/api/documents/${id}/pdf`
    link.download = `${mockDocument.templateName}_${mockDocument.patient.name}.pdf`
    link.click()
  }

  const handleSign = () => {
    if (confirm('Deseja assinar este documento? Esta ação não pode ser desfeita.')) {
      signDocumentMutation.mutate({ provider: 'mock' })
    }
  }

  const handleShare = () => {
    // TODO: Implement sharing functionality
    alert('Funcionalidade de compartilhamento - Em desenvolvimento')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'signed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/documents')}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mockDocument.templateName}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-gray-600">
                Paciente: {mockDocument.patient.name}
              </span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(mockDocument.status)}
                <span className="text-sm font-medium">
                  {getStatusText(mockDocument.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF
          </button>
          
          <button
            onClick={handleShare}
            className="btn-secondary flex items-center"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </button>
          
          {mockDocument.status === 'draft' && (
            <button
              onClick={handleSign}
              disabled={signDocumentMutation.isPending}
              className="btn-primary flex items-center"
            >
              <PenTool className="h-4 w-4 mr-2" />
              {signDocumentMutation.isPending ? 'Assinando...' : 'Assinar'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Conteúdo do Documento
            </h2>
            
            {/* Document Preview */}
            <div className="medical-document bg-white border border-gray-300 rounded-md p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">RECEITUÁRIO MÉDICO</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong>Paciente:</strong> {mockDocument.patient.name}
                </div>
                <div>
                  <strong>CPF:</strong> {mockDocument.patient.cpf}
                </div>
                <div>
                  <strong>Data:</strong> {formatDate(mockDocument.createdAt)}
                </div>
                
                <div className="mt-6">
                  <strong>PRESCRIÇÃO:</strong>
                  <div className="mt-2 space-y-2">
                    {mockDocument.fields.medications?.map((med, index) => (
                      <div key={index} className="pl-4">
                        • {med.name} - {med.dosage} - {med.frequency}
                        {med.instructions && (
                          <div className="pl-4 text-sm text-gray-600">
                            {med.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <strong>INSTRUÇÕES GERAIS:</strong>
                  <div className="mt-2">{mockDocument.fields.instructions}</div>
                </div>
                
                <div className="mt-6">
                  <strong>Validade:</strong> {mockDocument.fields.valid_days} dias
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-300">
                  <div>_________________________</div>
                  <div className="mt-2">
                    <div>Dr. João Silva</div>
                    <div>CRM: 12345-SP</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Document Info */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Verificação
            </h3>
            
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-md mb-4">
                <QrCode className="h-24 w-24 text-gray-400 mx-auto" />
                <p className="text-xs text-gray-500 mt-2">QR Code Placeholder</p>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Hash:</span>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
                    {mockDocument.hash}
                  </div>
                </div>
                
                <button
                  onClick={() => navigate(`/verify/${mockDocument.hash}`)}
                  className="btn-secondary text-sm w-full"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Verificar Documento
                </button>
              </div>
            </div>
          </div>

          {/* Document Info */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informações
            </h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">ID:</span>
                <div className="font-mono">{mockDocument.id}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Template:</span>
                <div>{mockDocument.templateName}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(mockDocument.status)}
                  <span>{getStatusText(mockDocument.status)}</span>
                </div>
              </div>
              
              <div>
                <span className="text-gray-600">Criado em:</span>
                <div>{formatDate(mockDocument.createdAt)}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Atualizado em:</span>
                <div>{formatDate(mockDocument.updatedAt)}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações Rápidas
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={handleDownloadPDF}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar PDF
              </button>
              
              <button
                onClick={handleShare}
                className="w-full btn-secondary flex items-center justify-center"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </button>
              
              {mockDocument.status === 'draft' && (
                <button
                  onClick={handleSign}
                  disabled={signDocumentMutation.isPending}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  {signDocumentMutation.isPending ? 'Assinando...' : 'Assinar Documento'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}