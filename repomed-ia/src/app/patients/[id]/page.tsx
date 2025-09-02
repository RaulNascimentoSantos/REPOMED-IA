'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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
  emergency_contact: string
  insurance: string
  last_visit: string
  status: 'active' | 'inactive'
  avatar_color: string
  medical_history: string
}

export default function PatientDetailPage() {
  const { id } = useParams()
  const [isEditing, setIsEditing] = useState(false)

  // Mock data - em produção viria do tRPC
  const getPatientById = (patientId: string) => {
    const patients = {
      '1': {
        id: '1',
        name: 'Maria Silva Santos',
        cpf: '123.456.789-10',
        birth_date: '1978-03-15',
        gender: 'Feminino',
        phone: '(11) 98765-4321',
        email: 'maria.silva@email.com',
        address: 'Rua das Flores, 123, Jardim Paulista - São Paulo, SP - CEP: 01310-100',
        allergies: ['Penicilina', 'Dipirona', 'Látex'],
        conditions: ['Hipertensão', 'Diabetes Tipo 2', 'Colesterol Alto'],
        emergency_contact: 'João Silva Santos - (11) 97654-3210 - Marido',
        insurance: 'Amil - Plano Executivo',
        last_visit: '2025-01-15',
        status: 'active' as const,
        avatar_color: 'bg-blue-500',
        medical_history: 'Paciente com histórico de hipertensão desde 2015, bem controlada com medicação. Desenvoleu diabetes tipo 2 em 2020. Sem histórico de cirurgias ou internações graves. Alergia conhecida a Penicilina desde a infância.'
      },
      '2': {
        id: '2',
        name: 'José Santos Oliveira',
        cpf: '234.567.890-21',
        birth_date: '1985-07-22',
        gender: 'Masculino',
        phone: '(11) 97654-3210',
        email: 'jose.santos@email.com',
        address: 'Av. Paulista, 456, Bela Vista - São Paulo, SP - CEP: 01310-200',
        allergies: ['Lactose'],
        conditions: ['Asma', 'Rinite Alérgica'],
        emergency_contact: 'Ana Oliveira - (11) 96543-2109 - Esposa',
        insurance: 'SulAmérica - Plano Basic',
        last_visit: '2025-01-12',
        status: 'active' as const,
        avatar_color: 'bg-green-500',
        medical_history: 'Paciente asmático desde a infância. Faz uso regular de broncodilatador. Sem outras comorbidades significativas. Pratica exercícios físicos regularmente.'
      }
    }
    return patients[patientId as keyof typeof patients]
  }

  const patient = getPatientById(id as string)
  const [editedPatient, setEditedPatient] = useState(patient || null)

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">👤</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Paciente não encontrado</h2>
            <p className="text-gray-600 mb-4">O paciente solicitado não existe ou foi removido.</p>
            <Link href="/patients">
              <Button>← Voltar para Pacientes</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  const recentDocuments = [
    { id: '1', type: 'Receita Médica', date: '2025-01-15', status: 'signed' },
    { id: '2', type: 'Exames Laboratoriais', date: '2025-01-10', status: 'pending' },
    { id: '3', type: 'Atestado Médico', date: '2024-12-20', status: 'signed' },
    { id: '4', type: 'Receita Controlada', date: '2024-12-15', status: 'signed' }
  ]

  const upcomingAppointments = [
    { date: '2025-01-25', time: '14:30', type: 'Consulta de Rotina', doctor: 'Dr. João Silva' },
    { date: '2025-02-15', time: '09:00', type: 'Retorno Cardiologia', doctor: 'Dr. Roberto Costa' }
  ]

  const handleSaveChanges = () => {
    // Aqui seria a lógica para salvar via tRPC
    console.log('Salvando alterações:', editedPatient)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className={`${patient.avatar_color} text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-xl`}>
                {getInitials(patient.name)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-gray-600">{calculateAge(patient.birth_date)} anos • {patient.gender}</span>
                  <Badge className={patient.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                    {patient.status === 'active' ? '✅ Ativo' : '❌ Inativo'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link href="/patients">
                <Button variant="outline">← Voltar</Button>
              </Link>
              <Link href={`/workspace?patient=${patient.id}`}>
                <Button className="bg-green-600 hover:bg-green-700">
                  📝 Nova Prescrição
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>👤 Informações Pessoais</CardTitle>
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
                {isEditing && editedPatient ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={editedPatient.name}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={editedPatient.cpf}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          cpf: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={editedPatient.phone}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          phone: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editedPatient.email}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          email: e.target.value
                        })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={editedPatient.address}
                        onChange={(e) => setEditedPatient({
                          ...editedPatient,
                          address: e.target.value
                        })}
                      />
                    </div>
                    <div className="md:col-span-2 flex space-x-2 pt-4">
                      <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700">
                        💾 Salvar Alterações
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        ❌ Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">CPF</Label>
                      <p className="text-sm">{patient.cpf}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Data de Nascimento</Label>
                      <p className="text-sm">{new Date(patient.birth_date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Telefone</Label>
                      <p className="text-sm">{patient.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Email</Label>
                      <p className="text-sm">{patient.email}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Endereço</Label>
                      <p className="text-sm">{patient.address}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Contato de Emergência</Label>
                      <p className="text-sm">{patient.emergency_contact}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Plano de Saúde</Label>
                      <p className="text-sm">{patient.insurance}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Information */}
            <Card>
              <CardHeader>
                <CardTitle>🏥 Informações Médicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">⚠️ Alergias</Label>
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} className="bg-red-100 text-red-800">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">🏥 Condições Médicas</Label>
                  <div className="flex flex-wrap gap-2">
                    {patient.conditions.map((condition, index) => (
                      <Badge key={index} className="bg-yellow-100 text-yellow-800">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-600 mb-2 block">📋 Histórico Médico</Label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {patient.medical_history}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Documents */}
            <Card>
              <CardHeader>
                <CardTitle>📄 Documentos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.type}</p>
                        <p className="text-xs text-gray-600">{new Date(doc.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={doc.status === 'signed' ? 'bg-green-500' : 'bg-yellow-500'}>
                          {doc.status === 'signed' ? '✅ Assinado' : '⏳ Pendente'}
                        </Badge>
                        <Button variant="outline" size="sm">
                          👁️ Ver
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>⚡ Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/workspace?patient=${patient.id}`}>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    💊 Nova Receita
                  </Button>
                </Link>
                <Link href={`/workspace?patient=${patient.id}&template=certificate`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    📋 Novo Atestado
                  </Button>
                </Link>
                <Link href={`/workspace?patient=${patient.id}&template=exam`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    🔬 Solicitar Exames
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  📅 Agendar Consulta
                </Button>
              </CardContent>
            </Card>

            {/* Next Appointments */}
            <Card>
              <CardHeader>
                <CardTitle>📅 Próximas Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAppointments.map((appointment, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{appointment.type}</p>
                        <Badge variant="outline" className="text-xs">
                          {appointment.time}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{new Date(appointment.date).toLocaleDateString('pt-BR')}</p>
                      <p className="text-xs text-gray-600">{appointment.doctor}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">4</div>
                    <div className="text-xs text-gray-600">Documentos</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">2</div>
                    <div className="text-xs text-gray-600">Consultas</div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">3</div>
                    <div className="text-xs text-gray-600">Alergias</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">3</div>
                    <div className="text-xs text-gray-600">Condições</div>
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