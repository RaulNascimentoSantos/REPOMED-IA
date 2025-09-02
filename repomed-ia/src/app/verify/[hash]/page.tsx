'use client'

import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Shield, Calendar, Hash, FileText } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export default function VerifyPage() {
  const { hash } = useParams()

  const { data: verification, isLoading, error } = trpc.documents.verify.useQuery(
    { hash: hash as string },
    {
      enabled: !!hash,
      retry: false,
    }
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando documento...</p>
        </div>
      </div>
    )
  }

  if (error || !verification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle className="text-xl text-red-600">Documento Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                {error?.message || 'Documento não encontrado ou hash inválido'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 mb-1">
                <Hash className="w-3 h-3" />
                Hash verificado: {(hash as string)?.substring(0, 32)}...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const document = verification.document
  const template = verification.template

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Verification Status */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-600">Documento Verificado</CardTitle>
            <p className="text-muted-foreground">
              Este documento é autêntico e não foi alterado
            </p>
          </CardHeader>
        </Card>

        {/* Document Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informações do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">TIPO DE DOCUMENTO</h3>
                  <p className="text-lg font-medium">{template?.name || 'Documento Médico'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">PACIENTE</h3>
                  <p className="text-lg">{document.patientName}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">MÉDICO RESPONSÁVEL</h3>
                  <p className="text-lg">{document.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{document.doctorCrm}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">DATA DE EMISSÃO</h3>
                  <p className="text-lg">{new Date(document.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">STATUS DA ASSINATURA</h3>
                  <div className="flex items-center gap-2">
                    {document.isSigned ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Assinado Digitalmente</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-yellow-600" />
                        <span className="text-yellow-600 font-medium">Aguardando Assinatura</span>
                      </>
                    )}
                  </div>
                  {document.signedAt && (
                    <p className="text-sm text-muted-foreground">
                      Assinado em: {new Date(document.signedAt).toLocaleString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Detalhes de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">HASH SHA-256 DO DOCUMENTO</h3>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="font-mono text-sm break-all">{document.hash}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este hash garante que o documento não foi modificado desde sua criação
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-2">QR CODE DE VERIFICAÇÃO</h3>
                <div className="bg-gray-100 rounded-lg p-3">
                  <p className="font-mono text-sm break-all">{document.qrCode}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Código QR que permite verificação rápida da autenticidade
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Content Preview */}
        {document.dataJson && (
          <Card>
            <CardHeader>
              <CardTitle>Prévia do Conteúdo</CardTitle>
              <p className="text-sm text-muted-foreground">
                Dados estruturados do documento médico
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(document.dataJson, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <div className="flex items-center justify-center gap-1 mb-2">
            <Calendar className="w-3 h-3" />
            Verificado em: {new Date().toLocaleString('pt-BR')}
          </div>
          <p>RepoMed IA - Sistema de Verificação de Documentos Médicos</p>
          <p>Esta verificação confirma a integridade e autenticidade do documento</p>
        </div>
      </div>
    </div>
  )
}