'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  Phone,
  Mail,
  FileText,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function AgendamentoPage() {
  const { theme, isDarkMode, isMedicalTheme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    telefone: '',
    email: '',
    especialidade: '',
    tipoConsulta: '',
    observacoes: ''
  });

  const horarios = [
    { time: '08:00', available: true },
    { time: '08:30', available: false },
    { time: '09:00', available: true },
    { time: '09:30', available: true },
    { time: '10:00', available: false },
    { time: '10:30', available: true },
    { time: '11:00', available: true },
    { time: '11:30', available: false },
    { time: '14:00', available: true },
    { time: '14:30', available: true },
    { time: '15:00', available: true },
    { time: '15:30', available: false },
    { time: '16:00', available: true },
    { time: '16:30', available: true },
    { time: '17:00', available: true },
    { time: '17:30', available: false }
  ];

  const especialidades = [
    'Clínica Geral',
    'Cardiologia',
    'Neurologia',
    'Dermatologia',
    'Pediatria',
    'Ginecologia',
    'Ortopedia',
    'Psiquiatria'
  ];

  const tiposConsulta = [
    'Consulta de Rotina',
    'Primeira Consulta',
    'Retorno',
    'Urgência',
    'Exame',
    'Procedimento'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Dias vazios do início
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create appointment using Fastify API
      const appointmentData = {
        paciente: formData.paciente,
        telefone: formData.telefone,
        email: formData.email,
        especialidade: formData.especialidade,
        tipo_consulta: formData.tipoConsulta,
        observacoes: formData.observacoes,
        data: selectedDate.toISOString().split('T')[0],
        horario: selectedTime,
        status: 'agendado'
      };

      const response = await fetch('http://localhost:8081/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        const newAppointment = await response.json();
        console.log('Agendamento criado:', newAppointment);
        alert('Agendamento criado com sucesso!');
      } else {
        throw new Error('Erro ao criar agendamento');
      }

      // Reset form and close modal
      setShowForm(false);
      setFormData({
        paciente: '',
        telefone: '',
        email: '',
        especialidade: '',
        tipoConsulta: '',
        observacoes: ''
      });
      setSelectedTime('');
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento. Verifique se o backend está rodando na porta 8081.');
    }
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className={`min-h-screen p-6 ${
      isMedicalTheme ? 'bg-slate-900 text-white' :
      isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className={`text-2xl font-bold mb-2 ${
                isMedicalTheme ? 'text-white' :
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}>Agendamento de Consultas</h1>
              <p className={`${
                isMedicalTheme ? 'text-slate-400' :
                isDarkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>Gerencie agendamentos e horários</p>
            </div>
          </div>
          <div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Agendamento</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl p-6 transition-all duration-300 ${
            isMedicalTheme ? 'bg-slate-800 border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10' :
            isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10' :
            'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg shadow-sm'
          }`}>
            {/* Header do Calendário */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 bg-slate-700 hover:bg-slate-600 hover:scale-110 rounded-lg transition-all duration-300"
                >
                  <ChevronLeft className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white text-sm rounded-lg transition-all duration-300"
                >
                  Hoje
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 bg-slate-700 hover:bg-slate-600 hover:scale-110 rounded-lg transition-all duration-300"
                >
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Grid do Calendário */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map(day => (
                <div key={day} className="text-center text-slate-400 font-medium text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, index) => (
                <button
                  key={index}
                  onClick={() => date && setSelectedDate(date)}
                  disabled={!date}
                  className={`
                    aspect-square flex items-center justify-center text-sm rounded-lg transition-all duration-300
                    ${!date ? 'invisible' : ''}
                    ${isToday(date) ? 'bg-blue-600 text-white font-bold hover:bg-blue-500' : ''}
                    ${isSelected(date) && !isToday(date) ? 'bg-slate-600 text-white' : ''}
                    ${!isToday(date) && !isSelected(date) ? 'text-slate-300 hover:bg-slate-700 hover:scale-110' : ''}
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Horários Disponíveis */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 mt-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Horários para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {horarios.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => slot.available && handleTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`
                    p-3 rounded-lg text-sm font-medium transition-all duration-300
                    ${slot.available
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600 hover:text-white hover:scale-110 cursor-pointer'
                      : 'bg-red-600/20 text-red-400 border border-red-600/30 cursor-not-allowed opacity-50'
                    }
                  `}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Estatísticas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Estatísticas</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300 group-hover:text-green-300 transition-colors">Confirmadas</span>
                </div>
                <span className="text-white font-bold">24</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300 group-hover:text-yellow-300 transition-colors">Pendentes</span>
                </div>
                <span className="text-white font-bold">8</span>
              </div>

              <div className="flex items-center justify-between group">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-300 group-hover:text-red-300 transition-colors">Canceladas</span>
                </div>
                <span className="text-white font-bold">3</span>
              </div>
            </div>
          </div>

          {/* Próximos Agendamentos */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Próximos Agendamentos</h3>

            <div className="space-y-3">
              {[
                { nome: 'Maria Silva', hora: '09:00', tipo: 'Consulta' },
                { nome: 'João Santos', hora: '10:30', tipo: 'Retorno' },
                { nome: 'Ana Costa', hora: '14:00', tipo: 'Exame' }
              ].map((agendamento, index) => (
                <div key={index} className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium group-hover:text-blue-200 transition-colors">{agendamento.nome}</span>
                    <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{agendamento.hora}</span>
                  </div>
                  <span className="text-slate-500 text-xs group-hover:text-slate-400 transition-colors">{agendamento.tipo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Search className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white">Buscar Paciente</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Calendar className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white">Ver Agenda Completa</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Filter className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white">Filtros Avançados</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Agendamento */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md mx-4 border border-slate-700 transform scale-100 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Novo Agendamento</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 bg-slate-700 hover:bg-slate-600 hover:scale-110 rounded-lg transition-all duration-300"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Nome do Paciente</label>
                <input
                  type="text"
                  required
                  value={formData.paciente}
                  onChange={(e) => setFormData({...formData, paciente: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Digite o nome do paciente"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Telefone</label>
                  <input
                    type="tel"
                    required
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Especialidade</label>
                <select
                  required
                  value={formData.especialidade}
                  onChange={(e) => setFormData({...formData, especialidade: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Selecione uma especialidade</option>
                  {especialidades.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Tipo de Consulta</label>
                <select
                  required
                  value={formData.tipoConsulta}
                  onChange={(e) => setFormData({...formData, tipoConsulta: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  <option value="">Selecione o tipo</option>
                  {tiposConsulta.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Data e Horário</label>
                <div className="bg-slate-700 rounded-lg px-3 py-2 text-white">
                  {selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Observações adicionais..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white rounded-lg transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300"
                >
                  <Save className="w-4 h-4" />
                  <span>Agendar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}