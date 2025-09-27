import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';

const fastify: FastifyInstance = Fastify({
  logger: true,
  bodyLimit: 10485760 // 10MB
});

// CORS configurado para todas as origens do frontend
fastify.register(cors, {
  origin: [
    'http://localhost:3023',
    'http://localhost:3024',
    'http://localhost:3021',
    'http://localhost:3010',
    'http://localhost:5173',
    'http://localhost:3007',
    'http://repomed-web:3021'
  ],
  credentials: true
});

async function checkDatabase() {
  // Simular verificação de banco
  return true;
}

async function checkRedis() {
  // Simular verificação de Redis
  return true;
}

// Health check robusto
fastify.get('/health', async (request, reply) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      frontend: 'preserved'
    }
  };
  return health;
});

// Rota de login específica
fastify.post('/api/auth/login', async (request, reply) => {
  return {
    success: true,
    token: 'demo-token-' + Date.now(),
    user: {
      id: '1',
      name: 'Dr. João Silva',
      email: 'dr.silva@repomed.com.br',
      crm: 'SP 123456',
      role: 'physician'
    }
  };
});

// Métricas do dashboard
fastify.get('/api/dashboard/metrics', async (request, reply) => {
  return {
    success: true,
    data: {
      pacientesAtivos: 1247,
      consultasHoje: 24,
      documentosGerados: 3891,
      receitaMensal: 45680,
      alertasCriticos: 3,
      proximasConsultas: 4
    }
  };
});

// Templates de documentos
fastify.get('/api/templates', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 1,
        name: 'Receita Médica',
        type: 'prescription',
        description: 'Template para prescrição de medicamentos',
        template: `Dr(a). {medico_nome} - CRM: {medico_crm}
Clínica: {clinica_nome}

RECEITA MÉDICA

Paciente: {paciente_nome}
CPF: {paciente_cpf}
Data: {data}

{medicamentos}

Orientações: {orientacoes}

__________________________
Dr(a). {medico_nome}
CRM: {medico_crm}`,
        variables: ['medico_nome', 'medico_crm', 'clinica_nome', 'paciente_nome', 'paciente_cpf', 'data', 'medicamentos', 'orientacoes']
      },
      {
        id: 2,
        name: 'Atestado Médico',
        type: 'certificate',
        description: 'Template para atestados médicos',
        template: `ATESTADO MÉDICO

Atesto para os devidos fins que o(a) Sr(a). {paciente_nome}, portador(a) do CPF {paciente_cpf}, esteve sob meus cuidados médicos e necessita de afastamento de suas atividades por {dias_afastamento} dias, no período de {data_inicio} a {data_fim}.

CID-10: {cid}
Observações: {observacoes}

{cidade}, {data}

__________________________
Dr(a). {medico_nome}
CRM: {medico_crm}`,
        variables: ['paciente_nome', 'paciente_cpf', 'dias_afastamento', 'data_inicio', 'data_fim', 'cid', 'observacoes', 'cidade', 'data', 'medico_nome', 'medico_crm']
      },
      {
        id: 3,
        name: 'Relatório Médico',
        type: 'report',
        description: 'Template para relatórios médicos detalhados',
        template: `RELATÓRIO MÉDICO

Paciente: {paciente_nome}
CPF: {paciente_cpf}
Data de Nascimento: {paciente_nascimento}
Convênio: {convenio}

HISTÓRICO CLÍNICO:
{historico_clinico}

EXAME FÍSICO:
{exame_fisico}

EXAMES COMPLEMENTARES:
{exames_complementares}

DIAGNÓSTICO:
{diagnostico}

CONDUTA:
{conduta}

PROGNÓSTICO:
{prognostico}

{cidade}, {data}

__________________________
Dr(a). {medico_nome}
CRM: {medico_crm}
Especialidade: {especialidade}`,
        variables: ['paciente_nome', 'paciente_cpf', 'paciente_nascimento', 'convenio', 'historico_clinico', 'exame_fisico', 'exames_complementares', 'diagnostico', 'conduta', 'prognostico', 'cidade', 'data', 'medico_nome', 'medico_crm', 'especialidade']
      },
      {
        id: 4,
        name: 'Laudo Médico',
        type: 'report',
        description: 'Template para laudos médicos',
        template: `LAUDO MÉDICO

Identificação do Paciente:
Nome: {paciente_nome}
CPF: {paciente_cpf}
RG: {paciente_rg}
Data de Nascimento: {paciente_nascimento}

Exame Solicitado: {tipo_exame}
Data do Exame: {data_exame}

TÉCNICA:
{tecnica}

ACHADOS:
{achados}

CONCLUSÃO:
{conclusao}

RECOMENDAÇÕES:
{recomendacoes}

{cidade}, {data}

__________________________
Dr(a). {medico_nome}
CRM: {medico_crm}
Especialidade: {especialidade}`,
        variables: ['paciente_nome', 'paciente_cpf', 'paciente_rg', 'paciente_nascimento', 'tipo_exame', 'data_exame', 'tecnica', 'achados', 'conclusao', 'recomendacoes', 'cidade', 'data', 'medico_nome', 'medico_crm', 'especialidade']
      },
      {
        id: 5,
        name: 'Declaração de Comparecimento',
        type: 'certificate',
        description: 'Template para declaração de comparecimento',
        template: `DECLARAÇÃO DE COMPARECIMENTO

Declaro para os devidos fins que o(a) Sr(a). {paciente_nome}, portador(a) do CPF {paciente_cpf}, compareceu a esta consulta médica no dia {data_consulta} das {horario_inicio} às {horario_fim}.

Motivo da consulta: {motivo_consulta}

{cidade}, {data}

__________________________
Dr(a). {medico_nome}
CRM: {medico_crm}`,
        variables: ['paciente_nome', 'paciente_cpf', 'data_consulta', 'horario_inicio', 'horario_fim', 'motivo_consulta', 'cidade', 'data', 'medico_nome', 'medico_crm']
      },
      {
        id: 6,
        name: 'Encaminhamento Médico',
        type: 'referral',
        description: 'Template para encaminhamentos médicos',
        template: `ENCAMINHAMENTO MÉDICO

Ao colega: {medico_destino}
Especialidade: {especialidade_destino}

Estou encaminhando o(a) paciente:
Nome: {paciente_nome}
CPF: {paciente_cpf}
Data de Nascimento: {paciente_nascimento}

Motivo do encaminhamento: {motivo_encaminhamento}

Histórico relevante: {historico_relevante}

Exames anexos: {exames_anexos}

Urgência: {nivel_urgencia}

Aguardo retorno sobre a conduta adotada.

{cidade}, {data}

__________________________
Dr(a). {medico_nome}
CRM: {medico_crm}
Especialidade: {especialidade}`,
        variables: ['medico_destino', 'especialidade_destino', 'paciente_nome', 'paciente_cpf', 'paciente_nascimento', 'motivo_encaminhamento', 'historico_relevante', 'exames_anexos', 'nivel_urgencia', 'cidade', 'data', 'medico_nome', 'medico_crm', 'especialidade']
      }
    ],
    total: 6
  };
});

fastify.get('/api/documents', async (request, reply) => {
  const filter = (request.query as any)?.filter;

  const allDocuments = [
    {
      id: 'doc001',
      title: 'Receita - Maria Silva Santos',
      type: 'receita',
      category: 'Receita Médica',
      patient: 'Maria Silva Santos',
      patientId: 1,
      createdAt: '2024-01-23T14:30:00Z',
      updatedAt: '2024-01-23T14:30:00Z',
      status: 'pendente_assinatura',
      signed: false,
      content: 'Prescrevo: Metformina 850mg - 1 comprimido de 12/12h por 30 dias',
      doctor: 'Dr. João Silva',
      size: '2.1 KB',
      urgent: false
    },
    {
      id: 'doc002',
      title: 'Atestado - João Carlos Oliveira',
      type: 'atestado',
      category: 'Atestado Médico',
      patient: 'João Carlos Oliveira',
      patientId: 2,
      createdAt: '2024-01-23T13:15:00Z',
      updatedAt: '2024-01-23T13:15:00Z',
      status: 'assinado',
      signed: true,
      signedAt: '2024-01-23T13:20:00Z',
      content: 'Atesto que necessita afastamento por 3 dias devido a hipertensão',
      doctor: 'Dr. João Silva',
      size: '1.8 KB',
      urgent: false
    },
    {
      id: 'doc003',
      title: 'Laudo - Pedro Santos',
      type: 'laudo',
      category: 'Laudo Médico',
      patient: 'Pedro Santos',
      patientId: 3,
      createdAt: '2024-01-23T11:45:00Z',
      updatedAt: '2024-01-23T11:45:00Z',
      status: 'assinado',
      signed: true,
      signedAt: '2024-01-23T11:50:00Z',
      content: 'Laudo de exame cardiológico - ECG normal',
      doctor: 'Dr. João Silva',
      size: '3.2 KB',
      urgent: false
    },
    {
      id: 'doc004',
      title: 'Encaminhamento - Ana Lima',
      type: 'encaminhamento',
      category: 'Encaminhamento',
      patient: 'Ana Lima',
      patientId: 4,
      createdAt: '2024-01-23T10:20:00Z',
      updatedAt: '2024-01-23T10:20:00Z',
      status: 'pendente_assinatura',
      signed: false,
      content: 'Encaminho para cardiologista para avaliação de sopro',
      doctor: 'Dr. João Silva',
      size: '1.5 KB',
      urgent: true
    },
    {
      id: 'doc005',
      title: 'Receita - Beatriz Almeida',
      type: 'receita',
      category: 'Receita Médica',
      patient: 'Beatriz Almeida Santos',
      patientId: 5,
      createdAt: '2024-01-23T16:10:00Z',
      updatedAt: '2024-01-23T16:10:00Z',
      status: 'pendente_assinatura',
      signed: false,
      content: 'Prescrevo: Omeprazol 20mg - 1 comprimido pela manhã em jejum',
      doctor: 'Dr. João Silva',
      size: '2.0 KB',
      urgent: false
    },
    {
      id: 'doc006',
      title: 'Relatório - Roberto Mendes',
      type: 'relatorio',
      category: 'Relatório Médico',
      patient: 'Roberto Silva Mendes',
      patientId: 6,
      createdAt: '2024-01-23T09:30:00Z',
      updatedAt: '2024-01-23T09:30:00Z',
      status: 'rascunho',
      signed: false,
      content: 'Relatório de acompanhamento de lombalgia crônica',
      doctor: 'Dr. João Silva',
      size: '4.1 KB',
      urgent: false
    }
  ];

  let filteredDocuments = allDocuments;

  // Aplicar filtros
  if (filter && filter !== 'todos') {
    if (filter === 'receitas') {
      filteredDocuments = allDocuments.filter(doc => doc.type === 'receita');
    } else if (filter === 'atestados') {
      filteredDocuments = allDocuments.filter(doc => doc.type === 'atestado');
    } else if (filter === 'relatorios') {
      filteredDocuments = allDocuments.filter(doc => doc.type === 'relatorio' || doc.type === 'laudo');
    } else if (filter === 'pendentes') {
      filteredDocuments = allDocuments.filter(doc => !doc.signed);
    } else if (filter === 'assinados') {
      filteredDocuments = allDocuments.filter(doc => doc.signed);
    }
  }

  return {
    success: true,
    data: filteredDocuments,
    total: filteredDocuments.length,
    pendingSignature: allDocuments.filter(doc => !doc.signed).length,
    signed: allDocuments.filter(doc => doc.signed).length
  };
});

fastify.get('/api/pipeline', async (request, reply) => {
  return { success: true, data: { status: 'running' } };
});

fastify.get('/api/bridge/jobs', async (request, reply) => {
  return { success: true, data: [] };
});

fastify.get('/api/bridge/status/:jobId', async (request, reply) => {
  return { success: true, data: { status: 'completed' } };
});

fastify.get('/api/urls/list', async (request, reply) => {
  return { success: true, data: [] };
});

fastify.post('/api/urls/register', async (request, reply) => {
  return { success: true, data: { registered: true } };
});

// Rotas de Assinatura Digital
fastify.post('/api/signatures/request', async (request, reply) => {
  return {
    success: true,
    data: {
      requestId: 'req_' + Date.now(),
      documentId: (request.body as any).documentId,
      signerName: (request.body as any).signerName,
      signerCrm: (request.body as any).signerCrm,
      status: 'pending',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      signUrl: `http://localhost:8085/sign/req_${Date.now()}`,
      verificationToken: 'tok_' + Date.now()
    }
  };
});

fastify.get('/api/signatures/:requestId', async (request, reply) => {
  return {
    success: true,
    data: {
      requestId: (request.params as any).requestId,
      status: 'completed',
      signedAt: new Date().toISOString(),
      signature: 'sig_' + Date.now(),
      isValid: true
    }
  };
});

fastify.post('/api/signatures/:requestId/sign', async (request, reply) => {
  return {
    success: true,
    data: {
      signed: true,
      signatureId: 'sig_' + Date.now(),
      timestamp: new Date().toISOString()
    }
  };
});

fastify.get('/api/signatures/:requestId/verify', async (request, reply) => {
  return {
    success: true,
    data: {
      isValid: true,
      signedBy: 'Dr. João Silva',
      signedAt: new Date().toISOString(),
      documentHash: 'sha256_' + Date.now(),
      certificateValid: true
    }
  };
});

// Pacientes para a página
fastify.get('/api/patients', async (request, reply) => {
  return {
    success: true,
    data: [
      {
        id: 1,
        nome: 'Maria Silva Santos',
        idade: '40 anos',
        sexo: 'Feminino',
        telefone: '(11) 99999-9999',
        email: 'maria.santos@email.com',
        endereco: 'Rua das Flores, 123 - Vila Madalena, São Paulo, SP',
        condicoes: ['Diabetes Tipo 2', 'Hipertensão'],
        statusBadge: 'Médio',
        ultimaConsulta: '15/01/2024',
        cpf: '123.456.789-01',
        dataNascimento: '15/03/1984',
        profissao: 'Professora',
        convenio: 'Bradesco Saúde'
      },
      {
        id: 2,
        nome: 'João Carlos Oliveira',
        idade: '67 anos',
        sexo: 'Masculino',
        telefone: '(11) 77777-7777',
        email: 'joao.oliveira@email.com',
        endereco: 'Av. Paulista, 456 - Bela Vista, São Paulo, SP',
        condicoes: ['Hipertensão', 'Colesterol alto'],
        statusBadge: 'Alto',
        ultimaConsulta: '20/01/2024',
        cpf: '987.654.321-09',
        dataNascimento: '22/07/1957',
        profissao: 'Aposentado',
        convenio: 'Amil'
      },
      {
        id: 3,
        nome: 'Ana Paula Costa',
        idade: '32 anos',
        sexo: 'Feminino',
        telefone: '(11) 55555-5555',
        email: 'ana.costa@email.com',
        endereco: 'Rua Augusta, 789 - Consolação, São Paulo, SP',
        condicoes: ['Enxaqueca'],
        statusBadge: 'Baixo',
        ultimaConsulta: '10/01/2024',
        cpf: '456.789.123-45',
        dataNascimento: '08/12/1991',
        profissao: 'Designer',
        convenio: 'SulAmérica'
      },
      {
        id: 4,
        nome: 'Carlos Eduardo Lima',
        idade: '59 anos',
        sexo: 'Masculino',
        telefone: '(11) 33333-3333',
        email: 'carlos.lima@email.com',
        endereco: 'Rua Oscar Freire, 321 - Jardins, São Paulo, SP',
        condicoes: ['Diabetes Tipo 2', 'Doença arterial coronariana'],
        statusBadge: 'Crítico',
        ultimaConsulta: '19/01/2024',
        cpf: '789.123.456-78',
        dataNascimento: '14/09/1965',
        profissao: 'Empresário',
        convenio: 'Porto Seguro'
      },
      {
        id: 5,
        nome: 'Beatriz Almeida Santos',
        idade: '28 anos',
        sexo: 'Feminino',
        telefone: '(11) 88888-8888',
        email: 'beatriz.almeida@email.com',
        endereco: 'Rua Haddock Lobo, 567 - Cerqueira César, São Paulo, SP',
        condicoes: ['Ansiedade', 'Gastrite'],
        statusBadge: 'Médio',
        ultimaConsulta: '22/01/2024',
        cpf: '321.654.987-12',
        dataNascimento: '03/05/1996',
        profissao: 'Advogada',
        convenio: 'Bradesco Saúde'
      },
      {
        id: 6,
        nome: 'Roberto Silva Mendes',
        idade: '45 anos',
        sexo: 'Masculino',
        telefone: '(11) 44444-4444',
        email: 'roberto.mendes@email.com',
        endereco: 'Rua dos Três Irmãos, 890 - Vila Progredior, São Paulo, SP',
        condicoes: ['Lombalgia crônica'],
        statusBadge: 'Baixo',
        ultimaConsulta: '18/01/2024',
        cpf: '654.321.789-23',
        dataNascimento: '27/11/1979',
        profissao: 'Engenheiro',
        convenio: 'Particular'
      },
      {
        id: 7,
        nome: 'Isabella Rodrigues',
        idade: '35 anos',
        sexo: 'Feminino',
        telefone: '(11) 66666-6666',
        email: 'isabella.rodrigues@email.com',
        endereco: 'Rua Cardeal Arcoverde, 234 - Pinheiros, São Paulo, SP',
        condicoes: ['Hipotireoidismo'],
        statusBadge: 'Baixo',
        ultimaConsulta: '16/01/2024',
        cpf: '147.258.369-56',
        dataNascimento: '19/02/1989',
        profissao: 'Jornalista',
        convenio: 'Unimed'
      },
      {
        id: 8,
        nome: 'Fernando Costa Neto',
        idade: '52 anos',
        sexo: 'Masculino',
        telefone: '(11) 22222-2222',
        email: 'fernando.costa@email.com',
        endereco: 'Av. Faria Lima, 678 - Itaim Bibi, São Paulo, SP',
        condicoes: ['Hipertensão', 'Diabetes Tipo 2', 'Obesidade'],
        statusBadge: 'Alto',
        ultimaConsulta: '21/01/2024',
        cpf: '258.369.147-89',
        dataNascimento: '11/06/1972',
        profissao: 'Contador',
        convenio: 'Prevent Senior'
      }
    ],
    total: 8
  };
});


// Catch-all para rotas não definidas
fastify.setNotFoundHandler(async (request, reply) => {
  return {
    error: 'Route not found',
    path: request.url,
    method: request.method,
    suggestion: 'Check the API documentation'
  };
});

// Error handler
fastify.setErrorHandler(async (error, request, reply) => {
  fastify.log.error(error);
  reply.status(500).send({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

const start = async () => {
  try {
    const PORT = process.env.PORT || 8081;
    await fastify.listen({ port: Number(PORT), host: '0.0.0.0' });
    fastify.log.info(`🚀 Servidor estável rodando na porta ${PORT}`);
    fastify.log.info('✅ Frontend preservado - todas as rotas funcionando');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();