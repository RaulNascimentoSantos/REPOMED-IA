'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Pill, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  Save, 
  ArrowLeft, 
  Plus, 
  X,
  User,
  FileText,
  Signature,
  CheckCircle,
  Stethoscope
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [prescription, setPrescription] = useState({
    date: new Date().toISOString().split('T')[0],
    complaints: 'Dor de cabeça persistente há 3 dias, acompanhada de náusea e sensibilidade à luz',
    diagnosis: 'Enxaqueca (G43.9) - Episódio agudo',
    observations: 'Paciente relata histórico familiar de enxaqueca. Primeira consulta para este quadro.',
    returnDate: '2025-09-20',
    medications: [
      {
        id: '1',
        name: 'Sumatriptana 50mg',
        dosage: '50mg',
        frequency: '1 comprimido',
        duration: '5 dias',
        instructions: 'Tomar 1 comprimido ao início da crise. Repetir após 2 horas se necessário, máximo 2 comprimidos/dia'
      },
      {
        id: '2',
        name: 'Dipirona 500mg',
        dosage: '500mg',
        frequency: '1 comprimido de 6/6h',
        duration: '3 dias',
        instructions: 'Para alívio da dor. Tomar com água, preferencialmente após as refeições'
      }
    ] as Medication[]
  });

  useEffect(() => {
    // Buscar dados do paciente
    const currentPatient = localStorage.getItem('repomed_current_patient');
    if (currentPatient) {
      setPatient(JSON.parse(currentPatient));
    } else {
      // Dados demo se não houver paciente
      setPatient({
        id: '1',
        fullName: 'Maria Oliveira Santos',
        birthDate: '1985-03-15',
        cpf: '123.456.789-00',
        insurance: 'Bradesco Saúde',
        allergies: 'Penicilina, Dipirona',
        chronicDiseases: 'Hipertensão, Diabetes Tipo 2'
      });
    }
  }, []);

  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: ''
    };
    setPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const updateMedication = (id: string, field: keyof Medication, value: string) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (id: string) => {
    setPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular salvamento
    setTimeout(() => {
      const prescriptionData = {
        ...prescription,
        id: Date.now().toString(),
        patientId: patient?.id,
        patientName: patient?.fullName,
        doctorName: 'Dr. João Silva',
        doctorCrm: 'CRM-SP 123456',
        createdAt: new Date().toISOString(),
        status: 'pendente_assinatura'
      };
      
      // Salvar prescrição
      const prescriptions = JSON.parse(localStorage.getItem('repomed_prescriptions') || '[]');
      prescriptions.push(prescriptionData);
      localStorage.setItem('repomed_prescriptions', JSON.stringify(prescriptions));
      localStorage.setItem('repomed_current_prescription', JSON.stringify(prescriptionData));
      
      setLoading(false);
      router.push('/prescriptions/sign');
    }, 2000);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    return age;
  };

  if (!patient) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Nova Receita Médica
              </h1>
              <p className="text-muted-foreground">Prescrição digital com assinatura certificada</p>
            </div>
          </div>
          
          <Badge variant="outline" className="px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            Em Edição
          </Badge>
        </div>

        {/* Informações do Paciente */}
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Paciente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-semibold">{patient.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-semibold">{calculateAge(patient.birthDate)} anos</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPF</p>
                <p className="font-semibold">{patient.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Convênio</p>
                <p className="font-semibold">{patient.insurance}</p>
              </div>
            </div>
            
            {(patient.allergies || patient.chronicDiseases) && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.allergies && (
                    <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Alergias</span>
                      </div>
                      <p className="text-sm text-red-700">{patient.allergies}</p>
                    </div>
                  )}
                  
                  {patient.chronicDiseases && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Comorbidades</span>
                      </div>
                      <p className="text-sm text-orange-700">{patient.chronicDiseases}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Dados da Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Dados da Consulta</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Data da Consulta"
                  type="date"
                  value={prescription.date}
                  onChange={(e) => setPrescription(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
                
                <Input
                  label="Retorno"
                  type="date"
                  value={prescription.returnDate}
                  onChange={(e) => setPrescription(prev => ({ ...prev, returnDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Queixa Principal</label>
                <textarea
                  className="input-modern min-h-[80px] resize-none"
                  value={prescription.complaints}
                  onChange={(e) => setPrescription(prev => ({ ...prev, complaints: e.target.value }))}
                  placeholder="Descreva os sintomas relatados pelo paciente..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Diagnóstico (CID-10)</label>
                <Input
                  value={prescription.diagnosis}
                  onChange={(e) => setPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Ex: Enxaqueca (G43.9)"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Observações</label>
                <textarea
                  className="input-modern min-h-[60px] resize-none"
                  value={prescription.observations}
                  onChange={(e) => setPrescription(prev => ({ ...prev, observations: e.target.value }))}
                  placeholder="Observações adicionais sobre o quadro clínico..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Medicações */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Pill className="w-5 h-5" />
                <span>Prescrição Médica</span>
              </CardTitle>
              
              <Button 
                type="button"
                variant="outline"
                onClick={addMedication}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Medicamento</span>
              </Button>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div key={medication.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50/30">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Medicamento {index + 1}</h4>
                    {prescription.medications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(medication.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="lg:col-span-2">
                      <Input
                        label="Nome do Medicamento"
                        value={medication.name}
                        onChange={(e) => updateMedication(medication.id, 'name', e.target.value)}
                        placeholder="Ex: Dipirona 500mg"
                        required
                      />
                    </div>
                    
                    <Input
                      label="Dosagem"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(medication.id, 'dosage', e.target.value)}
                      placeholder="Ex: 500mg"
                      required
                    />
                    
                    <Input
                      label="Frequência"
                      value={medication.frequency}
                      onChange={(e) => updateMedication(medication.id, 'frequency', e.target.value)}
                      placeholder="Ex: 8/8h"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <Input
                      label="Duração do Tratamento"
                      value={medication.duration}
                      onChange={(e) => updateMedication(medication.id, 'duration', e.target.value)}
                      placeholder="Ex: 7 dias"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-900">Instruções de Uso</label>
                    <textarea
                      className="input-modern min-h-[60px] resize-none"
                      value={medication.instructions}
                      onChange={(e) => updateMedication(medication.id, 'instructions', e.target.value)}
                      placeholder="Ex: Tomar com água, após as refeições. Em caso de dor intensa, repetir a dose após 6 horas."
                      required
                    />
                  </div>
                </div>
              ))}
              
              {prescription.medications.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhum medicamento adicionado</p>
                  <p className="text-sm">Clique em "Adicionar Medicamento" para começar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            
            <Button 
              type="submit" 
              variant="medical"
              size="lg"
              disabled={loading || prescription.medications.length === 0}
              className="min-w-[200px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Signature className="w-4 h-4" />
                  <span>Salvar e Assinar</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}