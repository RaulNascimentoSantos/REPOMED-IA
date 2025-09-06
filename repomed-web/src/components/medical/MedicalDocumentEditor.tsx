'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Mic, 
  MicOff, 
  Save, 
  Download, 
  Eye, 
  Settings,
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Plus,
  X,
  Calendar,
  User,
  MapPin,
  Hash
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Variable {
  id: string
  name: string
  value: string
  type: 'text' | 'date' | 'number' | 'select'
  options?: string[]
  required: boolean
}

interface DocumentTemplate {
  id: string
  name: string
  category: string
  content: string
  variables: Variable[]
}

const defaultTemplates: DocumentTemplate[] = [
  {
    id: 'prescription',
    name: 'Receituário Médico',
    category: 'Prescrição',
    content: `RECEITUÁRIO MÉDICO

Dr(a). {{MEDICO_NOME}}
CRM: {{MEDICO_CRM}}
Especialidade: {{MEDICO_ESPECIALIDADE}}

Paciente: {{PACIENTE_NOME}}
Data de Nascimento: {{PACIENTE_DATA_NASCIMENTO}}
CPF: {{PACIENTE_CPF}}

Prescrição:
{{MEDICAMENTOS}}

Orientações:
{{ORIENTACOES}}

Data: {{DATA_CONSULTA}}
Assinatura Digital: {{ASSINATURA_DIGITAL}}`,
    variables: [
      { id: 'MEDICO_NOME', name: 'Nome do Médico', value: '', type: 'text', required: true },
      { id: 'MEDICO_CRM', name: 'CRM', value: '', type: 'text', required: true },
      { id: 'MEDICO_ESPECIALIDADE', name: 'Especialidade', value: '', type: 'text', required: true },
      { id: 'PACIENTE_NOME', name: 'Nome do Paciente', value: '', type: 'text', required: true },
      { id: 'PACIENTE_DATA_NASCIMENTO', name: 'Data de Nascimento', value: '', type: 'date', required: true },
      { id: 'PACIENTE_CPF', name: 'CPF', value: '', type: 'text', required: true },
      { id: 'MEDICAMENTOS', name: 'Medicamentos', value: '', type: 'text', required: true },
      { id: 'ORIENTACOES', name: 'Orientações', value: '', type: 'text', required: false },
      { id: 'DATA_CONSULTA', name: 'Data da Consulta', value: new Date().toISOString().split('T')[0], type: 'date', required: true },
      { id: 'ASSINATURA_DIGITAL', name: 'Assinatura Digital', value: '[Assinatura Digital Certificada ICP-Brasil]', type: 'text', required: true }
    ]
  },
  {
    id: 'medical_report',
    name: 'Relatório Médico',
    category: 'Relatório',
    content: `RELATÓRIO MÉDICO

Dr(a). {{MEDICO_NOME}} - CRM {{MEDICO_CRM}}
{{CLINICA_NOME}}
{{CLINICA_ENDERECO}}

IDENTIFICAÇÃO DO PACIENTE:
Nome: {{PACIENTE_NOME}}
Data de Nascimento: {{PACIENTE_DATA_NASCIMENTO}}
CPF: {{PACIENTE_CPF}}
RG: {{PACIENTE_RG}}

HISTÓRICO CLÍNICO:
{{HISTORICO_CLINICO}}

EXAME FÍSICO:
{{EXAME_FISICO}}

DIAGNÓSTICO:
{{DIAGNOSTICO}}

TRATAMENTO PRESCRITO:
{{TRATAMENTO}}

PROGNÓSTICO:
{{PROGNOSTICO}}

OBSERVAÇÕES:
{{OBSERVACOES}}

{{CIDADE}}, {{DATA_RELATORIO}}

____________________________
Dr(a). {{MEDICO_NOME}}
CRM {{MEDICO_CRM}}`,
    variables: [
      { id: 'MEDICO_NOME', name: 'Nome do Médico', value: '', type: 'text', required: true },
      { id: 'MEDICO_CRM', name: 'CRM', value: '', type: 'text', required: true },
      { id: 'CLINICA_NOME', name: 'Nome da Clínica', value: '', type: 'text', required: false },
      { id: 'CLINICA_ENDERECO', name: 'Endereço da Clínica', value: '', type: 'text', required: false },
      { id: 'PACIENTE_NOME', name: 'Nome do Paciente', value: '', type: 'text', required: true },
      { id: 'PACIENTE_DATA_NASCIMENTO', name: 'Data de Nascimento', value: '', type: 'date', required: true },
      { id: 'PACIENTE_CPF', name: 'CPF', value: '', type: 'text', required: true },
      { id: 'PACIENTE_RG', name: 'RG', value: '', type: 'text', required: false },
      { id: 'HISTORICO_CLINICO', name: 'Histórico Clínico', value: '', type: 'text', required: true },
      { id: 'EXAME_FISICO', name: 'Exame Físico', value: '', type: 'text', required: true },
      { id: 'DIAGNOSTICO', name: 'Diagnóstico', value: '', type: 'text', required: true },
      { id: 'TRATAMENTO', name: 'Tratamento', value: '', type: 'text', required: true },
      { id: 'PROGNOSTICO', name: 'Prognóstico', value: '', type: 'text', required: false },
      { id: 'OBSERVACOES', name: 'Observações', value: '', type: 'text', required: false },
      { id: 'CIDADE', name: 'Cidade', value: '', type: 'text', required: true },
      { id: 'DATA_RELATORIO', name: 'Data do Relatório', value: new Date().toISOString().split('T')[0], type: 'date', required: true }
    ]
  }
]

export function MedicalDocumentEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate>(defaultTemplates[0])
  const [documentContent, setDocumentContent] = useState(selectedTemplate.content)
  const [variables, setVariables] = useState(selectedTemplate.variables)
  const [isRecording, setIsRecording] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeTab, setActiveTab] = useState('editor')
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const recognition = useRef<any>(null)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognition.current = new SpeechRecognition()
      recognition.current.continuous = true
      recognition.current.interimResults = true
      recognition.current.lang = 'pt-BR'

      recognition.current.onresult = (event: any) => {
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' '
          }
        }

        if (finalTranscript) {
          const currentContent = documentContent
          const cursorPosition = editorRef.current?.selectionStart || currentContent.length
          const newContent = 
            currentContent.slice(0, cursorPosition) + 
            finalTranscript + 
            currentContent.slice(cursorPosition)
          
          setDocumentContent(newContent)
        }
      }

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        toast.error('Erro no reconhecimento de voz: ' + event.error)
      }

      recognition.current.onend = () => {
        setIsRecording(false)
      }
    }
  }, [documentContent])

  const startVoiceRecognition = () => {
    if (recognition.current && !isRecording) {
      try {
        recognition.current.start()
        setIsRecording(true)
        toast.success('Reconhecimento de voz iniciado')
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast.error('Erro ao iniciar reconhecimento de voz')
      }
    }
  }

  const stopVoiceRecognition = () => {
    if (recognition.current && isRecording) {
      recognition.current.stop()
      setIsRecording(false)
      toast.success('Reconhecimento de voz parado')
    }
  }

  const updateVariable = (variableId: string, value: string) => {
    setVariables(prev => prev.map(v => 
      v.id === variableId ? { ...v, value } : v
    ))
  }

  const generatePreview = () => {
    let content = documentContent
    
    variables.forEach(variable => {
      const placeholder = `{{${variable.id}}}`
      content = content.replace(new RegExp(placeholder, 'g'), variable.value || `[${variable.name}]`)
    })
    
    return content
  }

  const formatText = (command: string) => {
    const textarea = editorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = documentContent.slice(start, end)
    
    if (!selectedText) {
      toast.error('Selecione um texto para formatar')
      return
    }

    let formattedText = selectedText
    
    switch (command) {
      case 'bold':
        formattedText = `**${selectedText}**`
        break
      case 'italic':
        formattedText = `*${selectedText}*`
        break
      case 'underline':
        formattedText = `__${selectedText}__`
        break
    }

    const newContent = 
      documentContent.slice(0, start) + 
      formattedText + 
      documentContent.slice(end)
    
    setDocumentContent(newContent)
  }

  const insertVariable = (variableId: string) => {
    const placeholder = `{{${variableId}}}`
    const textarea = editorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const newContent = 
      documentContent.slice(0, start) + 
      placeholder + 
      documentContent.slice(start)
    
    setDocumentContent(newContent)
  }

  const saveDocument = () => {
    const documentData = {
      template: selectedTemplate.name,
      content: documentContent,
      variables: variables,
      preview: generatePreview(),
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem(`medical_document_${Date.now()}`, JSON.stringify(documentData))
    toast.success('Documento salvo com sucesso')
  }

  const downloadDocument = () => {
    const preview = generatePreview()
    const blob = new Blob([preview], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Documento baixado com sucesso')
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Editor de Documentos Médicos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema avançado com reconhecimento de voz e templates dinâmicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {selectedTemplate.category}
          </Badge>
          <Badge variant="outline">
            IA Integrada
          </Badge>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="variables">Variáveis</TabsTrigger>
          <TabsTrigger value="preview">Visualização</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className={`cursor-pointer transition-all ${
                    selectedTemplate.id === template.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/50' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setDocumentContent(template.content)
                    setVariables(template.variables)
                  }}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg">{template.name}</span>
                      <FileText className="w-5 h-5 text-blue-600" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {template.variables.length} variáveis configuráveis
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {selectedTemplate.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isRecording ? "destructive" : "outline"}
                    onClick={isRecording ? stopVoiceRecognition : startVoiceRecognition}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-4 h-4 mr-2" />
                        Parar
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" />
                        Voz
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" onClick={saveDocument}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={downloadDocument}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => formatText('bold')}
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => formatText('italic')}
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => formatText('underline')}
                >
                  <Underline className="w-4 h-4" />
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Button size="sm" variant="outline">
                  <List className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <AlignLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <AlignCenter className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <AlignRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-red-700 dark:text-red-400 font-medium">
                        Gravando... Fale agora
                      </span>
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    </div>
                  </motion.div>
                )}
                
                <textarea
                  ref={editorRef}
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Digite o conteúdo do documento ou use reconhecimento de voz..."
                />
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {variables.map((variable) => (
                    <Button
                      key={variable.id}
                      size="sm"
                      variant="outline"
                      onClick={() => insertVariable(variable.id)}
                      className="justify-start text-xs"
                    >
                      <Hash className="w-3 h-3 mr-1" />
                      {variable.name}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Variáveis</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Preencha as variáveis para personalizar o documento
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {variables.map((variable) => (
                <div key={variable.id} className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    {variable.type === 'date' && <Calendar className="w-4 h-4" />}
                    {variable.type === 'text' && <FileText className="w-4 h-4" />}
                    {variable.type === 'number' && <Hash className="w-4 h-4" />}
                    {variable.name}
                    {variable.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {variable.type === 'select' && variable.options ? (
                    <select
                      value={variable.value}
                      onChange={(e) => updateVariable(variable.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={variable.required}
                    >
                      <option value="">Selecione uma opção</option>
                      {variable.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={variable.type}
                      value={variable.value}
                      onChange={(e) => updateVariable(variable.id, e.target.value)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={`Digite ${variable.name.toLowerCase()}`}
                      required={variable.required}
                    />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visualização Final
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={downloadDocument}>
                    <Download className="w-4 h-4 mr-2" />
                    Baixar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-900 p-6 border border-gray-300 dark:border-gray-600 rounded-lg min-h-96">
                <pre className="whitespace-pre-wrap font-serif text-sm leading-relaxed">
                  {generatePreview()}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}