'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  allergies: string[]
  conditions: string[]
}

interface AISuggestion {
  id: string
  type: 'allergy_alert' | 'medication_suggestion' | 'interaction_warning'
  title: string
  message: string
  confidence: number
  action?: string
}

export default function WorkspacePage() {
  const [patientPanelVisible, setPatientPanelVisible] = useState(true)
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [documentContent, setDocumentContent] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Dados mockados do paciente ativo
  const activePatient: Patient = {
    id: '1',
    name: 'Maria Silva Santos',
    age: 45,
    gender: 'Feminino',
    allergies: ['Penicilina', 'Dipirona'],
    conditions: ['Hipertensão', 'Diabetes Tipo 2']
  }

  // Sugestões de IA mockadas
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([
    {
      id: '1',
      type: 'allergy_alert',
      title: '⚠️ Alerta de Alergia',
      message: 'Paciente é alérgico a Penicilina. Evitar antibióticos da família das penicilinas.',
      confidence: 95,
      action: 'Verificar prescrição'
    }
  ])

  const templates = [
    { id: 'prescription', name: '💊 Receita Médica', content: 'RECEITA MÉDICA\n\nPaciente: [NOME]\nIdade: [IDADE]\n\n1. [MEDICAMENTO] [DOSAGEM]\n   [ORIENTAÇÕES]\n\nData: [DATA]\nDr. [MÉDICO]\nCRM: [CRM]' },
    { id: 'certificate', name: '📋 Atestado Médico', content: 'ATESTADO MÉDICO\n\nAtesto que o(a) Sr(a). [NOME], portador(a) do RG [RG], necessita de afastamento de suas atividades por [DIAS] dias, a partir de [DATA_INICIO].\n\nCID: [CID]\n\nData: [DATA]\nDr. [MÉDICO]\nCRM: [CRM]' },
    { id: 'exam_request', name: '🔬 Solicitação de Exames', content: 'SOLICITAÇÃO DE EXAMES\n\nPaciente: [NOME]\nIdade: [IDADE]\n\nExames solicitados:\n1. [EXAME_1]\n2. [EXAME_2]\n\nJustificativa: [JUSTIFICATIVA]\n\nData: [DATA]\nDr. [MÉDICO]\nCRM: [CRM]' },
    { id: 'referral', name: '🏥 Encaminhamento', content: 'ENCAMINHAMENTO MÉDICO\n\nEncaminho o(a) paciente [NOME] para consulta com especialista em [ESPECIALIDADE].\n\nMotivo: [MOTIVO]\nHipótese Diagnóstica: [HIPOTESE]\n\nData: [DATA]\nDr. [MÉDICO]\nCRM: [CRM]' },
    { id: 'report', name: '📊 Relatório Médico', content: 'RELATÓRIO MÉDICO\n\nPaciente: [NOME]\nData da consulta: [DATA_CONSULTA]\n\nQueixa principal: [QUEIXA]\n\nHistória da doença atual: [HISTORIA]\n\nExame físico: [EXAME_FISICO]\n\nConclusão: [CONCLUSAO]\n\nData: [DATA]\nDr. [MÉDICO]\nCRM: [CRM]' }
  ]

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId)
    const template = templates.find(t => t.id === templateId)
    if (template) {
      // Substituir campos automaticamente com dados do paciente
      let content = template.content
        .replace(/\[NOME\]/g, activePatient.name)
        .replace(/\[IDADE\]/g, activePatient.age.toString())
        .replace(/\[DATA\]/g, new Date().toLocaleDateString('pt-BR'))
        .replace(/\[MÉDICO\]/g, 'Dr. João Silva')
        .replace(/\[CRM\]/g, '12345-SP')
      
      setDocumentContent(content)
      
      // Simular sugestão de IA baseada no template
      if (templateId === 'prescription') {
        setAiSuggestions([
          ...aiSuggestions,
          {
            id: Date.now().toString(),
            type: 'medication_suggestion',
            title: '💡 Sugestão de Medicação',
            message: 'Para controle da hipertensão, considere Losartana 50mg 1x ao dia.',
            confidence: 80,
            action: 'Aplicar sugestão'
          }
        ])
      }
    }
  }

  const handleVoiceInput = () => {
    setIsListening(true)
    
    // Simular texto de ditado realista
    const sampleTexts = [
      "Paciente relata dor abdominal há 2 dias, localizada em epigástrio, tipo queimação, sem irradiação.",
      "Prescrevo Omeprazol 20mg uma vez ao dia pela manhã, em jejum, por 14 dias.",
      "Solicito hemograma completo, glicemia de jejum e dosagem de TSH.",
      "Retorno em 1 semana para reavaliação do quadro e ajuste terapêutico se necessário.",
      "Orientações: dieta leve, evitar alimentos gordurosos e bebidas alcoólicas."
    ]
    
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
    
    // Simular processo de reconhecimento de voz (2-3 segundos)
    setTimeout(() => {
      setIsListening(false)
      setDocumentContent(documentContent + (documentContent ? '\n\n' : '') + randomText)
      
      // Adicionar sugestão de IA contextual
      const contextSuggestion: AISuggestion = {
        id: Date.now().toString(),
        type: 'medication_suggestion',
        title: '🎯 Sugestão Contextual',
        message: randomText.includes('Omeprazol') 
          ? 'Considere orientar sobre tomar o medicamento 30min antes das refeições para melhor absorção.'
          : 'Baseado no conteúdo ditado, considere adicionar orientações de acompanhamento.',
        confidence: Math.floor(Math.random() * 20) + 75, // 75-95%
        action: 'Aplicar sugestão'
      }
      
      setAiSuggestions(prev => [contextSuggestion, ...prev].slice(0, 4))
    }, 2500)
  }

  const applySuggestion = (suggestionId: string) => {
    const suggestion = aiSuggestions.find(s => s.id === suggestionId)
    if (suggestion && suggestion.type === 'medication_suggestion') {
      setDocumentContent(documentContent + "\n\n1. Losartana 50mg\n   Tomar 1 comprimido pela manhã")
    }
    // Remover sugestão aplicada
    setAiSuggestions(aiSuggestions.filter(s => s.id !== suggestionId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏥 Workspace Médico</h1>
              <p className="text-gray-600 text-sm">Interface profissional tri-painel</p>
            </div>
            
            {/* Ações do Header */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={isListening ? 'animate-pulse bg-red-50' : ''}
              >
                {isListening ? '🎤 Gravando...' : '🎤 Ditar'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiAssistantEnabled(!aiAssistantEnabled)}
                className={aiAssistantEnabled ? 'bg-blue-50 text-blue-700' : ''}
              >
                🧠 IA {aiAssistantEnabled ? 'ON' : 'OFF'}
              </Button>
              
              <Button variant="outline" size="sm">
                💾 Salvar
              </Button>
              
              <Button variant="outline" size="sm">
                ✍️ Assinar
              </Button>
              
              <Link href="/">
                <Button variant="outline" size="sm">← Início</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Painel do Paciente - Esquerda */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${patientPanelVisible ? 'w-80' : 'w-0'} overflow-hidden`}>
          {patientPanelVisible && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">👤 Paciente Ativo</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPatientPanelVisible(false)}
                >
                  ←
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-blue-900">{activePatient.name}</h3>
                      <p className="text-sm text-gray-600">{activePatient.age} anos • {activePatient.gender}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-700 text-sm mb-1">⚠️ Alergias:</h4>
                      <div className="space-y-1">
                        {activePatient.allergies.map((allergy, idx) => (
                          <Badge key={idx} className="bg-red-100 text-red-800 text-xs">
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-yellow-700 text-sm mb-1">🏥 Condições:</h4>
                      <div className="space-y-1">
                        {activePatient.conditions.map((condition, idx) => (
                          <Badge key={idx} className="bg-yellow-100 text-yellow-800 text-xs">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Botão para mostrar painel do paciente quando oculto */}
        {!patientPanelVisible && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPatientPanelVisible(true)}
            className="absolute left-2 top-24 z-20"
          >
            👤
          </Button>
        )}

        {/* Editor Central */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Selecione um template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Toolbar de formatação */}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">𝐁</Button>
                  <Button variant="outline" size="sm"><em>𝐼</em></Button>
                  <Button variant="outline" size="sm"><u>U</u></Button>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {documentContent.length} caracteres
              </div>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <Textarea
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              placeholder="Digite o conteúdo do documento ou selecione um template..."
              className="w-full h-full resize-none font-mono text-sm"
              style={{ minHeight: 'calc(100vh - 200px)' }}
            />
          </div>
        </div>

        {/* IA Assistente - Direita */}
        <div className={`bg-gradient-to-b from-blue-50 to-purple-50 border-l border-gray-200 transition-all duration-300 ${aiAssistantEnabled ? 'w-96' : 'w-0'} overflow-hidden`}>
          {aiAssistantEnabled && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">🧠 IA Assistente</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAiAssistantEnabled(false)}
                >
                  →
                </Button>
              </div>
              
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="border-l-4 border-blue-400">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm">{suggestion.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.confidence}% confiança
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{suggestion.message}</p>
                        {suggestion.action && (
                          <Button
                            size="sm"
                            onClick={() => applySuggestion(suggestion.id)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {suggestion.action}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {aiSuggestions.length === 0 && (
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-4xl mb-2">🤖</div>
                      <p className="text-sm text-gray-600">
                        Nenhuma sugestão no momento. Continue digitando para receber sugestões da IA.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Botão para mostrar IA quando oculto */}
        {!aiAssistantEnabled && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiAssistantEnabled(true)}
            className="absolute right-2 top-24 z-20"
          >
            🧠
          </Button>
        )}
      </div>

      {/* Footer Informativo */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <span><strong>Paciente:</strong> {activePatient.name}, {activePatient.age} anos</span>
            <span><strong>Alergias:</strong> {activePatient.allergies.join(', ')}</span>
          </div>
          <div>
            <span>{documentContent.length} caracteres • {documentContent.split('\n').length} linhas</span>
          </div>
        </div>
      </div>
    </div>
  )
}