'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
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
    <div className="p-6">
      {/* Header com estatísticas */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Agenda de Consultas</h1>
              <p className="text-slate-400">Gerenciar consultas e agendamentos</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span>Nova Consulta</span>
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Hoje</p>
                <p className="text-2xl font-bold text-white">{stats.hoje}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Confirmadas</p>
                <p className="text-2xl font-bold text-white">{stats.confirmadas}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pendentes</p>
                <p className="text-2xl font-bold text-white">{stats.pendentes}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Canceladas</p>
                <p className="text-2xl font-bold text-white">{stats.canceladas}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda do Dia */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Agenda do Dia</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <span className="text-white font-medium px-4">
                  {new Date().toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <button className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Grade de horários */}
            <div className="space-y-2">
              {horarios.map((horario) => {
                const consulta = consultas.find(c => c.horario === horario);

                return (
                  <div key={horario} className="flex items-center">
                    <div className="w-16 text-slate-400 text-sm font-medium">
                      {horario}
                    </div>
                    <div className="flex-1 ml-4">
                      {consulta ? (
                        <div className="bg-slate-700 rounded-lg p-4 border-l-4 border-blue-500">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-white font-medium">{consulta.paciente}</h3>
                                <span className={`px-2 py-1 ${consulta.statusColor} text-white text-xs rounded-full`}>
                                  {consulta.status}
                                </span>
                              </div>
                              <p className="text-slate-400 text-sm mb-1">{consulta.tipo}</p>
                              <p className="text-slate-500 text-xs">{consulta.observacoes}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-slate-400 text-sm">{consulta.duracao}</span>
                              <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                                <Eye className="w-4 h-4 text-white" />
                              </button>
                              <button className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors">
                                <Edit className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-12 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center hover:border-slate-600 transition-colors cursor-pointer">
                          <span className="text-slate-500 text-sm">Horário disponível</span>
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
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Próximas Consultas</h3>
            <div className="space-y-3">
              {consultas.filter(c => c.status === 'Confirmada').map((consulta) => (
                <div key={consulta.id} className="bg-slate-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{consulta.paciente}</span>
                    <span className="text-slate-400 text-xs">{consulta.horario}</span>
                  </div>
                  <p className="text-slate-400 text-xs">{consulta.tipo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left">
                <Plus className="w-5 h-5 text-blue-500" />
                <span className="text-white">Nova Consulta</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left">
                <Calendar className="w-5 h-5 text-green-500" />
                <span className="text-white">Ver Calendário</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-left">
                <Search className="w-5 h-5 text-purple-500" />
                <span className="text-white">Buscar Paciente</span>
              </button>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Esta Semana</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Total de consultas:</span>
                <span className="text-white font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taxa de comparecimento:</span>
                <span className="text-green-400 font-medium">92%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cancelamentos:</span>
                <span className="text-red-400 font-medium">8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}