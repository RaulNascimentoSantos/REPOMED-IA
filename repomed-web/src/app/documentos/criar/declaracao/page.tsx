'use client';

import BackButton from '@/app/components/BackButton';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  User,
  Calendar,
  Save,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle
} from 'lucide-react';

export default function CriarDeclaracaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Dados do falecido
    nomeFalecido: '',
    cpfFalecido: '',
    rgFalecido: '',
    dataNascimento: '',
    sexo: '',
    cor: '',
    estadoCivil: '',
    profissao: '',
    naturalidade: '',
    nacionalidade: 'Brasileira',

    // Dados dos pais
    nomePai: '',
    nomeMae: '',

    // Local e data do óbito
    dataObito: '',
    horaObito: '',
    localObito: '',
    enderecoObito: '',
    municipioObito: '',
    ufObito: '',

    // Causa da morte
    causaImediata: '',
    causaAntecedente1: '',
    causaAntecedente2: '',
    causaBasica: '',
    outrasCondicoes: '',
    tipoMorte: 'natural',

    // Dados médicos
    cid: '',
    necropsia: 'nao',
    tempoDoenca: '',
    cirurgia: 'nao',
    dataCirurgia: '',

    // Responsável
    responsavelDeclaracao: '',
    crmResponsavel: '',
    dataDeclaracao: new Date().toISOString().split('T')[0],

    // Observações
    observacoes: ''
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
      // Simular criação da declaração
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Redirecionar para assinatura
      router.push('/assinatura');
    } catch (error) {
      console.error('Erro ao criar declaração:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Simular salvamento como rascunho
    console.log('Declaração salva como rascunho:', formData);
  };

  return (
    <div className="p-6 relative">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-white">Declaração de Óbito</h1>
          </div>
          <p className="text-slate-400 text-lg">
            Declaração oficial de óbito com protocolo de registro
          </p>
        </div>

        {/* Aviso importante */}
        <div className="mb-8 bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-red-300 font-medium mb-1">Documento Oficial de Alta Responsabilidade</h4>
              <p className="text-red-200 text-sm">
                Esta declaração possui validade jurídica e deve ser preenchida com máxima precisão.
                Todos os campos obrigatórios devem ser devidamente preenchidos conforme regulamentação do CFM.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados do Falecido */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-400" />
              Dados do Falecido
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo do Falecido *
                </label>
                <input
                  type="text"
                  name="nomeFalecido"
                  value={formData.nomeFalecido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome completo sem abreviações"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CPF *
                </label>
                <input
                  type="text"
                  name="cpfFalecido"
                  value={formData.cpfFalecido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  RG *
                </label>
                <input
                  type="text"
                  name="rgFalecido"
                  value={formData.rgFalecido}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Número do RG"
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
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Sexo *
                </label>
                <select
                  name="sexo"
                  value={formData.sexo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Cor *
                </label>
                <select
                  name="cor"
                  value={formData.cor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="branca">Branca</option>
                  <option value="preta">Preta</option>
                  <option value="amarela">Amarela</option>
                  <option value="parda">Parda</option>
                  <option value="indigena">Indígena</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Estado Civil *
                </label>
                <select
                  name="estadoCivil"
                  value={formData.estadoCivil}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="separado">Separado(a)</option>
                  <option value="uniao-estavel">União Estável</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Profissão
                </label>
                <input
                  type="text"
                  name="profissao"
                  value={formData.profissao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Profissão exercida"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Pai
                </label>
                <input
                  type="text"
                  name="nomePai"
                  value={formData.nomePai}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome completo do pai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome da Mãe *
                </label>
                <input
                  type="text"
                  name="nomeMae"
                  value={formData.nomeMae}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Nome completo da mãe"
                  required
                />
              </div>
            </div>
          </div>

          {/* Local e Data do Óbito */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-orange-400" />
              Local e Data do Óbito
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data do Óbito *
                </label>
                <input
                  type="date"
                  name="dataObito"
                  value={formData.dataObito}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hora do Óbito *
                </label>
                <input
                  type="time"
                  name="horaObito"
                  value={formData.horaObito}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Local do Óbito *
                </label>
                <select
                  name="localObito"
                  value={formData.localObito}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  <option value="hospital">Hospital</option>
                  <option value="domicilio">Domicílio</option>
                  <option value="via-publica">Via Pública</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Município do Óbito *
                </label>
                <input
                  type="text"
                  name="municipioObito"
                  value={formData.municipioObito}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Município onde ocorreu o óbito"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Endereço do Óbito *
                </label>
                <input
                  type="text"
                  name="enderecoObito"
                  value={formData.enderecoObito}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Endereço completo onde ocorreu o óbito"
                  required
                />
              </div>
            </div>
          </div>

          {/* Causa da Morte */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-green-400" />
              Causa da Morte
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Morte *
                </label>
                <select
                  name="tipoMorte"
                  value={formData.tipoMorte}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="natural">Natural</option>
                  <option value="acidental">Acidental</option>
                  <option value="suicidio">Suicídio</option>
                  <option value="homicidio">Homicídio</option>
                  <option value="ignorada">Ignorada</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Causa Imediata da Morte *
                </label>
                <textarea
                  name="causaImediata"
                  value={formData.causaImediata}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Causa que levou diretamente à morte"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Causa Antecedente 1
                </label>
                <textarea
                  name="causaAntecedente1"
                  value={formData.causaAntecedente1}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Condição que levou à causa imediata"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Causa Básica da Morte *
                </label>
                <textarea
                  name="causaBasica"
                  value={formData.causaBasica}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Doença ou lesão que iniciou a sucessão de eventos"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CID-10 *
                  </label>
                  <input
                    type="text"
                    name="cid"
                    value={formData.cid}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Ex: I21.9"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Necropsia *
                  </label>
                  <select
                    name="necropsia"
                    value={formData.necropsia}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Dados do Médico Responsável */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Shield className="w-6 h-6 text-purple-400" />
              Médico Responsável pela Declaração
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome do Médico *
                </label>
                <input
                  type="text"
                  name="responsavelDeclaracao"
                  value={formData.responsavelDeclaracao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  CRM *
                </label>
                <input
                  type="text"
                  name="crmResponsavel"
                  value={formData.crmResponsavel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Data da Declaração *
                </label>
                <input
                  type="date"
                  name="dataDeclaracao"
                  value={formData.dataDeclaracao}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Observações adicionais sobre a declaração..."
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
                    ? 'bg-red-600/50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transform hover:scale-105'
                } text-white font-semibold`}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Criando Declaração...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Criar Declaração
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Informação sobre assinatura digital */}
        <div className="mt-8 bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h4 className="text-red-300 font-medium mb-1">Documento Oficial de Alta Responsabilidade</h4>
              <p className="text-red-200 text-sm">
                Esta declaração será direcionada para assinatura digital obrigatória e possui
                validade jurídica plena conforme regulamentação do CFM e legislação vigente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}