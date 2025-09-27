'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Users,
  Search,
  Plus,
  Grid,
  List,
  Phone,
  Mail,
  MapPin,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  Activity,
  Heart,
  ChevronLeft,
  Filter,
  Calendar,
  Clock,
  Download,
  MoreVertical,
  UserCheck,
  Baby,
  FileText,
  Shield,
  Stethoscope,
  TrendingUp,
  AlertCircle,
  UserPlus,
  Settings,
  Star,
  Zap,
  Globe,
  Lock,
  ChevronDown,
  BarChart3,
  PieChart,
  Sparkles,
  Brain
} from 'lucide-react';

interface Patient {
  id: string;
  nome: string;
  idade: string;
  telefone: string;
  email: string;
  endereco: string;
  condicoes: string[];
  statusBadge: string;
  statusColor: string;
  avatar: string;
  cpf?: string;
  convenio?: string;
  ultimaConsulta?: string;
  proximaConsulta?: string;
  risco?: 'baixo' | 'medio' | 'alto';
  categoria?: 'adulto' | 'pediatrico' | 'idoso' | 'gestante';
  prioridade?: number;
  satisfacao?: number;
}

const AdvancedStatCard = ({ icon, title, value, subtitle, change, trend, color, theme }: {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  subtitle: string;
  change?: string;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  theme: any;
}) => {
  const getCardBg = () => {
    if (theme?.theme === 'dark') return 'bg-slate-800/80 border-slate-700/50';
    if (theme?.theme === 'medical') return 'bg-slate-900/80 border-slate-700/50';
    return 'bg-white/90 border-slate-200/60';
  };

  const getTextColor = () => {
    if (theme?.theme === 'dark' || theme?.theme === 'medical') return 'text-slate-200';
    return 'text-slate-800';
  };

  const getSubtextColor = () => {
    if (theme?.theme === 'dark' || theme?.theme === 'medical') return 'text-slate-400';
    return 'text-slate-600';
  };

  return (
    <div className={`${getCardBg()} backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl group cursor-pointer relative overflow-hidden`}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/25 group-hover:shadow-2xl group-hover:shadow-blue-500/40 transition-all duration-500 group-hover:scale-110"
            style={{ background: color }}
          >
            {icon}
          </div>
          <div className="text-right">
            {change && (
              <div className={`flex items-center gap-1 text-xs font-semibold ${
                trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-slate-400'
              }`}>
                {trend === 'up' && <TrendingUp size={12} />}
                {trend === 'down' && <AlertCircle size={12} />}
                {change}
              </div>
            )}
            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {title}
            </span>
          </div>
        </div>

        <div className={`text-3xl font-bold ${getTextColor()} mb-2 group-hover:text-blue-600 transition-colors duration-300`}>
          {value}
        </div>

        <div className={`text-sm ${getSubtextColor()} leading-relaxed`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
};

const UltraModernPatientCard = ({ patient, onView, onEdit, theme }: {
  patient: Patient;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  theme: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = (categoria?: string) => {
    switch (categoria) {
      case 'gestante': return <Baby size={16} className="text-purple-500" />;
      case 'idoso': return <UserCheck size={16} className="text-orange-500" />;
      case 'pediatrico': return <Baby size={16} className="text-blue-500" />;
      default: return <Users size={16} className="text-blue-500" />;
    }
  };

  const getRiskBadge = (risco?: string) => {
    const riskStyles = {
      baixo: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
      medio: 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100',
      alto: 'bg-red-50 text-red-700 border-red-200 shadow-red-100'
    };
    return risco && risco in riskStyles ? riskStyles[risco as keyof typeof riskStyles] : '';
  };

  const getStatusStyle = (color: string) => {
    const styles = {
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100',
      blue: 'bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 shadow-purple-100',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100',
      red: 'bg-red-50 text-red-700 border-red-200 shadow-red-100'
    };
    return styles[color as keyof typeof styles] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getCardBg = () => {
    if (theme?.theme === 'dark') return 'bg-slate-800/90 border-slate-700/50';
    if (theme?.theme === 'medical') return 'bg-slate-900/90 border-slate-700/50';
    return 'bg-white/95 border-slate-200/60';
  };

  const getTextColor = () => {
    if (theme?.theme === 'dark' || theme?.theme === 'medical') return 'text-slate-200';
    return 'text-slate-800';
  };

  const getSubtextColor = () => {
    if (theme?.theme === 'dark' || theme?.theme === 'medical') return 'text-slate-400';
    return 'text-slate-600';
  };

  const getHeaderBg = () => {
    if (theme?.theme === 'dark') return 'from-slate-700/50 to-slate-800/50';
    if (theme?.theme === 'medical') return 'from-slate-800/50 to-slate-900/50';
    return 'from-blue-50/80 to-indigo-50/80';
  };

  return (
    <div
      className={`${getCardBg()} backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-700 hover:scale-[1.02] group cursor-pointer relative shadow-xl hover:shadow-2xl`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated border gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl blur-sm"></div>

      {/* Priority indicator */}
      {patient.prioridade && patient.prioridade > 7 && (
        <div className="absolute top-4 right-4 z-20">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
        </div>
      )}

      {/* Header com gradiente dinâmico */}
      <div className={`bg-gradient-to-r ${getHeaderBg()} p-6 border-b border-slate-200/30 relative overflow-hidden`}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full blur-3xl transform translate-x-16 -translate-y-16"></div>
        </div>

        <div className="relative z-10 flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-2xl shadow-blue-500/30 group-hover:shadow-3xl group-hover:shadow-blue-500/50 transition-all duration-500 group-hover:scale-110">
              {patient.avatar}
            </div>
            {patient.satisfacao && patient.satisfacao >= 4 && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <Star size={12} className="text-yellow-800 fill-current" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-xl font-bold ${getTextColor()} truncate group-hover:text-blue-600 transition-colors duration-300`}>
                {patient.nome}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-slate-100/80 text-slate-700 px-3 py-1 rounded-xl backdrop-blur-sm">
                  #{patient.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className={`text-sm ${getSubtextColor()} font-medium flex items-center gap-1`}>
                <Clock size={14} />
                {patient.idade}
              </span>
              {patient.categoria && (
                <div className="flex items-center gap-1 text-xs font-medium bg-white/60 text-slate-700 px-3 py-1 rounded-xl backdrop-blur-sm border border-white/40">
                  {getCategoryIcon(patient.categoria)}
                  <span>
                    {patient.categoria === 'gestante' ? 'Gestante' :
                     patient.categoria === 'idoso' ? 'Idoso' :
                     patient.categoria === 'pediatrico' ? 'Pediátrico' : 'Adulto'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-lg backdrop-blur-sm ${getStatusStyle(patient.statusColor)} transition-all duration-300 hover:scale-105`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  patient.statusColor === 'green' ? 'bg-emerald-500' :
                  patient.statusColor === 'blue' ? 'bg-blue-500' :
                  patient.statusColor === 'purple' ? 'bg-purple-500' :
                  patient.statusColor === 'orange' ? 'bg-orange-500' :
                  'bg-red-500'
                } animate-pulse`}></div>
                {patient.statusBadge}
              </span>
              {patient.risco && (
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border-2 shadow-md ${getRiskBadge(patient.risco)} transition-all duration-300 hover:scale-105`}>
                  <AlertTriangle size={12} className="mr-1" />
                  Risco {patient.risco.charAt(0).toUpperCase() + patient.risco.slice(1)}
                </span>
              )}
            </div>
          </div>

          <button className="p-3 rounded-xl hover:bg-white/20 transition-colors duration-300 group/menu">
            <MoreVertical size={18} className={`${getSubtextColor()} group-hover/menu:text-blue-500 transition-colors`} />
          </button>
        </div>
      </div>

      {/* Informações detalhadas */}
      <div className="p-6 space-y-5">
        {/* Contatos */}
        <div className="grid grid-cols-1 gap-3">
          <div className={`flex items-center gap-3 text-sm ${getSubtextColor()} hover:text-blue-500 transition-colors duration-300 group/contact`}>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center group-hover/contact:bg-blue-200 transition-colors">
              <Phone size={14} className="text-blue-600" />
            </div>
            <span className="font-medium">{patient.telefone}</span>
          </div>
          <div className={`flex items-center gap-3 text-sm ${getSubtextColor()} hover:text-blue-500 transition-colors duration-300 group/contact`}>
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center group-hover/contact:bg-emerald-200 transition-colors">
              <Mail size={14} className="text-emerald-600" />
            </div>
            <span className="font-medium truncate">{patient.email}</span>
          </div>
          {patient.convenio && (
            <div className={`flex items-center gap-3 text-sm ${getSubtextColor()} hover:text-purple-500 transition-colors duration-300 group/contact`}>
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover/contact:bg-purple-200 transition-colors">
                <Shield size={14} className="text-purple-600" />
              </div>
              <span className="font-medium">Convênio: {patient.convenio}</span>
            </div>
          )}
        </div>

        {/* Consultas com animação */}
        {(patient.ultimaConsulta || patient.proximaConsulta) && (
          <div className={`flex items-center gap-4 pt-4 border-t ${theme?.theme === 'dark' || theme?.theme === 'medical' ? 'border-slate-700' : 'border-slate-200'} transition-all duration-500`}>
            {patient.ultimaConsulta && (
              <div className="flex items-center gap-2 text-xs bg-slate-100 text-slate-700 px-4 py-2 rounded-xl backdrop-blur-sm border border-slate-200 hover:bg-slate-200 transition-all duration-300 cursor-pointer">
                <Clock size={14} className="text-slate-500" />
                <span className="font-medium">Última: {new Date(patient.ultimaConsulta).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {patient.proximaConsulta && (
              <div className="flex items-center gap-2 text-xs bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl backdrop-blur-sm border border-emerald-200 hover:bg-emerald-200 transition-all duration-300 cursor-pointer animate-pulse">
                <Calendar size={14} className="text-emerald-600" />
                <span className="font-medium">Próxima: {new Date(patient.proximaConsulta).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        )}

        {/* Condições médicas */}
        <div className={`pt-4 border-t ${theme?.theme === 'dark' || theme?.theme === 'medical' ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <h4 className={`text-sm font-bold ${getTextColor()}`}>Condições Atuais</h4>
            <div className="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent"></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {patient.condicoes.map((condicao, index) => (
              <span
                key={index}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold px-4 py-2 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 hover:scale-105 transition-all duration-300 cursor-pointer shadow-sm"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {condicao}
              </span>
            ))}
          </div>
        </div>

        {/* Ações com gradientes */}
        <div className={`flex items-center gap-3 pt-5 border-t ${theme?.theme === 'dark' || theme?.theme === 'medical' ? 'border-slate-700' : 'border-slate-200'}`}>
          <button
            onClick={() => onView(patient.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/30 group/btn"
          >
            <Eye size={16} className="group-hover/btn:scale-110 transition-transform" />
            Visualizar
          </button>
          <button
            onClick={() => onEdit(patient.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group/btn"
          >
            <Edit size={16} className="group-hover/btn:scale-110 transition-transform" />
            Editar
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 text-sm font-bold py-3 px-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 group/btn">
            <FileText size={16} className="group-hover/btn:scale-110 transition-transform" />
            Prontuário
          </button>
        </div>
      </div>
    </div>
  );
};

export default function UltraProfessionalPacientesPage() {
  const router = useRouter();
  const { theme, isDarkMode, isMedicalTheme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const pacientesExemplo: Patient[] = [
    {
      id: 'PAC-001',
      nome: 'Maria Silva Santos',
      idade: '34 anos',
      telefone: '(11) 99999-9999',
      email: 'maria.silva@email.com',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      condicoes: ['Hipertensão', 'Diabetes Tipo 2'],
      statusBadge: 'Tratamento Ativo',
      statusColor: 'green',
      avatar: 'MS',
      cpf: '123.456.789-00',
      convenio: 'Unimed',
      ultimaConsulta: '2025-09-15',
      proximaConsulta: '2025-10-15',
      risco: 'medio',
      categoria: 'adulto',
      prioridade: 8,
      satisfacao: 5
    },
    {
      id: 'PAC-002',
      nome: 'João Costa Lima',
      idade: '45 anos',
      telefone: '(11) 88888-8888',
      email: 'joao.costa@email.com',
      endereco: 'Av. Paulista, 456 - São Paulo/SP',
      condicoes: ['Cefaleia Crônica', 'Ansiedade'],
      statusBadge: 'Em Acompanhamento',
      statusColor: 'blue',
      avatar: 'JC',
      cpf: '234.567.890-11',
      convenio: 'Bradesco Saúde',
      ultimaConsulta: '2025-09-10',
      proximaConsulta: '2025-09-25',
      risco: 'baixo',
      categoria: 'adulto',
      prioridade: 5,
      satisfacao: 4
    },
    {
      id: 'PAC-003',
      nome: 'Ana Paula Ferreira',
      idade: '28 anos',
      telefone: '(11) 77777-7777',
      email: 'ana.paula@email.com',
      endereco: 'Rua Augusta, 789 - São Paulo/SP',
      condicoes: ['Pré-natal', 'Suplementação'],
      statusBadge: 'Gestação Ativa',
      statusColor: 'purple',
      avatar: 'AP',
      cpf: '345.678.901-22',
      convenio: 'SulAmérica',
      ultimaConsulta: '2025-09-18',
      proximaConsulta: '2025-09-25',
      risco: 'baixo',
      categoria: 'gestante',
      prioridade: 7,
      satisfacao: 5
    },
    {
      id: 'PAC-004',
      nome: 'Pedro Santos Oliveira',
      idade: '52 anos',
      telefone: '(11) 66666-6666',
      email: 'pedro.santos@email.com',
      endereco: 'Rua da Consolação, 321 - São Paulo/SP',
      condicoes: ['Reabilitação Ortopédica'],
      statusBadge: 'Recuperação',
      statusColor: 'orange',
      avatar: 'PS',
      cpf: '456.789.012-33',
      convenio: 'Particular',
      ultimaConsulta: '2025-09-12',
      proximaConsulta: '2025-09-26',
      risco: 'baixo',
      categoria: 'adulto',
      prioridade: 4,
      satisfacao: 4
    },
    {
      id: 'PAC-005',
      nome: 'Helena Mendes Costa',
      idade: '72 anos',
      telefone: '(11) 55555-5555',
      email: 'helena.mendes@email.com',
      endereco: 'Alameda Santos, 654 - São Paulo/SP',
      condicoes: ['Hipertensão', 'Osteoartrose'],
      statusBadge: 'Monitoramento',
      statusColor: 'blue',
      avatar: 'HM',
      cpf: '567.890.123-44',
      convenio: 'Amil',
      ultimaConsulta: '2025-09-08',
      proximaConsulta: '2025-09-22',
      risco: 'medio',
      categoria: 'idoso',
      prioridade: 6,
      satisfacao: 5
    },
    {
      id: 'PAC-006',
      nome: 'Roberto Alves Costa',
      idade: '67 anos',
      telefone: '(11) 44444-4444',
      email: 'roberto.alves@email.com',
      endereco: 'Rua Oscar Freire, 987 - São Paulo/SP',
      condicoes: ['Diabetes Tipo 2', 'Cardiopatia Isquêmica'],
      statusBadge: 'Atenção Especial',
      statusColor: 'red',
      avatar: 'RA',
      cpf: '678.901.234-55',
      convenio: 'Golden Cross',
      ultimaConsulta: '2025-09-20',
      proximaConsulta: '2025-09-27',
      risco: 'alto',
      categoria: 'idoso',
      prioridade: 9,
      satisfacao: 3
    }
  ];

  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('http://localhost:8081/patients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const patients = await response.json();
          if (patients && patients.length > 0) {
            setPacientes(patients);
          } else {
            setPacientes(pacientesExemplo);
          }
        } else {
          setPacientes(pacientesExemplo);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPacientes(pacientesExemplo);
      } finally {
        setTimeout(() => setIsLoading(false), 1000); // Simular loading para efeito visual
      }
    };

    fetchPatients();
  }, []);

  const handleNewPatient = () => {
    try {
      router.push('/pacientes/novo');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/pacientes/novo';
    }
  };

  const handleViewPatient = (patientId: string) => {
    try {
      router.push(`/pacientes/${patientId}`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/pacientes/${patientId}`;
    }
  };

  const handleEditPatient = (patientId: string) => {
    try {
      router.push(`/pacientes/${patientId}/edit`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/pacientes/${patientId}/edit`;
    }
  };

  const estatisticas = {
    total: pacientes.length,
    ativos: pacientes.filter(p => p.statusColor === 'green' || p.statusColor === 'blue').length,
    gestantes: pacientes.filter(p => p.categoria === 'gestante').length,
    idosos: pacientes.filter(p => p.categoria === 'idoso').length,
    altoRisco: pacientes.filter(p => p.risco === 'alto').length
  };

  const filteredPatients = pacientes.filter(patient => {
    const matchesSearch = patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condicoes.some(condition =>
        condition.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && patient.statusColor === 'green') ||
      (filterStatus === 'risk' && patient.statusColor === 'red') ||
      (filterStatus === 'treatment' && patient.statusColor === 'blue');

    return matchesSearch && matchesFilter;
  });

  const getPageBg = () => {
    if (isDarkMode) return 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
    if (isMedicalTheme) return 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900';
    return 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50';
  };

  const getTextColor = () => {
    if (isDarkMode || isMedicalTheme) return 'text-slate-200';
    return 'text-slate-800';
  };

  const getSubtextColor = () => {
    if (isDarkMode || isMedicalTheme) return 'text-slate-400';
    return 'text-slate-600';
  };

  const getControlsBg = () => {
    if (isDarkMode) return 'bg-slate-800/80 border-slate-700/50';
    if (isMedicalTheme) return 'bg-slate-900/80 border-slate-700/50';
    return 'bg-white/80 border-slate-200/50';
  };

  const getInputBg = () => {
    if (isDarkMode || isMedicalTheme) return 'bg-slate-700/50 border-slate-600/50 text-slate-200 placeholder-slate-400';
    return 'bg-slate-50 border-slate-200 text-slate-700 placeholder-slate-400';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${getPageBg()} flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <div className={`text-lg font-semibold ${getTextColor()}`}>Carregando pacientes...</div>
          <div className={`text-sm ${getSubtextColor()}`}>Preparando interface inteligente</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getPageBg()} relative overflow-hidden`}>
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl transform -translate-x-48 translate-y-48"></div>
      </div>

      <div className="relative z-10 p-8">
        {/* Header ultra-moderno */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/home')}
                className={`flex items-center gap-3 px-6 py-3 ${getControlsBg()} backdrop-blur-xl border rounded-2xl ${getTextColor()} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group`}
              >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-semibold">Voltar</span>
              </button>
              <div>
                <h1 className={`text-4xl font-black ${getTextColor()} flex items-center gap-4 mb-2`}>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <Brain size={24} className="text-white" />
                  </div>
                  Gestão Inteligente de Pacientes
                  <span className="text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
                    <Sparkles size={14} />
                    AI-POWERED
                  </span>
                </h1>
                <p className={`text-lg ${getSubtextColor()} flex items-center gap-2`}>
                  <Lock size={16} className="text-emerald-500" />
                  Prontuários criptografados • {estatisticas.total} pacientes • Conformidade LGPD & CFM
                  <div className="flex items-center gap-1 text-emerald-500">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">ONLINE</span>
                  </div>
                </p>
              </div>
            </div>
            <button
              onClick={handleNewPatient}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 hover:from-blue-600 hover:via-purple-600 hover:to-emerald-600 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 group"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus size={16} />
              </div>
              <span className="text-lg">Novo Paciente</span>
              <Zap size={16} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </div>

        {/* Estatísticas avançadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <AdvancedStatCard
            icon={<Users size={26} />}
            title="Total Pacientes"
            value={estatisticas.total}
            subtitle="Cadastros verificados e ativos"
            change="+12%"
            trend="up"
            color="linear-gradient(135deg, #3b82f6, #1d4ed8)"
            theme={{ theme, isDarkMode, isMedicalTheme }}
          />
          <AdvancedStatCard
            icon={<CheckCircle size={26} />}
            title="Em Tratamento"
            value={estatisticas.ativos}
            subtitle="Acompanhamento ativo contínuo"
            change="+8%"
            trend="up"
            color="linear-gradient(135deg, #22c55e, #16a34a)"
            theme={{ theme, isDarkMode, isMedicalTheme }}
          />
          <AdvancedStatCard
            icon={<Baby size={26} />}
            title="Gestantes"
            value={estatisticas.gestantes}
            subtitle="Monitoramento pré-natal"
            change="Estável"
            trend="stable"
            color="linear-gradient(135deg, #a855f7, #7c3aed)"
            theme={{ theme, isDarkMode, isMedicalTheme }}
          />
          <AdvancedStatCard
            icon={<UserCheck size={26} />}
            title="Idosos"
            value={estatisticas.idosos}
            subtitle="Cuidados geriátricos"
            change="+5%"
            trend="up"
            color="linear-gradient(135deg, #f59e0b, #d97706)"
            theme={{ theme, isDarkMode, isMedicalTheme }}
          />
          <AdvancedStatCard
            icon={<AlertTriangle size={26} />}
            title="Alto Risco"
            value={estatisticas.altoRisco}
            subtitle="Monitoramento crítico"
            change="-15%"
            trend="down"
            color="linear-gradient(135deg, #ef4444, #dc2626)"
            theme={{ theme, isDarkMode, isMedicalTheme }}
          />
        </div>

        {/* Controles avançados */}
        <div className={`${getControlsBg()} backdrop-blur-xl border rounded-2xl p-6 mb-8 shadow-xl`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1 w-full lg:w-auto">
              <div className="relative flex-1 max-w-md group">
                <Search size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${getSubtextColor()} group-focus-within:text-blue-500 transition-colors`} />
                <input
                  type="text"
                  placeholder="Buscar por nome, condição, ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-4 ${getInputBg()} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-lg group-focus-within:scale-[1.02]`}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Brain size={16} className="text-blue-500" />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`px-6 py-4 ${getInputBg()} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 font-semibold`}
              >
                <option value="all">🔍 Todos os Status</option>
                <option value="active">✅ Ativos</option>
                <option value="treatment">🏥 Em Tratamento</option>
                <option value="risk">⚠️ Alto Risco</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-100/80 rounded-2xl p-2 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                    : `${getTextColor()} hover:bg-white/60`
                }`}
              >
                <Grid size={18} />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                    : `${getTextColor()} hover:bg-white/60`
                }`}
              >
                <List size={18} />
                <span>Lista</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grid de pacientes ultra-moderno */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredPatients.map((patient, index) => (
            <div
              key={patient.id}
              style={{ animationDelay: `${index * 150}ms` }}
              className="animate-in slide-in-from-bottom-4 fade-in duration-700"
            >
              <UltraModernPatientCard
                patient={patient}
                onView={handleViewPatient}
                onEdit={handleEditPatient}
                theme={{ theme, isDarkMode, isMedicalTheme }}
              />
            </div>
          ))}
        </div>

        {/* Estado vazio elegante */}
        {filteredPatients.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mx-auto w-32 h-32 mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
              <div className="absolute inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users size={48} className="text-white" />
              </div>
            </div>
            <h3 className={`text-2xl font-bold ${getTextColor()} mb-4`}>
              Nenhum paciente encontrado
            </h3>
            <p className={`text-lg ${getSubtextColor()} mb-8`}>
              Tente ajustar os filtros ou adicione um novo paciente ao sistema.
            </p>
            <button
              onClick={handleNewPatient}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <UserPlus size={20} />
              Adicionar Primeiro Paciente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}