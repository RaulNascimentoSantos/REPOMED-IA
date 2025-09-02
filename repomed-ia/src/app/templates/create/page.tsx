'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface Variable {
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'textarea'
  required: boolean
  description: string
  options?: string[]
}

export default function CreateTemplatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [variables, setVariables] = useState<Variable[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [newVariable, setNewVariable] = useState<Variable>({
    name: '',
    type: 'text',
    required: false,
    description: '',
    options: []
  })
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    specialty: '',
    icon: '📄',
    content: ''
  })

  const categories = [
    { value: 'prescription', label: '💊 Receita Médica', icon: '💊' },
    { value: 'certificate', label: '📋 Atestado Médico', icon: '📋' },
    { value: 'exam_request', label: '🔬 Solicitação de Exames', icon: '🔬' },
    { value: 'report', label: '📊 Relatório Médico', icon: '📊' },
    { value: 'referral', label: '🏥 Encaminhamento', icon: '🏥' },
    { value: 'other', label: '📄 Outro', icon: '📄' }
  ]

  const specialties = [
    { value: 'clinica_geral', label: 'Clínica Geral' },
    { value: 'cardiologia', label: 'Cardiologia' },
    { value: 'dermatologia', label: 'Dermatologia' },
    { value: 'endocrinologia', label: 'Endocrinologia' },
    { value: 'ginecologia', label: 'Ginecologia' },
    { value: 'neurologia', label: 'Neurologia' },
    { value: 'ortopedia', label: 'Ortopedia' },
    { value: 'pediatria', label: 'Pediatria' },
    { value: 'psiquiatria', label: 'Psiquiatria' },
    { value: 'urologia', label: 'Urologia' }
  ]

  const templateExamples = {
    prescription: `RECEITA MÉDICA

Paciente: [NOME_PACIENTE]
Idade: [IDADE] anos
Data: [DATA_CONSULTA]

PRESCRIÇÃO:
1. [MEDICAMENTO] [DOSAGEM]
   [ORIENTACOES]

_________________________________
Dr(a). [NOME_MEDICO]
CRM: [CRM_MEDICO]`,
    
    certificate: `ATESTADO MÉDICO

Atesto que o(a) Sr(a). [NOME_PACIENTE] necessita de afastamento por [DIAS] dias, a partir de [DATA_INICIO].

CID: [CID_10]

Data: [DATA_EMISSAO]

_________________________________
Dr(a). [NOME_MEDICO]
CRM: [CRM_MEDICO]`,

    exam_request: `SOLICITAÇÃO DE EXAMES

Paciente: [NOME_PACIENTE]
Idade: [IDADE] anos

Exames solicitados:
1. [EXAME_1]
2. [EXAME_2]

Justificativa: [JUSTIFICATIVA]

Data: [DATA_SOLICITACAO]

_________________________________
Dr(a). [NOME_MEDICO]
CRM: [CRM_MEDICO]`
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Auto-selecionar ícone baseado na categoria
    if (field === 'category') {
      const category = categories.find(cat => cat.value === value)
      if (category) {
        setFormData(prev => ({
          ...prev,
          icon: category.icon
        }))
      }
    }
  }

  const addVariable = () => {
    if (newVariable.name.trim() && newVariable.description.trim()) {
      const variableName = newVariable.name.trim().toUpperCase().replace(/\s+/g, '_')
      setVariables([...variables, {
        ...newVariable,
        name: variableName
      }])
      setNewVariable({
        name: '',
        type: 'text',
        required: false,
        description: '',
        options: []
      })
    }
  }

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const insertVariable = (variableName: string) => {
    const cursorPos = (document.getElementById('content') as HTMLTextAreaElement)?.selectionStart || 0
    const content = formData.content
    const newContent = content.slice(0, cursorPos) + `[${variableName}]` + content.slice(cursorPos)
    setFormData(prev => ({ ...prev, content: newContent }))
  }

  const loadTemplate = (category: string) => {
    if (templateExamples[category as keyof typeof templateExamples]) {
      setFormData(prev => ({
        ...prev,
        content: templateExamples[category as keyof typeof templateExamples]
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newTemplate = {
        ...formData,
        id: Date.now().toString(),
        variables,
        usage_count: 0,
        is_favorite: false,
        created_date: new Date().toISOString(),
        last_modified: new Date().toISOString()
      }

      console.log('Criando template:', newTemplate)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirecionar para a página do template criado
      router.push(`/templates/${newTemplate.id}`)
      
    } catch (error) {
      console.error('Erro ao criar template:', error)
    } finally {
      setLoading(false)
    }
  }

  const previewContent = () => {
    let preview = formData.content
    variables.forEach(variable => {
      const placeholder = variable.type === 'date' ? '01/01/2025' :
                         variable.type === 'number' ? '123' :
                         `[${variable.name}]`
      preview = preview.replace(new RegExp(`\\[${variable.name}\\]`, 'g'), placeholder)
    })
    return preview
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 Novo Template</h1>
              <p className="text-gray-600 mt-1">Crie um novo template de documento médico</p>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? '✏️ Editar' : '👁️ Preview'}
              </Button>
              <Link href="/templates">
                <Button variant="outline">← Cancelar</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle>📝 Informações Básicas</CardTitle>
                  <CardDescription>Dados gerais do template</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Template *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Ex: Receita Médica Básica"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="icon">Ícone</Label>
                      <Input
                        id="icon"
                        value={formData.icon}
                        onChange={(e) => handleInputChange('icon', e.target.value)}
                        placeholder="📄"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Breve descrição do template"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="specialty">Especialidade</Label>
                      <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a especialidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {specialties.map(specialty => (
                            <SelectItem key={specialty.value} value={specialty.value}>
                              {specialty.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Conteúdo do Template */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>📄 Conteúdo do Template</CardTitle>
                      <CardDescription>
                        Use [NOME_VARIAVEL] para campos que serão preenchidos automaticamente
                      </CardDescription>
                    </div>
                    {formData.category && templateExamples[formData.category as keyof typeof templateExamples] && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => loadTemplate(formData.category)}
                      >
                        📋 Carregar Exemplo
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {showPreview ? (
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 min-h-[400px]">
                      <h3 className="text-lg font-bold mb-4 text-center">Preview do Documento</h3>
                      <pre className="text-sm whitespace-pre-wrap leading-relaxed">
                        {previewContent() || 'Digite o conteúdo do template...'}
                      </pre>
                    </div>
                  ) : (
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => handleInputChange('content', e.target.value)}
                      placeholder="Digite o conteúdo do template aqui..."
                      rows={20}
                      className="font-mono text-sm"
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Variáveis */}
              <Card>
                <CardHeader>
                  <CardTitle>🔧 Variáveis</CardTitle>
                  <CardDescription>
                    Campos que serão preenchidos pelos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Adicionar Nova Variável */}
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <Label htmlFor="var-name">Nome da Variável</Label>
                      <Input
                        id="var-name"
                        value={newVariable.name}
                        onChange={(e) => setNewVariable({...newVariable, name: e.target.value})}
                        placeholder="Ex: NOME_PACIENTE"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="var-type">Tipo</Label>
                        <Select 
                          value={newVariable.type} 
                          onValueChange={(value: any) => setNewVariable({...newVariable, type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">📝 Texto</SelectItem>
                            <SelectItem value="number">🔢 Número</SelectItem>
                            <SelectItem value="date">📅 Data</SelectItem>
                            <SelectItem value="select">📋 Seleção</SelectItem>
                            <SelectItem value="textarea">📄 Texto Longo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-end">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newVariable.required}
                            onChange={(e) => setNewVariable({...newVariable, required: e.target.checked})}
                          />
                          <span className="text-sm">Obrigatório</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="var-desc">Descrição</Label>
                      <Input
                        id="var-desc"
                        value={newVariable.description}
                        onChange={(e) => setNewVariable({...newVariable, description: e.target.value})}
                        placeholder="Descreva o campo"
                      />
                    </div>
                    
                    <Button
                      type="button"
                      onClick={addVariable}
                      size="sm"
                      className="w-full"
                      disabled={!newVariable.name.trim() || !newVariable.description.trim()}
                    >
                      ➕ Adicionar Variável
                    </Button>
                  </div>

                  {/* Variáveis Criadas */}
                  {variables.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Variáveis criadas:</Label>
                      {variables.map((variable, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                          <div className="flex-1">
                            <code className="text-xs bg-gray-100 px-1 rounded">
                              [{variable.name}]
                            </code>
                            <p className="text-xs text-gray-600 mt-1">{variable.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{variable.type}</Badge>
                              {variable.required && (
                                <Badge className="text-xs bg-red-100 text-red-800">Obrigatório</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => insertVariable(variable.name)}
                              className="text-xs"
                            >
                              📝
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => removeVariable(index)}
                              className="text-xs text-red-600"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações */}
              <Card>
                <CardHeader>
                  <CardTitle>⚡ Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    type="submit" 
                    disabled={loading || !formData.name || !formData.category || !formData.content}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Criando Template...
                      </>
                    ) : (
                      <>
                        💾 Criar Template
                      </>
                    )}
                  </Button>
                  <Link href="/templates" className="block">
                    <Button type="button" variant="outline" className="w-full">
                      ❌ Cancelar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}