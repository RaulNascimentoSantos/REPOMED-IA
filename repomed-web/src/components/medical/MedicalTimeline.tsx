'use client'

import React, { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Heart,
  Pill,
  TestTube,
  Stethoscope,
  AlertTriangle,
  TrendingUp,
  Filter,
  Search,
  Download,
  Eye,
  Plus,
  MapPin,
  Phone,
  Mail,
  Printer,
  Share2,
  BookOpen,
  Zap,
  Shield
} from 'lucide-react'
import { motion } from 'framer-motion'
import { format, parseISO, differenceInDays, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface TimelineEvent {
  id: string
  type: 'consultation' | 'exam' | 'prescription' | 'vaccine' | 'surgery' | 'emergency' | 'lab_result' | 'follow_up'
  title: string
  description: string
  date: string
  time?: string
  doctor?: string
  location?: string
  status: 'completed' | 'pending' | 'cancelled' | 'scheduled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  attachments?: string[]
  results?: {
    value?: string | number
    unit?: string
    reference?: string
    status?: 'normal' | 'abnormal' | 'critical'
  }[]
  medications?: {
    name: string
    dosage: string
    frequency: string
    duration?: string
  }[]
  vitals?: {
    bloodPressure?: string
    heartRate?: number
    temperature?: number
    weight?: number
    height?: number
  }
}

interface PatientData {
  id: string
  name: string
  birthDate: string
  gender: 'M' | 'F'
  bloodType?: string
  allergies?: string[]
  conditions?: string[]
}

// Mock data for demonstration
const mockPatient: PatientData = {
  id: 'patient_001',
  name: 'Maria Silva Santos',
  birthDate: '1985-03-15',
  gender: 'F',
  bloodType: 'A+',
  allergies: ['Penicilina', 'Látex'],
  conditions: ['Diabetes Tipo 2', 'Hipertensão']
}

const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'event_001',
    type: 'consultation',
    title: 'Consulta de Rotina',
    description: 'Avaliação geral de saúde, controle de diabetes e pressão arterial',
    date: '2024-01-20',
    time: '14:30',
    doctor: 'Dr. João Cardiologista',
    location: 'Consultório 102',
    status: 'completed',
    priority: 'medium',
    category: 'Cardiologia',
    vitals: {
      bloodPressure: '130/85',
      heartRate: 75,
      temperature: 36.5,
      weight: 65,
      height: 165
    }
  },
  {
    id: 'event_002',
    type: 'lab_result',
    title: 'Resultados de Exames Laboratoriais',
    description: 'Hemograma completo, glicemia de jejum, HbA1c',
    date: '2024-01-18',
    time: '09:00',
    doctor: 'Lab Central',
    status: 'completed',
    priority: 'high',
    category: 'Laboratório',
    results: [
      { value: 95, unit: 'mg/dL', reference: '70-100', status: 'normal' },
      { value: 6.8, unit: '%', reference: '<7.0', status: 'normal' },
      { value: 4500, unit: '/mm³', reference: '4000-11000', status: 'normal' }
    ]
  },
  {
    id: 'event_003',
    type: 'prescription',
    title: 'Prescrição Médica Atualizada',
    description: 'Ajuste da medicação para diabetes e hipertensão',
    date: '2024-01-15',
    time: '16:00',
    doctor: 'Dr. João Cardiologista',
    status: 'completed',
    priority: 'high',
    category: 'Prescrição',
    medications: [
      { name: 'Metformina', dosage: '850mg', frequency: '2x ao dia', duration: '30 dias' },
      { name: 'Losartana', dosage: '50mg', frequency: '1x ao dia', duration: '30 dias' },
      { name: 'Sinvastatina', dosage: '20mg', frequency: '1x ao dia à noite', duration: '30 dias' }
    ]
  },
  {
    id: 'event_004',
    type: 'exam',
    title: 'Eletrocardiograma',
    description: 'ECG de rotina para acompanhamento cardiológico',
    date: '2024-01-12',
    time: '10:30',
    doctor: 'Dr. João Cardiologista',
    location: 'Sala de Exames',
    status: 'completed',
    priority: 'medium',
    category: 'Cardiologia',
    attachments: ['ecg_20240112.pdf']
  },
  {
    id: 'event_005',
    type: 'follow_up',
    title: 'Retorno Agendado',
    description: 'Acompanhamento dos resultados e ajuste do tratamento',
    date: '2024-02-20',
    time: '14:00',
    doctor: 'Dr. João Cardiologista',
    location: 'Consultório 102',
    status: 'scheduled',
    priority: 'medium',
    category: 'Cardiologia'
  },
  {
    id: 'event_006',
    type: 'vaccine',
    title: 'Vacina da Gripe',
    description: 'Imunização anual contra influenza',
    date: '2024-01-08',
    time: '11:00',
    doctor: 'Enfermeira Ana',
    location: 'Sala de Vacinas',
    status: 'completed',
    priority: 'low',
    category: 'Prevenção'
  }
]

const eventTypeConfig = {
  consultation: { icon: Stethoscope, color: 'bg-blue-500', label: 'Consulta' },
  exam: { icon: TestTube, color: 'bg-green-500', label: 'Exame' },
  prescription: { icon: Pill, color: 'bg-purple-500', label: 'Prescrição' },
  vaccine: { icon: Shield, color: 'bg-teal-500', label: 'Vacina' },
  surgery: { icon: Activity, color: 'bg-red-500', label: 'Cirurgia' },
  emergency: { icon: AlertTriangle, color: 'bg-orange-500', label: 'Emergência' },
  lab_result: { icon: TestTube, color: 'bg-indigo-500', label: 'Resultado Lab' },
  follow_up: { icon: Calendar, color: 'bg-gray-500', label: 'Retorno' }
}

const priorityColors = {
  low: 'border-green-200 bg-green-50',
  medium: 'border-blue-200 bg-blue-50',
  high: 'border-orange-200 bg-orange-50',
  critical: 'border-red-200 bg-red-50'
}

export function MedicalTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>(mockTimelineEvents)
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'timeline' | 'list' | 'calendar'>('timeline')
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)

  const filteredEvents = useMemo(() => {
    let filtered = events

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(event => event.type === selectedFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.doctor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [events, selectedFilter, searchTerm])

  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {}
    
    filteredEvents.forEach(event => {
      const date = new Date(event.date)
      let groupKey: string

      if (isToday(date)) {
        groupKey = 'Hoje'
      } else if (isYesterday(date)) {
        groupKey = 'Ontem'
      } else if (differenceInDays(new Date(), date) <= 7) {
        groupKey = format(date, 'EEEE', { locale: ptBR })
      } else if (differenceInDays(new Date(), date) <= 30) {
        groupKey = 'Últimos 30 dias'
      } else {
        groupKey = format(date, 'MMMM yyyy', { locale: ptBR })
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(event)
    })

    return groups
  }, [filteredEvents])

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString)
    return format(date, 'dd MMM yyyy', { locale: ptBR })
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return ''
    return timeString
  }

  const getEventIcon = (type: TimelineEvent['type']) => {
    const config = eventTypeConfig[type]
    return config ? config.icon : FileText
  }

  const getEventColor = (type: TimelineEvent['type']) => {
    const config = eventTypeConfig[type]
    return config ? config.color : 'bg-gray-500'
  }

  const exportTimeline = () => {
    const data = {
      patient: mockPatient,
      events: filteredEvents,
      exportDate: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `timeline_${mockPatient.name.replace(/\s+/g, '_')}_${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const EventCard = ({ event, isSelected = false }: { event: TimelineEvent, isSelected?: boolean }) => {
    const IconComponent = getEventIcon(event.type)
    const eventConfig = eventTypeConfig[event.type]

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
          isSelected 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
            : `${priorityColors[event.priority]} hover:shadow-md`
        }`}
        onClick={() => setSelectedEvent(event)}
      >
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${getEventColor(event.type)} text-white`}>
            <IconComponent className="w-4 h-4" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {event.title}
              </h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={event.status === 'completed' ? 'default' : event.status === 'scheduled' ? 'secondary' : 'destructive'}
                  className="text-xs"
                >
                  {event.status === 'completed' ? 'Concluído' : 
                   event.status === 'scheduled' ? 'Agendado' : 
                   event.status === 'pending' ? 'Pendente' : 'Cancelado'}
                </Badge>
                {event.priority === 'critical' && (
                  <Badge variant="destructive" className="text-xs">
                    Crítico
                  </Badge>
                )}
              </div>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {event.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(event.date)}
              </span>
              {event.time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.time)}
                </span>
              )}
              {event.doctor && (
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {event.doctor}
                </span>
              )}
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </span>
              )}
            </div>

            {/* Quick Preview for specific event types */}
            {event.vitals && (
              <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                <div className="grid grid-cols-2 gap-2">
                  {event.vitals.bloodPressure && (
                    <span>PA: {event.vitals.bloodPressure}</span>
                  )}
                  {event.vitals.heartRate && (
                    <span>FC: {event.vitals.heartRate} bpm</span>
                  )}
                  {event.vitals.weight && (
                    <span>Peso: {event.vitals.weight} kg</span>
                  )}
                  {event.vitals.temperature && (
                    <span>Temp: {event.vitals.temperature}°C</span>
                  )}
                </div>
              </div>
            )}

            {event.results && (
              <div className="mt-3 space-y-1">
                {event.results.slice(0, 2).map((result, index) => (
                  <div key={index} className="flex items-center justify-between text-xs">
                    <span>{result.value} {result.unit}</span>
                    <Badge 
                      variant={result.status === 'normal' ? 'secondary' : 'destructive'}
                      className="text-xs"
                    >
                      {result.status === 'normal' ? 'Normal' : 'Alterado'}
                    </Badge>
                  </div>
                ))}
                {(event.results?.length || 0) > 2 && (
                  <span className="text-xs text-gray-500">
                    +{(event.results?.length || 0) - 2} mais resultados
                  </span>
                )}
              </div>
            )}

            {event.medications && (
              <div className="mt-3 text-xs text-gray-600">
                <span className="font-medium">Medicações: </span>
                {event.medications.slice(0, 2).map((med, index) => (
                  <span key={index}>
                    {med.name} {med.dosage}
                    {index < Math.min(event.medications!.length - 1, 1) && ', '}
                  </span>
                ))}
                {(event.medications?.length || 0) > 2 && (
                  <span> +{(event.medications?.length || 0) - 2} mais</span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
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
            Linha do Tempo Médica
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Histórico cronológico completo de {mockPatient.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
            {filteredEvents.length} eventos
          </Badge>
          <Badge variant="outline">
            Interativa
          </Badge>
        </div>
      </motion.div>

      {/* Patient Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {mockPatient.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {format(parseISO(mockPatient.birthDate), 'dd/MM/yyyy')} • {mockPatient.gender === 'M' ? 'Masculino' : 'Feminino'}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo Sanguíneo</span>
              <p className="text-sm">{mockPatient.bloodType}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alergias</span>
              <p className="text-sm">{mockPatient.allergies?.join(', ')}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Condições</span>
              <p className="text-sm">{mockPatient.conditions?.join(', ')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os eventos</option>
                <option value="consultation">Consultas</option>
                <option value="exam">Exames</option>
                <option value="prescription">Prescrições</option>
                <option value="lab_result">Resultados Lab</option>
                <option value="vaccine">Vacinas</option>
                <option value="follow_up">Retornos</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={exportTimeline}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
              <Button size="sm" variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-12 gap-6">
        {/* Timeline */}
        <div className="col-span-8">
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([groupName, groupEvents]) => (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {groupName}
                  </h2>
                  <Separator className="flex-1" />
                  <Badge variant="outline" className="text-xs">
                    {groupEvents.length} {groupEvents.length === 1 ? 'evento' : 'eventos'}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {groupEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      isSelected={selectedEvent?.id === event.id}
                    />
                  ))}
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <Card className="p-8 text-center">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Nenhum evento encontrado
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Ajuste os filtros ou termo de busca para encontrar eventos específicos
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="col-span-4">
          {selectedEvent ? (
            <Card className="sticky top-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {React.createElement(getEventIcon(selectedEvent.type), { className: "w-5 h-5" })}
                    Detalhes do Evento
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedEvent(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatDate(selectedEvent.date)}</span>
                    {selectedEvent.time && (
                      <>
                        <Clock className="w-4 h-4 text-gray-500 ml-2" />
                        <span>{selectedEvent.time}</span>
                      </>
                    )}
                  </div>

                  {selectedEvent.doctor && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-500" />
                      <span>{selectedEvent.doctor}</span>
                    </div>
                  )}

                  {selectedEvent.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={selectedEvent.status === 'completed' ? 'default' : 'secondary'}
                    >
                      {selectedEvent.status === 'completed' ? 'Concluído' : 
                       selectedEvent.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                    </Badge>
                    <Badge 
                      variant={selectedEvent.priority === 'critical' ? 'destructive' : 'outline'}
                    >
                      {selectedEvent.priority === 'critical' ? 'Crítico' :
                       selectedEvent.priority === 'high' ? 'Alta' :
                       selectedEvent.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>

                {/* Detailed Information by Type */}
                {selectedEvent.vitals && (
                  <div>
                    <h4 className="font-medium mb-2">Sinais Vitais</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {selectedEvent.vitals.bloodPressure && (
                        <div>
                          <span className="text-gray-500">Pressão:</span>
                          <p>{selectedEvent.vitals.bloodPressure}</p>
                        </div>
                      )}
                      {selectedEvent.vitals.heartRate && (
                        <div>
                          <span className="text-gray-500">FC:</span>
                          <p>{selectedEvent.vitals.heartRate} bpm</p>
                        </div>
                      )}
                      {selectedEvent.vitals.temperature && (
                        <div>
                          <span className="text-gray-500">Temperatura:</span>
                          <p>{selectedEvent.vitals.temperature}°C</p>
                        </div>
                      )}
                      {selectedEvent.vitals.weight && (
                        <div>
                          <span className="text-gray-500">Peso:</span>
                          <p>{selectedEvent.vitals.weight} kg</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.results && (
                  <div>
                    <h4 className="font-medium mb-2">Resultados</h4>
                    <div className="space-y-2">
                      {selectedEvent.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <span>{result.value} {result.unit}</span>
                          <Badge 
                            variant={result.status === 'normal' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {result.status === 'normal' ? 'Normal' : 'Alterado'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.medications && (
                  <div>
                    <h4 className="font-medium mb-2">Medicações</h4>
                    <div className="space-y-2">
                      {selectedEvent.medications.map((med, index) => (
                        <div key={index} className="p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          <p className="font-medium">{med.name}</p>
                          <p className="text-gray-600 dark:text-gray-400">
                            {med.dosage} - {med.frequency}
                          </p>
                          {med.duration && (
                            <p className="text-xs text-gray-500">Por {med.duration}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEvent.attachments && (
                  <div>
                    <h4 className="font-medium mb-2">Anexos</h4>
                    <div className="space-y-1">
                      {selectedEvent.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="flex-1">{attachment}</span>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Completo
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="p-8 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecione um Evento
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Clique em qualquer evento na linha do tempo para ver os detalhes completos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}