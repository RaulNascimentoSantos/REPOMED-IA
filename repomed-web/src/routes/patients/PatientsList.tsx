import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { DataTable } from '../../components/ui/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingState } from '../../components/states/LoadingState';
import { EmptyState } from '../../components/states/EmptyState';
import { ErrorState } from '../../components/states/ErrorState';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '../../components/ui/Dialog';

export default function PatientsList() {
  const nav = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [ageFilter, setAgeFilter] = React.useState('');
  const [genderFilter, setGenderFilter] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [currentPatient, setCurrentPatient] = React.useState<any>(null);

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients', searchTerm, ageFilter, genderFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        search: searchTerm,
        ageFilter,
        genderFilter,
        limit: '100'
      });
      const response = await api.get(`/api/patients?${params}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  const rows = patients || [];
  
  if (!rows.length && !searchTerm && !ageFilter && !genderFilter) {
    return (
      <EmptyState 
        title="Nenhum paciente cadastrado"
        message="Comece cadastrando seu primeiro paciente"
        cta={<Button onClick={() => nav('/patients/create')}>Cadastrar paciente</Button>}
      />
    );
  }

  const formatAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    return `${age} anos`;
  };

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-slate-600 mt-1">Gerencie o cadastro de pacientes</p>
        </div>
        <Button onClick={() => nav('/patients/create')}>
          Novo paciente
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <h2 className="font-semibold text-slate-900">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Buscar
            </label>
            <Input
              placeholder="Nome, CPF ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Idade
            </label>
            <Select value={ageFilter} onChange={(e) => setAgeFilter(e.target.value)}>
              <option value="">Todas as idades</option>
              <option value="0-18">0-18 anos</option>
              <option value="19-35">19-35 anos</option>
              <option value="36-55">36-55 anos</option>
              <option value="56+">56+ anos</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gênero
            </label>
            <Select value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
              <option value="">Todos</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Results */}
      {rows.length > 0 ? (
        <div className="bg-white rounded-lg border overflow-hidden">
          <DataTable 
            data={rows}
            columns={[
              {
                key: 'name',
                header: 'Nome',
                render: (patient) => (
                  <div>
                    <div className="font-medium text-slate-900">{patient.name}</div>
                    <div className="text-sm text-slate-500">{patient.cpf}</div>
                  </div>
                )
              },
              {
                key: 'birthDate',
                header: 'Idade',
                render: (patient) => formatAge(patient.birthDate)
              },
              {
                key: 'gender',
                header: 'Gênero',
                render: (patient) => patient.gender || 'N/A'
              },
              {
                key: 'phone',
                header: 'Telefone',
                render: (patient) => formatPhone(patient.phone)
              },
              {
                key: 'email',
                header: 'Email',
                render: (patient) => patient.email || 'N/A'
              },
              {
                key: 'actions',
                header: 'Ações',
                render: (patient) => (
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => {
                        setCurrentPatient(patient);
                        setOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                    <Button 
                      variant="secondary"
                      size="sm"
                      onClick={() => nav(`/patients/${patient.id}/edit`)}
                    >
                      Editar
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => nav(`/documents/new?patientId=${patient.id}`)}
                    >
                      Criar documento
                    </Button>
                  </div>
                )
              }
            ]}
          />
        </div>
      ) : (
        <EmptyState 
          title="Nenhum resultado"
          message="Nenhum paciente encontrado com os filtros aplicados"
          cta={<Button variant="secondary" onClick={() => {
            setSearchTerm('');
            setAgeFilter('');
            setGenderFilter('');
          }}>Limpar filtros</Button>}
        />
      )}

      {/* Patient Details Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} title={currentPatient?.name || 'Detalhes do Paciente'}>
        {currentPatient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nome</label>
                <p className="text-slate-900">{currentPatient.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">CPF</label>
                <p className="text-slate-900">{currentPatient.cpf}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Data de Nascimento</label>
                <p className="text-slate-900">
                  {currentPatient.birthDate ? new Date(currentPatient.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Gênero</label>
                <p className="text-slate-900">{currentPatient.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Telefone</label>
                <p className="text-slate-900">{formatPhone(currentPatient.phone)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <p className="text-slate-900">{currentPatient.email || 'N/A'}</p>
              </div>
            </div>
            
            {currentPatient.address && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Endereço</label>
                <p className="text-slate-900">
                  {currentPatient.address.street}, {currentPatient.address.number}
                  {currentPatient.address.complement && ` - ${currentPatient.address.complement}`}
                  <br />
                  {currentPatient.address.neighborhood}, {currentPatient.address.city}/{currentPatient.address.state}
                  <br />
                  CEP: {currentPatient.address.zipCode}
                </p>
              </div>
            )}

            {currentPatient.medicalInfo && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Informações Médicas</label>
                <div className="space-y-2 text-sm">
                  {currentPatient.medicalInfo.allergies && (
                    <p><strong>Alergias:</strong> {currentPatient.medicalInfo.allergies}</p>
                  )}
                  {currentPatient.medicalInfo.medications && (
                    <p><strong>Medicamentos:</strong> {currentPatient.medicalInfo.medications}</p>
                  )}
                  {currentPatient.medicalInfo.conditions && (
                    <p><strong>Condições:</strong> {currentPatient.medicalInfo.conditions}</p>
                  )}
                  {currentPatient.medicalInfo.notes && (
                    <p><strong>Observações:</strong> {currentPatient.medicalInfo.notes}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button onClick={() => nav(`/patients/${currentPatient.id}/edit`)}>
                Editar paciente
              </Button>
              <Button 
                variant="secondary"
                onClick={() => nav(`/documents/new?patientId=${currentPatient.id}`)}
              >
                Criar documento
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}