'use client';

import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Pill,
  Save,
  X,
  Plus,
  Minus,
  User,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePrescriptionAutoSave, loadPrescriptionDraft, clearPrescriptionDraft } from '@/hooks/useAutoSave';
import { usePrescriptionFormShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ShortcutHelp } from '@/components/ui/ShortcutHelp';
// Updated to use Fastify API instead of localStorage

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Patient {
  id: string;
  nome: string;
  idade: string;
  telefone: string;
  email: string;
}

export default function NovaPrescricaoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [formData, setFormData] = useState({
    paciente: '',
    dataEmissao: new Date().toISOString().split('T')[0],
    dataValidade: '',
    observacoes: '',
    crm: 'CRM SP 123456' // Default CRM
  });

  const [medications, setMedications] = useState<Medication[]>([
    {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }
  ]);

  const isFormValid = formData.paciente && medications.some(med => med.name.trim() !== '');

  const autoSave = usePrescriptionAutoSave(
    { formData, medications },
    isFormValid
  );

  const addMedication = () => {
    setMedications(prev => [...prev, {
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    }]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formShortcuts = usePrescriptionFormShortcuts(
    () => handleSubmit(new Event('submit') as any),
    () => router.push('/prescricoes'),
    addMedication
  );


  useEffect(() => {
    // Load patients from Fastify API
    const fetchPatients = async () => {
      try {
        const response = await fetch('http://localhost:8081/patients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const apiPatients = await response.json();
          setPatients(apiPatients);
        } else {
          console.error('Failed to fetch patients from API');
          setPatients([]);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        setPatients([]);
      }
    };

    fetchPatients();

    // Load draft if available
    const draft = loadPrescriptionDraft();
    if (draft) {
      setFormData(prev => ({
        ...prev,
        ...draft.formData
      }));
      if (draft.medications) {
        setMedications(draft.medications);
      }
    } else {
      // Set default validity date (90 days from today)
      const validityDate = new Date();
      validityDate.setDate(validityDate.getDate() + 90);
      setFormData(prev => ({
        ...prev,
        dataValidade: validityDate.toISOString().split('T')[0]
      }));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    setMedications(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    if (!formData.paciente) {
      setSubmitError('Selecione um paciente');
      return false;
    }

    const validMedications = medications.filter(med => med.name.trim() !== '');
    if (validMedications.length === 0) {
      setSubmitError('Adicione pelo menos um medicamento');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) {
      return;
    }

    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setSubmitError('');

    try {
      const validMedications = medications.filter(med => med.name.trim() !== '');
      const medicationList = validMedications.map(med =>
        `${med.name} ${med.dosage} - ${med.frequency} por ${med.duration}`
      );

      const prescriptionData = {
        paciente: formData.paciente,
        medicamentos: medicationList,
        dataEmissao: formData.dataEmissao,
        dataValidade: formData.dataValidade,
        status: 'Ativa',
        statusColor: 'bg-green-500',
        crm: formData.crm,
        observacoes: formData.observacoes
      };

      const response = await fetch('http://localhost:8081/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(prescriptionData)
      });

      if (response.ok) {
        const newPrescription = await response.json();
        console.log('Prescrição criada:', newPrescription);
        clearPrescriptionDraft();
        setShowConfirmDialog(false);
        router.push('/prescricoes');
      } else {
        throw new Error('Failed to create prescription');
      }
    } catch (error) {
      console.error('Erro ao criar prescrição:', error);
      setSubmitError('Erro ao criar prescrição. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <BackButton href="/prescricoes" inline />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              💊 Nova Prescrição
              <span className="text-lg bg-green-600 text-white px-3 py-1 rounded-full">IA</span>
              {autoSave.isSaving && (
                <StatusBadge status="info" showIcon={false} className="text-xs">
                  Salvando...
                </StatusBadge>
              )}
            </h1>
            <p className="text-slate-400 text-lg">
              Criar nova prescrição médica com validação automática
            </p>
          </div>
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* Dados da Prescrição */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Dados da Prescrição
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Paciente *
              </label>
              {!formData.paciente && submitError && (
                <StatusBadge status="error">Campo obrigatório</StatusBadge>
              )}
              <select
                name="paciente"
                value={formData.paciente}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione um paciente</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.nome}>
                    {patient.nome} - {patient.idade}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                CRM Médico
              </label>
              <input
                type="text"
                name="crm"
                value={formData.crm}
                onChange={handleInputChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="CRM SP 123456"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Data de Emissão *
              </label>
              <input
                type="date"
                name="dataEmissao"
                value={formData.dataEmissao}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Data de Validade *
              </label>
              <input
                type="date"
                name="dataValidade"
                value={formData.dataValidade}
                onChange={handleInputChange}
                required
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Medicamentos */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-400" />
              Medicamentos Prescritos
            </h2>
            <button
              type="button"
              onClick={addMedication}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Adicionar Medicamento
            </button>
          </div>

          <div className="space-y-4">
            {medications.map((medication, index) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-medium">Medicamento {index + 1}</h3>
                  {medications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedication(index)}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Nome do Medicamento *
                    </label>
                    {!medication.name && submitError && (
                      <StatusBadge status="error">Campo obrigatório</StatusBadge>
                    )}
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Paracetamol"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Dosagem
                    </label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 500mg"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Frequência
                    </label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 3x ao dia"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Duração
                    </label>
                    <input
                      type="text"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 7 dias"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Instruções de Uso
                    </label>
                    <textarea
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                      rows={2}
                      className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Ex: Tomar após as refeições"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-6">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-orange-400" />
            Observações Gerais
          </h2>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Observações e Orientações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Instruções adicionais, observações médicas, recomendações especiais..."
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push('/prescricoes')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Cancelar
          </button>

          <div className="flex items-center gap-4">
            {formData.paciente && medications.some(med => med.name.trim() !== '') && (
              <StatusBadge status="success">Pronto para assinar</StatusBadge>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-lg transition-colors"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando Prescrição...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Prescrição
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error feedback */}
        {submitError && (
          <div className="mt-4">
            <StatusBadge status="error">
              {submitError}
            </StatusBadge>
          </div>
        )}
      </form>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirm}
        title="Confirmar Criação da Prescrição"
        description="Revise os dados da prescrição antes de finalizar. Esta ação criará uma nova prescrição no sistema."
        confirmText="Criar Prescrição"
        cancelText="Revisar"
        variant="medical"
        isLoading={loading}
        error={submitError}
        prescriptionSummary={{
          patientName: formData.paciente,
          medications: medications.filter(med => med.name.trim() !== '').map(med =>
            `${med.name} ${med.dosage} - ${med.frequency}${med.duration ? ` por ${med.duration}` : ''}`
          ),
          totalItems: medications.filter(med => med.name.trim() !== '').length
        }}
      />

      <ShortcutHelp
        shortcuts={formShortcuts.shortcuts}
      />
    </div>
  );
}