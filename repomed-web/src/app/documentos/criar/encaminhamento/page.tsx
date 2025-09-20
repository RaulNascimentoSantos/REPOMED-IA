'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Calendar,
  Save,
  UserPlus,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Brain,
  MapPin
} from 'lucide-react';

export default function CriarEncaminhamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    cpfPaciente: '',
    dataNascimento: '',
    endereco: '',
    telefone: '',
    cid: '',
    hipoteseDiagnostica: '',
    motivoEncaminhamento: '',
    especialidadeDestino: '',
    medicoDestino: '',
    instituicaoDestino: '',
    enderecoDestino: '',
    urgencia: 'normal',
    examesAnexos: '',
    historicoClinico: '',
    medicamentosUso: '',
    observacoes: '',
    dataEncaminhamento: new Date().toISOString().split('T')[0],
    crm: 'CRM-SP 123456',
    nomeMedico: 'Dr. João Silva'
  });

  const especialidades = [
    'Cardiologia',
    'Neurologia',
    'Endocrinologia',
    'Gastroenterologia',
    'Pneumologia',
    'Reumatologia',
    'Dermatologia',
    'Oftalmologia',
    'Otorrinolaringologia',
    'Urologia',
    'Ginecologia',
    'Psiquiatria',
    'Ortopedia',
    'Oncologia',
    'Hematologia',
    'Nefrologia',
    'Infectologia'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular criação do encaminhamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirecionar para assinatura
      router.push('/assinatura');
    } catch (error) {
      console.error('Erro ao criar encaminhamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Simular salvamento como rascunho
    console.log('Encaminhamento salvo como rascunho:', formData);
  };

  return (
    <div className="p-6 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserPlus className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Criar Encaminhamento Médico</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Encaminhamento para especialista ou exame complementar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados do Paciente */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-400" />
              Dados do Paciente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  name="paciente"
                  value={formData.paciente}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome completo do paciente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CPF do Paciente *
                </label>
                <input
                  type="text"
                  name="cpfPaciente"
                  value={formData.cpfPaciente}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data de Nascimento *
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Endereço completo do paciente"
                />
              </div>
            </div>
          </div>

          {/* Informações Clínicas */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-green-400" />
              Informações Clínicas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CID-10
                </label>
                <input
                  type="text"
                  name="cid"
                  value={formData.cid}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: M79.3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data do Encaminhamento *
                </label>
                <input
                  type="date"
                  name="dataEncaminhamento"
                  value={formData.dataEncaminhamento}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hipótese Diagnóstica *
                </label>
                <textarea
                  name="hipoteseDiagnostica"
                  value={formData.hipoteseDiagnostica}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva a hipótese diagnóstica atual..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Motivo do Encaminhamento *
                </label>
                <textarea
                  name="motivoEncaminhamento"
                  value={formData.motivoEncaminhamento}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descreva o motivo do encaminhamento e qual avaliação/procedimento é necessário..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Histórico Clínico Relevante
                </label>
                <textarea
                  name="historicoClinico"
                  value={formData.historicoClinico}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Histórico médico relevante para o caso..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Medicamentos em Uso
                </label>
                <textarea
                  name="medicamentosUso"
                  value={formData.medicamentosUso}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Medicamentos que o paciente está utilizando..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exames Anexos
                </label>
                <textarea
                  name="examesAnexos"
                  value={formData.examesAnexos}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Liste os exames anexados (laboratoriais, imagem, etc.)..."
                />
              </div>
            </div>
          </div>

          {/* Dados do Destino */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-400" />
              Dados do Destino
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Especialidade de Destino *
                </label>
                <select
                  name="especialidadeDestino"
                  value={formData.especialidadeDestino}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione a especialidade</option>
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Urgência *
                </label>
                <select
                  name="urgencia"
                  value={formData.urgencia}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente</option>
                  <option value="muito-urgente">Muito Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Médico de Destino
                </label>
                <input
                  type="text"
                  name="medicoDestino"
                  value={formData.medicoDestino}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do médico especialista (se conhecido)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Instituição de Destino
                </label>
                <input
                  type="text"
                  name="instituicaoDestino"
                  value={formData.instituicaoDestino}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Hospital, clínica ou consultório de destino"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Endereço de Destino
                </label>
                <input
                  type="text"
                  name="enderecoDestino"
                  value={formData.enderecoDestino}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Endereço da instituição de destino"
                />
              </div>
            </div>
          </div>

          {/* Dados do Médico */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Dados do Médico Solicitante
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Médico *
                </label>
                <input
                  type="text"
                  name="nomeMedico"
                  value={formData.nomeMedico}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CRM *
                </label>
                <input
                  type="text"
                  name="crm"
                  value={formData.crm}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observações Adicionais
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre o encaminhamento..."
                />
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              Salvar Rascunho
            </button>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all ${
                  loading
                    ? 'bg-blue-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105'
                } text-white font-semibold`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando Encaminhamento...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Criar Encaminhamento
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informação sobre assinatura digital */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="text-blue-300 font-medium mb-1">Assinatura Digital Obrigatória</h4>
              <p className="text-blue-200 text-sm">
                Este encaminhamento será direcionado para assinatura digital após a criação,
                conforme exigências do CFM para validade jurídica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}