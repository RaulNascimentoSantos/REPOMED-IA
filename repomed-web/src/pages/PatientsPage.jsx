import { useState } from 'react';
import { Link } from 'react-router-dom';
import './PatientsPage.css';

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients] = useState([
    { id: 1, initials: 'SF', name: 'Sílvia Freitas Mendes', cpf: 'CPF não informado', age: 'Não informado', birthDate: '05/08/1988', lastVisit: '08/08/2025' },
    { id: 2, initials: 'NM', name: 'Natalia Moura Cadeira...', cpf: 'CPF não informado', age: '37 anos', birthDate: '05/08/1988', lastVisit: '07/08/2025' },
    { id: 3, initials: 'RN', name: 'Raul Nascimento dos Sa...', cpf: 'CPF não informado', age: '32 anos', birthDate: '08/06/1993', lastVisit: '26/07/2025' },
    { id: 4, initials: 'KC', name: 'Kelly Cristina Costa', cpf: 'CPF não informado', age: 'Não informado', birthDate: 'Não informado', lastVisit: '05/06/2025' },
    { id: 5, initials: 'HC', name: 'Hélio Cardoso de Miran...', cpf: 'CPF não informado', age: 'Não informado', birthDate: 'Não informado', lastVisit: '30/05/2025' }
  ]);

  const getInitialsColor = (initials) => {
    const colors = {
      'SF': '#8b5cf6',
      'NM': '#ec4899', 
      'RN': '#06b6d4',
      'KC': '#f59e0b',
      'HC': '#10b981'
    };
    return colors[initials] || '#6366f1';
  };

  return (
    <div className="patients-page">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">Lista de Pacientes</h1>
          <Link to="/patients/create" className="btn-create-patient">
            Criar paciente
          </Link>
        </div>

        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Pesquise um paciente por nome ou CPF"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="patients-table">
          <div className="table-header">
            <div className="th-name">
              NOME<br/>
              <span className="th-sub">CPF</span>
            </div>
            <div className="th-age">
              IDADE<br/>
              <span className="th-sub">DATA DE NASCIMENTO</span>
            </div>
            <div className="th-visit">ÚLTIMA PRESCRIÇÃO ↑</div>
            <div className="th-action"></div>
          </div>

          {patients.map(patient => (
            <div key={patient.id} className="table-row">
              <div className="td-name">
                <div className="patient-avatar" style={{ background: getInitialsColor(patient.initials) }}>
                  {patient.initials}
                </div>
                <div className="patient-info">
                  <div className="patient-name">{patient.name}</div>
                  <div className="patient-cpf">{patient.cpf}</div>
                </div>
              </div>
              <div className="td-age">
                <div className="patient-age">{patient.age}</div>
                <div className="patient-birth">{patient.birthDate}</div>
              </div>
              <div className="td-visit">{patient.lastVisit}</div>
              <div className="td-action">
                <Link to="/prescription/create" className="btn-prescribe">Criar prescrição</Link>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <div className="pagination-info">
            Exibindo <select className="select-limit"><option>5</option></select> de 13 pacientes
          </div>
          <div className="pagination-controls">
            <button className="pagination-btn" disabled onClick={() => {/* TODO: First page */}}>←</button>
            <button className="pagination-btn" disabled onClick={() => {/* TODO: Previous page */}}>Anterior</button>
            <button className="pagination-number active" onClick={() => {/* TODO: Page 1 */}}>1</button>
            <button className="pagination-number" onClick={() => {/* TODO: Page 2 */}}>2</button>
            <button className="pagination-number" onClick={() => {/* TODO: Page 3 */}}>3</button>
            <button className="pagination-btn" onClick={() => {/* TODO: Next page */}}>Próximo</button>
            <button className="pagination-btn" onClick={() => {/* TODO: Last page */}}>→</button>
          </div>
        </div>
      </div>
    </div>
  );
}