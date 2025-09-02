'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Share2, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Copy,
  Eye,
  Calendar,
  Hash 
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const [shareExpiration, setShareExpiration] = useState(7)
  const [sharePassword, setSharePassword] = useState('')
  const [copiedUrl, setCopiedUrl] = useState('')

  const { data: document, isLoading, error } = trpc.documents.getById.useQuery(
    id as string,
    { enabled: !!id }
  )

  const { data: shareStats, refetch: refetchStats } = trpc.documents.getShareStats.useQuery(
    { documentId: id as string },
    { enabled: !!id }
  )

  const generatePDF = trpc.documents.generatePDF.useMutation()
  const createShare = trpc.documents.createShareLink.useMutation()
  const signDocument = trpc.documents.sign.useMutation({
    onSuccess: () => {
      window.location.reload()
    }
  })

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

  const handleCreateShare = async () => {
    if (!document?.id) return

    try {
      const result = await createShare.mutateAsync({
        documentId: document.id,
        expiresInDays: shareExpiration,
        password: sharePassword || undefined,
      })

      setCopiedUrl(result.url)
      await navigator.clipboard.writeText(result.url)
      refetchStats()
      
      setTimeout(() => setCopiedUrl(''), 3000)
    } catch (err) {
      console.error('Erro ao criar link:', err)
    }
  }

  const handleSignDocument = async () => {
    if (!document?.id) return

    try {
      await signDocument.mutateAsync({
        documentId: document.id,
        doctorName: document.doctorName,
      })
    } catch (err) {
      console.error('Erro ao assinar documento:', err)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedUrl(text)
      setTimeout(() => setCopiedUrl(''), 2000)
    } catch (err) {
      console.error('Erro ao copiar:', err)
    }
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

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>
                Documento não encontrado
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Link href="/documents">
                <Button variant="outline" size="sm">← Voltar</Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Documento Médico</h1>
                <p className="text-muted-foreground">Paciente: {document.patientName}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {!document.isSigned && (
                <Button
                  onClick={handleSignDocument}
                  disabled={signDocument.isPending}
                  variant="outline"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {signDocument.isPending ? 'Assinando...' : 'Assinar'}
                </Button>
              )}
              <Button
                onClick={handleDownloadPDF}
                disabled={generatePDF.isPending}
              >
                <Download className="w-4 h-4 mr-2" />
                {generatePDF.isPending ? 'Gerando...' : 'Download PDF'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informações do Documento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Dados do Paciente</h3>
                    <p className="text-sm"><strong>Nome:</strong> {document.patientName}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Médico Responsável</h3>
                    <p className="text-sm"><strong>Dr(a):</strong> {document.doctorName}</p>
                    <p className="text-sm"><strong>CRM:</strong> {document.doctorCrm}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="font-semibold">Status</h3>
                    <Badge variant={document.isSigned ? 'default' : 'secondary'}>
                      {document.isSigned ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Assinado</>
                      ) : (
                        <><XCircle className="w-3 h-3 mr-1" />Pendente</>
                      )}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Criado em:</strong>
                      <p>{new Date(document.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    {document.signedAt && (
                      <div>
                        <strong>Assinado em:</strong>
                        <p>{new Date(document.signedAt).toLocaleString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Content */}
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(document.dataJson, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5" />
                  Informações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Hash SHA-256</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={document.hash} 
                        readOnly 
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(document.hash)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>URL de Verificação</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input 
                        value={`${window.location.origin}/verify/${document.hash}`}
                        readOnly 
                        className="text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(`${window.location.origin}/verify/${document.hash}`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sharing Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Compartilhamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {copiedUrl && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Link copiado para a área de transferência!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="expiration">Expiração (dias)</Label>
                  <Input
                    id="expiration"
                    type="number"
                    min="1"
                    max="30"
                    value={shareExpiration}
                    onChange={(e) => setShareExpiration(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha (opcional)</Label>
                  <Input
                    id="password"
                    type="password"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    placeholder="Deixe vazio para acesso livre"
                  />
                </div>

                <Button
                  onClick={handleCreateShare}
                  disabled={createShare.isPending}
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  {createShare.isPending ? 'Criando...' : 'Criar Link'}
                </Button>
              </CardContent>
            </Card>

            {/* Share Stats */}
            {shareStats && shareStats.shares.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Links Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold">{shareStats.activeShares}</div>
                        <div className="text-muted-foreground">Ativos</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-lg font-bold">{shareStats.totalViews}</div>
                        <div className="text-muted-foreground">Visualizações</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {shareStats.shares.slice(0, 3).map((share) => (
                        <div key={share.id} className="flex items-center justify-between p-2 border rounded text-xs">
                          <div>
                            <div className="font-mono">{share.token.substring(0, 8)}...</div>
                            <div className="text-muted-foreground">
                              {share.viewCount} visualizações
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(share.expiresAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}