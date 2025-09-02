# RepoMed IA - Sistema Médico com Assinatura Digital

RepoMed IA é um sistema médico moderno e completo que oferece funcionalidades avançadas para gestão de documentos médicos, prescrições, pacientes e assinatura digital. Desenvolvido com tecnologias modernas e interface inspirada no Memed.

## 🚀 Funcionalidades

### ✅ **Implementado**
- **🏥 Gestão de Pacientes** - Lista completa com avatars coloridos e busca
- **📋 Criação de Prescrições** - Interface moderna com duas colunas e sidebar
- **📊 Dashboard de Métricas** - KPIs, gráficos e estatísticas do sistema  
- **🔐 Autenticação de Usuários** - Sistema de registro e login
- **✍️ Assinatura Digital** - Toggle funcional e verificação de documentos
- **📱 Interface Responsiva** - Design Memed-style moderno e responsivo

### 🔄 **Em Desenvolvimento**
- **📄 Templates Médicos** - Biblioteca de modelos pré-configurados
- **📁 Gestão de Documentos** - Upload, visualização e compartilhamento
- **🔍 Sistema de Verificação** - Validação por hash e QR codes
- **👥 Gestão de Usuários** - Perfis, permissões e configurações

## 🛠️ Tecnologias

### **Frontend**
- **React 18** - Interface moderna e reativa
- **Vite** - Build tool rápido e eficiente
- **React Router** - Navegação SPA
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones modernos
- **CSS Variables** - Sistema de design consistente

### **Backend**
- **Node.js** - Runtime JavaScript
- **Fastify** - Framework web rápido e leve
- **Fastify Static** - Servir arquivos estáticos
- **CORS** - Política de origem cruzada

## 🎨 Design System

Interface inspirada no **Memed** com:
- **Cores**: Paleta profissional azul (#6366f1)
- **Tipografia**: Clean e legível
- **Componentes**: Cards, buttons, forms modernos
- **Layout**: Grid responsivo e flexível
- **Animações**: Transições suaves e hover effects

## 📂 Estrutura do Projeto

```
RepoMed IA/
├── repomed-web/          # Frontend React + Vite
│   ├── src/
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── pages/        # Páginas da aplicação
│   │   ├── styles/       # CSS global e variáveis
│   │   └── lib/          # Utilitários e APIs
│   └── package.json
├── repomed-api/          # Backend API Node.js
│   ├── src/
│   │   ├── routes/       # Rotas da API
│   │   ├── plugins/      # Plugins Fastify
│   │   └── server.js     # Servidor principal
│   └── package.json
├── DOCUMENTACAO OFICIAL/ # Documentação do projeto
└── README.md
```

## 🚀 Como Executar

### **1. Clone o repositório**
```bash
git clone https://github.com/[seu-usuario]/repomed-ia.git
cd repomed-ia
```

### **2. Configure o Backend**
```bash
cd repomed-api
npm install
npm run dev
# API rodará em http://localhost:8082
```

### **3. Configure o Frontend**
```bash
cd repomed-web  
npm install
npm run dev
# Interface rodará em http://localhost:3013 (ou próxima porta disponível)
```

### **4. Acesse o Sistema**
- **Frontend**: `http://localhost:3013`
- **API**: `http://localhost:8082`

## 📱 Páginas Disponíveis

| Rota | Descrição | Status |
|------|-----------|--------|
| `/` | Página inicial | ✅ |
| `/patients` | Lista de pacientes | ✅ |
| `/prescription/create` | Criar prescrição | ✅ |
| `/metrics` | Dashboard métricas | ✅ |
| `/auth/register` | Cadastro usuário | ✅ |
| `/auth/login` | Login usuário | 🔄 |
| `/templates` | Templates médicos | 🔄 |
| `/documents` | Documentos | 🔄 |

## 🎯 Roadmap

- [ ] **Sistema de Templates** - Biblioteca completa de modelos médicos
- [ ] **Upload de Documentos** - Drag & drop e preview
- [ ] **Verificação por QR Code** - Geração e leitura
- [ ] **Relatórios Avançados** - Exportação PDF/Excel
- [ ] **API REST Completa** - CRUD para todas entidades
- [ ] **Sistema de Notificações** - Alertas e lembretes
- [ ] **Mobile App** - Aplicativo nativo React Native
- [ ] **Integração CFM/ANVISA** - Validações regulamentares

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Clone** sua fork
3. **Crie** uma branch para sua feature
4. **Commit** suas mudanças
5. **Push** para sua branch
6. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🏥 Sobre o RepoMed

RepoMed IA é um sistema médico completo que visa modernizar e digitalizar processos médicos, oferecendo:

- **Segurança** - Assinatura digital e verificação de documentos
- **Eficiência** - Interface intuitiva e workflows otimizados  
- **Conformidade** - Aderência às normas CFM e ANVISA
- **Escalabilidade** - Arquitetura moderna e performática

---

**Desenvolvido com ❤️ para revolucionar a área médica**
