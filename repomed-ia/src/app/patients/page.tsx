'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Patient {
  id: string
  name: string
  cpf: string
  birth_date: string
  gender: string
  phone: string
  email: string
  address: string
  allergies: string[]
  conditions: string[]
  last_visit: string
  status: 'active' | 'inactive'
  avatar_color: string
}

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  // Dados mockados de pacientes
  const mockPatients: Patient[] = [
    {
      id: '1',
      name: 'Maria Silva Santos',
      cpf: '123.456.789-10',
      birth_date: '1978-03-15',
      gender: 'Feminino',
      phone: '(11) 98765-4321',
      email: 'maria.silva@email.com',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      allergies: ['Penicilina', 'Dipirona'],
      conditions: ['Hipertensão', 'Diabetes Tipo 2'],
      last_visit: '2025-01-15',
      status: 'active',
      avatar_color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'José Santos Oliveira',
      cpf: '234.567.890-21',
      birth_date: '1985-07-22',
      gender: 'Masculino',
      phone: '(11) 97654-3210',
      email: 'jose.santos@email.com',
      address: 'Av. Paulista, 456 - São Paulo, SP',
      allergies: ['Lactose'],
      conditions: ['Asma'],
      last_visit: '2025-01-12',
      status: 'active',
      avatar_color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Ana Ferreira Costa',
      cpf: '345.678.901-32',
      birth_date: '1992-11-08',
      gender: 'Feminino',
      phone: '(11) 96543-2109',
      email: 'ana.ferreira@email.com',
      address: 'Rua Augusta, 789 - São Paulo, SP',
      allergies: [],
      conditions: ['Enxaqueca'],
      last_visit: '2025-01-10',
      status: 'active',
      avatar_color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Carlos Roberto Lima',
      cpf: '456.789.012-43',
      birth_date: '1970-05-30',
      gender: 'Masculino',
      phone: '(11) 95432-1098',
      email: 'carlos.lima@email.com',
      address: 'Rua da Consolação, 321 - São Paulo, SP',
      allergies: ['Aspirina'],
      conditions: ['Hipertensão', 'Colesterol Alto'],
      last_visit: '2025-01-08',
      status: 'active',
      avatar_color: 'bg-orange-500'
    },
    {
      id: '5',
      name: 'Beatriz Almeida Souza',
      cpf: '567.890.123-54',
      birth_date: '1988-12-12',
      gender: 'Feminino',
      phone: '(11) 94321-0987',
      email: 'beatriz.almeida@email.com',
      address: 'Rua Oscar Freire, 654 - São Paulo, SP',
      allergies: ['Frutos do Mar'],
      conditions: [],
      last_visit: '2024-12-20',
      status: 'inactive',
      avatar_color: 'bg-pink-500'
    },
    {
      id: '6',
      name: 'Roberto Costa Silva',
      cpf: '678.901.234-65',
      birth_date: '1965-09-18',
      gender: 'Masculino',
      phone: '(11) 93210-9876',
      email: 'roberto.costa@email.com',
      address: 'Alameda Santos, 987 - São Paulo, SP',
      allergies: ['Ibuprofeno'],
      conditions: ['Diabetes Tipo 2', 'Hipertensão'],
      last_visit: '2025-01-05',
      status: 'active',
      avatar_color: 'bg-indigo-500'
    }
  ]

  const filteredPatients = mockPatients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.cpf.includes(searchTerm) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'last_visit':
        return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
      case 'birth_date':
        return new Date(a.birth_date).getTime() - new Date(b.birth_date).getTime()
      default:
        return 0
    }
  })

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  const stats = {
    total: mockPatients.length,
    active: mockPatients.filter(p => p.status === 'active').length,
    with_allergies: mockPatients.filter(p => p.allergies.length > 0).length,
    recent_visits: mockPatients.filter(p => {
      const lastVisit = new Date(p.last_visit)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return lastVisit >= thirtyDaysAgo
    }).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👥 Pacientes</h1>
              <p className="text-gray-600 mt-1">Gestão completa de pacientes</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/">
                <Button variant="outline">← Início</Button>
              </Link>
              <Link href="/patients/create">
                <Button className="bg-green-600 hover:bg-green-700">
                  ➕ Novo Paciente
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
              <div className="text-2xl font-bold text-green-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de pacientes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Pacientes ativos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.with_allergies}</div>
              <div className="text-sm text-gray-600">Com alergias</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">{stats.recent_visits}</div>
              <div className="text-sm text-gray-600">Visitas recentes</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔍 Buscar e Filtrar Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Buscar pacientes
                </label>
                <Input
                  placeholder="Nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">✅ Ativos</SelectItem>
                    <SelectItem value="inactive">❌ Inativos</SelectItem>
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
                    <SelectItem value="name">📝 Nome</SelectItem>
                    <SelectItem value="last_visit">📅 Última visita</SelectItem>
                    <SelectItem value="birth_date">🎂 Data de nascimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients List */}
        <div className="space-y-4">
          {sortedPatients.length > 0 ? (
            sortedPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Avatar */}
                      <div className={`${patient.avatar_color} text-white rounded-full w-12 h-12 flex items-center justify-center font-semibold text-lg`}>
                        {getInitials(patient.name)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
                          <Badge className={patient.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                            {patient.status === 'active' ? '✅ Ativo' : '❌ Inativo'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">🆔 CPF:</span> {patient.cpf}
                          </div>
                          <div>
                            <span className="font-medium">🎂 Idade:</span> {calculateAge(patient.birth_date)} anos
                          </div>
                          <div>
                            <span className="font-medium">⚧ Gênero:</span> {patient.gender}
                          </div>
                          <div>
                            <span className="font-medium">📱 Telefone:</span> {patient.phone}
                          </div>
                          <div>
                            <span className="font-medium">📧 Email:</span> {patient.email}
                          </div>
                          <div>
                            <span className="font-medium">📅 Última visita:</span> {new Date(patient.last_visit).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          <span className="font-medium">🏠 Endereço:</span> {patient.address}
                        </div>
                        
                        {/* Alergias e Condições */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {patient.allergies.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-red-700 font-medium">⚠️ Alergias:</span>
                              {patient.allergies.map((allergy, idx) => (
                                <Badge key={idx} className="bg-red-100 text-red-800 text-xs">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {patient.conditions.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              <span className="text-xs text-yellow-700 font-medium">🏥 Condições:</span>
                              {patient.conditions.map((condition, idx) => (
                                <Badge key={idx} className="bg-yellow-100 text-yellow-800 text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-2 ml-4">
                      <Link href={`/patients/${patient.id}`}>
                        <Button variant="outline" size="sm">
                          👁️ Ver
                        </Button>
                      </Link>
                      <Link href={`/patients/${patient.id}/edit`}>
                        <Button variant="outline" size="sm">
                          ✏️ Editar
                        </Button>
                      </Link>
                      <Link href={`/workspace?patient=${patient.id}`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          📝 Prescrever
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum paciente encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece cadastrando seu primeiro paciente'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                    }}
                    variant="outline"
                  >
                    🔄 Limpar Filtros
                  </Button>
                  <Link href="/patients/create">
                    <Button className="bg-green-600 hover:bg-green-700">
                      ➕ Cadastrar Primeiro Paciente
                    </Button>
                  </Link>
                </div>
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
              <Link href="/patients/create">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  ➕ Novo Paciente
                </Button>
              </Link>
              <Link href="/patients/import">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  📁 Importar Lista
                </Button>
              </Link>
              <Link href="/documents/create">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  📝 Nova Prescrição
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