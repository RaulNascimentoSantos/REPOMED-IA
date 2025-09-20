'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import {
  User,
  Camera,
  Edit,
  Save,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Award,
  FileText,
  Activity,
  Clock,
  TrendingUp,
  Users,
  Stethoscope,
  Heart,
  Brain,
  Shield,
  Star,
  Badge,
  Settings,
  Bell,
  Eye,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nome: 'Dr. João Silva',
    especialidade: 'Clínica Geral',
    crm: 'CRM SP 123456',
    email: 'dr.silva@repomed.com.br',
    telefone: '(11) 99999-9999',
    endereco: 'São Paulo, SP',
    bio: 'Médico especialista em clínica geral com mais de 10 anos de experiência, dedicado ao atendimento humanizado e cuidado integral dos pacientes.',
    formacao: 'Universidade de São Paulo - USP',
    anoFormacao: '2013',
    residencia: 'Hospital das Clínicas - USP'
  });

  const estatisticas = {
    pacientesAtendidos: 1247,
    consultasHoje: 24,
    documentosGerados: 3891,
    avaliacaoMedia: 4.9,
    anosExperiencia: 10,
    certificacoes: 8
  };

  const especialidades = [
    { nome: 'Clínica Geral', icon: Stethoscope, nivel: 'Especialista' },
    { nome: 'Cardiologia', icon: Heart, nivel: 'Básico' },
    { nome: 'Neurologia', icon: Brain, nivel: 'Intermediário' }
  ];

  const certificacoes = [
    { nome: 'Título de Especialista em Medicina de Família', ano: '2015' },
    { nome: 'Certificação em Telemedicina', ano: '2020' },
    { nome: 'Curso Avançado em Emergências', ano: '2021' },
    { nome: 'Especialização em Geriatria', ano: '2022' }
  ];

  const handleSave = () => {
    setIsEditing(false);
    // Aqui salvaria os dados
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <BackButton href="/" inline />
          <div>
            <h1 className="text-2xl font-bold text-white">Perfil do Usuário</h1>
            <p className="text-slate-400">Gerencie suas informações pessoais</p>
          </div>
        </div>
      </div>

      {/* Header do Perfil */}
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
        <div className="flex items-start space-x-6">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold group-hover:bg-blue-500 group-hover:scale-105 transition-all duration-300">
              JS
            </div>
            <button className="absolute bottom-0 right-0 w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center text-white hover:bg-slate-600 hover:scale-110 transition-all duration-300 group">
              <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Informações Principais */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.nome}
                    onChange={(e) => setProfileData({...profileData, nome: e.target.value})}
                    className="text-2xl font-bold text-white bg-slate-700 border border-slate-600 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-white hover:text-blue-200 transition-colors">{profileData.nome}</h1>
                )}

                <div className="flex items-center space-x-4 mt-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.especialidade}
                      onChange={(e) => setProfileData({...profileData, especialidade: e.target.value})}
                      className="text-blue-400 bg-slate-700 border border-slate-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  ) : (
                    <span className="text-blue-400 font-medium hover:text-blue-300 transition-colors">{profileData.especialidade}</span>
                  )}

                  <span className="text-slate-400">•</span>

                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.crm}
                      onChange={(e) => setProfileData({...profileData, crm: e.target.value})}
                      className="text-slate-400 bg-slate-700 border border-slate-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  ) : (
                    <span className="text-slate-400 hover:text-slate-300 transition-colors">{profileData.crm}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-1 rounded-full hover:bg-yellow-500/30 transition-colors group">
                  <Star className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-yellow-400 font-medium">{estatisticas.avaliacaoMedia}</span>
                </div>

                {isEditing ? (
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 hover:scale-105 text-white rounded-lg transition-all duration-300"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white rounded-lg transition-all duration-300"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mb-4">
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  rows={3}
                  className="w-full text-slate-300 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 transition-all"
                />
              ) : (
                <p className="text-slate-300 hover:text-slate-200 transition-colors">{profileData.bio}</p>
              )}
            </div>

            {/* Informações de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2 group">
                <Mail className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="text-slate-300 bg-slate-700 border border-slate-600 rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                ) : (
                  <span className="text-slate-300 group-hover:text-blue-300 transition-colors">{profileData.email}</span>
                )}
              </div>

              <div className="flex items-center space-x-2 group">
                <Phone className="w-4 h-4 text-slate-400 group-hover:text-green-400 group-hover:scale-110 transition-all" />
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.telefone}
                    onChange={(e) => setProfileData({...profileData, telefone: e.target.value})}
                    className="text-slate-300 bg-slate-700 border border-slate-600 rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                ) : (
                  <span className="text-slate-300 group-hover:text-green-300 transition-colors">{profileData.telefone}</span>
                )}
              </div>

              <div className="flex items-center space-x-2 group">
                <MapPin className="w-4 h-4 text-slate-400 group-hover:text-purple-400 group-hover:scale-110 transition-all" />
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.endereco}
                    onChange={(e) => setProfileData({...profileData, endereco: e.target.value})}
                    className="text-slate-300 bg-slate-700 border border-slate-600 rounded px-2 py-1 flex-1 focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                ) : (
                  <span className="text-slate-300 group-hover:text-purple-300 transition-colors">{profileData.endereco}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Estatísticas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Métricas Principais */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 hover:text-blue-200 transition-colors">Estatísticas</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-blue-500 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 cursor-pointer">
                  <Users className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">{estatisticas.pacientesAtendidos.toLocaleString()}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Pacientes Atendidos</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-green-500 hover:scale-110 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 cursor-pointer">
                  <Calendar className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-green-200 transition-colors">{estatisticas.consultasHoje}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Consultas Hoje</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-purple-500 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer">
                  <FileText className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-purple-200 transition-colors">{estatisticas.documentosGerados.toLocaleString()}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Documentos</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-yellow-500 hover:scale-110 hover:shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 cursor-pointer">
                  <Star className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-yellow-200 transition-colors">{estatisticas.avaliacaoMedia}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Avaliação</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-orange-500 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 cursor-pointer">
                  <Clock className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-orange-200 transition-colors">{estatisticas.anosExperiencia}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Anos Experiência</p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 hover:bg-red-500 hover:scale-110 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 cursor-pointer">
                  <Award className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-2xl font-bold text-white group-hover:text-red-200 transition-colors">{estatisticas.certificacoes}</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Certificações</p>
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
            <h2 className="text-xl font-semibold text-white mb-6 hover:text-purple-200 transition-colors">Especialidades</h2>

            <div className="space-y-4">
              {especialidades.map((especialidade, index) => {
                const Icon = especialidade.icon;
                const nivelColor = especialidade.nivel === 'Especialista' ? 'bg-green-600' :
                                 especialidade.nivel === 'Intermediário' ? 'bg-yellow-600' : 'bg-blue-600';

                return (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 hover:scale-105 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${nivelColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium group-hover:text-blue-200 transition-colors">{especialidade.nome}</h3>
                        <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">Nível: {especialidade.nivel}</p>
                      </div>
                    </div>
                    <Badge className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Formação */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
            <h2 className="text-lg font-semibold text-white mb-4 hover:text-green-200 transition-colors">Formação</h2>

            <div className="space-y-4">
              <div className="group">
                <h3 className="text-white font-medium group-hover:text-blue-200 transition-colors">Graduação</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{profileData.formacao}</p>
                <p className="text-slate-500 text-xs group-hover:text-slate-400 transition-colors">Formado em {profileData.anoFormacao}</p>
              </div>

              <div className="group">
                <h3 className="text-white font-medium group-hover:text-blue-200 transition-colors">Residência</h3>
                <p className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{profileData.residencia}</p>
                <p className="text-slate-500 text-xs group-hover:text-slate-400 transition-colors">2013 - 2015</p>
              </div>
            </div>
          </div>

          {/* Certificações */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10 transition-all duration-300">
            <h2 className="text-lg font-semibold text-white mb-4 hover:text-yellow-200 transition-colors">Certificações</h2>

            <div className="space-y-3">
              {certificacoes.map((cert, index) => (
                <div key={index} className="p-3 bg-slate-700 rounded-lg hover:bg-slate-600 hover:scale-105 transition-all duration-300 group cursor-pointer">
                  <h3 className="text-white font-medium text-sm group-hover:text-blue-200 transition-colors">{cert.nome}</h3>
                  <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors">{cert.ano}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações Rápidas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
            <h2 className="text-lg font-semibold text-white mb-4 hover:text-blue-200 transition-colors">Ações</h2>

            <div className="space-y-2">
              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Settings className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white group-hover:text-blue-200 transition-colors">Configurações</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Bell className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white group-hover:text-yellow-200 transition-colors">Notificações</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Shield className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white group-hover:text-green-200 transition-colors">Privacidade</span>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 bg-slate-700 hover:bg-slate-600 hover:scale-105 rounded-lg transition-all duration-300 text-left group">
                <Lock className="w-5 h-5 text-slate-400 group-hover:text-white group-hover:scale-110 transition-all" />
                <span className="text-white group-hover:text-red-200 transition-colors">Segurança</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}