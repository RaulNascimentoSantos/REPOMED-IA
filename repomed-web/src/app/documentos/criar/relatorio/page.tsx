'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Calendar,
  Save,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Brain,
  Activity
} from 'lucide-react';

export default function CriarRelatorioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    cpfPaciente: '',
    dataNascimento: '',
    endereco: '',
    telefone: '',
    convenio: '',
    dataConsulta: new Date().toISOString().split('T')[0],
    horaConsulta: '',
    tipoConsulta: 'primeira-vez',
    queixaPrincipal: '',
    historicoDoencaAtual: '',
    historicoPatologico: '',
    historicoFamiliar: '',
    historicoSocial: '',
    medicamentosUso: '',
    alergias: '',
    examesFisico: '',
    sinaisVitais: {
      pressaoArterial: '',
      frequenciaCardiaca: '',
      temperatura: '',
      saturacaoO2: '',
      peso: '',
      altura: ''
    },
    hipoteseDiagnostica: '',
    cid: '',
    exameSolicitados: '',
    condutaTerapeutica: '',
    orientacoes: '',
    retorno: '',
    observacoes: '',
    crm: 'CRM-SP 123456',
    nomeMedico: 'Dr. João Silva'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('sinaisVitais.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        sinaisVitais: {
          ...prev.sinaisVitais,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simular criação do relatório
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirecionar para assinatura
      router.push('/assinatura');
    } catch (error) {
      console.error('Erro ao criar relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Simular salvamento como rascunho
    console.log('Relatório salvo como rascunho:', formData);
  };

  return (
    <div className="p-6 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList className="w-8 h-8 text-green-400" />
            <h1 className="text-3xl font-bold text-white">Relatório de Consulta</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Relatório detalhado da consulta médica realizada
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Convênio
                </label>
                <input
                  type="text"
                  name="convenio"
                  value={formData.convenio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Nome do convênio médico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Consulta *
                </label>
                <select
                  name="tipoConsulta"
                  value={formData.tipoConsulta}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="primeira-vez">Primeira Vez</option>
                  <option value="retorno">Retorno</option>
                  <option value="urgencia">Urgência</option>
                  <option value="rotina">Rotina</option>
                </select>
              </div>
            </div>
          </div>

          {/* Dados da Consulta */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-orange-400" />
              Dados da Consulta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data da Consulta *
                </label>
                <input
                  type="date"
                  name="dataConsulta"
                  value={formData.dataConsulta}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hora da Consulta
                </label>
                <input
                  type="time"
                  name="horaConsulta"
                  value={formData.horaConsulta}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Anamnese */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Anamnese
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Queixa Principal *
                </label>
                <textarea
                  name="queixaPrincipal"
                  value={formData.queixaPrincipal}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Motivo principal da consulta conforme relatado pelo paciente..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  História da Doença Atual *
                </label>
                <textarea
                  name="historicoDoencaAtual"
                  value={formData.historicoDoencaAtual}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Evolução detalhada dos sintomas atuais..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  História Patológica Pregressa
                </label>
                <textarea
                  name="historicoPatologico"
                  value={formData.historicoPatologico}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Doenças anteriores, cirurgias, internações..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  História Familiar
                </label>
                <textarea
                  name="historicoFamiliar"
                  value={formData.historicoFamiliar}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Histórico de doenças na família..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Medicamentos em Uso
                </label>
                <textarea
                  name="medicamentosUso"
                  value={formData.medicamentosUso}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Medicamentos que o paciente está utilizando..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Alergias
                </label>
                <input
                  type="text"
                  name="alergias"
                  value={formData.alergias}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Alergias conhecidas (medicamentos, alimentos, etc.)"
                />
              </div>
            </div>
          </div>

          {/* Exame Físico e Sinais Vitais */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Stethoscope className="w-6 h-6 text-red-400" />
              Exame Físico e Sinais Vitais
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Pressão Arterial
                  </label>
                  <input
                    type="text"
                    name="sinaisVitais.pressaoArterial"
                    value={formData.sinaisVitais.pressaoArterial}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="120/80"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    FC (bpm)
                  </label>
                  <input
                    type="text"
                    name="sinaisVitais.frequenciaCardiaca"
                    value={formData.sinaisVitais.frequenciaCardiaca}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="72"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Temperatura (°C)
                  </label>
                  <input
                    type="text"
                    name="sinaisVitais.temperatura"
                    value={formData.sinaisVitais.temperatura}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="36.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Saturação O2 (%)
                  </label>
                  <input
                    type="text"
                    name="sinaisVitais.saturacaoO2"
                    value={formData.sinaisVitais.saturacaoO2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="98"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="text"
                    name="sinaisVitais.peso"
                    value={formData.sinaisVitais.peso}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="70"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="text"
                    name="sinaisVitais.altura"
                    value={formData.sinaisVitais.altura}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="170"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exame Físico Detalhado *
                </label>
                <textarea
                  name="examesFisico"
                  value={formData.examesFisico}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Descrição detalhada do exame físico por sistemas..."
                  required
                />
              </div>
            </div>
          </div>

          {/* Avaliação e Conduta */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-cyan-400" />
              Avaliação e Conduta
            </h3>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Hipótese Diagnóstica *
                  </label>
                  <textarea
                    name="hipoteseDiagnostica"
                    value={formData.hipoteseDiagnostica}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Diagnóstico provável baseado na avaliação..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CID-10
                  </label>
                  <input
                    type="text"
                    name="cid"
                    value={formData.cid}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: K30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exames Solicitados
                </label>
                <textarea
                  name="exameSolicitados"
                  value={formData.exameSolicitados}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Exames laboratoriais, imagens ou outros complementares solicitados..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Conduta Terapêutica *
                </label>
                <textarea
                  name="condutaTerapeutica"
                  value={formData.condutaTerapeutica}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tratamento prescrito, medicações, orientações..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Orientações ao Paciente
                </label>
                <textarea
                  name="orientacoes"
                  value={formData.orientacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Cuidados, restrições, orientações gerais..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Retorno
                </label>
                <input
                  type="text"
                  name="retorno"
                  value={formData.retorno}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Quando retornar (ex: 30 dias, se necessário, etc.)"
                />
              </div>
            </div>
          </div>

          {/* Dados do Médico */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-400" />
              Dados do Médico
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre a consulta..."
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
                    ? 'bg-green-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transform hover:scale-105'
                } text-white font-semibold`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando Relatório...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Criar Relatório
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informação sobre assinatura digital */}
        <div className="mt-8 bg-green-900/20 border border-green-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-400 mt-0.5" />
            <div>
              <h4 className="text-green-300 font-medium mb-1">Assinatura Digital Obrigatória</h4>
              <p className="text-green-200 text-sm">
                Este relatório será direcionado para assinatura digital após a criação,
                conforme exigências do CFM para validade jurídica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}