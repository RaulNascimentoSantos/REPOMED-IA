'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  Video,
  Phone
} from 'lucide-react';

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      time: '09:00',
      patient: 'Maria Silva',
      type: 'Consulta',
      status: 'confirmado',
      duration: '30min',
      room: 'Sala 1'
    },
    {
      id: 2,
      time: '10:30',
      patient: 'João Santos',
      type: 'Retorno',
      status: 'pendente',
      duration: '20min',
      room: 'Sala 2'
    },
    {
      id: 3,
      time: '14:00',
      patient: 'Ana Costa',
      type: 'Telemedicina',
      status: 'confirmado',
      duration: '45min',
      room: 'Online'
    },
    {
      id: 4,
      time: '16:00',
      patient: 'Carlos Lima',
      type: 'Consulta',
      status: 'em_andamento',
      duration: '30min',
      room: 'Sala 1'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200';
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'em_andamento': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Telemedicina': return <Video className="w-4 h-4" />;
      case 'Retorno': return <Clock className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Agenda Médica
            </h1>
            <p className="text-muted-foreground">Gerencie seus compromissos e consultas</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filtrar</span>
            </Button>
            
            <Button variant="medical" className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nova Consulta</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mini Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Calendário</span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold">Setembro 2025</h3>
                  <p className="text-sm text-muted-foreground">Hoje: 6 de setembro</p>
                </div>
                
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => (
                    <div key={day} className="p-2 font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}
                  
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                    <div
                      key={day}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        day === 6 
                          ? 'bg-blue-600 text-white' 
                          : day === 7 || day === 14 || day === 21
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Consultas de Hoje</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="px-3 py-1">
                    4 consultas
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center min-w-[60px]">
                          <div className="text-lg font-bold text-blue-600">
                            {appointment.time}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {appointment.duration}
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-semibold">{appointment.patient}</h4>
                            <Badge className={getStatusColor(appointment.status)}>
                              {appointment.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(appointment.type)}
                              <span>{appointment.type}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{appointment.room}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {appointment.type === 'Telemedicina' && (
                          <Button size="sm" variant="outline" className="flex items-center space-x-1">
                            <Video className="w-4 h-4" />
                            <span>Iniciar</span>
                          </Button>
                        )}
                        
                        {appointment.status === 'confirmado' && (
                          <Button 
                            size="sm" 
                            variant="medical"
                            onClick={() => router.push('/patients/prescriptions/create')}
                          >
                            Iniciar Consulta
                          </Button>
                        )}
                        
                        {appointment.status === 'em_andamento' && (
                          <Button size="sm" variant="success">
                            Em Andamento
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Consultas Hoje</p>
                  <p className="text-2xl font-bold">4</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-600">2</p>
                </div>
                <User className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Telemedicina</p>
                  <p className="text-2xl font-bold text-purple-600">1</p>
                </div>
                <Video className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}