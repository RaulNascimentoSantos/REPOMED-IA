'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  Video,
  Phone,
  Calendar,
  Users,
  Monitor,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Settings,
  Share,
  MessageSquare,
  FileText,
  Camera,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  ScreenShare,
  Circle,
  Download,
  Upload,
  Heart,
  Activity,
  Stethoscope
} from 'lucide-react';

export default function TelemedicinaPage() {
  const [isInCall, setIsInCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<any>(null);

  const consultasAgendadas = [
    {
      id: 1,
      paciente: 'Maria Silva Santos',
      horario: '14:30',
      data: '2024-01-15',
      tipo: 'Consulta de Rotina',
      status: 'Agendada',
      avatar: 'MS',
      telefone: '(11) 99999-9999',
      observacoes: 'Acompanhamento diabetes',
      prioridade: 'Normal'
    },
    {
      id: 2,
      paciente: 'João Carlos Oliveira',
      horario: '15:00',
      data: '2024-01-15',
      tipo: 'Cardiologia',
      status: 'Em Andamento',
      avatar: 'JC',
      telefone: '(11) 77777-7777',
      observacoes: 'Avaliação pressão arterial',
      prioridade: 'Alta'
    },
    {
      id: 3,
      paciente: 'Ana Paula Costa',
      horario: '15:30',
      data: '2024-01-15',
      tipo: 'Neurologia',
      status: 'Agendada',
      avatar: 'AP',
      telefone: '(11) 55555-5555',
      observacoes: 'Consulta enxaqueca',
      prioridade: 'Normal'
    }
  ];

  const stats = {
    consultasHoje: 8,
    emAndamento: 1,
    concluidas: 5,
    agendadas: 2
  };

  const handleStartCall = (consulta: any) => {
    setSelectedConsulta(consulta);
    setIsInCall(true);
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setSelectedConsulta(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsRecording(false);
  };

  if (isInCall && selectedConsulta) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Header da Chamada */}
        <div className="bg-slate-800 p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">{selectedConsulta.avatar}</span>
              </div>
              <div>
                <h2 className="text-white font-semibold">{selectedConsulta.paciente}</h2>
                <p className="text-slate-400 text-sm">{selectedConsulta.tipo}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isRecording && (
                <div className="flex items-center space-x-2 bg-red-600/20 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 text-sm">Gravando</span>
                </div>
              )}
              <span className="text-slate-400 text-sm">15:23</span>
            </div>
          </div>
        </div>

        {/* Área da Videochamada */}
        <div className="flex-1 relative bg-slate-900">
          {/* Video Principal */}
          <div className="w-full h-full relative">
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-4xl font-bold">{selectedConsulta.avatar}</span>
                </div>
                <h3 className="text-white text-xl font-semibold">{selectedConsulta.paciente}</h3>
                <p className="text-slate-300">Conectado</p>
              </div>
            </div>

            {/* Video Local (Picture-in-Picture) */}
            <div className="absolute top-4 right-4 w-48 h-36 bg-slate-800 rounded-lg border border-slate-600 overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-green-900 to-blue-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-white text-lg font-bold">JS</span>
                  </div>
                  <p className="text-white text-sm">Dr. João Silva</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controles da Chamada */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-slate-800/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-600">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                  isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-6 h-6 text-white" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )}
              </button>

              <button
                onClick={() => setIsVideoOff(!isVideoOff)}
                className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                  isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {isVideoOff ? (
                  <VideoOff className="w-6 h-6 text-white" />
                ) : (
                  <Video className="w-6 h-6 text-white" />
                )}
              </button>

              <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-300 hover:scale-110">
                <ScreenShare className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={() => setIsRecording(!isRecording)}
                className={`p-4 rounded-full transition-all duration-300 hover:scale-110 ${
                  isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <Circle className="w-6 h-6 text-white" />
              </button>

              <button className="p-4 bg-slate-700 hover:bg-slate-600 rounded-full transition-all duration-300 hover:scale-110">
                <MessageSquare className="w-6 h-6 text-white" />
              </button>

              <button
                onClick={handleEndCall}
                className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300 hover:scale-110"
              >
                <PhoneOff className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar de Ferramentas */}
        <div className="absolute top-20 left-4 w-64 bg-slate-800/90 backdrop-blur-sm rounded-xl p-4 border border-slate-600">
          <h3 className="text-white font-semibold mb-4">Ferramentas</h3>
          <div className="space-y-2">
            <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
              <FileText className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="text-white">Nova Prescrição</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
              <Camera className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="text-white">Capturar Imagem</span>
            </button>
            <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
              <Upload className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
              <span className="text-white">Enviar Arquivo</span>
            </button>
          </div>
        </div>
        </div>
    );
  }

  return (
    <div className="p-6">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Telemedicina</h1>
          <p className="text-slate-400">Consultas virtuais e atendimento remoto</p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 hover:scale-105 text-white rounded-lg transition-all duration-300">
            <Settings className="w-4 h-4" />
            <span>Configurações</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300">
            <Video className="w-4 h-4" />
            <span>Nova Consulta</span>
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-blue-300 transition-colors">Consultas Hoje</p>
              <p className="text-2xl font-bold text-white group-hover:text-blue-100 transition-colors">{stats.consultasHoje}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-green-300 transition-colors">Em Andamento</p>
              <p className="text-2xl font-bold text-white group-hover:text-green-100 transition-colors">{stats.emAndamento}</p>
            </div>
            <Activity className="w-8 h-8 text-green-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-purple-300 transition-colors">Concluídas</p>
              <p className="text-2xl font-bold text-white group-hover:text-purple-100 transition-colors">{stats.concluidas}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 transform hover:scale-105 transition-all duration-300 group cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm group-hover:text-yellow-300 transition-colors">Agendadas</p>
              <p className="text-2xl font-bold text-white group-hover:text-yellow-100 transition-colors">{stats.agendadas}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500 group-hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Consultas */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6">Consultas de Hoje</h2>

            <div className="space-y-4">
              {consultasAgendadas.map((consulta) => (
                <div
                  key={consulta.id}
                  className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-semibold">{consulta.avatar}</span>
                      </div>

                      <div>
                        <h3 className="text-white font-semibold group-hover:text-blue-200 transition-colors">{consulta.paciente}</h3>
                        <div className="flex items-center space-x-3 text-slate-400 text-sm mt-1">
                          <span>{consulta.horario}</span>
                          <span>•</span>
                          <span>{consulta.tipo}</span>
                          <span>•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            consulta.prioridade === 'Alta' ? 'bg-red-600/20 text-red-400' : 'bg-green-600/20 text-green-400'
                          }`}>
                            {consulta.prioridade}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xs mt-1">{consulta.observacoes}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        consulta.status === 'Em Andamento' ? 'bg-green-600 text-white' :
                        consulta.status === 'Agendada' ? 'bg-blue-600 text-white' :
                        'bg-slate-600 text-white'
                      }`}>
                        {consulta.status}
                      </span>

                      {consulta.status === 'Agendada' && (
                        <button
                          onClick={() => handleStartCall(consulta)}
                          className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 hover:scale-110 text-white rounded-lg transition-all duration-300"
                        >
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Iniciar</span>
                        </button>
                      )}

                      {consulta.status === 'Em Andamento' && (
                        <button
                          onClick={() => handleStartCall(consulta)}
                          className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-110 text-white rounded-lg transition-all duration-300"
                        >
                          <Monitor className="w-4 h-4" />
                          <span className="text-sm">Entrar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Teste de Conexão */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Teste de Conexão</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Velocidade da Internet</span>
                <span className="text-green-400 font-medium">50 Mbps</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Latência</span>
                <span className="text-green-400 font-medium">15ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Qualidade de Vídeo</span>
                <span className="text-green-400 font-medium">HD</span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300">
              Testar Novamente
            </button>
          </div>

          {/* Configurações Rápidas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Configurações</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Câmera</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Microfone</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-300">Gravação Automática</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300">
            <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>

            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Calendar className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white">Agendar Consulta</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Download className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white">Ver Gravações</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Share className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white">Compartilhar Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}