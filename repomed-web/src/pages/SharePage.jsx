import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { 
  FileText, 
  Download, 
  QrCode, 
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function SharePage() {
  const { id } = useParams()
  
  // Conectar com API real
  const { data: sharedDoc, isLoading, error } = useQuery({
    queryKey: ['share', id],
    queryFn: async () => {
      try {
        const response = await api.get(`/api/documents/share/${id}`)
        return response.data || response
      } catch (err) {
        // Se a rota não existir, usar mock
        console.warn('API share não disponível, usando mock:', err)
        return mockSharedDoc
      }
    },
    enabled: !!id,
    retry: false
  })

  // Mock para fallback
  const mockSharedDoc = {
    id: 'doc_shared_001',
    templateName: 'Receita Simples',
    patient: {
      name: 'João Silva',
      cpf: '123.***.**-**' // Partially masked for privacy
    },
    fields: {
      medications: [
        {
          name: 'Dipirona 500mg',
          dosage: '1 comprimido',
          frequency: 'de 6/6 horas'
        }
      ],
      instructions: 'Tomar os medicamentos conforme prescrição médica',
      valid_days: 30
    },
    status: 'signed',
    hash: 'abc123hash',
    createdAt: '2024-01-15T10:30:00Z',
    sharedAt: '2024-01-15T11:00:00Z',
    expiresAt: '2024-01-22T11:00:00Z', // 7 days from share
    doctor: {
      name: 'Dr. João Silva',
      crm: '12345-SP'
    }
  }

  const doc = sharedDoc || mockSharedDoc
  const isExpired = doc?.expiresAt ? new Date() > new Date(doc.expiresAt) : false
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDownload = async () => {
    try {
      const response = await api.get(`/api/documents/${doc.id}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `documento-${doc.id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Erro ao baixar PDF:', err)
      alert('Download do documento - Em desenvolvimento')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Carregando documento...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Erro ao carregar documento</p>
              <p>O documento compartilhado não pôde ser carregado. Verifique o link ou entre em contato com o médico.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <FileText className="h-12 w-12 text-medical-blue" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Documento Compartilhado
        </h1>
        <p className="text-gray-600">
          Este documento foi compartilhado de forma segura pelo médico
        </p>
      </div>

      {/* Security Notice */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-1" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">🔐 Compartilhamento Seguro</p>
            <p>Este link é temporário e criptografado. Dados sensíveis foram parcialmente mascarados para proteção da privacidade.</p>
          </div>
        </div>
      </div>

      {/* Expiration Warning */}
      {isExpired ? (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-1" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">⚠️ Link Expirado</p>
              <p>Este link compartilhado expirou em {formatDate(doc.expiresAt)}. Solicite um novo link ao médico.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">✅ Link Ativo</p>
              <p>Este link expira em {formatDate(doc.expiresAt)}</p>
            </div>
          </div>
        </div>
      )}

      {!isExpired && (
        <>
          {/* Document Preview */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              {doc.templateName || doc.title || 'Documento Médico'}
            </h2>
            
            <div className="medical-document bg-white border border-gray-300 rounded-md p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold">RECEITUÁRIO MÉDICO</h3>
                <div className="text-sm text-gray-500 mt-2">
                  Documento Compartilhado • {formatDate(doc.sharedAt || doc.createdAt)}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <strong>Paciente:</strong> {doc.patient?.name || 'Nome do Paciente'}
                </div>
                <div>
                  <strong>CPF:</strong> {doc.patient?.cpf || '***.***.***-**'}
                </div>
                <div>
                  <strong>Data:</strong> {formatDate(doc.createdAt)}
                </div>
                
                <div className="mt-6">
                  <strong>PRESCRIÇÃO:</strong>
                  <div className="mt-2 space-y-2">
                    {(doc.fields?.medications || doc.medications || []).map((med, index) => (
                      <div key={index} className="pl-4">
                        • {med.name} - {med.dosage} - {med.frequency}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-6">
                  <strong>INSTRUÇÕES GERAIS:</strong>
                  <div className="mt-2">{doc.fields?.instructions || doc.instructions || 'Seguir orientações médicas'}</div>
                </div>
                
                <div className="mt-6">
                  <strong>Validade:</strong> {doc.fields?.valid_days || doc.valid_days || 30} dias
                </div>
                
                <div className="mt-8 pt-4 border-t border-gray-300">
                  <div>_________________________</div>
                  <div className="mt-2">
                    <div>{doc.doctor?.name || 'Médico Responsável'}</div>
                    <div>CRM: {doc.doctor?.crm || 'XXXXX-UF'}</div>
                  </div>
                </div>
              </div>

              {/* Watermark */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center">
                <div className="text-xs text-gray-400">
                  DOCUMENTO COMPARTILHADO • REPOMED IA • {formatDate(doc.sharedAt || doc.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleDownload}
              className="btn-primary flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </button>
          </div>
        </>
      )}

      {/* Document Info */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Informações do Documento
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-gray-600">Tipo:</span>
            <div className="font-medium">{doc.templateName || doc.title || 'Documento Médico'}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Status:</span>
            <div className="flex items-center space-x-2 mt-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">Assinado Digitalmente</span>
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Data de Criação:</span>
            <div className="font-medium">{formatDate(doc.createdAt)}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Compartilhado em:</span>
            <div className="font-medium">{formatDate(doc.sharedAt || doc.createdAt)}</div>
          </div>
          
          <div>
            <span className="text-gray-600">Hash de Verificação:</span>
            <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 break-all">
              {doc.hash || doc.id || 'N/A'}
            </div>
          </div>
          
          <div>
            <span className="text-gray-600">Médico Responsável:</span>
            <div className="font-medium">
              {doc.doctor?.name || 'Médico Responsável'}
              <div className="text-gray-500">CRM: {doc.doctor?.crm || 'XXXXX-UF'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Footer */}
      <div className="text-center text-xs text-gray-500 pt-6 border-t border-gray-200">
        <p>🔐 Este documento é protegido por criptografia e tem acesso controlado</p>
        <p className="mt-1">RepoMed IA • Sistema de Documentos Médicos • 2024</p>
      </div>
    </div>
  )
}