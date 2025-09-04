import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const API_BASE = 'http://localhost:8090'

export default function PatientCreatePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    gender: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    medicalInfo: {
      allergies: '',
      medications: '',
      conditions: '',
      notes: ''
    }
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const createPatientMutation = useMutation({
    mutationFn: async (patientData) => {
      setIsSubmitting(true)
      const response = await fetch(`${API_BASE}/api/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(patientData)
      })
      if (!response.ok) throw new Error('Erro ao criar paciente')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['patients'])
      navigate('/patients')
    },
    onError: (error) => {
      console.error('Error creating patient:', error)
      setErrors({ submit: 'Erro ao criar paciente. Tente novamente.' })
    },
    onSettled: () => {
      setIsSubmitting(false)
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    createPatientMutation.mutate(formData)
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  }

  const errorInputStyle = {
    ...inputStyle,
    borderColor: '#ef4444'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '6px'
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '24px' }}>
      
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', color: '#1f2937' }}>
              👤 Cadastrar Novo Paciente
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Preencha os dados do paciente para criar um novo cadastro
            </p>
          </div>
          <Link 
            to="/patients" 
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

      <form onSubmit={handleSubmit}>
        
        {/* Basic Information */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            📝 Informações Básicas
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            <div>
              <label style={labelStyle}>Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={errors.name ? errorInputStyle : inputStyle}
                placeholder="Digite o nome completo"
              />
              {errors.name && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.name}</span>}
            </div>

            <div>
              <label style={labelStyle}>CPF *</label>
              <input
                type="text"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                style={errors.cpf ? errorInputStyle : inputStyle}
                placeholder="000.000.000-00"
              />
              {errors.cpf && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.cpf}</span>}
            </div>

            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                style={errors.email ? errorInputStyle : inputStyle}
                placeholder="email@exemplo.com"
              />
              {errors.email && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={labelStyle}>Telefone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                style={errors.phone ? errorInputStyle : inputStyle}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.phone}</span>}
            </div>

            <div>
              <label style={labelStyle}>Data de Nascimento *</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                style={errors.birthDate ? errorInputStyle : inputStyle}
              />
              {errors.birthDate && <span style={{ color: '#ef4444', fontSize: '12px' }}>{errors.birthDate}</span>}
            </div>

            <div>
              <label style={labelStyle}>Gênero</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="nao_informar">Prefiro não informar</option>
              </select>
            </div>

          </div>
        </div>

        {/* Address Information */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            🏠 Endereço
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            
            <div>
              <label style={labelStyle}>CEP</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="00000-000"
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Rua</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Nome da rua"
              />
            </div>

            <div>
              <label style={labelStyle}>Número</label>
              <input
                type="text"
                name="address.number"
                value={formData.address.number}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="123"
              />
            </div>

            <div>
              <label style={labelStyle}>Complemento</label>
              <input
                type="text"
                name="address.complement"
                value={formData.address.complement}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Apt, sala, etc."
              />
            </div>

            <div>
              <label style={labelStyle}>Bairro</label>
              <input
                type="text"
                name="address.neighborhood"
                value={formData.address.neighborhood}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Nome do bairro"
              />
            </div>

            <div>
              <label style={labelStyle}>Cidade</label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Nome da cidade"
              />
            </div>

            <div>
              <label style={labelStyle}>Estado</label>
              <select
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                <option value="SP">São Paulo</option>
                <option value="RJ">Rio de Janeiro</option>
                <option value="MG">Minas Gerais</option>
                <option value="RS">Rio Grande do Sul</option>
                <option value="PR">Paraná</option>
                <option value="SC">Santa Catarina</option>
                <option value="BA">Bahia</option>
                <option value="GO">Goiás</option>
                <option value="DF">Distrito Federal</option>
                <option value="ES">Espírito Santo</option>
                <option value="MT">Mato Grosso</option>
                <option value="MS">Mato Grosso do Sul</option>
                <option value="CE">Ceará</option>
                <option value="PE">Pernambuco</option>
                <option value="PB">Paraíba</option>
                <option value="RN">Rio Grande do Norte</option>
                <option value="AL">Alagoas</option>
                <option value="SE">Sergipe</option>
                <option value="PI">Piauí</option>
                <option value="MA">Maranhão</option>
                <option value="PA">Pará</option>
                <option value="AM">Amazonas</option>
                <option value="RR">Roraima</option>
                <option value="AP">Amapá</option>
                <option value="TO">Tocantins</option>
                <option value="AC">Acre</option>
                <option value="RO">Rondônia</option>
              </select>
            </div>

          </div>
        </div>

        {/* Emergency Contact */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            🚨 Contato de Emergência
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            <div>
              <label style={labelStyle}>Nome</label>
              <input
                type="text"
                name="emergencyContact.name"
                value={formData.emergencyContact.name}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="Nome do contato"
              />
            </div>

            <div>
              <label style={labelStyle}>Telefone</label>
              <input
                type="tel"
                name="emergencyContact.phone"
                value={formData.emergencyContact.phone}
                onChange={handleInputChange}
                style={inputStyle}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label style={labelStyle}>Parentesco</label>
              <select
                name="emergencyContact.relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleInputChange}
                style={inputStyle}
              >
                <option value="">Selecione...</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="conjuge">Cônjuge</option>
                <option value="irmao">Irmão/Irmã</option>
                <option value="filho">Filho/Filha</option>
                <option value="amigo">Amigo</option>
                <option value="outro">Outro</option>
              </select>
            </div>

          </div>
        </div>

        {/* Medical Information */}
        <div style={sectionStyle}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '1.5rem', color: '#1f2937' }}>
            🩺 Informações Médicas
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            <div>
              <label style={labelStyle}>Alergias</label>
              <textarea
                name="medicalInfo.allergies"
                value={formData.medicalInfo.allergies}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                placeholder="Liste alergias conhecidas..."
              />
            </div>

            <div>
              <label style={labelStyle}>Medicamentos em Uso</label>
              <textarea
                name="medicalInfo.medications"
                value={formData.medicalInfo.medications}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                placeholder="Liste medicamentos atuais..."
              />
            </div>

            <div>
              <label style={labelStyle}>Condições Médicas</label>
              <textarea
                name="medicalInfo.conditions"
                value={formData.medicalInfo.conditions}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                placeholder="Condições médicas existentes..."
              />
            </div>

            <div>
              <label style={labelStyle}>Observações</label>
              <textarea
                name="medicalInfo.notes"
                value={formData.medicalInfo.notes}
                onChange={handleInputChange}
                style={{ ...inputStyle, height: '100px', resize: 'vertical' }}
                placeholder="Informações adicionais..."
              />
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div style={sectionStyle}>
          {errors.submit && (
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              color: '#dc2626', 
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {errors.submit}
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link
              to="/patients"
              style={{
                padding: '12px 24px',
                background: '#e5e7eb',
                color: '#374151',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '12px 32px',
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? '⏳ Salvando...' : '💾 Salvar Paciente'}
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}