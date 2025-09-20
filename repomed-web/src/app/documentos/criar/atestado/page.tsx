'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Calendar,
  Save,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function CriarAtestadoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    paciente: '',
    cpfPaciente: '',
    dataNascimento: '',
    endereco: '',
    cid: '',
    diagnostico: '',
    dataInicio: '',
    dataFim: '',
    diasAfastamento: '',
    tipoAtestado: 'medico',
    observacoes: '',
    crm: 'CRM-SP 123456',
    nomeMedico: 'Dr. João Silva'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Calcular dias de afastamento automaticamente
    if (name === 'dataInicio' || name === 'dataFim') {
      const inicio = name === 'dataInicio' ? new Date(value) : new Date(formData.dataInicio);
      const fim = name === 'dataFim' ? new Date(value) : new Date(formData.dataFim);

      if (inicio && fim && inicio <= fim) {
        const diffTime = Math.abs(fim.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({
          ...prev,
          [name]: value,
          diasAfastamento: diffDays.toString()
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: value
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados para a API
      const atestadoData = {
        paciente: formData.paciente,
        cpf_paciente: formData.cpfPaciente,
        data_nascimento: formData.dataNascimento,
        endereco: formData.endereco,
        cid: formData.cid,
        diagnostico: formData.diagnostico,
        data_inicio: formData.dataInicio,
        data_fim: formData.dataFim,
        dias_afastamento: parseInt(formData.diasAfastamento),
        tipo_atestado: formData.tipoAtestado,
        observacoes: formData.observacoes,
        crm: formData.crm,
        nome_medico: formData.nomeMedico,
        data_emissao: new Date().toISOString().split('T')[0]
      };

      // Chamar API do Fastify
      const response = await fetch('http://localhost:8081/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...atestadoData,
          type: 'atestado',
          title: `Atestado Médico - ${formData.paciente}`,
          content: `Atesto que o(a) paciente ${formData.paciente} necessita afastar-se de suas atividades por ${formData.diasAfastamento} dias.`
        })
      });

      if (response.ok) {
        const result = await response.json();
        alert('Atestado criado com sucesso!');
        router.push('/documentos');
      } else {
        throw new Error('Erro ao criar atestado');
      }
    } catch (error) {
      console.error('Erro ao criar atestado:', error);
      alert('Erro ao criar atestado. Verifique se o backend está rodando na porta 8081.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <BackButton href="/documentos" />
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Criar Atestado Médico</h1>
              <p className="text-slate-400">Documento de afastamento médico</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados do Paciente */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Dados do Paciente</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome Completo do Paciente *
                  </label>
                  <input
                    type="text"
                    name="paciente"
                    value={formData.paciente}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite o nome completo do paciente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpfPaciente"
                    value={formData.cpfPaciente}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
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
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Endereço completo do paciente"
                  />
                </div>
              </div>
            </div>

            {/* Informações Médicas */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-white">Informações Médicas</h2>
              </div>

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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Z76.3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tipo de Atestado *
                  </label>
                  <select
                    name="tipoAtestado"
                    value={formData.tipoAtestado}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="medico">Atestado Médico</option>
                    <option value="acompanhamento">Acompanhamento</option>
                    <option value="comparecimento">Comparecimento</option>
                    <option value="repouso">Repouso</option>
                  </select>
                </div>

                <div className="col-span-full">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Diagnóstico/Motivo *
                  </label>
                  <textarea
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o diagnóstico ou motivo do afastamento"
                  />
                </div>
              </div>
            </div>

            {/* Período de Afastamento */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center space-x-3 mb-6">
                <Calendar className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-white">Período de Afastamento</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    name="dataInicio"
                    value={formData.dataInicio}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Data de Fim *
                  </label>
                  <input
                    type="date"
                    name="dataFim"
                    value={formData.dataFim}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Dias de Afastamento
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="diasAfastamento"
                      value={formData.diasAfastamento}
                      onChange={handleInputChange}
                      readOnly
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none cursor-not-allowed"
                      placeholder="Calculado automaticamente"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {formData.diasAfastamento && (
                <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      Período calculado: {formData.diasAfastamento} dia(s) de afastamento
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Observações */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Observações Médicas</h2>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Observações adicionais, recomendações especiais, etc."
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/documentos')}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Criando...' : 'Criar Atestado'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}