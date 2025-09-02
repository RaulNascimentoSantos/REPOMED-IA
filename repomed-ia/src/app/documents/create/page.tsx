'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'

const TEMPLATES = [
  { 
    id: 'receita', 
    name: '💊 Receita Médica', 
    icon: '💊',
    description: 'Prescrição de medicamentos',
    category: 'prescription'
  },
  { 
    id: 'atestado', 
    name: '📋 Atestado Médico', 
    icon: '📋',
    description: 'Atestado para afastamento',
    category: 'certificate'
  },
  { 
    id: 'exames', 
    name: '🔬 Solicitação de Exames', 
    icon: '🔬',
    description: 'Pedidos de exames laboratoriais',
    category: 'exam_request'
  },
  { 
    id: 'encaminhamento', 
    name: '🏥 Encaminhamento', 
    icon: '🏥',
    description: 'Encaminhamento para especialista',
    category: 'referral'
  },
  { 
    id: 'relatorio', 
    name: '📊 Relatório Médico', 
    icon: '📊',
    description: 'Relatório de consulta',
    category: 'report'
  },
]

const PATIENTS = [
  { id: '1', name: 'Maria Silva Santos', age: 45 },
  { id: '2', name: 'José Santos Oliveira', age: 38 },
  { id: '3', name: 'Ana Ferreira Costa', age: 32 },
  { id: '4', name: 'Carlos Roberto Lima', age: 54 },
  { id: '5', name: 'Beatriz Almeida Souza', age: 36 },
]

const PRIORITIES = [
  { value: 'low', label: '🟢 Baixa', color: 'bg-green-100 text-green-800' },
  { value: 'normal', label: '🔵 Normal', color: 'bg-blue-100 text-blue-800' },
  { value: 'high', label: '🟡 Alta', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'urgent', label: '🔴 Urgente', color: 'bg-red-100 text-red-800' },
]

export default function CreateDocumentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  
  // Form data
  const [templateId, setTemplateId] = useState(searchParams?.get('template') || '')
  const [patientId, setPatientId] = useState(searchParams?.get('patient') || '')
  const [patientName, setPatientName] = useState('')
  const [doctorName, setDoctorName] = useState('Dr. João Silva')
  const [doctorCrm, setDoctorCrm] = useState('12345-SP')
  const [priority, setPriority] = useState('normal')
  const [documentData, setDocumentData] = useState('')

  const createDocument = trpc.documents.create.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Parse document data as JSON or use as text
      let parsedData
      try {
        parsedData = JSON.parse(documentData || '{}')
      } catch {
        parsedData = { content: documentData }
      }

      // Add doctor and patient info to data
      parsedData.patientName = patientName
      parsedData.doctorName = doctorName
      parsedData.doctorCrm = doctorCrm

      const result = await createDocument.mutateAsync({
        templateId: templateId || 'mock-template-id',
        patientName,
        doctorName,
        doctorCrm,
        dataJson: parsedData,
      })

      router.push(`/documents/${result.id}`)
    } catch (err) {
      console.error('Error creating document:', err)
      setError('Erro ao criar documento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setTemplateId(template.id)
    
    // Auto-populate content based on template
    const templateContent = {
      receita: `RECEITA MÉDICA\n\nPaciente: ${patientName || '[NOME_PACIENTE]'}\nIdade: [IDADE]\nData: ${new Date().toLocaleDateString('pt-BR')}\n\nPRESCRIÇÃO:\n1. [MEDICAMENTO] [DOSAGEM]\n   [ORIENTAÇÕES]\n\n_________________________________\n${doctorName}\n${doctorCrm}`,
      atestado: `ATESTADO MÉDICO\n\nAtesto que o(a) Sr(a). ${patientName || '[NOME_PACIENTE]'} necessita de afastamento por [DIAS] dias, a partir de ${new Date().toLocaleDateString('pt-BR')}.\n\nCID: [CID_10]\n\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n_________________________________\n${doctorName}\n${doctorCrm}`,
      exames: `SOLICITAÇÃO DE EXAMES\n\nPaciente: ${patientName || '[NOME_PACIENTE]'}\nIdade: [IDADE]\n\nExames solicitados:\n1. [EXAME_1]\n2. [EXAME_2]\n\nJustificativa: [JUSTIFICATIVA]\n\nData: ${new Date().toLocaleDateString('pt-BR')}\n\n_________________________________\n${doctorName}\n${doctorCrm}`
    }
    
    setDocumentData(templateContent[template.id] || '')
  }

  const handlePatientSelect = (patient) => {
    setPatientId(patient.id)
    setPatientName(patient.name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">➕ Criar Documento</h1>
              <p className="text-gray-600 mt-1">Interface completa para criação de documentos</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/documents">
                <Button variant="outline">← Voltar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Template Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>📋 Tipo de Documento</CardTitle>
                <CardDescription>Selecione o tipo de documento a ser criado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className={`w-full p-3 text-left border rounded-lg hover:shadow-md transition-all ${
                      templateId === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{template.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-600">{template.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Document Information */}
              <Card>
                <CardHeader>
                  <CardTitle>📋 Informações do Documento</CardTitle>
                  <CardDescription>Dados básicos do documento</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patient">Paciente *</Label>
                      <Select value={patientId} onValueChange={(value) => {
                        const patient = PATIENTS.find(p => p.id === value)
                        if (patient) handlePatientSelect(patient)
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {PATIENTS.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                              {patient.name} ({patient.age} anos)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="patientName">Ou digite o nome</Label>
                      <Input
                        id="patientName"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Nome completo do paciente"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="doctorName">Médico Responsável *</Label>
                      <Input
                        id="doctorName"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="Dr(a). Nome Completo"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="doctorCrm">CRM *</Label>
                      <Input
                        id="doctorCrm"
                        value={doctorCrm}
                        onChange={(e) => setDoctorCrm(e.target.value)}
                        placeholder="12345-SP"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedTemplate && (
                    <div>
                      <Badge className={`${PRIORITIES.find(p => p.value === priority)?.color}`}>
                        {PRIORITIES.find(p => p.value === priority)?.label}
                      </Badge>
                      <Badge variant="outline" className="ml-2">
                        {selectedTemplate.name}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Document Content */}
              <Card>
                <CardHeader>
                  <CardTitle>📝 Conteúdo do Documento</CardTitle>
                  <CardDescription>
                    O conteúdo será populado automaticamente baseado no template selecionado
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="documentData">Conteúdo do Documento</Label>
                      <Textarea
                        id="documentData"
                        value={documentData}
                        onChange={(e) => setDocumentData(e.target.value)}
                        placeholder="Selecione um template acima para auto-popular o conteúdo..."
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                    
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                      <strong>Dica:</strong> Use [CAMPO] para indicar campos que serão preenchidos automaticamente.
                      Exemplo: [MEDICAMENTO], [DOSAGEM], [ORIENTACOES]
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Link href="/documents">
                  <Button type="button" variant="outline" disabled={loading}>
                    Cancelar
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading || !patientName || !doctorName || !doctorCrm || !documentData}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Criando Documento...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Documento
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}