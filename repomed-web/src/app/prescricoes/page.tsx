'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import {
  Pill,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  Clock,
  Eye,
  Edit,
  Printer,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  Trash2
} from 'lucide-react';
interface Prescription {
  id: string;
  paciente: string;
  medicamentos: string[];
  dataEmissao: string;
  dataValidade: string;
  status: string;
  statusColor: string;
  crm: string;
  observacoes: string;
  numeroReceita: string;
  createdAt: string;
}

export default function PrescricoesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todas');
  const [prescricoes, setPrescricoes] = useState<Prescription[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: 'default' | 'destructive' | 'medical';
    prescriptionSummary?: any;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  useEffect(() => {
    // Load prescriptions from Fastify API
    const fetchPrescriptions = async () => {
      try {
        const response = await fetch('http://localhost:8081/prescriptions', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const prescriptions = await response.json();
          setPrescricoes(prescriptions);
        } else {
          console.error('Failed to fetch prescriptions from API');
          setPrescricoes([]);
        }
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        setPrescricoes([]);
      }
    };

    fetchPrescriptions();
  }, []);

  const handleNewPrescription = (e?: React.MouseEvent) => {
    e?.preventDefault();
    console.log('🔥 handleNewPrescription clicked!');
    console.log('🚀 Navigating to /prescricoes/nova');

    // Try multiple navigation approaches
    try {
      router.push('/prescricoes/nova');
    } catch (error) {
      console.error('Router push failed:', error);
      // Fallback to window.location
      window.location.href = '/prescricoes/nova';
    }
  };

  const handleViewPrescription = (id: string) => {
    router.push(`/prescricoes/${id}`);
  };

  const handleEditPrescription = (id: string) => {
    router.push(`/prescricoes/${id}/edit`);
  };

  const handlePrintPrescription = (id: string) => {
    // Implement print functionality
    console.log('Printing prescription:', id);
    alert('Funcionalidade de impressão será implementada em breve!');
  };

  const handleDownloadPrescription = (id: string) => {
    const prescription = prescricoes.find(p => p.id === id);
    if (!prescription) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Confirmar Download',
      description: 'Deseja baixar esta prescrição em formato PDF?',
      variant: 'medical',
      prescriptionSummary: {
        patientName: prescription.paciente,
        medications: prescription.medicamentos,
        totalItems: prescription.medicamentos.length
      },
      onConfirm: () => {
        console.log('Downloading prescription:', id);
        alert('Funcionalidade de download será implementada em breve!');
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleDeletePrescription = (id: string) => {
    const prescription = prescricoes.find(p => p.id === id);
    if (!prescription) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Prescrição',
      description: 'Esta ação não pode ser desfeita. A prescrição será permanentemente removida do sistema.',
      variant: 'destructive',
      prescriptionSummary: {
        patientName: prescription.paciente,
        medications: prescription.medicamentos,
        totalItems: prescription.medicamentos.length
      },
      onConfirm: () => {
        // Implement delete functionality
        setPrescricoes(prev => prev.filter(p => p.id !== id));
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const getStatusBadgeProps = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativa':
        return { status: 'success' as const, children: 'Ativa' };
      case 'expirada':
        return { status: 'warning' as const, children: 'Expirada' };
      case 'cancelada':
        return { status: 'error' as const, children: 'Cancelada' };
      default:
        return { status: 'info' as const, children: status };
    }
  };

  const stats = {
    total: prescricoes.length,
    ativas: prescricoes.filter(p => p.status === 'Ativa').length,
    expiradas: prescricoes.filter(p => p.status === 'Expirada').length,
    esteMes: prescricoes.filter(p => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const createdDate = new Date(p.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length
  };

  const filteredPrescricoes = prescricoes.filter(prescricao => {
    const matchesSearch = prescricao.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescricao.numeroReceita.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'todas') return matchesSearch;
    if (filterStatus === 'ativas') return matchesSearch && prescricao.status === 'Ativa';
    if (filterStatus === 'expiradas') return matchesSearch && prescricao.status === 'Expirada';

    return matchesSearch;
  });

  return (
    <>
      <BackButton href="/" />
      <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>Prescrições Médicas</h1>
          <p style={{color: 'var(--text-muted)'}}>Gerenciar receitas e prescrições</p>
        </div>

        <Link
          href="/prescricoes/nova"
          className="btn-primary flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
          style={{ cursor: 'pointer', minHeight: '40px', textDecoration: 'none' }}
          data-testid="nova-prescricao-link"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Prescrição</span>
        </Link>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card-primary rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Total</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{stats.total}</p>
            </div>
            <FileText className="w-8 h-8" style={{color: 'var(--accent-primary)'}} />
          </div>
        </div>

        <div className="card-primary rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Ativas</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{stats.ativas}</p>
            </div>
            <CheckCircle className="w-8 h-8" style={{color: 'var(--success)'}} />
          </div>
        </div>

        <div className="card-primary rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{color: 'var(--text-muted)'}}>Expiradas</p>
              <p className="text-2xl font-bold" style={{color: 'var(--text-primary)'}}>{stats.expiradas}</p>
            </div>
            <AlertTriangle className="w-8 h-8" style={{color: 'var(--error)'}} />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Este Mês</p>
              <p className="text-2xl font-bold text-white">{stats.esteMes}</p>
            </div>
            <Activity className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar prescrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas</option>
            <option value="ativas">Ativas</option>
            <option value="expiradas">Expiradas</option>
          </select>
        </div>

        <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          <Filter className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Lista de Prescrições */}
      <div className="space-y-4">
        {filteredPrescricoes.map((prescricao) => (
          <div
            key={prescricao.id}
            className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  {/* Header da prescrição */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-white font-semibold">{prescricao.numeroReceita}</h3>
                      <StatusBadge
                        {...getStatusBadgeProps(prescricao.status)}
                        className="text-xs"
                        aria-live="polite"
                      />
                    </div>
                    <div className="text-slate-400 text-sm">
                      {prescricao.crm}
                    </div>
                  </div>

                  {/* Informações do paciente */}
                  <div className="flex items-center space-x-6 mb-4 text-slate-400 text-sm">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>{prescricao.paciente}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Emitida: {new Date(prescricao.dataEmissao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>Válida até: {new Date(prescricao.dataValidade).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>

                  {/* Medicamentos */}
                  <div className="mb-4">
                    <h4 className="text-white font-medium mb-2">Medicamentos Prescritos:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {prescricao.medicamentos.map((medicamento, index) => (
                        <div
                          key={index}
                          className="bg-slate-700 rounded-lg p-3 border-l-4 border-blue-500"
                        >
                          <p className="text-white text-sm font-medium">{medicamento}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Observações */}
                  {prescricao.observacoes && (
                    <div className="mb-4">
                      <h4 className="text-white font-medium mb-1">Observações:</h4>
                      <p className="text-slate-400 text-sm">{prescricao.observacoes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => handleViewPrescription(prescricao.id)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors group"
                  aria-label={`Visualizar prescrição ${prescricao.numeroReceita}`}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditPrescription(prescricao.id)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors group"
                  aria-label={`Editar prescrição ${prescricao.numeroReceita}`}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePrintPrescription(prescricao.id)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors group"
                  aria-label={`Imprimir prescrição ${prescricao.numeroReceita}`}
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDownloadPrescription(prescricao.id)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors group"
                  aria-label={`Baixar prescrição ${prescricao.numeroReceita}`}
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePrescription(prescricao.id)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors group"
                  aria-label={`Excluir prescrição ${prescricao.numeroReceita}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between mt-8">
        <p className="text-slate-400 text-sm">
          Mostrando {filteredPrescricoes.length} de {prescricoes.length} prescrições
        </p>

        <div className="flex items-center space-x-2">
          <button className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
            Anterior
          </button>
          <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
            1
          </button>
          <button className="px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors">
            Próximo
          </button>
        </div>
      </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        prescriptionSummary={confirmDialog.prescriptionSummary}
        confirmText={confirmDialog.variant === 'destructive' ? 'Sim, Excluir' : 'Confirmar'}
        cancelText="Cancelar"
      />
    </>
  );
}