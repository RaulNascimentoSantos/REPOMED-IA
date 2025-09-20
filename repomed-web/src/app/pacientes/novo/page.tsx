'use client';

import BackButton from '@/app/components/BackButton';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  FileText,
  Heart,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function NovoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    rg: '',
    dataNascimento: '',
    sexo: '',
    telefone: '',
    celular: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    profissao: '',
    estadoCivil: '',
    contatoEmergencia: '',
    telefoneEmergencia: '',
    convenio: '',
    numeroCarteira: '',
    observacoes: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateAge = (birthDate: string): string => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} anos`;
    }
    return `${age} anos`;
  };

  const generateAvatar = (name: string): string => {
    return name.split(' ')
      .map(word => word.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getStatusBadge = (): { badge: string; color: string } => {
    // Default status for new patients
    return { badge: 'Estável', color: 'bg-green-500' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Calculate age and generate avatar
      const idade = formData.dataNascimento ? calculateAge(formData.dataNascimento) : '';
      const avatar = generateAvatar(formData.nome);
      const { badge, color } = getStatusBadge();

      // Prepare patient data for Fastify API
      const patientData = {
        nome: formData.nome,
        cpf: formData.cpf,
        rg: formData.rg,
        dataNascimento: formData.dataNascimento,
        sexo: formData.sexo,
        idade,
        telefone: formData.celular || formData.telefone,
        email: formData.email,
        endereco: `${formData.endereco}, ${formData.cidade}, ${formData.estado}`,
        cidade: formData.cidade,
        estado: formData.estado,
        cep: formData.cep,
        profissao: formData.profissao,
        estadoCivil: formData.estadoCivil,
        contatoEmergencia: formData.contatoEmergencia,
        telefoneEmergencia: formData.telefoneEmergencia,
        convenio: formData.convenio,
        numeroCarteira: formData.numeroCarteira,
        observacoes: formData.observacoes,
        condicoes: [], // Will be added later when medical conditions are registered
        statusBadge: badge,
        statusColor: color,
        avatar
      };

      // Create patient using Fastify API
      const response = await fetch('http://localhost:8081/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(patientData)
      });

      if (response.ok) {
        const newPatient = await response.json();
        console.log('Paciente criado com sucesso:', newPatient);
        alert('Paciente cadastrado com sucesso!');
        router.push('/pacientes');
      } else {
        throw new Error('Erro ao criar paciente no servidor');
      }
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      alert('Erro ao cadastrar paciente. Verifique se o backend está rodando na porta 8081.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <BackButton href="/pacientes" inline />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              👤 Novo Paciente
              <span className="text-lg bg-blue-600 text-white px-3 py-1 rounded-full">IA</span>
            </h1>
            <p className="text-slate-400 text-lg">
              Cadastre um novo paciente no sistema
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dados Pessoais */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Dados Pessoais
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    RG
                  </label>
                  <input
                    type="text"
                    name="rg"
                    value={formData.rg}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00.000.000-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
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

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Sexo *
                  </label>
                  <select
                    name="sexo"
                    value={formData.sexo}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Estado Civil
                  </label>
                  <select
                    name="estadoCivil"
                    value={formData.estadoCivil}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Solteiro(a)">Solteiro(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viúvo(a)">Viúvo(a)</option>
                    <option value="União Estável">União Estável</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Profissão
                  </label>
                  <input
                    type="text"
                    name="profissao"
                    value={formData.profissao}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Digite a profissão"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-400" />
              Contato
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 0000-0000"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Celular *
                  </label>
                  <input
                    type="tel"
                    name="celular"
                    value={formData.celular}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 90000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Endereço *
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, Número, Bairro"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Cidade"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Estado *
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">UF</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="RS">RS</option>
                    <option value="PR">PR</option>
                    <option value="SC">SC</option>
                    {/* Adicione outros estados conforme necessário */}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Contato de Emergência
                  </label>
                  <input
                    type="text"
                    name="contatoEmergencia"
                    value={formData.contatoEmergencia}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do contato"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Telefone de Emergência
                  </label>
                  <input
                    type="tel"
                    name="telefoneEmergencia"
                    value={formData.telefoneEmergencia}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(11) 90000-0000"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Convênio e Observações */}
        <div className="mt-8 bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Convênio e Observações
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Convênio
                </label>
                <select
                  name="convenio"
                  value={formData.convenio}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione o convênio</option>
                  <option value="particular">Particular</option>
                  <option value="unimed">Unimed</option>
                  <option value="bradesco">Bradesco Saúde</option>
                  <option value="amil">Amil</option>
                  <option value="porto">Porto Seguro</option>
                  <option value="santemed">SantéMed</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  Número da Carteira
                </label>
                <input
                  type="text"
                  name="numeroCarteira"
                  value={formData.numeroCarteira}
                  onChange={handleInputChange}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Número da carteirinha"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Observações
              </label>
              <textarea
                name="observacoes"
                value={formData.observacoes}
                onChange={handleInputChange}
                rows={4}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Observações importantes sobre o paciente..."
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Paciente
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}