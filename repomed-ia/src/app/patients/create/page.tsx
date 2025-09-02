'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function CreatePatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [allergies, setAllergies] = useState<string[]>([])
  const [conditions, setConditions] = useState<string[]>([])
  const [newAllergy, setNewAllergy] = useState('')
  const [newCondition, setNewCondition] = useState('')
  
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    birth_date: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergency_contact: '',
    insurance: '',
    medical_history: ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy('')
    }
  }

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter(a => a !== allergy))
  }

  const addCondition = () => {
    if (newCondition.trim() && !conditions.includes(newCondition.trim())) {
      setConditions([...conditions, newCondition.trim()])
      setNewCondition('')
    }
  }

  const removeCondition = (condition: string) => {
    setConditions(conditions.filter(c => c !== condition))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular criação do paciente
      const newPatient = {
        ...formData,
        id: Date.now().toString(),
        allergies,
        conditions,
        status: 'active',
        avatar_color: `bg-${['blue', 'green', 'purple', 'orange', 'pink', 'indigo'][Math.floor(Math.random() * 6)]}-500`,
        last_visit: new Date().toISOString().split('T')[0]
      }

      console.log('Criando paciente:', newPatient)
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirecionar para a página do paciente criado
      router.push(`/patients/${newPatient.id}`)
      
    } catch (error) {
      console.error('Erro ao criar paciente:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }

  const commonAllergies = [
    'Penicilina', 'Dipirona', 'Aspirina', 'Ibuprofeno', 'Látex', 
    'Frutos do Mar', 'Amendoim', 'Lactose', 'Glúten', 'Iodo'
  ]

  const commonConditions = [
    'Hipertensão', 'Diabetes Tipo 1', 'Diabetes Tipo 2', 'Asma', 
    'Rinite Alérgica', 'Colesterol Alto', 'Enxaqueca', 'Artrite', 
    'Fibromialgia', 'Hipotireoidismo'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👤 Novo Paciente</h1>
              <p className="text-gray-600 mt-1">Cadastre um novo paciente no sistema</p>
            </div>
            <Link href="/patients">
              <Button variant="outline">← Cancelar</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>📝 Dados Pessoais</CardTitle>
              <CardDescription>Informações básicas do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nome completo do paciente"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleInputChange('cpf', formatCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="birth_date">Data de Nascimento *</Label>
                  <Input
                    id="birth_date"
                    type="date"
                    value={formData.birth_date}
                    onChange={(e) => handleInputChange('birth_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero *</Label>
                  <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o gênero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                      <SelectItem value="Outro">Outro</SelectItem>
                      <SelectItem value="Não informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card>
            <CardHeader>
              <CardTitle>📞 Informações de Contato</CardTitle>
              <CardDescription>Dados para comunicação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', formatPhone(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={15}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="paciente@email.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Rua, número, bairro, cidade, estado, CEP"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact">Contato de Emergência</Label>
                <Input
                  id="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                  placeholder="Nome - Telefone - Parentesco"
                />
              </div>
            </CardContent>
          </Card>

          {/* Plano de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle>🏥 Plano de Saúde</CardTitle>
              <CardDescription>Informações do convênio médico</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="insurance">Plano de Saúde</Label>
                <Input
                  id="insurance"
                  value={formData.insurance}
                  onChange={(e) => handleInputChange('insurance', e.target.value)}
                  placeholder="Nome do plano e tipo (ex: Amil - Plano Executivo)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Alergias */}
          <Card>
            <CardHeader>
              <CardTitle>⚠️ Alergias</CardTitle>
              <CardDescription>Liste todas as alergias conhecidas do paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Digite uma alergia"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <Button type="button" onClick={addAllergy} variant="outline">
                  Adicionar
                </Button>
              </div>
              
              {/* Alergias Comuns */}
              <div>
                <Label className="text-sm text-gray-600">Alergias comuns (clique para adicionar):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonAllergies.map((allergy) => (
                    <Button
                      key={allergy}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!allergies.includes(allergy)) {
                          setAllergies([...allergies, allergy])
                        }
                      }}
                      disabled={allergies.includes(allergy)}
                      className="text-xs"
                    >
                      {allergy}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Alergias Adicionadas */}
              {allergies.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Alergias do paciente:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {allergies.map((allergy) => (
                      <Badge key={allergy} className="bg-red-100 text-red-800">
                        {allergy}
                        <button
                          type="button"
                          onClick={() => removeAllergy(allergy)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Condições Médicas */}
          <Card>
            <CardHeader>
              <CardTitle>🏥 Condições Médicas</CardTitle>
              <CardDescription>Doenças crônicas e condições médicas atuais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Digite uma condição médica"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                />
                <Button type="button" onClick={addCondition} variant="outline">
                  Adicionar
                </Button>
              </div>
              
              {/* Condições Comuns */}
              <div>
                <Label className="text-sm text-gray-600">Condições comuns (clique para adicionar):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonConditions.map((condition) => (
                    <Button
                      key={condition}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!conditions.includes(condition)) {
                          setConditions([...conditions, condition])
                        }
                      }}
                      disabled={conditions.includes(condition)}
                      className="text-xs"
                    >
                      {condition}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Condições Adicionadas */}
              {conditions.length > 0 && (
                <div>
                  <Label className="text-sm text-gray-600">Condições do paciente:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {conditions.map((condition) => (
                      <Badge key={condition} className="bg-yellow-100 text-yellow-800">
                        {condition}
                        <button
                          type="button"
                          onClick={() => removeCondition(condition)}
                          className="ml-2 text-yellow-600 hover:text-yellow-800"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico Médico */}
          <Card>
            <CardHeader>
              <CardTitle>📋 Histórico Médico</CardTitle>
              <CardDescription>Informações relevantes sobre o histórico do paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="medical_history">Observações Gerais</Label>
                <Textarea
                  id="medical_history"
                  value={formData.medical_history}
                  onChange={(e) => handleInputChange('medical_history', e.target.value)}
                  placeholder="Cirurgias anteriores, medicações em uso, observações importantes..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Link href="/patients">
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={loading || !formData.name || !formData.cpf || !formData.birth_date || !formData.gender || !formData.phone}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando Paciente...
                </>
              ) : (
                <>
                  💾 Criar Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}