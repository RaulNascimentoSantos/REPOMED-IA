import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { templatesApi } from '../lib/api'

export function TemplateSelector({ onSelect, selectedTemplate }) {
  const { 
    data: templates, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await templatesApi.list()
      console.log('✅ Templates carregados:', response.data)
      return response.data
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('❌ Erro ao carregar templates:', error)
    }
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-medical-blue mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Carregando Templates
            </h3>
            <p className="text-sm text-black dark:text-white">
              Buscando templates médicos disponíveis...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Erro ao Carregar Templates
          </h3>
          <p className="text-sm text-red-600 mb-4">
            {error.response?.data?.message || error.message || 'Erro desconhecido'}
          </p>
          <div className="space-y-2 text-xs text-red-500">
            <p>API URL: {error.config?.baseURL || 'N/A'}</p>
            <p>Status: {error.response?.status || 'N/A'}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  // Empty state
  if (!templates?.data || templates.data.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <FileText className="h-8 w-8 text-black dark:text-white mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Nenhum Template Encontrado
          </h3>
          <p className="text-sm text-black dark:text-white">
            Não há templates médicos disponíveis no momento.
          </p>
        </div>
      </div>
    )
  }

  // Success state
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Selecionar Template
        </h2>
        <div className="text-sm text-black dark:text-white">
          {templates.total} template{templates.total !== 1 ? 's' : ''} disponível{templates.total !== 1 ? 'eis' : ''}
        </div>
      </div>
      
      <div className="space-y-3">
        {templates.data.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedTemplate?.id === template.id
                ? 'border-medical-blue bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {template.specialty} • v{template.version}
                </p>
                <div className="flex items-center space-x-4 text-xs text-black dark:text-white">
                  <span>{template.fields?.length || 0} campos</span>
                  {template.compliance?.cfm && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      CFM
                    </span>
                  )}
                  {template.compliance?.anvisa && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ANVISA
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4">
                {selectedTemplate?.id === template.id ? (
                  <div className="w-6 h-6 bg-medical-blue rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full"></div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedTemplate && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-green-900">
                {selectedTemplate.name} selecionado
              </h4>
              <p className="text-sm text-green-700">
                Prossiga preenchendo os dados do documento
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}