'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Signature, 
  Shield, 
  CheckCircle, 
  ArrowLeft, 
  FileText, 
  User, 
  Calendar, 
  Clock,
  Download,
  Send,
  Camera,
  Fingerprint,
  Lock,
  Eye,
  Pill
} from 'lucide-react';

export default function SignPrescriptionPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prescription, setPrescription] = useState<any>(null);
  const [signatureStep, setSignatureStep] = useState(1); // 1: Review, 2: Sign, 3: Complete
  const [biometricVerified, setBiometricVerified] = useState(false);

  useEffect(() => {
    // Carregar prescrição
    const currentPrescription = localStorage.getItem('repomed_current_prescription');
    if (currentPrescription) {
      setPrescription(JSON.parse(currentPrescription));
    } else {
      // Demo data
      setPrescription({
        id: '1',
        patientName: 'Maria Oliveira Santos',
        patientAge: 38,
        date: '2025-09-06',
        complaints: 'Dor de cabeça persistente há 3 dias, acompanhada de náusea e sensibilidade à luz',
        diagnosis: 'Enxaqueca (G43.9) - Episódio agudo',
        observations: 'Paciente relata histórico familiar de enxaqueca. Primeira consulta para este quadro.',
        returnDate: '2025-09-20',
        medications: [
          {
            name: 'Sumatriptana 50mg',
            dosage: '50mg',
            frequency: '1 comprimido',
            duration: '5 dias',
            instructions: 'Tomar 1 comprimido ao início da crise. Repetir após 2 horas se necessário, máximo 2 comprimidos/dia'
          },
          {
            name: 'Dipirona 500mg',
            dosage: '500mg',
            frequency: '1 comprimido de 6/6h',
            duration: '3 dias',
            instructions: 'Para alívio da dor. Tomar com água, preferencialmente após as refeições'
          }
        ],
        doctorName: 'Dr. João Silva',
        doctorCrm: 'CRM-SP 123456',
        status: 'pendente_assinatura'
      });
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e40af';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  };

  const simulateBiometric = () => {
    setLoading(true);
    setTimeout(() => {
      setBiometricVerified(true);
      setLoading(false);
    }, 3000);
  };

  const handleSign = () => {
    setLoading(true);
    
    setTimeout(() => {
      setSigned(true);
      setSignatureStep(3);
      
      // Salvar prescrição assinada
      const signedPrescription = {
        ...prescription,
        status: 'assinada',
        signedAt: new Date().toISOString(),
        signatureData: 'signature_hash_placeholder'
      };
      
      localStorage.setItem('repomed_current_prescription', JSON.stringify(signedPrescription));
      
      const prescriptions = JSON.parse(localStorage.getItem('repomed_prescriptions') || '[]');
      const updatedPrescriptions = prescriptions.map((p: any) => 
        p.id === prescription.id ? signedPrescription : p
      );
      localStorage.setItem('repomed_prescriptions', JSON.stringify(updatedPrescriptions));
      
      setLoading(false);
    }, 2000);
  };

  if (!prescription) {
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
                Assinatura Digital
              </h1>
              <p className="text-muted-foreground">Prescrição médica certificada ICP-Brasil</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {signatureStep === 1 && (
              <Badge variant="outline" className="px-4 py-2">
                <Eye className="w-4 h-4 mr-2" />
                Revisão
              </Badge>
            )}
            {signatureStep === 2 && (
              <Badge variant="outline" className="px-4 py-2 border-orange-200 text-orange-700">
                <Signature className="w-4 h-4 mr-2" />
                Assinando
              </Badge>
            )}
            {signatureStep === 3 && (
              <Badge className="px-4 py-2 bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-4 h-4 mr-2" />
                Assinada
              </Badge>
            )}
          </div>
        </div>

        {/* Prescrição Preview */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Receita Médica Digital</span>
              </CardTitle>
              <div className="text-right text-sm text-muted-foreground">
                <p>Receita Nº: {prescription.id.padStart(6, '0')}</p>
                <p>Data: {new Date(prescription.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Dados do Médico */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">{prescription.doctorName}</h3>
                  <p className="text-blue-700 text-sm">{prescription.doctorCrm}</p>
                  <p className="text-blue-600 text-xs">Especialidade: Cardiologia</p>
                </div>
              </div>
            </div>

            {/* Dados do Paciente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Paciente</p>
                <p className="font-semibold">{prescription.patientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-semibold">{prescription.patientAge || 38} anos</p>
              </div>
            </div>

            <Separator />

            {/* Diagnóstico */}
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Queixa Principal</h4>
                <p className="text-gray-700 text-sm bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                  {prescription.complaints}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Diagnóstico</h4>
                <p className="text-gray-700 text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                  {prescription.diagnosis}
                </p>
              </div>
            </div>

            <Separator />

            {/* Medicações */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Pill className="w-4 h-4 mr-2" />
                Prescrição Médica
              </h4>
              
              <div className="space-y-4">
                {prescription.medications.map((med: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Medicamento</p>
                        <p className="font-semibold text-blue-900">{med.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Posologia</p>
                        <p className="font-medium">{med.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Duração</p>
                        <p className="font-medium">{med.duration}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Instruções</p>
                      <p className="text-sm text-gray-700">{med.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {prescription.observations && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Observações</h4>
                  <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
                    {prescription.observations}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Processo de Assinatura */}
        {signatureStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Verificação de Segurança</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Antes de assinar digitalmente, confirme se todas as informações estão corretas.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Dados Verificados</p>
                    <p className="text-xs text-muted-foreground">Paciente e médico</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Prescrição Validada</p>
                    <p className="text-xs text-muted-foreground">Sem interações detectadas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">CRM Válido</p>
                    <p className="text-xs text-muted-foreground">Registro ativo</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="medical" 
                  onClick={() => setSignatureStep(2)}
                  className="min-w-[200px]"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Prosseguir para Assinatura
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {signatureStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assinatura Manual */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Signature className="w-5 h-5" />
                  <span>Assinatura Digital</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={200}
                    className="w-full h-48 border rounded cursor-crosshair bg-white"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                  />
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={clearSignature}
                    className="text-sm"
                  >
                    Limpar Assinatura
                  </Button>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Assine no campo acima usando mouse ou toque
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Verificação Biométrica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Fingerprint className="w-5 h-5" />
                  <span>Autenticação Biométrica</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!biometricVerified ? (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      {loading ? (
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <Fingerprint className="w-12 h-12 text-white" />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-medium">Verificação Biométrica</p>
                      <p className="text-sm text-muted-foreground">
                        {loading ? 'Verificando identidade...' : 'Clique para iniciar verificação'}
                      </p>
                    </div>
                    
                    <Button 
                      variant="outline"
                      onClick={simulateBiometric}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Verificando...' : 'Iniciar Verificação'}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    
                    <div>
                      <p className="font-medium text-green-700">Identidade Verificada</p>
                      <p className="text-sm text-muted-foreground">Dr. João Silva - CRM-SP 123456</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {signatureStep === 2 && (
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setSignatureStep(1)}>
              Voltar
            </Button>
            
            <Button 
              variant="medical"
              onClick={handleSign}
              disabled={!biometricVerified || loading}
              className="min-w-[200px]"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Assinando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4" />
                  <span>Assinar Digitalmente</span>
                </div>
              )}
            </Button>
          </div>
        )}

        {signatureStep === 3 && (
          <Card className="border-green-200 bg-green-50/30">
            <CardContent className="text-center space-y-6 py-8">
              <div className="w-20 h-20 mx-auto bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-green-800">Prescrição Assinada com Sucesso!</h3>
                <p className="text-green-700 mt-2">
                  A receita foi assinada digitalmente e está pronta para uso.
                </p>
              </div>
              
              <div className="bg-white/60 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-gray-600">
                  <strong>Hash de Verificação:</strong><br />
                  SHA256: a8f7e2d1c9b6a4f3e8d7c2b9a6f5e4d3c2b1a9f8e7d6c5b4a3f2e1d0c9b8a7f6
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Assinada em: {new Date().toLocaleString('pt-BR')}
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Baixar PDF</span>
                </Button>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Send className="w-4 h-4" />
                  <span>Enviar por Email</span>
                </Button>
                
                <Button 
                  variant="medical"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}