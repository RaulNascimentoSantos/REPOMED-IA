import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import { Navigation, NavigationBreadcrumb } from './components/Navigation'

// Páginas principais (Memed-style)
import PatientsPage from './pages/PatientsPage'
import CreatePatientPage from './pages/CreatePatientPage'
import CreatePrescriptionPage from './pages/CreatePrescriptionPage'
import AuthRegisterPage from './pages/AuthRegisterPage'
import MetricsPage from './pages/MetricsPage'
import TemplatesPage from './pages/TemplatesPage'
import TemplateDetailPage from './pages/TemplateDetailPage'
import DocumentsPage from './pages/DocumentsPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import DocumentsListPage from './pages/DocumentsListPage'
import DocumentSigningPage from './pages/DocumentSigningPage'
import SharePage from './pages/SharePage'

// Páginas antigas (manter por compatibilidade)
import { HomePage } from './pages/HomePage'
import { Documents } from './pages/Documents'
import { CreateDocument } from './pages/CreateDocument'
import { Test } from './pages/Test'
import { VerifyPage } from './pages/VerifyPage'

import './styles/global.css'

// Componente para páginas temporárias
const TempPage = ({ title }) => (
  <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: '#f8fafc' }}>
    <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>{title}</h1>
    <p>Página em desenvolvimento</p>
    <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>← Voltar ao início</a>
  </div>
)

// Componente para páginas de login
const LoginPage = () => (
  <div style={{ padding: '40px', textAlign: 'center', minHeight: '100vh', background: '#f8fafc' }}>
    <div style={{ maxWidth: '400px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#1e40af', marginBottom: '20px' }}>Login - RepoMed IA</h1>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input 
          type="email" 
          placeholder="Email" 
          style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
        />
        <input 
          type="password" 
          placeholder="Senha" 
          style={{ padding: '12px', border: '1px solid #ddd', borderRadius: '6px' }}
        />
        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            background: '#6366f1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Entrar
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        <a href="/auth/register" style={{ color: '#3b82f6' }}>Criar conta</a>
      </p>
    </div>
  </div>
)

function AppContent() {
  const location = useLocation()
  
  // Páginas que usam o novo Header (Memed-style)
  const memedStylePages = [
    '/patients', 
    '/prescription', 
    '/metrics',
    '/templates',
    '/documents-new',
    '/documents-list'
  ]
  
  // Páginas que têm seu próprio header antigo
  const pagesWithOwnHeader = ['/documents', '/documents/create', '/test']
  
  // Páginas de auth não precisam de header
  const authPages = ['/auth/login', '/auth/register']
  
  const isVerifyPage = location.pathname.startsWith('/verify/')
  const isSharePage = location.pathname.startsWith('/share/')
  const isMemedStylePage = memedStylePages.some(page => location.pathname.startsWith(page))
  const isOldHeaderPage = pagesWithOwnHeader.includes(location.pathname)
  const isAuthPage = authPages.includes(location.pathname)
  
  const showGlobalNav = !isOldHeaderPage && !isVerifyPage && !isMemedStylePage && !isAuthPage && !isSharePage
  const showMemedHeader = isMemedStylePage
  
  return (
    <div>
      {showGlobalNav && (
        <>
          <Navigation />
          <NavigationBreadcrumb />
        </>
      )}
      {showMemedHeader && <Header />}
      
      <Routes>
        {/* Página inicial */}
        <Route path="/" element={<HomePage />} />
        
        {/* Páginas principais (Memed-style) */}
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/create" element={<CreatePatientPage />} />
        <Route path="/patients/:id" element={<TempPage title="Detalhes do Paciente" />} />
        
        <Route path="/prescription/create" element={<CreatePrescriptionPage />} />
        <Route path="/prescription/:id" element={<TempPage title="Ver Prescrição" />} />
        
        <Route path="/metrics" element={<MetricsPage />} />
        
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/templates/:id" element={<TemplateDetailPage />} />
        <Route path="/templates/create" element={<TempPage title="Criar Template" />} />
        
        <Route path="/documents-new" element={<DocumentsPage />} />
        <Route path="/documents-list" element={<DocumentsListPage />} />
        <Route path="/documents/:id" element={<DocumentDetailPage />} />
        <Route path="/documents/:id/sign" element={<DocumentSigningPage />} />
        <Route path="/documents/new" element={<TempPage title="Novo Documento" />} />
        
        <Route path="/share/:id" element={<SharePage />} />
        
        {/* Páginas de autenticação */}
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<AuthRegisterPage />} />
        
        {/* Páginas antigas (compatibilidade) */}
        <Route path="/documents" element={<Documents />} />
        <Route path="/documents/create" element={<CreateDocument />} />
        <Route path="/test" element={<Test />} />
        <Route path="/verify/:hash" element={<VerifyPage />} />
        
        {/* Rota 404 */}
        <Route path="*" element={<TempPage title="Página não encontrada - 404" />} />
      </Routes>
    </div>
  )
}

function App() {
  return <AppContent />
}

export default App