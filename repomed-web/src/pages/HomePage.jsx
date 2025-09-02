import React from 'react'
import { Link } from 'react-router-dom'

export function HomePage() {
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            RepoMed IA
          </span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Sistema de Documentos Médicos - V1 MVP
        </p>
        
        <div className="space-y-4">
          <p className="text-green-600 font-semibold">✅ Sistema Funcionando!</p>
          
          <div className="bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto">
            <h2 className="text-lg font-semibold mb-4">Status do Sistema:</h2>
            <ul className="text-left space-y-2 text-sm text-gray-700">
              <li>✅ React + Vite</li>
              <li>✅ Medical Workspace</li>
              <li>✅ IA Editor</li>
              <li>✅ Design System</li>
              <li>✅ Backend API</li>
            </ul>
            
            <div className="mt-4 space-y-2">
              <Link 
                to="/workspace" 
                className="block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                🎯 Acessar Workspace Moderno
              </Link>
              
              <Link 
                to="/documents" 
                className="block bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                📄 Ver Documentos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}