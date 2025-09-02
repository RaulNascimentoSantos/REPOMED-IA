'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Document {
  id: string
  title: string
  type: string
  patient: string
  doctor: string
  date: string
  status: 'signed' | 'pending' | 'draft'
  description: string
  icon: string
}

export default function DocumentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const clearFilters = () => {
    setSearchTerm('')
    setFilterType('all')
    setSortBy('date')
  }

  // Dados mockados para demonstração
  const mockDocuments: Document[] = [
    {
      id: '1',
      title: 'Receita Médica - Antibiótico',
      type: 'prescription',
      patient: 'Maria Silva Santos',
      doctor: 'Dr. João Silva',
      date: '2025-01-15',
      status: 'signed',
      description: 'Prescrição de Amoxicilina 500mg para infecção respiratória',
      icon: '💊'
    },
    {
      id: '2', 
      title: 'Atestado Médico - Repouso',
      type: 'certificate',
      patient: 'José Santos',
      doctor: 'Dr. João Silva',
      date: '2025-01-14',
      status: 'pending',
      description: 'Atestado para repouso de 3 dias por gripe',
      icon: '📋'
    },
    {
      id: '3',
      title: 'Laudo de Exames - Sangue',
      type: 'exam',
      patient: 'Carlos Oliveira',
      doctor: 'Dr. João Silva',
      date: '2025-01-13',
      status: 'signed',
      description: 'Resultados dos exames laboratoriais completos',
      icon: '🔬'
    },
    {
      id: '4',
      title: 'Receita Médica - Controle',
      type: 'prescription',
      patient: 'Ana Ferreira',
      doctor: 'Dr. João Silva',
      date: '2025-01-12',
      status: 'draft',
      description: 'Medicação para controle da hipertensão',
      icon: '💊'
    },
    {
      id: '5',
      title: 'Relatório Médico - Consulta',
      type: 'report',
      patient: 'Roberto Costa',
      doctor: 'Dr. João Silva',
      date: '2025-01-11',
      status: 'signed',
      description: 'Relatório detalhado da consulta cardiológica',
      icon: '📊'
    }
  ]

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = searchTerm === '' || (
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesFilter = filterType === 'all' || doc.type === filterType
    
    return matchesSearch && matchesFilter
  })

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      case 'title':
        return a.title.localeCompare(b.title)
      case 'patient':
        return a.patient.localeCompare(b.patient)
      default:
        return 0
    }
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'signed':
        return <Badge className="bg-green-500">✅ Assinado</Badge>
      case 'pending':
        return <Badge className="bg-yellow-500">⏳ Pendente</Badge>
      case 'draft':
        return <Badge className="bg-gray-500">📝 Rascunho</Badge>
      default:
        return <Badge>❓ Desconhecido</Badge>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'prescription': return 'Receita'
      case 'certificate': return 'Atestado'
      case 'exam': return 'Exame'
      case 'report': return 'Relatório'
      default: return type
    }
  }

  const stats = {
    total: mockDocuments.length,
    signed: mockDocuments.filter(d => d.status === 'signed').length,
    pending: mockDocuments.filter(d => d.status === 'pending').length,
    draft: mockDocuments.filter(d => d.status === 'draft').length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📄 Documentos Médicos</h1>
              <p className="text-gray-600 mt-1">Gerencie todos os seus documentos médicos</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="outline">← Início</Button>
              </Link>
              <Link href="/documents/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  ➕ Novo Documento
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
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de documentos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.signed}</div>
              <div className="text-sm text-gray-600">Assinados</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-gray-600">Rascunhos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔍 Buscar e Filtrar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Buscar documentos
                </label>
                <Input
                  placeholder="Digite título, paciente ou médico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Tipo de documento
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="prescription">💊 Receitas</SelectItem>
                    <SelectItem value="certificate">📋 Atestados</SelectItem>
                    <SelectItem value="exam">🔬 Exames</SelectItem>
                    <SelectItem value="report">📊 Relatórios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Ordenar por
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">📅 Data</SelectItem>
                    <SelectItem value="title">📝 Título</SelectItem>
                    <SelectItem value="patient">👤 Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchTerm || filterType !== 'all' || sortBy !== 'date') && (
              <div className="flex items-center justify-between mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">
                  {sortedDocuments.length} documento(s) encontrado(s)
                  {searchTerm && <span> • Busca: "{searchTerm}"</span>}
                  {filterType !== 'all' && <span> • Tipo: {filterType}</span>}
                  {sortBy !== 'date' && <span> • Ordenado por: {sortBy}</span>}
                </div>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  🗑️ Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="space-y-4">
          {sortedDocuments.length > 0 ? (
            sortedDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-2xl">{doc.icon}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                          {getStatusBadge(doc.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">👤 Paciente:</span> {doc.patient}
                          </div>
                          <div>
                            <span className="font-medium">👨‍⚕️ Médico:</span> {doc.doctor}
                          </div>
                          <div>
                            <span className="font-medium">📅 Data:</span> {new Date(doc.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{doc.description}</p>
                        <div className="mt-2">
                          <Badge variant="outline">{getTypeLabel(doc.type)}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Link href={`/documents/${doc.id}`}>
                        <Button variant="outline" size="sm">
                          👁️ Ver
                        </Button>
                      </Link>
                      <Link href={`/documents/${doc.id}/edit`}>
                        <Button variant="outline" size="sm">
                          ✏️ Editar
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        📥 Baixar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro documento médico'
                  }
                </p>
                <Link href="/documents/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    ➕ Criar Primeiro Documento
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>⚡ Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/documents/create">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  💊 Nova Receita
                </Button>
              </Link>
              <Link href="/documents/create">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  📋 Novo Atestado
                </Button>
              </Link>
              <Link href="/templates">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  📝 Ver Templates
                </Button>
              </Link>
              <Link href="/workspace">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  🏥 Workspace
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}