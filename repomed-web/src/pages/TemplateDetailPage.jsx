import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Edit, Copy, Shield, User, Clock, AlertCircle } from 'lucide-react';

const TemplateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTemplate();
  }, [id]);

  const fetchTemplate = async () => {
    try {
      const response = await fetch(`http://localhost:8085/api/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        setTemplate(data);
      } else {
        setError('Template não encontrado');
      }
    } catch (error) {
      setError('Erro ao carregar template');
      console.error('Error fetching template:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSpecialtyName = (specialty) => {
    const names = {
      'clinica_geral': 'Clínica Geral',
      'cardiologia': 'Cardiologia',
      'pediatria': 'Pediatria',
      'ginecologia': 'Ginecologia'
    };
    return names[specialty] || specialty;
  };

  const getFieldTypeLabel = (type) => {
    const types = {
      'text': 'Texto',
      'textarea': 'Texto Longo',
      'number': 'Número',
      'date': 'Data',
      'select': 'Seleção',
      'array': 'Lista'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando template...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/templates"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar aos Templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/templates')}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <FileText className="h-8 w-8 text-blue-600 mr-3" />
                  {template.name}
                </h1>
                <div className="flex items-center mt-1 space-x-4">
                  <span className="text-gray-600">{getSpecialtyName(template.specialty)}</span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    v{template.version}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center">
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </button>
              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <Link 
                to={`/documents/create?template=${template.id}`}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
              >
                <FileText className="h-4 w-4 mr-2" />
                Usar Template
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Template Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">ID:</span>
                  <div className="font-mono text-sm text-gray-900">{template.id}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Especialidade:</span>
                  <div className="text-gray-900">{getSpecialtyName(template.specialty)}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Versão:</span>
                  <div className="text-gray-900">{template.version}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Campos:</span>
                  <div className="text-gray-900">{template.fields?.length || 0} campos</div>
                </div>
              </div>
            </div>

            {/* Compliance */}
            {template.compliance && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Conformidade
                </h3>
                <div className="space-y-2">
                  {template.compliance.cfm && (
                    <div className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Resolução CFM
                    </div>
                  )}
                  {template.compliance.anvisa && (
                    <div className="flex items-center text-green-700">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      Conformidade ANVISA
                    </div>
                  )}
                  {template.compliance.requires_signature && (
                    <div className="flex items-center text-blue-700">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      Assinatura Digital Obrigatória
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Template Content and Fields */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fields */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Campos do Formulário
              </h3>
              {template.fields && template.fields.length > 0 ? (
                <div className="space-y-4">
                  {template.fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{field.label}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                            {getFieldTypeLabel(field.type)}
                          </span>
                          {field.required && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                              Obrigatório
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><strong>ID:</strong> {field.id}</div>
                        {field.default && <div><strong>Valor Padrão:</strong> {field.default}</div>}
                        {field.options && (
                          <div>
                            <strong>Opções:</strong> {field.options.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">Nenhum campo definido para este template.</p>
              )}
            </div>

            {/* Template Preview */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Visualização do Template
              </h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {template.content}
                </pre>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Nota:</strong> As variáveis entre chaves duplas (ex: {`{{patient_name}}`}) 
                  serão substituídas pelos valores dos campos do formulário.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPage;