import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import PatientsPage from './pages/PatientsPage'
import CreatePrescriptionPage from './pages/CreatePrescriptionPage'
import MetricsPage from './pages/MetricsPage'
import AuthRegisterPage from './pages/AuthRegisterPage'
import './styles/global.css'

// Páginas temporárias até consertar imports
const TempPage = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: '#f8fafc' }}>
    <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>{title}</h1>
    <p>Página em desenvolvimento</p>
    <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>← Voltar ao início</a>
  </div>
)

function AppContent() {
  const location = useLocation()
  const memedPages = ['/patients', '/prescription/create', '/metrics']
  const showHeader = memedPages.includes(location.pathname)
  
  return (
    <div>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<TempPage title="Home - RepoMed IA" />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/prescription/create" element={<CreatePrescriptionPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/auth/register" element={<AuthRegisterPage />} />
        <Route path="/auth/login" element={<TempPage title="Login" />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App