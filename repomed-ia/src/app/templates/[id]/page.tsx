'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TemplateDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)

  // Mock data - em produção viria do tRPC
  const getTemplateById = (templateId: string) => {
    const templates = {
      '1': {
        id: '1',
        name: 'Receita Médica Simples',
        description: 'Template básico para prescrições médicas gerais',
        category: 'prescription',
        specialty: 'clinica_geral',
        icon: '💊',
        usage_count: 147,
        is_favorite: true,
        created_date: '2025-01-01',
        last_modified: '2025-01-15',
        content: `RECEITA MÉDICA

Paciente: [NOME_PACIENTE]
Idade: [IDADE_PACIENTE] anos
Data de Nascimento: [DATA_NASCIMENTO]
CPF: [CPF_PACIENTE]

PRESCRIÇÃO:

1. [MEDICAMENTO_1] [DOSAGEM_1]
   Via: [VIA_ADMINISTRACAO_1]
   Posologia: [POSOLOGIA_1]
   Duração: [DURACAO_1]
   
2. [MEDICAMENTO_2] [DOSAGEM_2]
   Via: [VIA_ADMINISTRACAO_2]
   Posologia: [POSOLOGIA_2]
   Duração: [DURACAO_2]

ORIENTAÇÕES GERAIS:
[ORIENTACOES_GERAIS]

OBSERVAÇÕES:
[OBSERVACOES_MEDICAS]

Data: [DATA_CONSULTA]

_________________________________
Dr(a). [NOME_MEDICO]
CRM: [CRM_MEDICO]
Especialidade: [ESPECIALIDADE_MEDICO]`,
        variables: [
          { name: 'NOME_PACIENTE', type: 'text', required: true, description: 'Nome completo do paciente' },
          { name: 'IDADE_PACIENTE', type: 'number', required: true, description: 'Idade do paciente em anos' },
          { name: 'DATA_NASCIMENTO', type: 'date', required: false, description: 'Data de nascimento' },
          { name: 'CPF_PACIENTE', type: 'text', required: false, description: 'CPF do paciente' },
          { name: 'MEDICAMENTO_1', type: 'text', required: true, description: 'Nome do primeiro medicamento' },
          { name: 'DOSAGEM_1', type: 'text', required: true, description: 'Dosagem do primeiro medicamento' },
          { name: 'VIA_ADMINISTRACAO_1', type: 'select', required: true, description: 'Via de administração', options: ['Oral', 'Tópica', 'Intravenosa', 'Intramuscular', 'Subcutânea'] },
          { name: 'POSOLOGIA_1', type: 'text', required: true, description: 'Como tomar o medicamento' },
          { name: 'DURACAO_1', type: 'text', required: true, description: 'Por quanto tempo tomar' },
          { name: 'NOME_MEDICO', type: 'text', required: true, description: 'Nome do médico responsável' },
          { name: 'CRM_MEDICO', type: 'text', required: true, description: 'CRM do médico' },
          { name: 'ESPECIALIDADE_MEDICO', type: 'text', required: false, description: 'Especialidade médica' }
        ]
      },
      '2': {
        id: '2',
        name: 'Atestado Médico - Repouso',
        description: 'Atestado para afastamento do trabalho',
        category: 'certificate',
        specialty: 'clinica_geral',
        icon: '📋',
        usage_count: 203,
        is_favorite: true,
        created_date: '2025-01-03',
        last_modified: '2025-01-10',
        content: `ATESTADO MÉDICO

Atesto que o(a) Sr(a). [NOME_PACIENTE], portador(a) do RG nº [RG_PACIENTE] e CPF nº [CPF_PACIENTE], necessita de afastamento de suas atividades [TIPO_ATIVIDADE] por [DIAS_AFASTAMENTO] ([DIAS_EXTENSO]), a partir de [DATA_INICIO].

CID: [CID_10]

Observações: [OBSERVACOES]

São Paulo, [DATA_EMISSAO]

_________________________________
Dr(a). [NOME_MEDICO]
CRM: [CRM_MEDICO]
Especialidade: [ESPECIALIDADE_MEDICO]`,
        variables: [
          { name: 'NOME_PACIENTE', type: 'text', required: true, description: 'Nome completo do paciente' },
          { name: 'RG_PACIENTE', type: 'text', required: true, description: 'RG do paciente' },
          { name: 'CPF_PACIENTE', type: 'text', required: false, description: 'CPF do paciente' },
          { name: 'TIPO_ATIVIDADE', type: 'select', required: true, description: 'Tipo de atividade', options: ['laborais', 'escolares', 'esportivas', 'sociais'] },
          { name: 'DIAS_AFASTAMENTO', type: 'number', required: true, description: 'Número de dias de afastamento' },
          { name: 'DIAS_EXTENSO', type: 'text', required: true, description: 'Número de dias por extenso' },
          { name: 'DATA_INICIO', type: 'date', required: true, description: 'Data de início do afastamento' },
          { name: 'CID_10', type: 'text', required: false, description: 'Código CID-10' },
          { name: 'OBSERVACOES', type: 'textarea', required: false, description: 'Observações adicionais' },
          { name: 'DATA_EMISSAO', type: 'date', required: true, description: 'Data de emissão do atestado' },
          { name: 'NOME_MEDICO', type: 'text', required: true, description: 'Nome do médico responsável' },
          { name: 'CRM_MEDICO', type: 'text', required: true, description: 'CRM do médico' },
          { name: 'ESPECIALIDADE_MEDICO', type: 'text', required: false, description: 'Especialidade médica' }
        ]
      }
    }
    return templates[templateId as keyof typeof templates]
  }

  const template = getTemplateById(id as string)
  const [editedTemplate, setEditedTemplate] = useState(template || null)

  if (!template) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Template não encontrado</h2>
            <p className="text-gray-600 mb-4">O template solicitado não existe ou foi removido.</p>
            <Link href="/templates">
              <Button>← Voltar para Templates</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getCategoryLabel = (category: string) => {
    const categories = {
      'prescription': '💊 Receita',
      'certificate': '📋 Atestado',
      'exam_request': '🔬 Exame',
      'report': '📊 Relatório',
      'referral': '🏥 Encaminhamento'
    }
    return categories[category as keyof typeof categories] || category
  }

  const getSpecialtyLabel = (specialty: string) => {
    const specialties = {
      'clinica_geral': 'Clínica Geral',
      'cardiologia': 'Cardiologia',
      'psiquiatria': 'Psiquiatria',
      'pediatria': 'Pediatria',
      'ginecologia': 'Ginecologia'
    }
    return specialties[specialty as keyof typeof specialties] || specialty
  }

  const getVariableIcon = (type: string) => {
    const icons = {
      'text': '📝',
      'number': '🔢',
      'date': '📅',
      'select': '📋',
      'textarea': '📄'
    }
    return icons[type as keyof typeof icons] || '📝'
  }

  const handleUseTemplate = () => {
    router.push(`/workspace?template=${template.id}`)
  }

  const handleToggleFavorite = () => {
    // Aqui seria a lógica para alternar favorito via tRPC
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        is_favorite: !editedTemplate.is_favorite
      })
    }
  }

  const handleSaveChanges = () => {
    // Aqui seria a lógica para salvar via tRPC
    console.log('Salvando alterações:', editedTemplate)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl">{template.icon}</span>
                <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  className={editedTemplate?.is_favorite ? 'text-yellow-500' : 'text-gray-400'}
                >
                  {editedTemplate?.is_favorite ? '⭐' : '☆'}
                </Button>
              </div>
              <p className="text-gray-600">{template.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="outline">{getCategoryLabel(template.category)}</Badge>
                <Badge variant="outline">{getSpecialtyLabel(template.specialty)}</Badge>
                <span className="text-sm text-gray-500">📊 {template.usage_count} usos</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/templates">
                <Button variant="outline">← Voltar</Button>
              </Link>
              <Button onClick={handleUseTemplate} className="bg-purple-600 hover:bg-purple-700">
                🚀 Usar Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Template Content */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>📄 Conteúdo do Template</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? '👁️ Visualizar' : '✏️ Editar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isEditing && editedTemplate ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedTemplate.content}
                      onChange={(e) => setEditedTemplate({
                        ...editedTemplate,
                        content: e.target.value
                      })}
                      className="min-h-[400px] font-mono text-sm"
                      placeholder="Conteúdo do template..."
                    />
                    <div className="flex space-x-2">
                      <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700">
                        💾 Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        ❌ Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                      {template.content}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Variables */}
            <Card>
              <CardHeader>
                <CardTitle>🔧 Variáveis do Template</CardTitle>
                <CardDescription>
                  Campos que serão preenchidos automaticamente ou pelo usuário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {template.variables.map((variable, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="text-lg">{getVariableIcon(variable.type)}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                            [{variable.name}]
                          </code>
                          <Badge variant={variable.required ? 'default' : 'secondary'} className="text-xs">
                            {variable.required ? 'Obrigatório' : 'Opcional'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {variable.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{variable.description}</p>
                        {variable.options && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Opções disponíveis:</p>
                            <div className="flex flex-wrap gap-1">
                              {variable.options.map((option, optIndex) => (
                                <Badge key={optIndex} variant="outline" className="text-xs">
                                  {option}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Template Info */}
            <Card>
              <CardHeader>
                <CardTitle>ℹ️ Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                  <p className="text-sm">{getCategoryLabel(template.category)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Especialidade</Label>
                  <p className="text-sm">{getSpecialtyLabel(template.specialty)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Usos</Label>
                  <p className="text-sm">{template.usage_count} vezes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Criado em</Label>
                  <p className="text-sm">{new Date(template.created_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Última modificação</Label>
                  <p className="text-sm">{new Date(template.last_modified).toLocaleDateString('pt-BR')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleUseTemplate}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  🚀 Usar no Workspace
                </Button>
                <Link href={`/documents/create?template=${template.id}`} className="block">
                  <Button variant="outline" className="w-full">
                    📝 Criar Documento
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  📋 Duplicar Template
                </Button>
                <Button variant="outline" className="w-full">
                  📤 Exportar Template
                </Button>
                <Button variant="outline" className="w-full">
                  📊 Ver Estatísticas
                </Button>
              </CardContent>
            </Card>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>👁️ Preview</CardTitle>
                <CardDescription>
                  Como ficará o documento final
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4 text-xs">
                  <div className="text-center mb-4">
                    <h3 className="font-bold">PREVIEW DO DOCUMENTO</h3>
                    <p className="text-gray-600">{template.name}</p>
                  </div>
                  <div className="space-y-2 text-gray-700">
                    {template.content.split('\n').slice(0, 10).map((line, index) => (
                      <div key={index} className="truncate">
                        {line.replace(/\[([^\]]+)\]/g, '[$1]')}
                      </div>
                    ))}
                    {template.content.split('\n').length > 10 && (
                      <div className="text-center text-gray-500">
                        ... e mais {template.content.split('\n').length - 10} linhas
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}