// Templates médicos completos para o sistema
export const medicalTemplates = [
  {
    id: 'receita-simples',
    name: 'Receita Médica Simples',
    category: 'receituario',
    specialty: 'Clínica Geral',
    description: 'Template padrão para prescrições médicas simples',
    fields: [
      {
        id: 'patient_name',
        label: 'Nome do Paciente',
        type: 'text',
        required: true,
        placeholder: 'Nome completo do paciente'
      },
      {
        id: 'patient_cpf',
        label: 'CPF do Paciente',
        type: 'text',
        required: true,
        mask: '999.999.999-99',
        placeholder: '000.000.000-00'
      },
      {
        id: 'medications',
        label: 'Medicamentos Prescritos',
        type: 'array',
        required: true,
        itemFields: [
          { id: 'name', label: 'Nome do Medicamento', type: 'text', required: true },
          { id: 'dosage', label: 'Dosagem', type: 'text', required: true },
          { id: 'frequency', label: 'Frequência', type: 'select', options: ['1x ao dia', '2x ao dia', '3x ao dia', '4x ao dia', '6x ao dia', '8x ao dia', 'SOS'] },
          { id: 'duration', label: 'Duração do Tratamento', type: 'text', placeholder: 'Ex: 7 dias' },
          { id: 'instructions', label: 'Instruções Especiais', type: 'textarea', placeholder: 'Tomar após as refeições...' }
        ]
      },
      {
        id: 'general_instructions',
        label: 'Instruções Gerais',
        type: 'textarea',
        required: true,
        placeholder: 'Orientações gerais para o paciente...'
      },
      {
        id: 'return_date',
        label: 'Data de Retorno',
        type: 'date',
        required: false
      }
    ],
    template: `
RECEITUÁRIO MÉDICO

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{current_date}}

PRESCRIÇÃO MÉDICA:
{{#medications}}
• {{name}} - {{dosage}}
  Posologia: {{frequency}} - {{duration}}
  {{#instructions}}Obs: {{instructions}}{{/instructions}}
{{/medications}}

INSTRUÇÕES GERAIS:
{{general_instructions}}

{{#return_date}}Data de retorno: {{return_date}}{{/return_date}}

Validade da receita: 30 dias

_____________________________
Dr(a). {{doctor_name}}
CRM: {{doctor_crm}}
{{doctor_specialty}}
    `
  },
  {
    id: 'atestado-medico',
    name: 'Atestado Médico',
    category: 'atestado',
    specialty: 'Clínica Geral',
    description: 'Atestado médico para justificar ausências',
    fields: [
      {
        id: 'patient_name',
        label: 'Nome do Paciente',
        type: 'text',
        required: true
      },
      {
        id: 'patient_cpf',
        label: 'CPF do Paciente',
        type: 'text',
        required: true,
        mask: '999.999.999-99'
      },
      {
        id: 'days_off',
        label: 'Dias de Afastamento',
        type: 'number',
        required: true,
        min: 1,
        max: 365
      },
      {
        id: 'start_date',
        label: 'Data de Início do Afastamento',
        type: 'date',
        required: true
      },
      {
        id: 'cid10',
        label: 'CID-10 (Opcional)',
        type: 'text',
        required: false,
        placeholder: 'Ex: Z76.3'
      },
      {
        id: 'reason',
        label: 'Motivo do Afastamento',
        type: 'textarea',
        required: true,
        placeholder: 'Descreva brevemente a condição médica...'
      }
    ],
    template: `
ATESTADO MÉDICO

Atesto que o(a) paciente {{patient_name}}, portador(a) do CPF {{patient_cpf}}, esteve sob meus cuidados médicos e necessita de AFASTAMENTO de suas atividades por {{days_off}} dia(s), a partir de {{start_date}}.

{{#cid10}}CID-10: {{cid10}}{{/cid10}}

MOTIVO:
{{reason}}

Este atestado é válido para todos os fins legais.

{{current_city}}, {{current_date}}

_____________________________
Dr(a). {{doctor_name}}
CRM: {{doctor_crm}}
{{doctor_specialty}}
    `
  },
  {
    id: 'solicitacao-exames',
    name: 'Solicitação de Exames',
    category: 'solicitacao',
    specialty: 'Clínica Geral',
    description: 'Solicitação de exames laboratoriais e de imagem',
    fields: [
      {
        id: 'patient_name',
        label: 'Nome do Paciente',
        type: 'text',
        required: true
      },
      {
        id: 'patient_cpf',
        label: 'CPF do Paciente',
        type: 'text',
        required: true,
        mask: '999.999.999-99'
      },
      {
        id: 'patient_age',
        label: 'Idade do Paciente',
        type: 'number',
        required: true,
        min: 0,
        max: 120
      },
      {
        id: 'exams',
        label: 'Exames Solicitados',
        type: 'array',
        required: true,
        itemFields: [
          { id: 'name', label: 'Nome do Exame', type: 'text', required: true },
          { id: 'urgency', label: 'Urgência', type: 'select', options: ['Rotina', 'Urgente', 'Muito Urgente'] },
          { id: 'notes', label: 'Observações', type: 'text' }
        ]
      },
      {
        id: 'clinical_info',
        label: 'Informações Clínicas',
        type: 'textarea',
        required: true,
        placeholder: 'Histórico clínico relevante, sintomas, sinais...'
      },
      {
        id: 'hypothesis',
        label: 'Hipótese Diagnóstica',
        type: 'text',
        required: false,
        placeholder: 'Suspeita clínica...'
      }
    ],
    template: `
SOLICITAÇÃO DE EXAMES

Paciente: {{patient_name}} ({{patient_age}} anos)
CPF: {{patient_cpf}}
Data: {{current_date}}

EXAMES SOLICITADOS:
{{#exams}}
• {{name}} {{#urgency}}({{urgency}}){{/urgency}}
  {{#notes}}Obs: {{notes}}{{/notes}}
{{/exams}}

INFORMAÇÕES CLÍNICAS:
{{clinical_info}}

{{#hypothesis}}HIPÓTESE DIAGNÓSTICA:
{{hypothesis}}{{/hypothesis}}

_____________________________
Dr(a). {{doctor_name}}
CRM: {{doctor_crm}}
{{doctor_specialty}}
    `
  },
  {
    id: 'encaminhamento',
    name: 'Encaminhamento Médico',
    category: 'encaminhamento',
    specialty: 'Clínica Geral',
    description: 'Encaminhamento para outras especialidades',
    fields: [
      {
        id: 'patient_name',
        label: 'Nome do Paciente',
        type: 'text',
        required: true
      },
      {
        id: 'patient_cpf',
        label: 'CPF do Paciente',
        type: 'text',
        required: true,
        mask: '999.999.999-99'
      },
      {
        id: 'specialty_to',
        label: 'Especialidade para Encaminhar',
        type: 'select',
        required: true,
        options: [
          'Cardiologia',
          'Dermatologia',
          'Endocrinologia',
          'Gastroenterologia',
          'Ginecologia',
          'Neurologia',
          'Oftalmologia',
          'Ortopedia',
          'Otorrinolaringologia',
          'Pediatria',
          'Pneumologia',
          'Psiquiatria',
          'Urologia',
          'Outro'
        ]
      },
      {
        id: 'urgency',
        label: 'Urgência do Encaminhamento',
        type: 'select',
        required: true,
        options: ['Rotina', 'Prioritário', 'Urgente']
      },
      {
        id: 'reason',
        label: 'Motivo do Encaminhamento',
        type: 'textarea',
        required: true,
        placeholder: 'Descreva o motivo e histórico clínico relevante...'
      },
      {
        id: 'exams_done',
        label: 'Exames Já Realizados',
        type: 'textarea',
        required: false,
        placeholder: 'Liste exames já realizados com resultados...'
      }
    ],
    template: `
ENCAMINHAMENTO MÉDICO

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{current_date}}

Encaminho o(a) paciente acima para avaliação especializada em {{specialty_to}}.

URGÊNCIA: {{urgency}}

MOTIVO DO ENCAMINHAMENTO:
{{reason}}

{{#exams_done}}EXAMES REALIZADOS:
{{exams_done}}{{/exams_done}}

Agradeço a atenção dispensada.

Atenciosamente,

_____________________________
Dr(a). {{doctor_name}}
CRM: {{doctor_crm}}
{{doctor_specialty}}
    `
  },
  {
    id: 'relatorio-medico',
    name: 'Relatório Médico',
    category: 'relatorio',
    specialty: 'Clínica Geral',
    description: 'Relatório médico detalhado',
    fields: [
      {
        id: 'patient_name',
        label: 'Nome do Paciente',
        type: 'text',
        required: true
      },
      {
        id: 'patient_cpf',
        label: 'CPF do Paciente',
        type: 'text',
        required: true,
        mask: '999.999.999-99'
      },
      {
        id: 'report_type',
        label: 'Tipo de Relatório',
        type: 'select',
        required: true,
        options: [
          'Relatório Médico Geral',
          'Relatório de Alta Hospitalar',
          'Relatório de Acompanhamento',
          'Relatório Pericial',
          'Relatório de Procedimento',
          'Outro'
        ]
      },
      {
        id: 'diagnosis',
        label: 'Diagnóstico Principal',
        type: 'text',
        required: true
      },
      {
        id: 'medical_history',
        label: 'Histórico Médico',
        type: 'textarea',
        required: true,
        placeholder: 'Histórico da doença atual, antecedentes...'
      },
      {
        id: 'treatment',
        label: 'Tratamento Realizado',
        type: 'textarea',
        required: true,
        placeholder: 'Procedimentos, medicações, terapias...'
      },
      {
        id: 'current_condition',
        label: 'Condição Atual',
        type: 'textarea',
        required: true,
        placeholder: 'Estado atual do paciente...'
      },
      {
        id: 'recommendations',
        label: 'Recomendações',
        type: 'textarea',
        required: false,
        placeholder: 'Orientações, cuidados, seguimento...'
      },
      {
        id: 'prognosis',
        label: 'Prognóstico',
        type: 'select',
        required: false,
        options: ['Excelente', 'Bom', 'Regular', 'Reservado', 'Grave']
      }
    ],
    template: `
{{report_type}}

Paciente: {{patient_name}}
CPF: {{patient_cpf}}
Data: {{current_date}}

DIAGNÓSTICO:
{{diagnosis}}

HISTÓRICO MÉDICO:
{{medical_history}}

TRATAMENTO REALIZADO:
{{treatment}}

CONDIÇÃO ATUAL:
{{current_condition}}

{{#recommendations}}RECOMENDAÇÕES:
{{recommendations}}{{/recommendations}}

{{#prognosis}}PROGNÓSTICO: {{prognosis}}{{/prognosis}}

Este relatório é verdadeiro e reflete fielmente o estado de saúde do paciente na data mencionada.

_____________________________
Dr(a). {{doctor_name}}
CRM: {{doctor_crm}}
{{doctor_specialty}}
    `
  }
];

export default medicalTemplates;