# 🏥 RepoMed IA - Frontend

Interface web completa para o sistema de documentos médicos com inteligência artificial.

## 📋 Páginas Implementadas

### 🏠 HomePage (`/`)
**Página inicial com visão geral do sistema**
- Status de todos os serviços (React, Workspace, IA, Design System, Backend API)
- Links para funcionalidades principais
- Design moderno com gradiente azul-verde
- Cards informativos com navegação rápida

**Componentes:**
- Status indicators visuais
- Navigation cards para Workspace e Documentos
- Responsive layout

### 🏥 WorkspaceSimple (`/workspace`)
**Interface médica profissional tri-pane**

**Funcionalidades:**
- **Painel do Paciente** (colapsível)
  - Dados do paciente ativo (Maria Silva Santos, 45 anos)
  - Alergias críticas (Penicilina, Dipirona) em vermelho
  - Condições médicas (Hipertensão, Diabetes Tipo 2) em amarelo
  - Toggle de visibilidade (👤 button)

- **Editor de Documentos**
  - Templates médicos (Receita, Atestado, Laudo)
  - Toolbar de formatação (Bold, Italic, Underline)
  - Dropdown de templates com auto-população
  - Área de texto com font monospace
  - Contador de caracteres em tempo real

- **IA Assistente** (toggle on/off)
  - Alertas de alergia (95% confiança) quando detecta "medicamento"
  - Sugestões de analgésicos (80% confiança) quando detecta "dor"
  - Cards de sugestão com botão "Aplicar"
  - Background gradient azul-roxo

- **Header com Ações**
  - Ditado por voz (🎤) com simulação de 3s
  - Toggle IA (🧠) on/off
  - Botão Salvar (💾)
  - Botão Assinar (✍️)

- **Footer Informativo**
  - Nome e idade do paciente
  - Alertas de alergia
  - Contador de caracteres

### 📄 Documents (`/documents`)
**Sistema completo de gestão de documentos**

**Funcionalidades:**
- **Lista de Documentos** (5 documentos mock)
  - Receita Médica - Maria Silva Santos (Assinado)
  - Atestado Médico - José Santos (Pendente)
  - Laudo de Exames - Carlos Oliveira (Assinado)
  - Receita Médica - Ana Ferreira (Rascunho)
  - Relatório Médico - Roberto Costa (Assinado)

- **Sistema de Busca e Filtros**
  - Busca por título, paciente ou médico
  - Filtro por tipo (Todos, Receitas, Atestados, Laudos, Relatórios)
  - Ordenação por data, título ou paciente
  - Filtros dinâmicos com resultados em tempo real

- **Card de Documento**
  - Ícone do tipo (💊 🔬 📋 📊)
  - Título, paciente, médico, data
  - Descrição do documento
  - Status visual com cores (Assinado: verde, Pendente: amarelo, Rascunho: cinza)
  - Ações: Ver (👁️), Editar (✏️), Baixar (📥)

- **Estatísticas**
  - Total de documentos: 5
  - Documentos assinados: 3
  - Pendentes: 1
  - Rascunhos: 1

- **Empty State** quando não há documentos filtrados

### ➕ CreateDocument (`/documents/create`)
**Interface completa para criação de documentos**

**Seleção de Tipo:**
- 💊 Receita Médica - Prescrição de medicamentos
- 📋 Atestado Médico - Atestado para afastamento
- 🔬 Laudo Médico - Resultado de exames
- 📊 Relatório Médico - Relatório de consulta
- 🔄 Encaminhamento - Encaminhamento para especialista

**Formulário de Informações:**
- Seleção de paciente (5 pacientes mock)
- Médico responsável (Dr. João Silva)
- Título auto-gerado
- Sistema de prioridades (Baixa 🟢, Normal 🔵, Alta 🟡, Urgente 🔴)

**Templates Automáticos:**
- Templates profissionais para cada tipo
- Auto-população com dados do paciente e médico
- Campos padronizados (CRM, data, etc.)

**Editor de Conteúdo:**
- Textarea com 20 linhas
- Font monospace para melhor legibilidade
- Contador de caracteres e linhas
- Preview mode lado a lado

**Sidebar de Ações:**
- Salvar como rascunho (💾)
- Finalizar documento (📝)
- Enviar para assinatura (✍️)
- Ações rápidas (Ditar, Anexar, IA, Copiar)

### 🧪 Test (`/test`)
**Diagnóstico completo do sistema**

**Status de Serviços:**
- Frontend React (✅ funcionando)
- Backend API (✅ porta 8081)
- Database (✅ PostgreSQL)
- IA Service (✅ OpenAI GPT-4)

**Testes Automatizados:**
1. Teste de Componentes React
2. Teste de Roteamento
3. Teste de API Endpoints
4. Teste de Workspace
5. Teste de Templates
6. Teste de IA Assistente
7. Teste de Performance

**Métricas de Performance:**
- Tempo de carregamento (ms)
- Tempo de renderização (ms)
- Memória do dispositivo
- Taxa de aprovação dos testes

**Informações do Dispositivo:**
- Navegador e User Agent
- Plataforma e idioma
- Resolução de tela e viewport
- Status de cookies e conexão

**Ações Rápidas:**
- Testar Workspace (🏥)
- Testar Documentos (📄)
- Testar Criação (➕)
- Recarregar Página (🔄)

### ⚡ AppSimple (`/app-simple`)
**Página de status do React**
- Confirmação de funcionamento do React
- Versão do React em tempo real
- Timestamp e URL atual
- Links para Workspace e Teste Simples
- Design com gradiente roxo

### 🧪 TestSimple (`/test-simple`)
**Testes básicos de componentes**
- Verificação do React, Vite e estilos
- Botões de teste interativos
- Teste do Tailwind CSS
- Status visual de cada verificação

## 🧭 Sistema de Navegação

### Navigation Component
**Barra superior sticky com:**
- Logo RepoMed IA com gradiente
- Menu horizontal com 5 itens principais
- Estados ativos visuais
- Hover effects e transições
- Status indicator "Sistema Online" com pulse

**Menu Items:**
- 🏠 Home → `/`
- 🏥 Workspace → `/workspace`
- 📄 Documentos → `/documents`
- ➕ Criar → `/documents/create`
- 🧪 Testes → `/test`

### NavigationBreadcrumb Component
**Breadcrumbs dinâmicos baseados na rota:**
- Home
- Home → Workspace
- Home → Documentos
- Home → Documentos → Criar
- Home → Testes

## 🎨 Design System

### Cores Principais
- **Primary Blue**: #3b82f6
- **Success Green**: #10b981
- **Warning Yellow**: #f59e0b
- **Error Red**: #ef4444
- **Gray Scale**: #6b7280, #374151, #1f2937

### Gradientes
- **Brand**: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- **Blue-Green**: linear-gradient(to right, #3b82f6, #10b981)
- **AI Panel**: linear-gradient(to bottom, #dbeafe, #ede9fe)

### Tipografia
- **System Font**: system-ui, sans-serif
- **Monospace**: ui-monospace, "Cascadia Code", monospace
- **Headings**: 600 weight
- **Body**: 14px base

### Iconografia
- Emojis médicos consistentes
- Estados visuais para status
- Ícones de ação contextuais

## 📱 Responsividade

**Breakpoints:**
- Desktop: 1200px max-width
- Tablet: Grid adaptativo
- Mobile: Stack vertical

**Layouts Adaptativos:**
- Grid repeat(auto-fit, minmax())
- Flex layouts com wrap
- Collapsible panels no mobile

## 🔧 Tecnologias

### Core Stack
- **React 18** com Hooks
- **Vite** para desenvolvimento
- **React Router Dom** para navegação
- **Tailwind CSS** para estilos

### Bibliotecas
- **class-variance-authority**: Variantes de componentes
- **clsx**: Conditional classes
- **lucide-react**: Ícones (quando necessário)
- **date-fns**: Manipulação de datas

### Desenvolvimento
- **TypeScript**: Para componentes críticos
- **ESLint**: Linting
- **Hot Reload**: Desenvolvimento rápido

## 🚀 Scripts

```bash
npm run dev        # Servidor desenvolvimento (porta 3010)
npm run build      # Build para produção
npm run preview    # Preview do build
npm run test       # Testes com Vitest
```

## 📂 Estrutura de Arquivos

```
src/
├── components/
│   └── Navigation.jsx         # Sistema de navegação
├── pages/
│   ├── HomePage.jsx           # Página inicial
│   ├── WorkspaceSimple.jsx    # Workspace médico
│   ├── Documents.jsx          # Lista de documentos
│   ├── CreateDocument.jsx     # Criação de documentos
│   ├── Test.jsx               # Testes do sistema
│   ├── TestSimple.jsx         # Testes básicos
│   └── AppSimple.jsx          # Status React
├── App.jsx                    # Roteamento principal
└── main.jsx                   # Entry point
```

## 🌐 Acesso

- **Desenvolvimento**: http://localhost:3010
- **Todas as páginas funcionais** com navegação
- **Hot reload** habilitado
- **Error boundaries** implementadas

---

**Sistema completo e funcional pronto para uso médico profissional** 🚀