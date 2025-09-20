import React from 'react'

function AppSimple() {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        🏥 RepoMed IA
      </h1>
      
      <div style={{
        background: 'white',
        color: '#333',
        padding: '30px',
        borderRadius: '15px',
        maxWidth: '600px',
        margin: '0 auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <h2 style={{ color: '#10b981' }}>✅ React está funcionando!</h2>
        <p>Se você está vendo esta mensagem, o React foi carregado com sucesso.</p>
        
        <div style={{ marginTop: '30px' }}>
          <h3>Links de Teste:</h3>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/workspace" style={{
              background: '#4f46e5',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              Workspace
            </a>
            <a href="/test-simple" style={{
              background: '#10b981',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '8px',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              Teste Simples
            </a>
          </div>
        </div>
        
        <div style={{ marginTop: '30px', textAlign: 'left' }}>
          <h4>Informações do Sistema:</h4>
          <ul>
            <li>React Version: {React.version}</li>
            <li>Timestamp: {new Date().toLocaleString()}</li>
            <li>URL: {window.location.href}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AppSimple