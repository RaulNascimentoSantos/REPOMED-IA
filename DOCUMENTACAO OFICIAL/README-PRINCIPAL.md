# 🏥 RepoMed IA - Sistema de Documentos Médicos

Sistema completo de documentação médica com inteligência artificial integrada, desenvolvido para modernizar o workflow de profissionais da saúde.

## 📋 Visão Geral

O RepoMed IA é uma plataforma completa que combina interface médica moderna, assistente de IA, templates profissionais e ferramentas avançadas para criação, gestão e assinatura digital de documentos médicos.

## ✨ Funcionalidades Principais

### 🏥 Workspace Médico
- **Interface tri-pane** (Paciente | Editor | IA Assistente)
- **Painel do paciente** com informações críticas (alergias, condições)
- **Editor de documentos** com formatação rica
- **Templates médicos** pré-formatados
- **Ditado por voz** simulado
- **IA Assistente** com sugestões contextuais

### 📄 Gestão de Documentos
- **Lista completa** com busca e filtros avançados
- **5 tipos de documentos**: Receitas, Atestados, Laudos, Relatórios, Encaminhamentos
- **Status tracking**: Rascunho, Pendente, Assinado
- **Estatísticas em tempo real**
- **Ações rápidas**: Ver, Editar, Baixar

### ➕ Criação de Documentos
- **Templates automáticos** para cada tipo
- **Preview em tempo real** lado a lado
- **Sistema de prioridades** (Baixa, Normal, Alta, Urgente)
- **Auto-população** com dados do paciente
- **Validação inteligente** de formulários

### 🧪 Diagnóstico do Sistema
- **Status monitoring** de todos os serviços
- **Testes automatizados** com feedback visual
- **Métricas de performance** em tempo real
- **Informações do dispositivo** detalhadas
- **Ações rápidas** para teste de funcionalidades

### 🧠 Inteligência Artificial
- **Alertas de alergia** (95% confiança)
- **Sugestões de medicamentos** (80% confiança)
- **Detecção contextual** de sintomas
- **Inserção automática** de prescrições
- **Toggle on/off** para controle do usuário

## 🏗️ Arquitetura Técnica

### Frontend (React + Vite)
```
📁 src/
├── 📁 components/
│   ├── Navigation.jsx          # Navegação global + breadcrumbs
│   └── workspace/
│       └── (componentes do workspace)
├── 📁 pages/
│   ├── HomePage.jsx            # Página inicial
│   ├── WorkspaceSimple.jsx     # Workspace médico
│   ├── Documents.jsx           # Gestão de documentos
│   ├── CreateDocument.jsx      # Criação de documentos
│   ├── Test.jsx                # Diagnóstico do sistema
│   ├── TestSimple.jsx          # Testes simples
│   └── AppSimple.jsx           # Status do sistema
├── App.jsx                     # Roteamento principal
└── main.jsx                    # Entry point
```

### Backend (Node.js + Fastify)
```
📁 src/
├── 📁 services/
│   ├── AIService.js            # Integração OpenAI GPT-4
│   ├── SignatureService.js     # Assinatura digital ICP-Brasil
│   └── FHIRService.js          # Interoperabilidade FHIR/RNDS
├── 📁 migrations/              # Migrações PostgreSQL
└── server.js                   # Servidor principal
```

### Tecnologias Utilizadas
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Fastify, PostgreSQL
- **IA**: OpenAI GPT-4o-mini
- **Segurança**: ICP-Brasil, FHIR R4, PostgreSQL RLS
- **Deploy**: Docker, Multi-tenant Architecture

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key (opcional)

### Frontend
```bash
cd repomed-web
npm install
npm run dev
# Acesse: http://localhost:3010
```

### Backend
```bash
cd repomed-api
npm install
PORT=8081 node src/server.js
# API: http://localhost:8081
```

## 📱 Páginas Implementadas

### 🏠 HomePage (`/`)
Página inicial com status do sistema e navegação principal.
- ✅ Design moderno com gradientes
- ✅ Status de todos os serviços
- ✅ Links para funcionalidades principais

### 🏥 Workspace (`/workspace`)
Interface médica completa para criação de documentos.
- ✅ Tri-pane layout responsivo
- ✅ Painel do paciente com alertas
- ✅ Editor com templates
- ✅ IA Assistente contextual
- ✅ Dictado por voz simulado

### 📄 Documents (`/documents`)
Gestão completa de documentos médicos.
- ✅ Lista com 5 documentos mock
- ✅ Busca por título, paciente, médico
- ✅ Filtros por tipo de documento
- ✅ Ordenação flexível
- ✅ Estatísticas visuais

### ➕ Create Document (`/documents/create`)
Criação de novos documentos com templates.
- ✅ 5 tipos de documentos médicos
- ✅ Templates profissionais pré-formatados
- ✅ Preview em tempo real
- ✅ Sistema de prioridades
- ✅ Validação de formulários

### 🧪 Test (`/test`)
Diagnóstico completo do sistema.
- ✅ Status de Frontend, Backend, Database, IA
- ✅ Testes automatizados sequenciais
- ✅ Métricas de performance
- ✅ Informações do dispositivo
- ✅ Ações rápidas para teste

### ⚡ AppSimple (`/app-simple`)
Página de status do React com informações do sistema.

### 🧪 TestSimple (`/test-simple`)
Testes básicos de componentes e Tailwind CSS.

## 🌐 Navegação

Sistema de navegação global com:
- **Barra superior** sticky com logo e menu
- **Breadcrumbs dinâmicos** baseados na rota atual
- **Estados ativos** visuais para página atual
- **Status indicator** do sistema online
- **Hover effects** e transições suaves

## 🔧 APIs e Serviços

### Health Check
```
GET /health
Response: { status: "ok", timestamp: "..." }
```

### Serviços Backend
- **AIService**: Integração com OpenAI para sugestões médicas
- **SignatureService**: Assinatura digital ICP-Brasil
- **FHIRService**: Interoperabilidade com RNDS
- **Multi-tenant**: Isolamento por tenant com PostgreSQL RLS

## 🛡️ Segurança e Compliance

### Implementações
- ✅ **ICP-Brasil** para assinatura digital
- ✅ **FHIR R4** para interoperabilidade
- ✅ **LGPD** compliance
- ✅ **PostgreSQL RLS** para multi-tenancy
- ✅ **Encrypted storage** para dados sensíveis
- ✅ **Audit trail** para rastreabilidade

### Padrões Médicos
- ✅ **CID-10** para classificação de doenças
- ✅ **Templates** baseados em padrões CFM
- ✅ **Alertas de segurança** para alergias
- ✅ **Validação** de prescrições médicas

## 📊 Status Atual

### ✅ Implementado
- [x] Interface médica completa
- [x] Sistema de navegação global
- [x] Gestão de documentos
- [x] Criação com templates
- [x] IA Assistente médica
- [x] Testes automatizados
- [x] Backend API
- [x] Serviços de segurança
- [x] Multi-tenant architecture
- [x] Documentation completa

### 🔄 Em Funcionamento
- **Frontend**: ✅ http://localhost:3010
- **Backend**: ✅ http://localhost:8081
- **Database**: ✅ PostgreSQL conectado
- **IA Service**: ✅ OpenAI configurado
- **Navigation**: ✅ Todas as rotas funcionais

## 🎯 Demonstração

### Acesso Rápido
- **Sistema Completo**: http://localhost:3010
- **Workspace Médico**: http://localhost:3010/workspace
- **Gestão Documentos**: http://localhost:3010/documents
- **Criar Documento**: http://localhost:3010/documents/create
- **Testes Sistema**: http://localhost:3010/test
- **Demo Visual**: http://localhost:3010/demo-completo.html

### Recursos de Teste
- **5 documentos mock** com dados realistas
- **5 pacientes simulados** com histórico médico
- **Templates profissionais** para todos os tipos
- **IA contextual** com sugestões médicas
- **Performance metrics** em tempo real

## 👨‍💻 Desenvolvimento

### Scripts Disponíveis
```bash
# Frontend
npm run dev        # Desenvolvimento
npm run build      # Build produção
npm run preview    # Preview build

# Backend  
npm start          # Servidor produção
node src/server.js # Desenvolvimento
```

### Estrutura do Projeto
- **Modular**: Componentes reutilizáveis
- **TypeScript**: Para components críticos
- **Responsive**: Design adaptativo
- **Performance**: Lazy loading e otimizações
- **SEO**: Meta tags e structured data

## 📞 Suporte

Sistema desenvolvido com foco em:
- **Usabilidade médica** profissional
- **Performance** otimizada
- **Segurança** de dados sensíveis
- **Compliance** regulatório
- **Escalabilidade** multi-tenant

---

**RepoMed IA** - Modernizando a documentação médica com inteligência artificial 🚀