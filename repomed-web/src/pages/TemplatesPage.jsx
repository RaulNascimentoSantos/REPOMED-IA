import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8081'

export default function TemplatesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [sortBy, setSortBy] = useState('name') // name, specialty, createdAt
  const [sortOrder, setSortOrder] = useState('asc')

  // Fetch templates from API
  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/templates`)
      if (!response.ok) throw new Error('Erro ao carregar templates')
      return response.json()
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId) => {
      const response = await fetch(`${API_BASE}/api/templates/${templateId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Erro ao excluir template')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
    }
  })

  const templates = templatesData?.data || []

  // Filter and sort templates
  const filteredAndSortedTemplates = templates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (template.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSpecialty = selectedSpecialty === 'all' || template.specialty === selectedSpecialty
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
      
      return matchesSearch && matchesSpecialty && matchesCategory
    })
    .sort((a, b) => {
      let aVal = a[sortBy] || ''
      let bVal = b[sortBy] || ''
      
      if (sortBy === 'createdAt') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      } else {
        aVal = aVal.toString().toLowerCase()
        bVal = bVal.toString().toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return bVal > aVal ? 1 : -1
      }
    })

  const specialties = [...new Set(templates.map(t => t.specialty))]
  const categories = [...new Set(templates.map(t => t.category || 'Geral'))]

  const getSpecialtyIcon = (specialty) => {
    const icons = {
      'clinica_geral': '🩺',
      'cardiologia': '❤️',
      'pediatria': '🧸',
      'ginecologia': '🌸',
      'dermatologia': '🔬',
      'ortopedia': '🦴'
    }
    return icons[specialty] || '📋'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const handleDelete = (template) => {
    if (window.confirm(`Tem certeza que deseja excluir o template "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id)
    }
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>❌</div>
          <h2 style={{ color: '#ef4444' }}>Erro ao carregar templates</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const cardStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
              📋 Templates Médicos
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {isLoading ? 'Carregando...' : `${filteredAndSortedTemplates.length} templates encontrados`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link 
              to="/templates/create" 
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>+</span>
              Novo Template
            </Link>
            <Link 
              to="/" 
              style={{
                padding: '12px 20px',
                background: '#e5e7eb',
                color: '#374151',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              ← Voltar
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={cardStyle}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="🔍 Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Specialty Filter */}
          <div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">🏥 Todas Especialidades</option>
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {getSpecialtyIcon(specialty)} {specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">📂 Todas Categorias</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="name">📝 Nome</option>
              <option value="specialty">🏥 Especialidade</option>
              <option value="createdAt">📅 Data</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              style={{
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {sortOrder === 'asc' ? '⬆️' : '⬇️'}
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280' }}>Visualização:</span>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'grid' ? '#6366f1' : '#e5e7eb',
              color: viewMode === 'grid' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            📊 Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 16px',
              background: viewMode === 'list' ? '#6366f1' : '#e5e7eb',
              color: viewMode === 'list' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500'
            }}
          >
            📋 Lista
          </button>
        </div>
      </div>

      {/* Templates List */}
      <div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
            <h3>Carregando templates...</h3>
            <p style={{ color: '#6b7280' }}>Aguarde um momento</p>
          </div>
        ) : filteredAndSortedTemplates.length === 0 ? (
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '60px 20px',
            textAlign: 'center',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
              {searchTerm || selectedSpecialty !== 'all' ? 'Nenhum template encontrado' : 'Nenhum template cadastrado'}
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px' }}>
              {searchTerm || selectedSpecialty !== 'all' ? 
                'Tente ajustar os filtros de busca' : 
                'Comece criando o primeiro template médico'
              }
            </p>
            <Link 
              to="/templates/create" 
              style={{
                display: 'inline-block',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              + Criar Primeiro Template
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {filteredAndSortedTemplates.map(template => (
              <div 
                key={template.id} 
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontSize: '2rem',
                      padding: '12px',
                      background: '#f0f9ff',
                      borderRadius: '8px'
                    }}>
                      {getSpecialtyIcon(template.specialty)}
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#1f2937' }}>
                        {template.name}
                      </h3>
                      <span style={{ 
                        fontSize: '0.8rem', 
                        color: '#6366f1', 
                        background: '#ede9fe',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                      }}>
                        {template.specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/templates/${template.id}`}
                      style={{
                        padding: '8px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      👁️
                    </Link>
                    <button
                      onClick={() => handleDelete(template)}
                      style={{
                        padding: '8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.9rem', 
                  marginBottom: '16px',
                  lineHeight: '1.5'
                }}>
                  {template.description || 'Sem descrição disponível'}
                </p>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  color: '#9ca3af',
                  borderTop: '1px solid #e5e7eb',
                  paddingTop: '16px'
                }}>
                  <span>📅 {formatDate(template.createdAt)}</span>
                  <span>👨‍⚕️ {template.createdBy || 'Sistema'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', gap: '16px', fontWeight: '600', color: '#374151' }}>
                <span>Template</span>
                <span>Especialidade</span>
                <span>Categoria</span>
                <span>Data</span>
                <span>Ações</span>
              </div>
            </div>
            
            {filteredAndSortedTemplates.map(template => (
              <div 
                key={template.id}
                style={{ 
                  padding: '20px 24px', 
                  borderBottom: '1px solid #e5e7eb',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 100px', gap: '16px', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{getSpecialtyIcon(template.specialty)}</span>
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{template.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                          {template.description || 'Sem descrição'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.8rem',
                      color: '#6366f1',
                      background: '#ede9fe',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {template.specialty.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div style={{ color: '#6b7280' }}>
                    {template.category || 'Geral'}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>
                    {formatDate(template.createdAt)}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/templates/${template.id}`}
                      style={{
                        padding: '6px 8px',
                        background: '#3b82f6',
                        color: 'white',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        fontSize: '12px'
                      }}
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDelete(template)}
                      style={{
                        padding: '6px 8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div style={{ ...cardStyle, marginTop: '32px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#1f2937' }}>
          📊 Estatísticas
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#6366f1', marginBottom: '8px' }}>
              {templates.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Templates Disponíveis</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
              {specialties.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Especialidades</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
              {categories.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Categorias</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>
              {filteredAndSortedTemplates.length}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>Filtrados</div>
          </div>

        </div>
      </div>
    </div>
  )
}