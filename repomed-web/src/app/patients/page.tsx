'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, 
  Search, 
  Filter,
  Plus,
  Download,
  Upload,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  AlertTriangle,
  Activity,
  FileText,
  Clock,
  User,
  Shield,
  Zap,
  TrendingUp,
  Grid,
  List
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { format, parseISO, differenceInYears } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  birthDate: string
  gender: 'M' | 'F'
  cpf: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  medicalInfo: {
    bloodType?: string
    allergies: string[]
    conditions: string[]
    medications: string[]
  }
  insurance?: {
    provider: string
    plan: string
    cardNumber: string
  }
  status: 'active' | 'inactive' | 'pending'
  lastVisit?: string
  nextAppointment?: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  avatar?: string
  createdAt: string
  updatedAt: string
}

// Mock data for demonstration
const mockPatients: Patient[] = [
  {
    id: 'pat_001',
    name: 'Maria Silva Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 99999-9999',
    birthDate: '1985-03-15',
    gender: 'F',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    emergencyContact: {
      name: 'João Santos',
      phone: '(11) 88888-8888',
      relationship: 'Esposo'
    },
    medicalInfo: {
      bloodType: 'A+',
      allergies: ['Penicilina', 'Látex'],
      conditions: ['Diabetes Tipo 2', 'Hipertensão'],
      medications: ['Metformina 850mg', 'Losartana 50mg']
    },
    insurance: {
      provider: 'Unimed',
      plan: 'Premium',
      cardNumber: '1234567890123456'
    },
    status: 'active',
    lastVisit: '2024-01-15',
    nextAppointment: '2024-02-15',
    riskLevel: 'medium',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15'
  },
  {
    id: 'pat_002',
    name: 'João Carlos Oliveira',
    email: 'joao.oliveira@email.com',
    phone: '(11) 77777-7777',
    birthDate: '1978-07-22',
    gender: 'M',
    cpf: '987.654.321-00',
    address: {
      street: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    emergencyContact: {
      name: 'Ana Oliveira',
      phone: '(11) 66666-6666',
      relationship: 'Esposa'
    },
    medicalInfo: {
      bloodType: 'O-',
      allergies: ['Contraste iodado'],
      conditions: ['Hipertensão', 'Colesterol alto'],
      medications: ['Atenolol 50mg', 'Sinvastatina 20mg']
    },
    status: 'active',
    lastVisit: '2024-01-20',
    nextAppointment: '2024-02-10',
    riskLevel: 'high',
    createdAt: '2023-05-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 'pat_003',
    name: 'Ana Paula Costa',
    email: 'ana.costa@email.com',
    phone: '(11) 55555-5555',
    birthDate: '1992-11-08',
    gender: 'F',
    cpf: '456.789.123-00',
    address: {
      street: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000'
    },
    emergencyContact: {
      name: 'Pedro Costa',
      phone: '(11) 44444-4444',
      relationship: 'Pai'
    },
    medicalInfo: {
      bloodType: 'B+',
      allergies: [],
      conditions: ['Enxaqueca'],
      medications: ['Naratriptana 2,5mg']
    },
    status: 'active',
    lastVisit: '2024-01-10',
    riskLevel: 'low',
    createdAt: '2023-08-20',
    updatedAt: '2024-01-10'
  },
  {
    id: 'pat_004',
    name: 'Carlos Eduardo Lima',
    email: 'carlos.lima@email.com',
    phone: '(11) 33333-3333',
    birthDate: '1965-12-03',
    gender: 'M',
    cpf: '789.123.456-00',
    address: {
      street: 'Rua da Consolação, 321',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-000'
    },
    emergencyContact: {
      name: 'Márcia Lima',
      phone: '(11) 22222-2222',
      relationship: 'Filha'
    },
    medicalInfo: {
      bloodType: 'AB+',
      allergies: ['Aspirina', 'Dipirona'],
      conditions: ['Diabetes Tipo 2', 'Doença arterial coronariana', 'Insuficiência cardíaca'],
      medications: ['Metformina 1g', 'Enalapril 10mg', 'AAS 100mg', 'Carvedilol 6,25mg']
    },
    status: 'active',
    lastVisit: '2024-01-18',
    nextAppointment: '2024-01-25',
    riskLevel: 'critical',
    createdAt: '2022-03-10',
    updatedAt: '2024-01-18'
  }
]

const patientStats = {
  total: mockPatients.length,
  active: mockPatients.filter(p => p.status === 'active').length,
  highRisk: mockPatients.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length,
  newThisMonth: 2
}

const riskLevelColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  critical: 'bg-red-100 text-red-800 border-red-200'
}

const riskLevelLabels = {
  low: 'Baixo',
  medium: 'Médio',
  high: 'Alto',
  critical: 'Crítico'
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)

  const filteredPatients = useMemo(() => {
    let filtered = patients

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.cpf.includes(searchTerm) ||
        patient.phone.includes(searchTerm)
      )
    }

    // Filter by status/risk
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'high_risk') {
        filtered = filtered.filter(patient => 
          patient.riskLevel === 'high' || patient.riskLevel === 'critical'
        )
      } else if (selectedFilter === 'active') {
        filtered = filtered.filter(patient => patient.status === 'active')
      } else if (selectedFilter === 'upcoming') {
        filtered = filtered.filter(patient => patient.nextAppointment)
      }
    }

    return filtered
  }, [patients, searchTerm, selectedFilter])

  const calculateAge = (birthDate: string): number => {
    return differenceInYears(new Date(), parseISO(birthDate))
  }

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR })
  }

  const PatientCard = ({ patient }: { patient: Patient }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="medical-card p-6 cursor-pointer"
      onClick={() => setSelectedPatient(patient)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={patient.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
              {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {patient.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {calculateAge(patient.birthDate)} anos • {patient.gender === 'M' ? 'Masculino' : 'Feminino'}
            </p>
          </div>
        </div>
        <Badge className={`text-xs ${riskLevelColors[patient.riskLevel]}`}>
          {riskLevelLabels[patient.riskLevel]}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Phone className="w-4 h-4 mr-2" />
          {patient.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Mail className="w-4 h-4 mr-2" />
          {patient.email}
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-2" />
          {patient.address.city}, {patient.address.state}
        </div>
      </div>

      {patient.medicalInfo.conditions.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Condições:</p>
          <div className="flex flex-wrap gap-1">
            {patient.medicalInfo.conditions.slice(0, 2).map((condition, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {condition}
              </Badge>
            ))}
            {patient.medicalInfo.conditions.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{patient.medicalInfo.conditions.length - 2}
              </Badge>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs text-gray-500">
          {patient.lastVisit ? (
            <span>Última consulta: {formatDate(patient.lastVisit)}</span>
          ) : (
            <span>Novo paciente</span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )

  const PatientRow = ({ patient }: { patient: Patient }) => (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
      onClick={() => setSelectedPatient(patient)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={patient.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
              {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{patient.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{patient.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {calculateAge(patient.birthDate)} anos
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {patient.phone}
      </td>
      <td className="px-6 py-4">
        <Badge className={`text-xs ${riskLevelColors[patient.riskLevel]}`}>
          {riskLevelLabels[patient.riskLevel]}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {patient.lastVisit ? formatDate(patient.lastVisit) : 'Nunca'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="relative">
                <Users className="w-8 h-8 text-blue-600" />
                <div className="absolute inset-0 w-8 h-8 bg-blue-600/20 rounded-full blur-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Gestão de Pacientes
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredPatients.length} de {patients.length} pacientes
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4">
              <Link href="/patients/new">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Paciente
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total de Pacientes</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {patientStats.total}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pacientes Ativos</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {patientStats.active}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Alto Risco</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {patientStats.highRisk}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="medical-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Novos Este Mês</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {patientStats.newThisMonth}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters and Controls */}
        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar pacientes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos os pacientes</option>
                  <option value="active">Ativos</option>
                  <option value="high_risk">Alto risco</option>
                  <option value="upcoming">Próximas consultas</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patients Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </div>
        ) : (
          <Card className="medical-card">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Idade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Telefone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Risco
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Última Consulta
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPatients.map((patient) => (
                      <PatientRow key={patient.id} patient={patient} />
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {filteredPatients.length === 0 && (
          <Card className="medical-card">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Nenhum paciente encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Ajuste os filtros ou adicione um novo paciente
              </p>
              <Link href="/patients/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Paciente
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Patient Details Modal/Sidebar */}
      {selectedPatient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPatient(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={selectedPatient.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-xl">
                      {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedPatient.name}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      {calculateAge(selectedPatient.birthDate)} anos • {selectedPatient.gender === 'M' ? 'Masculino' : 'Feminino'}
                    </p>
                    <Badge className={`mt-2 ${riskLevelColors[selectedPatient.riskLevel]}`}>
                      Risco {riskLevelLabels[selectedPatient.riskLevel]}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                    ×
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="medical">Informações Médicas</TabsTrigger>
                  <TabsTrigger value="history">Histórico</TabsTrigger>
                  <TabsTrigger value="documents">Documentos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                          <p className="text-sm">{selectedPatient.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone:</label>
                          <p className="text-sm">{selectedPatient.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CPF:</label>
                          <p className="text-sm">{selectedPatient.cpf}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Data de Nascimento:</label>
                          <p className="text-sm">{formatDate(selectedPatient.birthDate)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Endereço</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <address className="text-sm not-italic">
                          {selectedPatient.address.street}<br />
                          {selectedPatient.address.city}, {selectedPatient.address.state}<br />
                          CEP: {selectedPatient.address.zipCode}
                        </address>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Contato de Emergência</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome:</label>
                          <p className="text-sm">{selectedPatient.emergencyContact.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Telefone:</label>
                          <p className="text-sm">{selectedPatient.emergencyContact.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Parentesco:</label>
                          <p className="text-sm">{selectedPatient.emergencyContact.relationship}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {selectedPatient.insurance && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Plano de Saúde</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Operadora:</label>
                            <p className="text-sm">{selectedPatient.insurance.provider}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plano:</label>
                            <p className="text-sm">{selectedPatient.insurance.plan}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Número:</label>
                            <p className="text-sm">{selectedPatient.insurance.cardNumber}</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="medical" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Heart className="w-5 h-5" />
                          Informações Básicas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {selectedPatient.medicalInfo.bloodType && (
                          <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Sanguíneo:</label>
                            <p className="text-sm">{selectedPatient.medicalInfo.bloodType}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5" />
                          Alergias
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.medicalInfo.allergies.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.medicalInfo.allergies.map((allergy, index) => (
                              <Badge key={index} variant="destructive" className="mr-2">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Nenhuma alergia conhecida</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Condições Médicas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.medicalInfo.conditions.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.medicalInfo.conditions.map((condition, index) => (
                              <Badge key={index} variant="secondary" className="mr-2 mb-2">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Nenhuma condição registrada</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Medicações Atuais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedPatient.medicalInfo.medications.length > 0 ? (
                          <div className="space-y-2">
                            {selectedPatient.medicalInfo.medications.map((medication, index) => (
                              <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                                {medication}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Nenhuma medicação atual</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Histórico de Consultas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedPatient.lastVisit ? (
                          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">Consulta de Rotina</h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(selectedPatient.lastVisit)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Consulta de acompanhamento regular
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 text-center py-8">
                            Nenhuma consulta registrada
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-500">Nenhum documento anexado</p>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Upload className="w-4 h-4 mr-2" />
                          Adicionar Documento
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}