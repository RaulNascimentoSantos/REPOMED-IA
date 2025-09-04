import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { templatesApi } from '../lib/api'

export default function TestPage() {
  const { data: templates, isLoading, error } = useQuery({
    queryKey: ['templates-test'],
    queryFn: async () => {
      console.log('🔍 Testando API...')
      try {
        const response = await templatesApi.list()
        console.log('✅ API Response:', response)
        return response.data
      } catch (err) {
        console.error('❌ API Error:', err)
        throw err
      }
    },
    retry: 1
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Teste de API - Templates</h1>
      
      {/* API Status */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Status da API</h2>
        <div className="space-y-2">
          <p><strong>URL:</strong> http://localhost:8081</p>
          <p><strong>Endpoint:</strong> /api/templates</p>
          <p><strong>Status:</strong> {isLoading ? '🔄 Carregando...' : error ? '❌ Erro' : '✅ Sucesso'}</p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card bg-red-50 border-red-200">
          <h3 className="text-red-800 font-semibold mb-2">❌ Erro ao carregar templates</h3>
          <pre className="text-red-700 text-sm bg-red-100 p-3 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {/* Success State */}
      {templates && (
        <div className="space-y-4">
          <div className="card bg-green-50 border-green-200">
            <h3 className="text-green-800 font-semibold mb-2">✅ Templates carregados com sucesso!</h3>
            <p className="text-green-700">Total: {templates.total} templates</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.data?.map((template) => (
              <div key={template.id} className="card border-l-4 border-l-blue-500">
                <h4 className="font-semibold text-gray-900">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.specialty}</p>
                <p className="text-xs text-gray-500 mt-2">
                  ID: {template.id} • v{template.version} • {template.fields?.length || 0} campos
                </p>
              </div>
            ))}
          </div>

          {/* Raw Data */}
          <div className="card">
            <h3 className="font-semibold mb-2">🔧 Dados Raw da API</h3>
            <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-96">
              {JSON.stringify(templates, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}