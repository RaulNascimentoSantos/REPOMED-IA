import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Check, AlertTriangle, Upload, Key, Lock, User } from 'lucide-react';

const DocumentSigningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [signatureMethod, setSignatureMethod] = useState('icp_brasil');
  const [certificateFile, setCertificateFile] = useState(null);
  const [certificatePassword, setCertificatePassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const response = await fetch(`http://localhost:8082/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      } else {
        setError('Documento não encontrado');
      }
    } catch (error) {
      setError('Erro ao carregar documento');
      console.error('Error fetching document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignDocument = async () => {
    setSigning(true);
    setError(null);

    try {
      const signatureData = {
        provider: signatureMethod,
        certificate: certificateFile ? await convertFileToBase64(certificateFile) : null,
        password: certificatePassword
      };

      const response = await fetch(`http://localhost:8082/api/documents/${id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(signatureData)
      });

      if (response.ok) {
        const result = await response.json();
        setSuccess(true);
        // Refresh document data
        await fetchDocument();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao assinar documento');
      }
    } catch (error) {
      setError('Erro ao processar assinatura');
      console.error('Signing error:', error);
    } finally {
      setSigning(false);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setCertificateFile(file);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando documento...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Documento Assinado com Sucesso!</h2>
            <p className="text-gray-600 mb-6">
              O documento foi assinado digitalmente e está pronto para uso.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/documents/${id}`)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Ver Documento
              </button>
              <button
                onClick={() => navigate('/documents-list')}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Lista de Documentos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(`/documents/${id}`)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                Assinatura Digital
              </h1>
              <p className="text-gray-600 mt-1">
                Assine o documento digitalmente para validá-lo
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Document Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Documento a ser assinado
            </h3>
            
            {document && (
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <FileText className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">{document.templateName}</div>
                      <div className="text-sm text-gray-600 font-mono">{document.id}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Paciente:</span>
                      <div className="text-gray-900">{document.patient?.name}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">CPF:</span>
                      <div className="text-gray-900">{document.patient?.cpf}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Criado em:</span>
                      <div className="text-gray-900">
                        {new Date(document.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <div className="text-yellow-600">Aguardando Assinatura</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Importante:</p>
                      <p className="text-yellow-700">
                        Ao assinar este documento, você está confirmando sua autenticidade e 
                        concordando com todo o seu conteúdo. A assinatura digital tem validade 
                        jurídica equivalente à assinatura manuscrita.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Signature Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              Configurações da Assinatura
            </h3>

            <div className="space-y-6">
              {/* Signature Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Método de Assinatura
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="signatureMethod"
                      value="icp_brasil"
                      checked={signatureMethod === 'icp_brasil'}
                      onChange={(e) => setSignatureMethod(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">ICP-Brasil (Recomendado)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="signatureMethod"
                      value="mock"
                      checked={signatureMethod === 'mock'}
                      onChange={(e) => setSignatureMethod(e.target.value)}
                      className="form-radio h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-gray-700">Assinatura de Teste (Mock)</span>
                  </label>
                </div>
              </div>

              {/* Certificate Upload */}
              {signatureMethod === 'icp_brasil' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificado Digital (.p12/.pfx)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Selecionar certificado</span>
                          <input
                            type="file"
                            accept=".p12,.pfx"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        Arquivos .p12 ou .pfx até 10MB
                      </p>
                    </div>
                  </div>
                  {certificateFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Arquivo selecionado: {certificateFile.name}
                    </p>
                  )}
                </div>
              )}

              {/* Certificate Password */}
              {signatureMethod === 'icp_brasil' && certificateFile && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha do Certificado
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={certificatePassword}
                      onChange={(e) => setCertificatePassword(e.target.value)}
                      placeholder="Digite a senha do certificado"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {/* Sign Button */}
              <button
                onClick={handleSignDocument}
                disabled={signing || (signatureMethod === 'icp_brasil' && (!certificateFile || !certificatePassword))}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
              >
                {signing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Assinar Documento
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Sua assinatura será processada de forma segura usando criptografia de ponta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSigningPage;