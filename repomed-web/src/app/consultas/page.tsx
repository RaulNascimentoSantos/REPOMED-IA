'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Calendar,
  Clock,
  User,
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ConsultasPage() {
  const { theme, isDarkMode, isMedicalTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('agenda'); // agenda, lista, calendario

  // Dados simulados de consultas
  const consultas = [
    {
      id: 1,
      paciente: 'Maria Silva Santos',
      horario: '09:00',
      data: '2024-01-15',
      tipo: 'Consulta de Rotina',
      status: 'Confirmada',
      statusColor: 'bg-green-500',
      telefone: '(11) 99999-9999',
      duracao: '30 min',
      observacoes: 'Acompanhamento diabetes'
    },
    {
      id: 2,
      paciente: 'João Carlos Oliveira',
      horario: '10:30',
      data: '2024-01-15',
      tipo: 'Cardiologia',
      status: 'Pendente',
      statusColor: 'bg-yellow-500',
      telefone: '(11) 77777-7777',
      duracao: '45 min',
      observacoes: 'Avaliação pressão arterial'
    },
    {
      id: 3,
      paciente: 'Ana Paula Costa',
      horario: '14:00',
      data: '2024-01-15',
      tipo: 'Neurologia',
      status: 'Confirmada',
      statusColor: 'bg-green-500',
      telefone: '(11) 55555-5555',
      duracao: '60 min',
      observacoes: 'Consulta enxaqueca'
    },
    {
      id: 4,
      paciente: 'Carlos Eduardo Lima',
      horario: '16:00',
      data: '2024-01-15',
      tipo: 'Retorno',
      status: 'Cancelada',
      statusColor: 'bg-red-500',
      telefone: '(11) 33333-3333',
      duracao: '30 min',
      observacoes: 'Cancelado pelo paciente'
    }
  ];

  const horarios = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const stats = {
    hoje: 4,
    confirmadas: 2,
    pendentes: 1,
    canceladas: 1
  };

  return (
    <div className={`min-h-screen p-6 ${
      isMedicalTheme ? 'bg-slate-900 text-white' :
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header com estatísticas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                isMedicalTheme ? 'text-white' :
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Agenda de Consultas</h1>
              <p className={`${
                isMedicalTheme ? 'text-slate-400' :
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>Gerenciar consultas e agendamentos</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nova Consulta</span>
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className={`rounded-xl p-4 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-base ${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Hoje</p>
                <p className={`text-2xl font-bold ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>{stats.hoje}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className={`rounded-xl p-4 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-base ${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Confirmadas</p>
                <p className={`text-2xl font-bold ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>{stats.confirmadas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className={`rounded-xl p-4 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-base ${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Pendentes</p>
                <p className={`text-2xl font-bold ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className={`rounded-xl p-4 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-base ${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Canceladas</p>
                <p className={`text-2xl font-bold ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>{stats.canceladas}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda do Dia */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl p-6 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${
                isMedicalTheme ? 'text-white' :
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Agenda do Dia</h2>
              <div className="flex items-center space-x-2">
                <button className={`p-2 rounded-lg transition-colors ${
                  isMedicalTheme ? 'bg-slate-700 hover:bg-slate-600' :
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600' :
                  'bg-slate-100 hover:bg-slate-200'
                }`}>
                  <ChevronLeft className={`w-4 h-4 ${
                    isMedicalTheme ? 'text-white' :
                    isDarkMode ? 'text-white' : 'text-slate-600'
                  }`} />
                </button>
                <span className={`font-medium px-4 ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button className={`p-2 rounded-lg transition-colors ${
                  isMedicalTheme ? 'bg-slate-700 hover:bg-slate-600' :
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600' :
                  'bg-slate-100 hover:bg-slate-200'
                }`}>
                  <ChevronRight className={`w-4 h-4 ${
                    isMedicalTheme ? 'text-white' :
                    isDarkMode ? 'text-white' : 'text-slate-600'
                  }`} />
                </button>
              </div>
            </div>

            {/* Grade de horários */}
            <div className="space-y-2">
              {horarios.map((horario) => {
                const consulta = consultas.find(c => c.horario === horario);

                return (
                  <div key={horario} className="flex items-center">
                    <div className={`w-16 text-base font-medium ${
                      isMedicalTheme ? 'text-slate-400' :
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {horario}
                    </div>
                    <div className="flex-1 ml-4">
                      {consulta ? (
                        <div className={`rounded-lg p-4 border-l-4 border-blue-500 ${
                          isMedicalTheme ? 'bg-slate-700' :
                          isDarkMode ? 'bg-slate-700' : 'bg-blue-50'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className={`font-medium ${
                                  isMedicalTheme ? 'text-white' :
                                  isDarkMode ? 'text-white' : 'text-slate-800'
                                }`}>{consulta.paciente}</h3>
                                <span className={`px-2 py-1 ${consulta.statusColor} text-white text-xs rounded-full`}>
                                  {consulta.status}
                                </span>
                              </div>
                              <p className={`text-base mb-1 ${
                                isMedicalTheme ? 'text-slate-400' :
                                isDarkMode ? 'text-slate-400' : 'text-slate-600'
                              }`}>{consulta.tipo}</p>
                              <p className={`text-xs ${
                                isMedicalTheme ? 'text-slate-500' :
                                isDarkMode ? 'text-slate-500' : 'text-slate-500'
                              }`}>{consulta.observacoes}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-base ${
                                isMedicalTheme ? 'text-slate-400' :
                                isDarkMode ? 'text-slate-400' : 'text-slate-600'
                              }`}>{consulta.duracao}</span>
                              <button className={`p-2 rounded-lg transition-colors ${
                                isMedicalTheme ? 'bg-slate-600 hover:bg-slate-500' :
                                isDarkMode ? 'bg-slate-600 hover:bg-slate-500' :
                                'bg-slate-100 hover:bg-slate-200'
                              }`}>
                                <Eye className={`w-4 h-4 ${
                                  isMedicalTheme ? 'text-white' :
                                  isDarkMode ? 'text-white' : 'text-slate-600'
                                }`} />
                              </button>
                              <button className={`p-2 rounded-lg transition-colors ${
                                isMedicalTheme ? 'bg-slate-600 hover:bg-slate-500' :
                                isDarkMode ? 'bg-slate-600 hover:bg-slate-500' :
                                'bg-slate-100 hover:bg-slate-200'
                              }`}>
                                <Edit className={`w-4 h-4 ${
                                  isMedicalTheme ? 'text-white' :
                                  isDarkMode ? 'text-white' : 'text-slate-600'
                                }`} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className={`h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                          isMedicalTheme ? 'border-slate-700 hover:border-slate-600' :
                          isDarkMode ? 'border-slate-700 hover:border-slate-600' :
                          'border-slate-300 hover:border-slate-400'
                        }`}>
                          <span className={`text-base ${
                            isMedicalTheme ? 'text-slate-500' :
                            isDarkMode ? 'text-slate-500' : 'text-slate-400'
                          }`}>Horário disponível</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Próximas Consultas */}
          <div className={`rounded-xl p-6 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isMedicalTheme ? 'text-white' :
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>Próximas Consultas</h3>
            <div className="space-y-3">
              {consultas.filter(c => c.status === 'Confirmada').map((consulta) => (
                <div key={consulta.id} className={`rounded-lg p-3 ${
                  isMedicalTheme ? 'bg-slate-700' :
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium text-base ${
                      isMedicalTheme ? 'text-white' :
                      isDarkMode ? 'text-white' : 'text-slate-800'
                    }`}>{consulta.paciente}</span>
                    <span className={`text-xs ${
                      isMedicalTheme ? 'text-slate-400' :
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>{consulta.horario}</span>
                  </div>
                  <p className={`text-xs ${
                    isMedicalTheme ? 'text-slate-400' :
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}>{consulta.tipo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className={`rounded-xl p-6 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isMedicalTheme ? 'text-white' :
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>Ações Rápidas</h3>
            <div className="space-y-3">
              <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                isMedicalTheme ? 'bg-slate-700 hover:bg-slate-600' :
                isDarkMode ? 'bg-slate-700 hover:bg-slate-600' :
                'bg-slate-50 hover:bg-slate-100'
              }`}>
                <Plus className="w-5 h-5 text-blue-500" />
                <span className={`${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Nova Consulta</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                isMedicalTheme ? 'bg-slate-700 hover:bg-slate-600' :
                isDarkMode ? 'bg-slate-700 hover:bg-slate-600' :
                'bg-slate-50 hover:bg-slate-100'
              }`}>
                <Calendar className="w-5 h-5 text-green-500" />
                <span className={`${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Ver Calendário</span>
              </button>
              <button className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left ${
                isMedicalTheme ? 'bg-slate-700 hover:bg-slate-600' :
                isDarkMode ? 'bg-slate-700 hover:bg-slate-600' :
                'bg-slate-50 hover:bg-slate-100'
              }`}>
                <Search className="w-5 h-5 text-purple-500" />
                <span className={`${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>Buscar Paciente</span>
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className={`rounded-xl p-6 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700' :
            isDarkMode ? 'bg-slate-800 border-slate-700' :
            'bg-white border-slate-200 shadow-sm'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 ${
              isMedicalTheme ? 'text-white' :
              isDarkMode ? 'text-white' : 'text-slate-800'
            }`}>Esta Semana</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={`${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Total de consultas:</span>
                <span className={`font-medium ${
                  isMedicalTheme ? 'text-white' :
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}>12</span>
              </div>
              <div className="flex justify-between">
                <span className={`${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Taxa de comparecimento:</span>
                <span className="text-green-400 font-medium">92%</span>
              </div>
              <div className="flex justify-between">
                <span className={`${
                  isMedicalTheme ? 'text-slate-400' :
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}>Cancelamentos:</span>
                <span className="text-red-400 font-medium">8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}