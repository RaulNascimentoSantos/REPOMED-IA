'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Pill,
  Plus,
  Save,
  X,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function CriarReceitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [medicamentos, setMedicamentos] = useState([
    { nome: '', dosagem: '', frequencia: '', duracao: '', quantidade: '', orientacoes: '' }
  ]);
  const [formData, setFormData] = useState({
    paciente: '',
    cpfPaciente: '',
    dataNascimento: '',
    endereco: '',
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
  };

  const handleMedicamentoChange = (index: number, field: string, value: string) => {
    const newMedicamentos = [...medicamentos];
    newMedicamentos[index] = {
      ...newMedicamentos[index],
      [field]: value
    };
    setMedicamentos(newMedicamentos);
  };

  const adicionarMedicamento = () => {
    setMedicamentos([...medicamentos, {
      nome: '', dosagem: '', frequencia: '', duracao: '', quantidade: '', orientacoes: ''
    }]);
  };

  const removerMedicamento = (index: number) => {
    if (medicamentos.length > 1) {
      setMedicamentos(medicamentos.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Preparar dados para a API
      const receitaData = {
        paciente: formData.paciente,
        cpf_paciente: formData.cpfPaciente,
        data_nascimento: formData.dataNascimento,
        endereco: formData.endereco,
        medicamentos: medicamentos,
        observacoes: formData.observacoes,
        crm: formData.crm,
        nome_medico: formData.nomeMedico,
        data_emissao: new Date().toISOString().split('T')[0],
        data_validade: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 dias
      };

      // Chamar API do Fastify
      const response = await fetch('http://localhost:8081/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(receitaData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Receita criada com sucesso!');
        router.push('/prescricoes');
      } else {
        throw new Error('Erro ao criar receita');
      }
    } catch (error) {
      console.error('Erro ao criar receita:', error);
      alert('Erro ao criar receita. Verifique se o backend está rodando na porta 8081.');
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
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Criar Receita Médica</h1>
              <p className="text-slate-400">Prescrição de medicamentos</p>
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
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
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Endereço completo do paciente"
                  />
                </div>
              </div>
            </div>

            {/* Medicamentos */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Pill className="w-5 h-5 text-green-500" />
                  <h2 className="text-lg font-semibold text-white">Medicamentos Prescritos</h2>
                </div>
                <button
                  type="button"
                  onClick={adicionarMedicamento}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Medicamento</span>
                </button>
              </div>

              <div className="space-y-6">
                {medicamentos.map((medicamento, index) => (
                  <div key={index} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">Medicamento {index + 1}</h3>
                      {medicamentos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removerMedicamento(index)}
                          className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="col-span-full md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Nome do Medicamento *
                        </label>
                        <input
                          type="text"
                          value={medicamento.nome}
                          onChange={(e) => handleMedicamentoChange(index, 'nome', e.target.value)}
                          required
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: Dipirona 500mg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Dosagem *
                        </label>
                        <input
                          type="text"
                          value={medicamento.dosagem}
                          onChange={(e) => handleMedicamentoChange(index, 'dosagem', e.target.value)}
                          required
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: 500mg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Frequência *
                        </label>
                        <input
                          type="text"
                          value={medicamento.frequencia}
                          onChange={(e) => handleMedicamentoChange(index, 'frequencia', e.target.value)}
                          required
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: 8/8h"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Duração
                        </label>
                        <input
                          type="text"
                          value={medicamento.duracao}
                          onChange={(e) => handleMedicamentoChange(index, 'duracao', e.target.value)}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: 7 dias"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Quantidade
                        </label>
                        <input
                          type="text"
                          value={medicamento.quantidade}
                          onChange={(e) => handleMedicamentoChange(index, 'quantidade', e.target.value)}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: 20 comprimidos"
                        />
                      </div>

                      <div className="col-span-full">
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Orientações Específicas
                        </label>
                        <textarea
                          value={medicamento.orientacoes}
                          onChange={(e) => handleMedicamentoChange(index, 'orientacoes', e.target.value)}
                          rows={2}
                          className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ex: Tomar após as refeições"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações Gerais */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-lg font-semibold text-white mb-4">Observações Gerais</h2>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Observações médicas adicionais, recomendações especiais, etc."
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
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Criando...' : 'Criar Receita'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}