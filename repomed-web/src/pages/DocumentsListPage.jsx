import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Filter, Eye, Download, Shield, Clock, User, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const DocumentsListPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Simulate fetching documents - replace with actual API call
    setTimeout(() => {
      const mockDocuments = [
        {
          id: 'doc_001',
          templateName: 'Receita Simples',
          patient: { name: 'João Silva', cpf: '123.456.789-00' },
          status: 'signed',
          createdAt: '2024-01-15T10:30:00Z',
          signedAt: '2024-01-15T10:35:00Z',
          hash: 'a1b2c3d4e5f6...',
          pdfUrl: '/api/documents/doc_001/pdf'
        },
        {
          id: 'doc_002',
          templateName: 'Atestado Médico',
          patient: { name: 'Maria Santos', cpf: '987.654.321-00' },
          status: 'draft',
          createdAt: '2024-01-15T11:00:00Z',
          hash: 'f6e5d4c3b2a1...',
          pdfUrl: '/api/documents/doc_002/pdf'
        },
        {
          id: 'doc_003',
          templateName: 'Solicitação de Exames',
          patient: { name: 'Pedro Costa', cpf: '456.789.123-00' },
          status: 'pending_signature',
          createdAt: '2024-01-15T14:20:00Z',
          hash: '123abc456def...',
          pdfUrl: '/api/documents/doc_003/pdf'
        }
      ];
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'signed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending_signature':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'draft':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'signed': 'Assinado',
      'pending_signature': 'Aguardando Assinatura',
      'draft': 'Rascunho',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'signed': 'bg-green-100 text-green-800',
      'pending_signature': 'bg-yellow-100 text-yellow-800',
      'draft': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando documentos...</span>
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 text-blue-600 mr-3" />
                Meus Documentos
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os seus documentos médicos
              </p>
            </div>
            <Link 
              to="/documents/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Documento
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar documentos, pacientes ou IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <div className="relative">
                <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Todos os status</option>
                  <option value="draft">Rascunho</option>
                  <option value="pending_signature">Aguardando Assinatura</option>
                  <option value="signed">Assinado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Criação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map(document => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {document.templateName}
                          </div>
                          <div className="text-sm text-gray-500 font-mono">
                            {document.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{document.patient.name}</div>
                      <div className="text-sm text-gray-500">{document.patient.cpf}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(document.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                          {getStatusLabel(document.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(document.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/documents/${document.id}`}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <a
                          href={document.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        {document.status === 'pending_signature' && (
                          <Link
                            to={`/documents/${document.id}/sign`}
                            className="text-purple-600 hover:text-purple-900 p-1 hover:bg-purple-50 rounded"
                          >
                            <Shield className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDocuments.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum documento encontrado</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros para encontrar documentos.'
                : 'Você ainda não criou nenhum documento.'}
            </p>
            <Link 
              to="/documents/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Criar Primeiro Documento
            </Link>
          </div>
        )}

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
              <div className="text-sm text-gray-600">Total de Documentos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(d => d.status === 'signed').length}
              </div>
              <div className="text-sm text-gray-600">Assinados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(d => d.status === 'pending_signature').length}
              </div>
              <div className="text-sm text-gray-600">Aguardando Assinatura</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {documents.filter(d => d.status === 'draft').length}
              </div>
              <div className="text-sm text-gray-600">Rascunhos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsListPage;