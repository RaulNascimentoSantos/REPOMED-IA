'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  User,
  Calendar,
  Clock,
  Heart,
  Activity,
  Pill,
  Stethoscope,
  FileText,
  AlertCircle,
  Plus,
  X,
  Upload,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MedicationEntry {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function NovoProntuarioPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    type: 'consulta',
    department: '',
    physician: '',
    chiefComplaint: '',
    historyOfPresentIllness: '',
    pastMedicalHistory: '',
    familyHistory: '',
    socialHistory: '',
    physicalExamination: '',
    diagnosis: '',
    treatmentPlan: '',
    observations: '',
    priority: 'medium',
    followUpDate: '',
    status: 'active'
  });

  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: '',
    duration: ''
  });

  const [attachments, setAttachments] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage) {
      const medication: MedicationEntry = {
        id: Date.now().toString(),
        ...newMedication
      };
      setMedications(prev => [...prev, medication]);
      setNewMedication({ name: '', dosage: '', frequency: '', duration: '' });
    }
  };

  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(med => med.id !== id));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate prontuario ID
    const prontuarioId = `PRON-${String(Math.floor(Math.random() * 9999) + 1).padStart(3, '0')}`;

    console.log('Novo prontuário criado:', {
      id: prontuarioId,
      ...formData,
      medications,
      attachments: attachments.map(f => f.name)
    });

    setIsLoading(false);
    router.push('/pacientes/prontuarios');
  };

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-primary)'}}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="semantic-card rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/pacientes/prontuarios')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Novo Prontuário Médico
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Criação de novo registro médico
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações do Paciente */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Informações do Paciente
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  ID do Paciente *
                </label>
                <input
                  type="text"
                  name="patientId"
                  value={formData.patientId}
                  onChange={handleInputChange}
                  placeholder="PAC-001"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nome do Paciente *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  placeholder="Nome completo do paciente"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações da Consulta */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Informações da Consulta
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Data *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Horário *
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tipo de Atendimento *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="consulta">Consulta</option>
                  <option value="exame">Exame</option>
                  <option value="cirurgia">Cirurgia</option>
                  <option value="retorno">Retorno</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Departamento *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  placeholder="Ex: Cardiologia, Neurologia..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Médico Responsável *
                </label>
                <input
                  type="text"
                  name="physician"
                  value={formData.physician}
                  onChange={handleInputChange}
                  placeholder="Dr(a). Nome do médico"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Prioridade
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="medium">Média</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>
          </div>

          {/* Anamnese */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Stethoscope className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Anamnese
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Queixa Principal
                </label>
                <textarea
                  name="chiefComplaint"
                  value={formData.chiefComplaint}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Descreva a queixa principal do paciente..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  História da Doença Atual
                </label>
                <textarea
                  name="historyOfPresentIllness"
                  value={formData.historyOfPresentIllness}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descreva a evolução dos sintomas..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Antecedentes Pessoais
                  </label>
                  <textarea
                    name="pastMedicalHistory"
                    value={formData.pastMedicalHistory}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Doenças prévias, cirurgias, alergias..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Antecedentes Familiares
                  </label>
                  <textarea
                    name="familyHistory"
                    value={formData.familyHistory}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Histórico familiar relevante..."
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                             bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Exame Físico */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Exame Físico
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Achados do Exame Físico
              </label>
              <textarea
                name="physicalExamination"
                value={formData.physicalExamination}
                onChange={handleInputChange}
                rows={4}
                placeholder="Descreva os achados do exame físico (sinais vitais, ausculta, palpação, etc.)..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                         bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Diagnóstico e Plano */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Diagnóstico e Plano Terapêutico
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Diagnóstico *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="CID-10 + descrição do diagnóstico..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Plano Terapêutico
                </label>
                <textarea
                  name="treatmentPlan"
                  value={formData.treatmentPlan}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descrição do plano de tratamento..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Medicações */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Pill className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Medicações Prescritas
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <input
                  type="text"
                  placeholder="Nome da medicação"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Dosagem"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Frequência"
                  value={newMedication.frequency}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, frequency: e.target.value }))}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="button"
                  onClick={addMedication}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {medications.length > 0 && (
                <div className="space-y-2">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className="flex items-center justify-between p-3 rounded-lg card-secondary"
                    >
                      <div>
                        <span className="font-medium text-slate-800 dark:text-white">
                          {med.name}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 ml-2">
                          {med.dosage} - {med.frequency}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(med.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Observações */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Observações Gerais
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Observações
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Observações adicionais, orientações ao paciente..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Data de Retorno
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={formData.followUpDate}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg
                           bg-white dark:bg-slate-700 text-slate-900 dark:text-white
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Anexos */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                Anexos
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <input
                  type="file"
                  id="attachments"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <label
                  htmlFor="attachments"
                  className="flex items-center justify-center gap-2 p-4 border-2 border-dashed
                           border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer
                           hover:border-blue-500 transition-colors"
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Clique para anexar arquivos ou arraste aqui
                  </span>
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg card-secondary"
                    >
                      <span className="text-slate-800 dark:text-white">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push('/pacientes/prontuarios')}
                className="text-slate-600 hover:text-slate-800"
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                >
                  Salvar Rascunho
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Criar Prontuário
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}