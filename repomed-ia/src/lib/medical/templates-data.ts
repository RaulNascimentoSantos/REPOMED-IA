// 5 Templates Essenciais do RepoMed IA V1

export const initialTemplates = [
  {
    id: 'receita-simples',
    name: 'Receita Simples',
    specialty: 'Clínica Geral',
    description: 'Prescrição médica básica com validação de medicamentos e dosagens',
    contentJson: {
      content: `# RECEITUÁRIO MÉDICO

**Paciente:** {{patient_name}}  
**Data de Nascimento:** {{patient_dob}}  
**CPF:** {{patient_cpf}}

**Data da Prescrição:** {{current_date}}

---

## PRESCRIÇÃO:

{{medications}}

---

## ORIENTAÇÕES GERAIS:
{{instructions}}

{{diet_instructions}}

## RETORNO:
{{return_instructions}}

---

**Dr(a). {{doctor_name}}**  
**CRM:** {{doctor_crm}}  
**{{doctor_specialty}}**

*Este documento foi gerado digitalmente e possui validade legal*  
*Código de verificação: {{verification_code}}*`
    },
    fieldsSchema: {
      fields: [
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true,
          placeholder: 'Nome completo do paciente'
        },
        {
          id: 'patient_dob',
          label: 'Data de Nascimento',
          type: 'date',
          required: true
        },
        {
          id: 'patient_cpf',
          label: 'CPF do Paciente',
          type: 'text',
          required: false,
          placeholder: '000.000.000-00'
        },
        {
          id: 'medications',
          label: 'Medicamentos',
          type: 'textarea',
          required: true,
          placeholder: '1. Dipirona 500mg - Tomar 1 comprimido de 6/6h se dor\n2. Omeprazol 20mg - Tomar 1 cápsula pela manhã em jejum',
          rows: 6
        },
        {
          id: 'instructions',
          label: 'Orientações Médicas',
          type: 'textarea',
          required: false,
          placeholder: 'Repouso relativo, hidratação adequada...',
          rows: 3
        },
        {
          id: 'diet_instructions',
          label: 'Orientações Dietéticas',
          type: 'textarea',
          required: false,
          placeholder: 'Dieta leve, evitar frituras...',
          rows: 2
        },
        {
          id: 'return_instructions',
          label: 'Retorno',
          type: 'text',
          required: false,
          placeholder: 'Retorno se necessário ou em 7 dias'
        },
        {
          id: 'doctor_name',
          label: 'Nome do Médico',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_crm',
          label: 'CRM',
          type: 'text',
          required: true,
          placeholder: 'CRM/SP 123456'
        },
        {
          id: 'doctor_specialty',
          label: 'Especialidade',
          type: 'text',
          required: false,
          default: 'Clínica Geral'
        }
      ]
    }
  },

  {
    id: 'atestado-medico',
    name: 'Atestado Médico',
    specialty: 'Clínica Geral',
    description: 'Atestado para afastamento do trabalho com CID-10 e justificativa médica',
    contentJson: {
      content: `# ATESTADO MÉDICO

Atesto que o(a) Sr.(a) **{{patient_name}}**, portador(a) do documento **{{patient_doc}}**, esteve sob meus cuidados médicos no dia {{consultation_date}}.

## DIAGNÓSTICO:
{{diagnosis}}  
**CID-10:** {{cid_code}}

## AFASTAMENTO:
Por motivos de saúde, necessita afastar-se de suas atividades habituais por **{{days_off}} dias**, no período de {{start_date}} a {{end_date}}.

## OBSERVAÇÕES:
{{observations}}

{{restrictions}}

Este atestado é válido para os fins a que se destina.

---

**{{city}}, {{current_date}}**

**Dr(a). {{doctor_name}}**  
**CRM:** {{doctor_crm}}  
**{{doctor_specialty}}**

*Documento com validade legal - Código: {{verification_code}}*`
    },
    fieldsSchema: {
      fields: [
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'patient_doc',
          label: 'Documento (CPF/RG)',
          type: 'text',
          required: true,
          placeholder: '000.000.000-00'
        },
        {
          id: 'consultation_date',
          label: 'Data da Consulta',
          type: 'date',
          required: true,
          default: 'today'
        },
        {
          id: 'diagnosis',
          label: 'Diagnóstico',
          type: 'textarea',
          required: true,
          placeholder: 'Descrição do diagnóstico médico',
          rows: 3
        },
        {
          id: 'cid_code',
          label: 'Código CID-10',
          type: 'text',
          required: false,
          placeholder: 'M54.5'
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
          label: 'Data de Início',
          type: 'date',
          required: true
        },
        {
          id: 'end_date',
          label: 'Data de Fim',
          type: 'date',
          required: true
        },
        {
          id: 'observations',
          label: 'Observações',
          type: 'textarea',
          required: false,
          placeholder: 'Observações adicionais sobre o afastamento',
          rows: 2
        },
        {
          id: 'restrictions',
          label: 'Restrições/Recomendações',
          type: 'textarea',
          required: false,
          placeholder: 'Repouso absoluto, evitar esforços...',
          rows: 2
        },
        {
          id: 'city',
          label: 'Cidade',
          type: 'text',
          required: true,
          default: 'São Paulo'
        },
        {
          id: 'doctor_name',
          label: 'Nome do Médico',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_crm',
          label: 'CRM',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_specialty',
          label: 'Especialidade',
          type: 'text',
          required: false,
          default: 'Clínica Geral'
        }
      ]
    }
  },

  {
    id: 'solicitacao-exames',
    name: 'Solicitação de Exames',
    specialty: 'Clínica Geral',
    description: 'Pedido de exames laboratoriais, de imagem e complementares',
    contentJson: {
      content: `# SOLICITAÇÃO DE EXAMES MÉDICOS

**Paciente:** {{patient_name}}  
**Data de Nascimento:** {{patient_dob}}  
**CPF:** {{patient_cpf}}  
**Convênio:** {{insurance}}

**Data da Solicitação:** {{current_date}}

---

## HIPÓTESE DIAGNÓSTICA:
{{diagnostic_hypothesis}}  
**CID-10:** {{cid_code}}

---

## EXAMES SOLICITADOS:

### LABORATÓRIO:
{{lab_exams}}

### IMAGEM:
{{imaging_exams}}

### OUTROS EXAMES:
{{other_exams}}

---

## OBSERVAÇÕES/PREPARO:
{{preparation_instructions}}

## URGÊNCIA:
{{urgency_level}}

---

**Dr(a). {{doctor_name}}**  
**CRM:** {{doctor_crm}}  
**{{doctor_specialty}}**

*Solicitação válida por 30 dias - Código: {{verification_code}}*`
    },
    fieldsSchema: {
      fields: [
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'patient_dob',
          label: 'Data de Nascimento',
          type: 'date',
          required: true
        },
        {
          id: 'patient_cpf',
          label: 'CPF',
          type: 'text',
          required: false
        },
        {
          id: 'insurance',
          label: 'Convênio',
          type: 'text',
          required: false,
          placeholder: 'SUS, Unimed, Bradesco...'
        },
        {
          id: 'diagnostic_hypothesis',
          label: 'Hipótese Diagnóstica',
          type: 'textarea',
          required: true,
          rows: 2
        },
        {
          id: 'cid_code',
          label: 'CID-10',
          type: 'text',
          required: false
        },
        {
          id: 'lab_exams',
          label: 'Exames Laboratoriais',
          type: 'textarea',
          required: false,
          placeholder: 'Hemograma completo\nGlicemia de jejum\nTSH, T4 livre',
          rows: 4
        },
        {
          id: 'imaging_exams',
          label: 'Exames de Imagem',
          type: 'textarea',
          required: false,
          placeholder: 'Raio-X de tórax PA\nUSG abdome total\nTomografia...',
          rows: 4
        },
        {
          id: 'other_exams',
          label: 'Outros Exames',
          type: 'textarea',
          required: false,
          placeholder: 'ECG\nEcocardiograma\nEspirometria...',
          rows: 3
        },
        {
          id: 'preparation_instructions',
          label: 'Orientações de Preparo',
          type: 'textarea',
          required: false,
          placeholder: 'Jejum de 8h para glicemia...',
          rows: 3
        },
        {
          id: 'urgency_level',
          label: 'Nível de Urgência',
          type: 'select',
          required: false,
          options: ['Rotina', 'Urgente', 'Muito Urgente'],
          default: 'Rotina'
        },
        {
          id: 'doctor_name',
          label: 'Nome do Médico',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_crm',
          label: 'CRM',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_specialty',
          label: 'Especialidade',
          type: 'text',
          required: false,
          default: 'Clínica Geral'
        }
      ]
    }
  },

  {
    id: 'encaminhamento',
    name: 'Encaminhamento Médico',
    specialty: 'Clínica Geral',
    description: 'Referência para especialista ou serviço médico específico',
    contentJson: {
      content: `# ENCAMINHAMENTO MÉDICO

**Paciente:** {{patient_name}}  
**Data de Nascimento:** {{patient_dob}}  
**CPF:** {{patient_cpf}}

**Data:** {{current_date}}

---

## ENCAMINHO PARA:
**Especialidade:** {{target_specialty}}  
**Médico/Serviço:** {{target_doctor}}  
**Local:** {{target_location}}

---

## MOTIVO DO ENCAMINHAMENTO:
{{referral_reason}}

## QUADRO CLÍNICO ATUAL:
{{clinical_picture}}

**Diagnóstico Atual:** {{current_diagnosis}}  
**CID-10:** {{cid_code}}

## MEDICAMENTOS EM USO:
{{current_medications}}

## EXAMES REALIZADOS:
{{performed_exams}}

## EXAMES ANEXOS:
{{attached_exams}}

## URGÊNCIA DA CONSULTA:
{{urgency}}

---

## OBSERVAÇÕES:
{{additional_notes}}

Agradeço a atenção dispensada ao paciente.

---

**Dr(a). {{doctor_name}}**  
**CRM:** {{doctor_crm}}  
**{{doctor_specialty}}**  
**Telefone:** {{doctor_phone}}  
**Email:** {{doctor_email}}

*Encaminhamento válido - Código: {{verification_code}}*`
    },
    fieldsSchema: {
      fields: [
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'patient_dob',
          label: 'Data de Nascimento',
          type: 'date',
          required: true
        },
        {
          id: 'patient_cpf',
          label: 'CPF',
          type: 'text',
          required: false
        },
        {
          id: 'target_specialty',
          label: 'Especialidade de Destino',
          type: 'select',
          required: true,
          options: [
            'Cardiologia',
            'Neurologia',
            'Ortopedia',
            'Ginecologia',
            'Urologia',
            'Dermatologia',
            'Psiquiatria',
            'Endocrinologia',
            'Gastroenterologia',
            'Pneumologia',
            'Reumatologia',
            'Oftalmologia',
            'Otorrinolaringologia'
          ]
        },
        {
          id: 'target_doctor',
          label: 'Médico/Serviço Específico',
          type: 'text',
          required: false,
          placeholder: 'Dr. João Silva ou Hospital XYZ'
        },
        {
          id: 'target_location',
          label: 'Local/Clínica',
          type: 'text',
          required: false
        },
        {
          id: 'referral_reason',
          label: 'Motivo do Encaminhamento',
          type: 'textarea',
          required: true,
          rows: 3
        },
        {
          id: 'clinical_picture',
          label: 'Quadro Clínico Atual',
          type: 'textarea',
          required: true,
          rows: 4
        },
        {
          id: 'current_diagnosis',
          label: 'Diagnóstico Atual',
          type: 'text',
          required: false
        },
        {
          id: 'cid_code',
          label: 'CID-10',
          type: 'text',
          required: false
        },
        {
          id: 'current_medications',
          label: 'Medicamentos em Uso',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'performed_exams',
          label: 'Exames Realizados',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'attached_exams',
          label: 'Exames em Anexo',
          type: 'text',
          required: false
        },
        {
          id: 'urgency',
          label: 'Urgência',
          type: 'select',
          required: true,
          options: ['Rotina', 'Preferencial', 'Urgente', 'Muito Urgente'],
          default: 'Rotina'
        },
        {
          id: 'additional_notes',
          label: 'Observações Adicionais',
          type: 'textarea',
          required: false,
          rows: 2
        },
        {
          id: 'doctor_name',
          label: 'Nome do Médico',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_crm',
          label: 'CRM',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_specialty',
          label: 'Sua Especialidade',
          type: 'text',
          required: false,
          default: 'Clínica Geral'
        },
        {
          id: 'doctor_phone',
          label: 'Telefone de Contato',
          type: 'text',
          required: false
        },
        {
          id: 'doctor_email',
          label: 'Email de Contato',
          type: 'email',
          required: false
        }
      ]
    }
  },

  {
    id: 'relatorio-medico',
    name: 'Relatório Médico',
    specialty: 'Clínica Geral',
    description: 'Relatório detalhado do quadro clínico e evolução do paciente',
    contentJson: {
      content: `# RELATÓRIO MÉDICO

**Paciente:** {{patient_name}}  
**Data de Nascimento:** {{patient_dob}}  
**CPF:** {{patient_cpf}}  
**Data do Relatório:** {{current_date}}

---

## IDENTIFICAÇÃO DO CASO:
**Período de Acompanhamento:** {{follow_up_period}}  
**Data da Primeira Consulta:** {{first_consultation}}  
**Data da Última Consulta:** {{last_consultation}}

---

## ANAMNESE:

### Queixa Principal:
{{chief_complaint}}

### História da Doença Atual:
{{history_present_illness}}

### História Médica Pregressa:
{{past_medical_history}}

### História Familiar:
{{family_history}}

### História Social:
{{social_history}}

---

## EXAME FÍSICO:

### Sinais Vitais:
{{vital_signs}}

### Exame Físico Geral:
{{general_examination}}

### Exame Físico Específico:
{{specific_examination}}

---

## EXAMES COMPLEMENTARES REALIZADOS:
{{complementary_exams}}

---

## DIAGNÓSTICOS:

### Diagnóstico Principal:
{{main_diagnosis}}  
**CID-10:** {{main_cid}}

### Diagnósticos Secundários:
{{secondary_diagnoses}}

---

## TRATAMENTOS REALIZADOS:

### Medicamentosos:
{{medication_treatments}}

### Não-medicamentosos:
{{non_medication_treatments}}

### Procedimentos:
{{procedures_performed}}

---

## EVOLUÇÃO CLÍNICA:
{{clinical_evolution}}

## ESTADO ATUAL:
{{current_status}}

## PROGNÓSTICO:
{{prognosis}}

## RECOMENDAÇÕES:
{{recommendations}}

---

**Dr(a). {{doctor_name}}**  
**CRM:** {{doctor_crm}}  
**{{doctor_specialty}}**

*Relatório médico com validade legal - Código: {{verification_code}}*`
    },
    fieldsSchema: {
      fields: [
        {
          id: 'patient_name',
          label: 'Nome do Paciente',
          type: 'text',
          required: true
        },
        {
          id: 'patient_dob',
          label: 'Data de Nascimento',
          type: 'date',
          required: true
        },
        {
          id: 'patient_cpf',
          label: 'CPF',
          type: 'text',
          required: false
        },
        {
          id: 'follow_up_period',
          label: 'Período de Acompanhamento',
          type: 'text',
          required: false,
          placeholder: 'Ex: Janeiro a Dezembro 2024'
        },
        {
          id: 'first_consultation',
          label: 'Primeira Consulta',
          type: 'date',
          required: false
        },
        {
          id: 'last_consultation',
          label: 'Última Consulta',
          type: 'date',
          required: false
        },
        {
          id: 'chief_complaint',
          label: 'Queixa Principal',
          type: 'textarea',
          required: true,
          rows: 2
        },
        {
          id: 'history_present_illness',
          label: 'História da Doença Atual',
          type: 'textarea',
          required: true,
          rows: 4
        },
        {
          id: 'past_medical_history',
          label: 'História Médica Pregressa',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'family_history',
          label: 'História Familiar',
          type: 'textarea',
          required: false,
          rows: 2
        },
        {
          id: 'social_history',
          label: 'História Social',
          type: 'textarea',
          required: false,
          rows: 2
        },
        {
          id: 'vital_signs',
          label: 'Sinais Vitais',
          type: 'text',
          required: false,
          placeholder: 'PA: 120x80 mmHg, FC: 72 bpm, T: 36.5°C'
        },
        {
          id: 'general_examination',
          label: 'Exame Físico Geral',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'specific_examination',
          label: 'Exame Físico Específico',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'complementary_exams',
          label: 'Exames Complementares',
          type: 'textarea',
          required: false,
          rows: 4
        },
        {
          id: 'main_diagnosis',
          label: 'Diagnóstico Principal',
          type: 'text',
          required: true
        },
        {
          id: 'main_cid',
          label: 'CID-10 Principal',
          type: 'text',
          required: false
        },
        {
          id: 'secondary_diagnoses',
          label: 'Diagnósticos Secundários',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'medication_treatments',
          label: 'Tratamentos Medicamentosos',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'non_medication_treatments',
          label: 'Tratamentos Não-medicamentosos',
          type: 'textarea',
          required: false,
          rows: 2
        },
        {
          id: 'procedures_performed',
          label: 'Procedimentos Realizados',
          type: 'textarea',
          required: false,
          rows: 2
        },
        {
          id: 'clinical_evolution',
          label: 'Evolução Clínica',
          type: 'textarea',
          required: true,
          rows: 3
        },
        {
          id: 'current_status',
          label: 'Estado Atual',
          type: 'textarea',
          required: true,
          rows: 2
        },
        {
          id: 'prognosis',
          label: 'Prognóstico',
          type: 'textarea',
          required: false,
          rows: 2
        },
        {
          id: 'recommendations',
          label: 'Recomendações',
          type: 'textarea',
          required: false,
          rows: 3
        },
        {
          id: 'doctor_name',
          label: 'Nome do Médico',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_crm',
          label: 'CRM',
          type: 'text',
          required: true
        },
        {
          id: 'doctor_specialty',
          label: 'Especialidade',
          type: 'text',
          required: false,
          default: 'Clínica Geral'
        }
      ]
    }
  }
]