'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Eye, Shield, Calendar, Hash } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export default function SharePage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [showDocument, setShowDocument] = useState(false)
  const [error, setError] = useState('')

  const { data: document, isLoading, error: queryError } = trpc.documents.getByShareToken.useQuery(
    token as string,
    {
      enabled: !!token && showDocument,
      retry: false,
    }
  )

  const generatePDF = trpc.documents.generatePDF.useMutation()

  const handleAccess = async () => {
    try {
      setError('')
      setShowDocument(true)
    } catch (err) {
      setError('Erro ao acessar documento')
    }
  }

  const handleDownloadPDF = async () => {
    if (!document?.id) return

    try {
      const result = await generatePDF.mutateAsync({
        documentId: document.id
      })

      // Create blob and download
      const binaryString = atob(result.pdf)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao baixar PDF:', err)
    }
  }

  if (!showDocument) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Documento Compartilhado</CardTitle>
            <p className="text-muted-foreground text-sm">
              Este documento foi compartilhado de forma segura
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha (se necessário)</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha do documento"
              />
            </div>

            <Button 
              onClick={handleAccess} 
              className="w-full"
              disabled={isLoading}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isLoading ? 'Carregando...' : 'Acessar Documento'}
            </Button>

            <div className="text-xs text-muted-foreground text-center pt-4">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Hash className="w-3 h-3" />
                Token: {(token as string)?.substring(0, 16)}...
              </div>
              <p>RepoMed IA - Sistema de Documentos Médicos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando documento...</p>
        </div>
      </div>
    )
  }

  if (queryError || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                {queryError?.message || 'Documento não encontrado ou link expirado'}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => setShowDocument(false)} 
              variant="outline" 
              className="w-full mt-4"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Documento Médico</h1>
              <p className="text-muted-foreground">Paciente: {document.patientName}</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleDownloadPDF}
                disabled={generatePDF.isPending}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {generatePDF.isPending ? 'Gerando...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        {/* Document Content */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Informações do Documento</CardTitle>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(document.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Dados do Paciente</h3>
                <p className="text-sm"><strong>Nome:</strong> {document.patientName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Médico Responsável</h3>
                <p className="text-sm"><strong>Dr(a):</strong> {document.doctorName}</p>
                <p className="text-sm"><strong>CRM:</strong> {document.doctorCrm}</p>
              </div>
            </div>

            {/* Document Data Display */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-3">Conteúdo do Documento</h3>
              <div className="whitespace-pre-wrap text-sm">
                {JSON.stringify(document.dataJson, null, 2)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Shield className="w-4 h-4" />
              Informações de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <strong>Hash do Documento:</strong>
                <p className="font-mono break-all">{document.hash}</p>
              </div>
              <div>
                <strong>Status:</strong>
                <p className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  document.isSigned 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {document.isSigned ? 'Assinado Digitalmente' : 'Aguardando Assinatura'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}