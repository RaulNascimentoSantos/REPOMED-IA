'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Activity,
  Save,
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

export default function CreatePatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState({
    // Dados pessoais
    fullName: 'Maria Oliveira Santos',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    birthDate: '1985-03-15',
    gender: 'feminino',
    civilStatus: 'casada',
    
    // Contato
    phone: '(11) 99876-5432',
    email: 'maria.santos@email.com',
    emergencyContact: 'João Santos - (11) 98765-4321',
    
    // Endereço
    zipCode: '01310-100',
    address: 'Avenida Paulista, 1000',
    number: '1000',
    complement: 'Apto 123',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
    
    // Dados médicos
    bloodType: 'O+',
    allergies: 'Penicilina, Dipirona',
    chronicDiseases: 'Hipertensão, Diabetes Tipo 2',
    medications: 'Losartana 50mg, Metformina 850mg',
    insurance: 'Bradesco Saúde',
    insuranceNumber: '123456789012',
    
    // Informações clínicas
    height: '165',
    weight: '70',
    emergencyNotes: 'Paciente diabética - atenção especial à glicemia'
  });

  const handleInputChange = (field: string, value: string) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simular salvamento
    setTimeout(() => {
      // Salvar no localStorage para demonstração
      const patients = JSON.parse(localStorage.getItem('repomed_patients') || '[]');
      const newPatient = {
        ...patient,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'ativo'
      };
      
      patients.push(newPatient);
      localStorage.setItem('repomed_patients', JSON.stringify(patients));
      localStorage.setItem('repomed_current_patient', JSON.stringify(newPatient));
      
      setLoading(false);
      router.push('/patients/prescriptions/create');
    }, 2000);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBMI = (weight: string, height: string) => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (w && h) {
      return (w / (h * h)).toFixed(1);
    }
    return '0.0';
  };

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
                Novo Paciente
              </h1>
              <p className="text-muted-foreground">Cadastro completo de paciente</p>
            </div>
          </div>
          
          <Badge variant="outline" className="px-4 py-2">
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastro Ativo
          </Badge>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5" />
                <span>Dados Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <Input
                  label="Nome Completo"
                  value={patient.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  required
                />
              </div>
              
              <Input
                label="CPF"
                value={patient.cpf}
                onChange={(e) => handleInputChange('cpf', e.target.value)}
                mask="cpf"
              />
              
              <Input
                label="RG"
                value={patient.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
              />
              
              <Input
                label="Data de Nascimento"
                type="date"
                value={patient.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                helperText={`Idade: ${calculateAge(patient.birthDate)} anos`}
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-900">Gênero</label>
                <select 
                  className="input-modern w-full"
                  value={patient.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                >
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Informações de Contato</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefone"
                value={patient.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                mask="phone"
                leftIcon={<Phone className="w-4 h-4" />}
              />
              
              <Input
                label="Email"
                type="email"
                value={patient.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              
              <div className="md:col-span-2">
                <Input
                  label="Contato de Emergência"
                  value={patient.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Nome - Telefone"
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Endereço</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="CEP"
                value={patient.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                mask="cep"
              />
              
              <div className="lg:col-span-2">
                <Input
                  label="Endereço"
                  value={patient.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                />
              </div>
              
              <Input
                label="Número"
                value={patient.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
              />
              
              <Input
                label="Complemento"
                value={patient.complement}
                onChange={(e) => handleInputChange('complement', e.target.value)}
              />
              
              <Input
                label="Bairro"
                value={patient.neighborhood}
                onChange={(e) => handleInputChange('neighborhood', e.target.value)}
              />
              
              <Input
                label="Cidade"
                value={patient.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
              
              <Input
                label="Estado"
                value={patient.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                placeholder="SP"
              />
            </CardContent>
          </Card>

          {/* Dados Médicos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>Informações Médicas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Tipo Sanguíneo"
                  value={patient.bloodType}
                  onChange={(e) => handleInputChange('bloodType', e.target.value)}
                />
                
                <Input
                  label="Altura (cm)"
                  value={patient.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  type="number"
                />
                
                <Input
                  label="Peso (kg)"
                  value={patient.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  type="number"
                  helperText={`IMC: ${calculateBMI(patient.weight, patient.height)}`}
                />
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">Alergias</label>
                  <textarea
                    className="input-modern min-h-[80px] resize-none"
                    value={patient.allergies}
                    onChange={(e) => handleInputChange('allergies', e.target.value)}
                    placeholder="Liste todas as alergias conhecidas..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-900">Doenças Crônicas</label>
                  <textarea
                    className="input-modern min-h-[80px] resize-none"
                    value={patient.chronicDiseases}
                    onChange={(e) => handleInputChange('chronicDiseases', e.target.value)}
                    placeholder="Diabetes, Hipertensão, etc..."
                  />
                </div>
              </div>

              <Input
                label="Medicações em Uso"
                value={patient.medications}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                placeholder="Medicamentos e dosagens atuais"
              />

              <div className="glass p-4 rounded-lg border border-orange-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                  <div className="space-y-2 flex-1">
                    <label className="block text-sm font-medium text-orange-800">
                      Observações de Emergência
                    </label>
                    <textarea
                      className="w-full p-3 border border-orange-200 rounded-lg bg-white/50 text-sm"
                      value={patient.emergencyNotes}
                      onChange={(e) => handleInputChange('emergencyNotes', e.target.value)}
                      rows={2}
                      placeholder="Informações críticas para emergências..."
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Plano de Saúde</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Operadora"
                value={patient.insurance}
                onChange={(e) => handleInputChange('insurance', e.target.value)}
              />
              
              <Input
                label="Número da Carteirinha"
                value={patient.insuranceNumber}
                onChange={(e) => handleInputChange('insuranceNumber', e.target.value)}
              />
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
              disabled={loading}
              className="min-w-[200px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span>Salvar e Continuar</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}