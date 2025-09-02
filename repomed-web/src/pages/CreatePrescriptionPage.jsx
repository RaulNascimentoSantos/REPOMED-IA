import { useState } from 'react';
import './CreatePrescriptionPage.css';

export default function CreatePrescriptionPage() {
  const [patient, setPatient] = useState('');
  const [medications, setMedications] = useState([]);
  const [showMedicationSearch, setShowMedicationSearch] = useState(false);
  const [medicationSearch, setMedicationSearch] = useState('');
  const [isDigitalSignature, setIsDigitalSignature] = useState(true);

  const handleAddMedication = () => {
    setShowMedicationSearch(true);
  };

  return (
    <div className="prescription-page">
      <div className="page-container">
        <div className="prescription-header">
          <h1 className="page-title">Criar prescrição</h1>
          <p className="page-subtitle">Prescrição de medicamentos, pedido de exames e outros.</p>
        </div>

        <div className="prescription-content">
          <div className="prescription-form">
            <div className="form-section">
              <label className="form-label">
                Nome do paciente
                <span className="label-link">Mais dados →</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Busque por nome ou CPF"
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label className="form-label">Adicionar item</label>
              <div className="search-medication">
                <input
                  type="text"
                  className="form-input medication-input"
                  placeholder="Busque por fármacos, exames, dermocosméticos, composições, etc."
                  value={medicationSearch}
                  onChange={(e) => setMedicationSearch(e.target.value)}
                  onFocus={() => setShowMedicationSearch(true)}
                />
                <div className="medication-actions">
                  <button className="btn-action" onClick={() => alert('Adicionar modelo - Em desenvolvimento')}>
                    <span className="action-icon">📋</span>
                    Adicionar modelo
                  </button>
                  <button className="btn-action" onClick={() => alert('Adicionar CID - Em desenvolvimento')}>
                    <span className="action-icon">🔍</span>
                    Adicionar CID
                  </button>
                  <button className="btn-action" onClick={() => alert('Adicionar observação - Em desenvolvimento')}>
                    <span className="action-icon">📝</span>
                    Adicionar observação
                  </button>
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="prescriptions-history">
                <h3 className="section-title">Últimas prescrições</h3>
                <div className="timeline">
                  {['08/08/2025', '07/08/2025', '26/07/2025', '29/06/2025', '29/06/2025', '05/06/2025', '30/05'].map((date, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-date">{date}</div>
                      <div className="timeline-dot"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="prescription-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-icon">📅</span>
                <span>Data do documento</span>
                <span className="sidebar-date">01/09/2025</span>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-icon">⚠️</span>
                <span>Alertas</span>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-icon">📋</span>
                <span>Modelos (protocolos)</span>
              </div>
            </div>

            <div className="sidebar-card">
              <div className="sidebar-header">
                <span className="sidebar-icon">👥</span>
                <span>Personalizar receituário</span>
              </div>
            </div>

            <div className="sidebar-toggle">
              <label className="toggle">
                <span>Assinatura digital</span>
                <input
                  type="checkbox"
                  checked={isDigitalSignature}
                  onChange={(e) => setIsDigitalSignature(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
              <p className="toggle-description">
                Assine suas receitas pelo RepoMed e envie apenas a via digital ao paciente, sem precisar imprimir.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}