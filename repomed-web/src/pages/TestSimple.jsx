import React from 'react'

export default function TestSimple() {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f8ff', 
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#1e40af', fontSize: '2rem' }}>
        🎯 RepoMed IA - Teste Funcionando!
      </h1>
      
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ Status do Sistema:</h2>
        <ul>
          <li>✅ React carregou corretamente</li>
          <li>✅ Vite está funcionando</li>
          <li>✅ Estilos inline funcionam</li>
          <li>⚠️ Testando Tailwind CSS...</li>
        </ul>
        
        <div style={{
          marginTop: '20px',
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap'
        }}>
          <button style={{
            backgroundColor: '#1e40af',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            🏥 Teste Workspace
          </button>
          
          <button style={{
            backgroundColor: '#059669',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            📄 Ver Documentos
          </button>
        </div>
      </div>
      
      <div className="bg-blue-100 p-4 rounded mt-4">
        <p className="text-blue-800">
          📋 Este texto deve ter fundo azul claro se o Tailwind estiver funcionando
        </p>
      </div>
    </div>
  )
}