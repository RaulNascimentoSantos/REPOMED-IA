'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Template {
  id: string
  name: string
  description: string
  category: string
  specialty: string
  icon: string
  usage_count: number
  is_favorite: boolean
  created_date: string
  content_preview: string
}

// Templates mockados
const mockTemplates: Template[] = [
    {
      id: '1',
      name: 'Receita Médica Simples',
      description: 'Template básico para prescrições médicas gerais',
      category: 'prescription',
      specialty: 'clinica_geral',
      icon: '💊',
      usage_count: 147,
      is_favorite: true,
      created_date: '2025-01-01',
      content_preview: 'RECEITA MÉDICA\n\nPaciente: [NOME]\nIdade: [IDADE]\n\n1. [MEDICAMENTO] [DOSAGEM]...'
    },
    {
      id: '2',
      name: 'Receita Controlada',
      description: 'Template para medicamentos de controle especial',
      category: 'prescription',
      specialty: 'psiquiatria',
      icon: '💊',
      usage_count: 89,
      is_favorite: false,
      created_date: '2025-01-02',
      content_preview: 'RECEITA DE CONTROLE ESPECIAL\n\nPaciente: [NOME]\nRG: [RG]\n\n1. [MEDICAMENTO_CONTROLADO]...'
    },
    {
      id: '3',
      name: 'Atestado Médico - Repouso',
      description: 'Atestado para afastamento do trabalho',
      category: 'certificate',
      specialty: 'clinica_geral',
      icon: '📋',
      usage_count: 203,
      is_favorite: true,
      created_date: '2025-01-03',
      content_preview: 'ATESTADO MÉDICO\n\nAtesto que o(a) Sr(a). [NOME] necessita de afastamento...'
    },
    {
      id: '4',
      name: 'Solicitação de Exames Laboratoriais',
      description: 'Pedido para exames de sangue e urina',
      category: 'exam_request',
      specialty: 'clinica_geral',
      icon: '🔬',
      usage_count: 156,
      is_favorite: false,
      created_date: '2025-01-04',
      content_preview: 'SOLICITAÇÃO DE EXAMES\n\nPaciente: [NOME]\n\nExames solicitados:\n1. Hemograma completo...'
    },
    {
      id: '5',
      name: 'Laudo Cardiológico',
      description: 'Template para laudos de exames do coração',
      category: 'report',
      specialty: 'cardiologia',
      icon: '❤️',
      usage_count: 67,
      is_favorite: true,
      created_date: '2025-01-05',
      content_preview: 'LAUDO CARDIOLÓGICO\n\nPaciente: [NOME]\nExame: [TIPO_EXAME]\n\nResultados:...'
    },
    {
      id: '6',
      name: 'Encaminhamento Especialista',
      description: 'Encaminhamento para outras especialidades médicas',
      category: 'referral',
      specialty: 'clinica_geral',
      icon: '🏥',
      usage_count: 124,
      is_favorite: false,
      created_date: '2025-01-06',
      content_preview: 'ENCAMINHAMENTO MÉDICO\n\nEncaminho o(a) paciente [NOME] para [ESPECIALIDADE]...'
    },
    {
      id: '7',
      name: 'Relatório de Alta Hospitalar',
      description: 'Documento de alta do paciente internado',
      category: 'report',
      specialty: 'clinica_geral',
      icon: '🏨',
      usage_count: 45,
      is_favorite: false,
      created_date: '2025-01-07',
      content_preview: 'RELATÓRIO DE ALTA HOSPITALAR\n\nPaciente: [NOME]\nData de internação: [DATA_INTERNACAO]...'
    },
    {
      id: '8',
      name: 'Declaração de Óbito',
      description: 'Template para declaração de óbito médico',
      category: 'certificate',
      specialty: 'clinica_geral',
      icon: '⚰️',
      usage_count: 12,
      is_favorite: false,
      created_date: '2025-01-08',
      content_preview: 'DECLARAÇÃO DE ÓBITO\n\nDeclaro que [NOME] faleceu em [DATA] às [HORA]...'
    }
  ]

  const categories = [
    { value: 'all', label: 'Todas as Categorias' },
    { value: 'prescription', label: '💊 Receitas' },
    { value: 'certificate', label: '📋 Atestados' },
    { value: 'exam_request', label: '🔬 Solicitação de Exames' },
    { value: 'report', label: '📊 Relatórios' },
    { value: 'referral', label: '🏥 Encaminhamentos' }
  ]

  const specialties = [
    { value: 'all', label: 'Todas as Especialidades' },
    { value: 'clinica_geral', label: 'Clínica Geral' },
    { value: 'cardiologia', label: 'Cardiologia' },
    { value: 'psiquiatria', label: 'Psiquiatria' },
    { value: 'pediatria', label: 'Pediatria' },
    { value: 'ginecologia', label: 'Ginecologia' }
  ]

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  
  const toggleFavorite = (templateId: string) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template =>
        template.id === templateId
          ? { ...template, is_favorite: !template.is_favorite }
          : template
      )
    )
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter
    const matchesSpecialty = specialtyFilter === 'all' || template.specialty === specialtyFilter
    
    return matchesSearch && matchesCategory && matchesSpecialty
  })


  const getCategoryLabel = (category: string) => {
    const cat = categories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const getSpecialtyLabel = (specialty: string) => {
    const spec = specialties.find(s => s.value === specialty)
    return spec ? spec.label : specialty
  }

  const stats = {
    total: templates.length,
    favorites: templates.filter(t => t.is_favorite).length,
    most_used: Math.max(...templates.map(t => t.usage_count)),
    categories: [...new Set(templates.map(t => t.category))].length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 Templates Médicos</h1>
              <p className="text-gray-600 mt-1">Modelos prontos para documentos médicos</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="outline">← Início</Button>
              </Link>
              <Link href="/templates/create">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  ➕ Novo Template
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Templates disponíveis</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.favorites}</div>
              <div className="text-sm text-gray-600">Favoritos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.most_used}</div>
              <div className="text-sm text-gray-600">Mais usado</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.categories}</div>
              <div className="text-sm text-gray-600">Categorias</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔍 Buscar Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Buscar por nome ou descrição
                </label>
                <Input
                  placeholder="Digite para buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Categoria
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione categoria" />
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
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Especialidade
                </label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione especialidade" />
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

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFavorite(template.id)}
                    className={template.is_favorite ? 'text-yellow-500' : 'text-gray-400'}
                  >
                    {template.is_favorite ? '⭐' : '☆'}
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      {getCategoryLabel(template.category)}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getSpecialtyLabel(template.specialty)}
                    </Badge>
                  </div>
                  
                  {/* Preview */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 font-mono leading-relaxed line-clamp-4">
                      {template.content_preview}
                    </p>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>📊 {template.usage_count} usos</span>
                    <span>📅 {new Date(template.created_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Link href={`/templates/${template.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        👁️ Ver
                      </Button>
                    </Link>
                    <Link href={`/workspace?template=${template.id}`} className="flex-1">
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        🚀 Usar
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum template encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || categoryFilter !== 'all' || specialtyFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Não há templates disponíveis no momento'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => {
                    setSearchTerm('')
                    setCategoryFilter('all')
                    setSpecialtyFilter('all')
                  }}
                  variant="outline"
                >
                  🔄 Limpar Filtros
                </Button>
                <Link href="/templates/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    ➕ Criar Template
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>⚡ Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/workspace?template=prescription">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  💊 Usar Receita
                </Button>
              </Link>
              <Link href="/workspace?template=certificate">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  📋 Usar Atestado
                </Button>
              </Link>
              <Link href="/templates/favorites">
                <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                  ⭐ Meus Favoritos
                </Button>
              </Link>
              <Link href="/workspace">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  🏥 Ir para Workspace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}