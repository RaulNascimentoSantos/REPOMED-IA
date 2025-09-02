import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, Search, Filter, Clock, User, Shield } from 'lucide-react';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:8082/api/templates');
      const data = await response.json();
      setTemplates(data.data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || template.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = [...new Set(templates.map(t => t.specialty))];

  const getSpecialtyName = (specialty) => {
    const names = {
      'clinica_geral': 'Clínica Geral',
      'cardiologia': 'Cardiologia',
      'pediatria': 'Pediatria',
      'ginecologia': 'Ginecologia'
    };
    return names[specialty] || specialty;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Carregando templates...</span>
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
                Templates Médicos
              </h1>
              <p className="text-gray-600 mt-1">
                Modelos de documentos médicos pré-configurados
              </p>
            </div>
            <Link 
              to="/templates/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Template
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
                  placeholder="Buscar templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">Todas as especialidades</option>
                  {specialties.map(specialty => (
                    <option key={specialty} value={specialty}>
                      {getSpecialtyName(specialty)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{getSpecialtyName(template.specialty)}</p>
                    </div>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    v{template.version}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {template.fields?.length || 0} campos obrigatórios
                  </div>
                  {template.compliance && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Shield className="h-4 w-4 mr-2" />
                      {template.compliance.cfm && 'CFM '}
                      {template.compliance.anvisa && 'ANVISA '}
                      {template.compliance.requires_signature && 'Assinatura Digital'}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Link 
                    to={`/templates/${template.id}`}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm"
                  >
                    Ver Detalhes
                  </Link>
                  <Link 
                    to={`/documents/create?template=${template.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    Usar Template
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && !loading && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum template encontrado</h3>
            <p className="text-gray-600">
              {searchTerm || selectedSpecialty !== 'all' 
                ? 'Tente ajustar os filtros para encontrar templates.'
                : 'Não há templates disponíveis no momento.'}
            </p>
          </div>
        )}

        {/* Template Statistics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Estatísticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
              <div className="text-sm text-gray-600">Templates Disponíveis</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{specialties.length}</div>
              <div className="text-sm text-gray-600">Especialidades</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {templates.filter(t => t.compliance?.requires_signature).length}
              </div>
              <div className="text-sm text-gray-600">Com Assinatura Digital</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplatesPage;