'use client';

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

  const handleNewPrescription = () => {
    try {
      router.push('/prescricoes/nova');
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/prescricoes/nova';
    }
  };

  const handleViewPrescription = (id: string) => {
    try {
      router.push(`/prescricoes/${id}`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/prescricoes/${id}`;
    }
  };

  const handleEditPrescription = (id: string) => {
    try {
      router.push(`/prescricoes/${id}/edit`);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = `/prescricoes/${id}/edit`;
    }
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
    total: Array.isArray(prescricoes) ? prescricoes.length : 0,
    ativas: Array.isArray(prescricoes) ? prescricoes.filter(p => p.status === 'Ativa').length : 0,
    expiradas: Array.isArray(prescricoes) ? prescricoes.filter(p => p.status === 'Expirada').length : 0,
    esteMes: Array.isArray(prescricoes) ? prescricoes.filter(p => {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const createdDate = new Date(p.createdAt);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length : 0
  };

  const filteredPrescricoes = Array.isArray(prescricoes) ? prescricoes.filter(prescricao => {
    const matchesSearch = prescricao.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prescricao.numeroReceita.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'todas') return matchesSearch;
    if (filterStatus === 'ativas') return matchesSearch && prescricao.status === 'Ativa';
    if (filterStatus === 'expiradas') return matchesSearch && prescricao.status === 'Expirada';

    return matchesSearch;
  }) : [];

  return (
    <>
      <style jsx>{`
        .prescriptions-page {
          min-height: 100vh;
          padding: 2rem;
          background: var(--bg-primary);
          color: var(--text-primary);
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-image:
            radial-gradient(circle at 25% 25%, rgba(16, 185, 129, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.03) 0%, transparent 50%);
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          text-decoration: none;
          margin-right: 1rem;
        }

        .back-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .header-content h1 {
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .header-content p {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin: 0;
        }

        .new-prescription-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .new-prescription-btn:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .stat-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-info h3 {
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-info p {
          color: var(--text-primary);
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
        }

        .controls-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .controls-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .search-filters {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex: 1;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .filter-select {
          padding: 0.75rem 1rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 0.875rem;
          cursor: pointer;
        }

        .prescription-card {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 1.5rem;
          padding: 0;
          margin-bottom: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          position: relative;
        }

        .prescription-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #16a34a, #059669);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .prescription-card:hover {
          transform: translateY(-6px);
          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.08),
            0 8px 16px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(16, 185, 129, 0.1);
        }

        .prescription-card:hover::before {
          opacity: 1;
        }

        .prescription-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .prescription-icon {
          width: 3.5rem;
          height: 3.5rem;
          background: linear-gradient(135deg, #16a34a, #059669);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.25);
          flex-shrink: 0;
        }

        .prescription-info {
          flex: 1;
          min-width: 0;
        }

        .prescription-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .prescription-number {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .prescription-crm {
          font-size: 0.8125rem;
          color: var(--text-muted);
          background: var(--bg-tertiary);
          padding: 0.25rem 0.625rem;
          border-radius: 0.375rem;
          border: 1px solid var(--border-color);
        }

        .prescription-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.8125rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .prescription-content {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .medications-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.75rem 0;
        }

        .medications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .medication-item {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-left: 4px solid #16a34a;
          border-radius: 0.5rem;
          padding: 0.75rem;
          transition: all 0.2s ease;
        }

        .medication-item:hover {
          background: rgba(16, 185, 129, 0.05);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .medication-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .observations-section {
          margin-top: 1rem;
        }

        .observations-section h4 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 0.5rem 0;
        }

        .observations-text {
          font-size: 0.8125rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        .prescription-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .action-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
          border-color: rgba(59, 130, 246, 0.3);
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border-color: #3b82f6;
          color: white;
        }

        .action-btn.primary:hover {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .action-btn.success {
          background: linear-gradient(135deg, #16a34a, #059669);
          border-color: #16a34a;
          color: white;
        }

        .action-btn.success:hover {
          background: linear-gradient(135deg, #059669, #047857);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .action-btn.danger {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          border-color: #dc2626;
          color: white;
        }

        .action-btn.danger:hover {
          background: linear-gradient(135deg, #b91c1c, #991b1b);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: between;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .pagination-info {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 2.5rem;
          height: 2.5rem;
          padding: 0 0.75rem;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          color: var(--text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .pagination-btn.active {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        @media (max-width: 768px) {
          .prescriptions-page {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .controls-content {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .search-filters {
            flex-direction: column;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .prescription-meta {
            flex-direction: column;
            align-items: stretch;
            gap: 0.5rem;
          }

          .medications-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="prescriptions-page">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              onClick={() => router.push('/home')}
              className="back-btn"
            >
              ← Voltar
            </button>
            <div className="header-content">
              <h1>💊 Prescrições Médicas</h1>
              <p>Gestão completa de receitas e prescrições digitais</p>
            </div>
          </div>
          <button
            onClick={handleNewPrescription}
            className="new-prescription-btn"
          >
            <Plus size={16} />
            Nova Prescrição
          </button>
        </div>
        {/* Estatísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Total</h3>
                <p>{stats.total}</p>
              </div>
              <FileText size={32} style={{ color: '#3b82f6' }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Ativas</h3>
                <p>{stats.ativas}</p>
              </div>
              <CheckCircle size={32} style={{ color: '#16a34a' }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Expiradas</h3>
                <p>{stats.expiradas}</p>
              </div>
              <AlertTriangle size={32} style={{ color: '#f59e0b' }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-content">
              <div className="stat-info">
                <h3>Este Mês</h3>
                <p>{stats.esteMes}</p>
              </div>
              <Activity size={32} style={{ color: '#a855f7' }} />
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="controls-section">
          <div className="controls-content">
            <div className="search-filters">
              <div className="search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar prescrições..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="todas">Todas</option>
                <option value="ativas">Ativas</option>
                <option value="expiradas">Expiradas</option>
              </select>
            </div>

            <button className="action-btn">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Lista de Prescrições */}
        <div>
          {filteredPrescricoes.map((prescricao) => (
            <div key={prescricao.id} className="prescription-card">
              <div className="prescription-header">
                <div className="prescription-icon">
                  <Pill size={20} />
                </div>
                <div className="prescription-info">
                  <div className="prescription-title">
                    <h3 className="prescription-number">{prescricao.numeroReceita}</h3>
                    <div className="prescription-crm">{prescricao.crm}</div>
                  </div>
                  <div className="prescription-meta">
                    <div className="meta-item">
                      <User size={14} />
                      <span>{prescricao.paciente}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={14} />
                      <span>Emitida: {new Date(prescricao.dataEmissao).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>Válida até: {new Date(prescricao.dataValidade).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <StatusBadge
                    {...getStatusBadgeProps(prescricao.status)}
                    aria-live="polite"
                  />
                </div>
              </div>

              <div className="prescription-content">
                <div className="medications-section">
                  <h4>Medicamentos Prescritos ({prescricao.medicamentos.length})</h4>
                  <div className="medications-grid">
                    {prescricao.medicamentos.map((medicamento, index) => (
                      <div key={index} className="medication-item">
                        <p className="medication-name">{medicamento}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {prescricao.observacoes && (
                  <div className="observations-section">
                    <h4>Observações Médicas</h4>
                    <p className="observations-text">{prescricao.observacoes}</p>
                  </div>
                )}
              </div>

              <div className="prescription-actions">
                <button
                  onClick={() => handleViewPrescription(prescricao.id)}
                  className="action-btn"
                  title="Visualizar prescrição"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleEditPrescription(prescricao.id)}
                  className="action-btn"
                  title="Editar prescrição"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handlePrintPrescription(prescricao.id)}
                  className="action-btn"
                  title="Imprimir prescrição"
                >
                  <Printer size={16} />
                </button>
                <button
                  onClick={() => handleDownloadPrescription(prescricao.id)}
                  className="action-btn success"
                  title="Baixar em PDF"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleDeletePrescription(prescricao.id)}
                  className="action-btn danger"
                  title="Excluir prescrição"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Paginação */}
        <div className="pagination">
          <div className="pagination-info">
            Mostrando {filteredPrescricoes.length} de {prescricoes.length} prescrições
          </div>

          <div className="pagination-controls">
            <button className="pagination-btn">
              Anterior
            </button>
            <button className="pagination-btn active">
              1
            </button>
            <button className="pagination-btn">
              Próximo
            </button>
          </div>
        </div>
      </div>
      </>
    );

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
}