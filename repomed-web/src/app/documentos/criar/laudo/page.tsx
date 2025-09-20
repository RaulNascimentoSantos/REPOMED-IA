'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Calendar,
  Save,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Stethoscope,
  Brain
} from 'lucide-react';

export default function CriarLaudoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    cpfPaciente: '',
    dataNascimento: '',
    endereco: '',
    cid: '',
    hipoteseDiagnostica: '',
    exameFisico: '',
    examesComplementares: '',
    diagnosticoFinal: '',
    prognostico: '',
    condutaTerapeutica: '',
    observacoes: '',
    tipoLaudo: 'clinico',
    dataExame: new Date().toISOString().split('T')[0],
    crm: 'CRM-SP 123456',
    nomeMedico: 'Dr. João Silva'
  });

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
      // Simular criação do laudo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Redirecionar para assinatura
      router.push('/assinatura');
    } catch (error) {
      console.error('Erro ao criar laudo:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Simular salvamento como rascunho
    console.log('Laudo salvo como rascunho:', formData);
  };

  return (
    <div className="p-6 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-orange-400" />
            <h1 className="text-3xl font-bold text-white">Criar Laudo Médico</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Laudo médico completo com diagnóstico e recomendações terapêuticas
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data do Exame *
                </label>
                <input
                  type="date"
                  name="dataExame"
                  value={formData.dataExame}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ex: M79.3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Laudo *
                </label>
                <select
                  name="tipoLaudo"
                  value={formData.tipoLaudo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="clinico">Clínico</option>
                  <option value="radiologico">Radiológico</option>
                  <option value="laboratorial">Laboratorial</option>
                  <option value="cardiologico">Cardiológico</option>
                  <option value="neurologico">Neurológico</option>
                  <option value="psiquiatrico">Psiquiátrico</option>
                </select>
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Descreva a hipótese diagnóstica inicial..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exame Físico *
                </label>
                <textarea
                  name="exameFisico"
                  value={formData.exameFisico}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Descreva os achados do exame físico..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exames Complementares
                </label>
                <textarea
                  name="examesComplementares"
                  value={formData.examesComplementares}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Descreva exames laboratoriais, radiológicos ou outros..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Diagnóstico Final *
                </label>
                <textarea
                  name="diagnosticoFinal"
                  value={formData.diagnosticoFinal}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Diagnóstico definitivo baseado nos achados..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Prognóstico
                </label>
                <textarea
                  name="prognostico"
                  value={formData.prognostico}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Prognóstico da condição..."
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
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Recomendações de tratamento..."
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Observações adicionais relevantes..."
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
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
                    ? 'bg-orange-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transform hover:scale-105'
                } text-white font-semibold`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando Laudo...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Criar Laudo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informação sobre assinatura digital */}
        <div className="mt-8 bg-orange-900/20 border border-orange-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
              <h4 className="text-orange-300 font-medium mb-1">Assinatura Digital Obrigatória</h4>
              <p className="text-orange-200 text-sm">
                Este laudo será direcionado para assinatura digital após a criação,
                conforme exigências do CFM para validade jurídica.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}