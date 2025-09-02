'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  // Profile Settings
  const [profileData, setProfileData] = useState({
    name: 'Dr. João Silva',
    email: 'joao.silva@repomed.com',
    phone: '(11) 99999-9999',
    crm: '12345-SP',
    specialty: 'clinica_geral',
    avatar: '',
    signature: 'Dr. João Silva\nCRM: 12345-SP\nClínica Geral'
  })

  // System Settings
  const [systemData, setSystemData] = useState({
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light',
    notifications: {
      email: true,
      sms: false,
      push: true,
      document_signed: true,
      patient_messages: false,
      system_updates: true
    }
  })

  // Clinic Settings
  const [clinicData, setClinicData] = useState({
    name: 'Clínica Médica Exemplo',
    cnpj: '12.345.678/0001-90',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    phone: '(11) 3333-4444',
    email: 'contato@clinica.com',
    logo: '',
    letterhead: 'CLÍNICA MÉDICA EXEMPLO\nRua das Flores, 123 - São Paulo, SP\nTel: (11) 3333-4444'
  })

  // Security Settings
  const [securityData, setSecurityData] = useState({
    two_factor: false,
    session_timeout: '60',
    password_policy: 'medium',
    audit_logs: true
  })

  const tabs = [
    { id: 'profile', name: '👤 Perfil', icon: '👤' },
    { id: 'clinic', name: '🏥 Clínica', icon: '🏥' },
    { id: 'system', name: '⚙️ Sistema', icon: '⚙️' },
    { id: 'security', name: '🔐 Segurança', icon: '🔐' },
    { id: 'integrations', name: '🔗 Integrações', icon: '🔗' }
  ]

  const specialties = [
    { value: 'clinica_geral', label: 'Clínica Geral' },
    { value: 'cardiologia', label: 'Cardiologia' },
    { value: 'dermatologia', label: 'Dermatologia' },
    { value: 'pediatria', label: 'Pediatria' },
    { value: 'psiquiatria', label: 'Psiquiatria' }
  ]

  const handleSave = async (section: string) => {
    setLoading(true)
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage(`✅ ${section} salvo com sucesso!`)
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`❌ Erro ao salvar ${section}`)
    } finally {
      setLoading(false)
    }
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>👤 Informações Pessoais</CardTitle>
          <CardDescription>Seus dados profissionais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="Dr(a). Nome Completo"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="crm">CRM</Label>
              <Input
                id="crm"
                value={profileData.crm}
                onChange={(e) => setProfileData({...profileData, crm: e.target.value})}
                placeholder="12345-SP"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Select value={profileData.specialty} onValueChange={(value) => setProfileData({...profileData, specialty: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map(spec => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="signature">Assinatura Padrão</Label>
            <Textarea
              id="signature"
              value={profileData.signature}
              onChange={(e) => setProfileData({...profileData, signature: e.target.value})}
              rows={3}
              placeholder="Texto que aparecerá como assinatura nos documentos"
            />
          </div>

          <Button onClick={() => handleSave('Perfil')} disabled={loading}>
            {loading ? 'Salvando...' : '💾 Salvar Perfil'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderClinicSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🏥 Dados da Clínica</CardTitle>
          <CardDescription>Informações da instituição</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="clinic-name">Nome da Clínica</Label>
              <Input
                id="clinic-name"
                value={clinicData.name}
                onChange={(e) => setClinicData({...clinicData, name: e.target.value})}
                placeholder="Nome da clínica"
              />
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={clinicData.cnpj}
                onChange={(e) => setClinicData({...clinicData, cnpj: e.target.value})}
                placeholder="12.345.678/0001-90"
              />
            </div>
            <div>
              <Label htmlFor="clinic-phone">Telefone</Label>
              <Input
                id="clinic-phone"
                value={clinicData.phone}
                onChange={(e) => setClinicData({...clinicData, phone: e.target.value})}
                placeholder="(11) 3333-4444"
              />
            </div>
            <div>
              <Label htmlFor="clinic-email">Email</Label>
              <Input
                id="clinic-email"
                type="email"
                value={clinicData.email}
                onChange={(e) => setClinicData({...clinicData, email: e.target.value})}
                placeholder="contato@clinica.com"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Input
              id="address"
              value={clinicData.address}
              onChange={(e) => setClinicData({...clinicData, address: e.target.value})}
              placeholder="Rua, número, bairro, cidade, estado, CEP"
            />
          </div>
          
          <div>
            <Label htmlFor="letterhead">Cabeçalho de Documentos</Label>
            <Textarea
              id="letterhead"
              value={clinicData.letterhead}
              onChange={(e) => setClinicData({...clinicData, letterhead: e.target.value})}
              rows={4}
              placeholder="Texto que aparecerá no cabeçalho dos documentos"
            />
          </div>

          <Button onClick={() => handleSave('Clínica')} disabled={loading}>
            {loading ? 'Salvando...' : '💾 Salvar Dados da Clínica'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configurações do Sistema</CardTitle>
          <CardDescription>Preferências gerais da aplicação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="language">Idioma</Label>
              <Select value={systemData.language} onValueChange={(value) => setSystemData({...systemData, language: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o idioma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt-BR">🇧🇷 Português (Brasil)</SelectItem>
                  <SelectItem value="en-US">🇺🇸 English (US)</SelectItem>
                  <SelectItem value="es-ES">🇪🇸 Español</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="timezone">Fuso Horário</Label>
              <Select value={systemData.timezone} onValueChange={(value) => setSystemData({...systemData, timezone: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Fuso horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  <SelectItem value="Europe/London">London (UTC+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="theme">Tema</Label>
              <Select value={systemData.theme} onValueChange={(value) => setSystemData({...systemData, theme: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Tema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">☀️ Claro</SelectItem>
                  <SelectItem value="dark">🌙 Escuro</SelectItem>
                  <SelectItem value="auto">🔄 Automático</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={() => handleSave('Sistema')} disabled={loading}>
            {loading ? 'Salvando...' : '💾 Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔔 Notificações</CardTitle>
          <CardDescription>Configure como você quer receber notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {Object.entries({
              email: '📧 Notificações por Email',
              sms: '📱 Notificações por SMS',
              push: '🔔 Notificações Push',
              document_signed: '✍️ Quando documentos forem assinados',
              patient_messages: '💬 Mensagens de pacientes',
              system_updates: '🔄 Atualizações do sistema'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <span className="text-sm font-medium">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemData.notifications[key as keyof typeof systemData.notifications]}
                    onChange={(e) => setSystemData({
                      ...systemData,
                      notifications: {
                        ...systemData.notifications,
                        [key]: e.target.checked
                      }
                    })}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    systemData.notifications[key as keyof typeof systemData.notifications] 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                  }`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow-lg transform transition-transform ${
                      systemData.notifications[key as keyof typeof systemData.notifications]
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } mt-1`}></div>
                  </div>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔐 Segurança da Conta</CardTitle>
          <CardDescription>Configure as opções de segurança</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-gray-600">Adicione uma camada extra de segurança</p>
              </div>
              <Badge className={securityData.two_factor ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {securityData.two_factor ? '✅ Ativo' : '❌ Inativo'}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session-timeout">Timeout de Sessão (minutos)</Label>
                <Select value={securityData.session_timeout} onValueChange={(value) => setSecurityData({...securityData, session_timeout: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Timeout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="240">4 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="password-policy">Política de Senha</Label>
                <Select value={securityData.password_policy} onValueChange={(value) => setSecurityData({...securityData, password_policy: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Política" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 Baixa (6+ caracteres)</SelectItem>
                    <SelectItem value="medium">🟡 Média (8+ caracteres, números)</SelectItem>
                    <SelectItem value="high">🔴 Alta (12+ caracteres, símbolos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button onClick={() => handleSave('Segurança')} disabled={loading}>
            {loading ? 'Salvando...' : '💾 Salvar Configurações de Segurança'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📊 Logs de Auditoria</CardTitle>
          <CardDescription>Controle de acesso e atividades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Registro de Atividades</h4>
                <p className="text-sm text-gray-600">Manter logs de todas as ações realizadas</p>
              </div>
              <Badge className="bg-green-100 text-green-800">
                ✅ Ativo
              </Badge>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-2">Últimas Atividades:</h5>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Login realizado em 02/09/2025 às 10:30</li>
                <li>• Documento criado em 01/09/2025 às 16:45</li>
                <li>• Configurações alteradas em 01/09/2025 às 14:20</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔗 Integrações Disponíveis</CardTitle>
          <CardDescription>Conecte com outros sistemas e serviços</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'WhatsApp Business', description: 'Envie documentos via WhatsApp', status: 'inactive', icon: '📱' },
              { name: 'Google Drive', description: 'Backup automático de documentos', status: 'active', icon: '💾' },
              { name: 'Sistema HIS', description: 'Integração com sistema hospitalar', status: 'inactive', icon: '🏥' },
              { name: 'OpenAI', description: 'IA para sugestões médicas', status: 'active', icon: '🤖' },
              { name: 'ICP-Brasil', description: 'Certificados digitais', status: 'inactive', icon: '🔐' }
            ].map((integration, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{integration.icon}</span>
                  <div>
                    <h4 className="font-medium">{integration.name}</h4>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={integration.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {integration.status === 'active' ? '✅ Conectado' : '⚪ Inativo'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    {integration.status === 'active' ? 'Configurar' : 'Conectar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">⚙️ Configurações</h1>
              <p className="text-gray-600 mt-1">Personalize sua experiência no RepoMed IA</p>
            </div>
            <Link href="/">
              <Button variant="outline">← Voltar ao Início</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <Alert className="mb-6">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Navegação</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeTab === tab.id ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="font-medium">{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && renderProfileSettings()}
            {activeTab === 'clinic' && renderClinicSettings()}
            {activeTab === 'system' && renderSystemSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'integrations' && renderIntegrationsSettings()}
          </div>
        </div>
      </div>
    </div>
  )
}