'use client';


import BackButton from '@/app/components/BackButton';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Key,
  Lock,
  CheckCircle,
  AlertTriangle,
  FileCheck,
  Clock,
  Download,
  Upload,
  Stamp,
  Award,
  Zap,
  Eye,
  RefreshCw,
  FileText,
  Calendar,
  User,
  Settings,
  Globe,
  Smartphone,
  Fingerprint,
  QrCode,
  ArrowLeft,
  Copy,
  ExternalLink
} from 'lucide-react';
interface PendingDocument {
  id: string;
  title: string;
  type: string;
  patient: string;
  createdAt: string;
  size: string;
  urgent?: boolean;
}

interface Certificate {
  id: string;
  name: string;
  type: string;
  issuer: string;
  validUntil: string;
  status: 'valid' | 'expired' | 'expiring';
  serialNumber: string;
}

export default function AssinaturaDigitalPage() {
  const router = useRouter();
  const [selectedCertificate, setSelectedCertificate] = useState<string>('');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [signingInProgress, setSigningInProgress] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState<'certificate' | 'biometric' | 'mobile'>('certificate');
  const [showCertificateDetails, setShowCertificateDetails] = useState(false);
  const [documents, setDocuments] = useState<PendingDocument[]>([]);

  useEffect(() => {
    // Load unsigned documents from Fastify API
    const fetchDocuments = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/documents', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        });

        if (response.ok) {
          const allDocuments = await response.json();
          const unsignedDocs = allDocuments
            .filter((doc: any) => !doc.signed)
            .map((doc: any) => ({
              id: doc.id,
              title: doc.title,
              type: doc.type,
              patient: doc.patient,
              createdAt: new Date(doc.createdAt).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
              }),
              size: `${Math.round(doc.content ? doc.content.length / 1024 * 10 : 1.5)} KB`,
              urgent: false
            }));
          setDocuments(unsignedDocs);
        } else {
          console.error('Failed to fetch documents from API');
          // Fallback to empty array if API is not available
          setDocuments([]);
        }
      } catch (error) {
        console.error('Error fetching documents:', error);
        // Fallback to empty array if API is not available
        setDocuments([]);
      }
    };

    fetchDocuments();
  }, []);

  const certificates: Certificate[] = [
    {
      id: '1',
      name: 'Dr. João Silva - CRM SP 123456',
      type: 'A3 - ICP-Brasil',
      issuer: 'Serpro',
      validUntil: '15/12/2025',
      status: 'valid',
      serialNumber: '1234567890ABCDEF'
    },
    {
      id: '2',
      name: 'Dr. João Silva - Backup',
      type: 'A1 - ICP-Brasil',
      issuer: 'Certisign',
      validUntil: '30/06/2024',
      status: 'expiring',
      serialNumber: 'ABCDEF1234567890'
    }
  ];

  const handleDocumentSelection = (docId: string) => {
    setSelectedDocuments(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const selectAllDocuments = () => {
    setSelectedDocuments(documents.map(doc => doc.id));
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
  };

  const handleSignDocuments = async () => {
    if (selectedDocuments.length === 0 || !selectedCertificate) {
      alert('Selecione pelo menos um documento e um certificado.');
      return;
    }

    setSigningInProgress(true);

    try {
      // Simulate signing process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Sign documents using Fastify API
      let signedCount = 0;

      for (const docId of selectedDocuments) {
        try {
          const response = await fetch(`http://localhost:8081/api/documents/${docId}/sign`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            },
            body: JSON.stringify({
              certificateId: selectedCertificate,
              signatureMethod: signatureMethod
            })
          });

          if (response.ok) {
            signedCount++;
          } else {
            console.error(`Failed to sign document ${docId}`);
          }
        } catch (error) {
          console.error(`Error signing document ${docId}:`, error);
        }
      }

      if (signedCount > 0) {
        alert(`${signedCount} documentos assinados com sucesso!`);

        // Refresh the documents list from API
        try {
          const response = await fetch('http://localhost:8081/api/documents', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          });

          if (response.ok) {
            const allDocuments = await response.json();
            const unsignedDocs = allDocuments
              .filter((doc: any) => !doc.signed)
              .map((doc: any) => ({
                id: doc.id,
                title: doc.title,
                type: doc.type,
                patient: doc.patient,
                createdAt: new Date(doc.createdAt).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                }),
                size: `${Math.round(doc.content ? doc.content.length / 1024 * 10 : 1.5)} KB`,
                urgent: false
              }));
            setDocuments(unsignedDocs);
          }
        } catch (error) {
          console.error('Error refreshing documents:', error);
        }

        setSelectedDocuments([]);
      } else {
        alert('Erro ao assinar documentos. Verifique se o backend está rodando na porta 8081.');
      }
    } catch (error) {
      console.error('Erro no processo de assinatura:', error);
      alert('Erro ao assinar documentos. Verifique se o backend está rodando na porta 8081.');
    } finally {
      setSigningInProgress(false);
    }
  };

  const getCertificateStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'text-green-400 bg-green-600';
      case 'expired': return 'text-red-400 bg-red-600';
      case 'expiring': return 'text-orange-400 bg-orange-600';
      default: return 'text-gray-400 bg-gray-600';
    }
  };

  const getCertificateStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'Válido';
      case 'expired': return 'Expirado';
      case 'expiring': return 'Expirando';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton href="/" inline />
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                🔐 Assinatura Digital
                <span className="text-lg bg-blue-600 text-white px-3 py-1 rounded-full">
                  {documents.length} Pendentes
                </span>
              </h1>
              <p className="text-slate-400 text-lg">
                Central de assinatura digital com certificado ICP-Brasil válido juridicamente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowCertificateDetails(!showCertificateDetails)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all transform hover:scale-105"
            >
              <Key className="w-5 h-5" />
              Certificados
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all transform hover:scale-105">
              <Upload className="w-5 h-5" />
              Importar Certificado
            </button>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Documentos Pendentes</p>
              <p className="text-3xl font-bold text-white">{documents.length}</p>
            </div>
            <FileText className="w-12 h-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Assinados Hoje</p>
              <p className="text-3xl font-bold text-white">12</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Certificados Ativos</p>
              <p className="text-3xl font-bold text-white">{certificates.filter(c => c.status === 'valid').length}</p>
            </div>
            <Shield className="w-12 h-12 text-purple-400" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/20 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Validade</p>
              <p className="text-3xl font-bold text-white">15/12/25</p>
            </div>
            <Calendar className="w-12 h-12 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Documents Section - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Selection */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Documentos para Assinatura
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllDocuments}
                  className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={clearSelection}
                  className="text-sm px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                >
                  Limpar
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => handleDocumentSelection(doc.id)}
                  className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                    selectedDocuments.includes(doc.id)
                      ? 'bg-blue-600/20 border border-blue-500'
                      : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedDocuments.includes(doc.id)
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-500'
                    }`}>
                      {selectedDocuments.includes(doc.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <FileText className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{doc.title}</p>
                      <p className="text-slate-400 text-sm">{doc.type} • {doc.size}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {doc.urgent && (
                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                        Urgente
                      </span>
                    )}
                    <span className="text-slate-400 text-sm">{doc.createdAt}</span>
                    <button className="p-1 hover:bg-slate-600 rounded transition-colors">
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Signing Action */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <button
                onClick={handleSignDocuments}
                disabled={selectedDocuments.length === 0 || !selectedCertificate || signingInProgress}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white py-4 rounded-xl transition-colors font-semibold"
              >
                {signingInProgress ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Assinando {selectedDocuments.length} documentos...
                  </>
                ) : (
                  <>
                    <Stamp className="w-5 h-5" />
                    Assinar {selectedDocuments.length > 0 ? selectedDocuments.length : ''} Documento{selectedDocuments.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Certificate and Settings Section - 1 column */}
        <div className="space-y-6">
          {/* Certificate Selection */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              Certificado Digital
            </h4>

            <div className="space-y-3">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  onClick={() => setSelectedCertificate(cert.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedCertificate === cert.id
                      ? 'bg-green-600/20 border border-green-500'
                      : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      selectedCertificate === cert.id
                        ? 'bg-green-600 border-green-600'
                        : 'border-slate-500'
                    }`} />
                    <Lock className="w-4 h-4 text-green-400" />
                    <span className="text-white text-sm font-medium">{cert.name}</span>
                  </div>

                  <div className="ml-7 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Tipo:</span>
                      <span className="text-white">{cert.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Emissor:</span>
                      <span className="text-white">{cert.issuer}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Validade:</span>
                      <span className="text-white">{cert.validUntil}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getCertificateStatusColor(cert.status)}`}>
                        {getCertificateStatusText(cert.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Methods */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-purple-400" />
              Método de Assinatura
            </h4>

            <div className="space-y-3">
              <div
                onClick={() => setSignatureMethod('certificate')}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  signatureMethod === 'certificate'
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Key className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Certificado Digital</p>
                    <p className="text-slate-400 text-xs">ICP-Brasil A3/A1</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSignatureMethod('biometric')}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  signatureMethod === 'biometric'
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Biometria</p>
                    <p className="text-slate-400 text-xs">Digital + Facial</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => setSignatureMethod('mobile')}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  signatureMethod === 'mobile'
                    ? 'bg-purple-600/20 border border-purple-500'
                    : 'bg-slate-700 hover:bg-slate-600 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-medium">Mobile</p>
                    <p className="text-slate-400 text-xs">SMS + Token</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-green-400" />
              Conformidade Legal
            </h4>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-green-300 text-sm font-medium">MP 2.200-2/2001</p>
                  <p className="text-green-400 text-xs">Validade jurídica garantida</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                <Award className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-300 text-sm font-medium">CFM Aprovado</p>
                  <p className="text-blue-400 text-xs">Resolução CFM nº 1.821/07</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                <Globe className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-purple-300 text-sm font-medium">ICP-Brasil</p>
                  <p className="text-purple-400 text-xs">Infraestrutura oficial</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}