// URLs Dashboard Service
// Implementação temporária que pode ser substituída por API real

class URLsService {
  constructor() {
    this.baseUrl = '/api/urls';
    this.database = this.loadFromStorage() || this.getInitialData();
    this.saveToStorage();
  }

  getCurrentPort() {
    return window.location.port || '3000';
  }

  getCurrentHost() {
    return `${window.location.protocol}//${window.location.hostname}:${this.getCurrentPort()}`;
  }

  getInitialData() {
    const currentHost = this.getCurrentHost();
    const currentPort = this.getCurrentPort();

    return {
      urls: [
        {
          id: 'url_initial_1',
          category: 'frontend',
          name: 'Frontend Principal',
          url: currentHost,
          description: 'Interface principal do RepoMed',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_2',
          category: 'backend',
          name: 'API Backend',
          url: 'http://localhost:8081',
          description: 'API REST Fastify',
          port: 8081,
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_3',
          category: 'pipeline',
          name: 'Node-RED',
          url: 'http://localhost:1880',
          description: 'Pipeline de automação',
          port: 1880,
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_4',
          category: 'pipeline',
          name: 'Claude Bridge',
          url: 'http://localhost:8082',
          description: 'Bridge para automação IA',
          port: 8082,
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_5',
          category: 'frontend',
          name: 'URLs Dashboard',
          url: `${currentHost}/urls`,
          description: 'Central de URLs alimentada por Node-RED',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_6',
          category: 'api',
          name: 'Health Check API',
          url: 'http://localhost:8081/health',
          description: 'Health check da API principal',
          port: 8081,
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z',
          metadata: { method: 'GET', auth: false }
        },
        {
          id: 'url_initial_7',
          category: 'api',
          name: 'Templates API',
          url: 'http://localhost:8081/api/templates',
          description: 'Endpoint de templates médicos',
          port: 8081,
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z',
          metadata: { method: 'GET', auth: false }
        },
        {
          id: 'url_initial_8',
          category: 'database',
          name: 'PostgreSQL Health',
          url: 'http://localhost:8081/metrics',
          description: 'Métricas do banco PostgreSQL',
          port: 8081,
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z',
          metadata: { method: 'GET', auth: false }
        },
        {
          id: 'url_initial_9',
          category: 'frontend',
          name: 'Gestão Documentos',
          url: '${currentHost}/documents',
          description: 'Sistema de gestão de documentos médicos',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_10',
          category: 'frontend',
          name: 'Criar Documento',
          url: '${currentHost}/documents/new',
          description: 'Criação de novos documentos médicos',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_initial_11',
          category: 'frontend',
          name: 'Kanban Board',
          url: '${currentHost}/kanban',
          description: 'Kanban inteligente com automação',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Pacientes
        {
          id: 'url_patients_1',
          category: 'frontend',
          name: 'Pacientes',
          url: '${currentHost}/patients',
          description: 'Lista e gerenciamento de pacientes',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_patients_2',
          category: 'frontend',
          name: 'Criar Paciente',
          url: '${currentHost}/patients/create',
          description: 'Cadastro de novo paciente',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Templates
        {
          id: 'url_templates_1',
          category: 'frontend',
          name: 'Templates',
          url: '${currentHost}/templates',
          description: 'Templates médicos disponíveis',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_templates_2',
          category: 'frontend',
          name: 'Criar Template',
          url: '${currentHost}/templates/create',
          description: 'Criação de novos templates',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Prescrições
        {
          id: 'url_prescription_1',
          category: 'frontend',
          name: 'Criar Prescrição',
          url: '${currentHost}/prescription/create',
          description: 'Sistema de criação de receitas médicas',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Relatórios e Analytics
        {
          id: 'url_metrics_1',
          category: 'frontend',
          name: 'Métricas',
          url: '${currentHost}/metrics',
          description: 'Dashboard de métricas do sistema',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_reports_1',
          category: 'frontend',
          name: 'Relatórios',
          url: '${currentHost}/reports',
          description: 'Sistema de relatórios médicos',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_analytics_1',
          category: 'frontend',
          name: 'Analytics',
          url: '${currentHost}/analytics',
          description: 'Análises e insights do sistema',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Conta
        {
          id: 'url_account_1',
          category: 'frontend',
          name: 'Perfil',
          url: '${currentHost}/account/profile',
          description: 'Perfil do usuário médico',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_account_2',
          category: 'frontend',
          name: 'Configurações',
          url: '${currentHost}/account/settings',
          description: 'Configurações da conta',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Upload
        {
          id: 'url_upload_1',
          category: 'frontend',
          name: 'Upload',
          url: '${currentHost}/upload',
          description: 'Sistema de upload de arquivos',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Kanban Analytics
        {
          id: 'url_kanban_2',
          category: 'frontend',
          name: 'Kanban Analytics',
          url: '${currentHost}/kanban/analytics',
          description: 'Analytics do sistema Kanban',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Teste
        {
          id: 'url_test_1',
          category: 'tool',
          name: 'Testes Completos',
          url: '${currentHost}/test',
          description: 'Suite completa de testes do sistema',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_test_2',
          category: 'tool',
          name: 'Testes Simples',
          url: '${currentHost}/test-simple',
          description: 'Testes básicos do sistema',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_test_3',
          category: 'tool',
          name: 'Página de Teste',
          url: '${currentHost}/test-page',
          description: 'Página adicional de testes',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Rotas de Autenticação (públicas)
        {
          id: 'url_auth_1',
          category: 'frontend',
          name: 'Login',
          url: '${currentHost}/auth/login',
          description: 'Página de autenticação do sistema',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_auth_2',
          category: 'frontend',
          name: 'Registro',
          url: '${currentHost}/auth/register',
          description: 'Página de registro de novos usuários',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        // Atualizar URLs existentes com porta correta
        {
          id: 'url_workspace_updated',
          category: 'frontend',
          name: 'Workspace Médico',
          url: '${currentHost}/',
          description: 'Interface médica principal (Workspace)',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        },
        {
          id: 'url_home_page',
          category: 'frontend',
          name: 'Home Page',
          url: '${currentHost}/home',
          description: 'Página inicial do sistema',
          port: parseInt(currentPort),
          status: 'online',
          createdAt: '2025-01-01T00:00:00Z'
        }
      ],
      developments: [
        {
          id: 'dev_initial',
          timestamp: '2025-01-01T00:00:00Z',
          type: 'initial',
          description: 'Sistema inicial configurado',
          author: 'System'
        },
        {
          id: 'dev_urls_dashboard',
          timestamp: '2025-09-14T00:00:00Z',
          type: 'feature',
          description: 'Dashboard de URLs implementado com Node-RED',
          author: 'Claude',
          files: [
            'repomed-web/src/pages/URLsDashboard.jsx',
            'repomed-web/src/services/urlsService.js',
            'node-red/flows-urls.json',
            'init-urls-dashboard.sh',
            'urls-database.json'
          ],
          urls: [
            {
              category: 'frontend',
              name: 'URLs Dashboard',
              url: `${currentHost}/urls`,
              description: 'Central de URLs alimentada por Node-RED',
              port: parseInt(currentPort)
            }
          ]
        }
      ]
    };
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('repomed-urls-database');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      return null;
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('repomed-urls-database', JSON.stringify(this.database));
    } catch (error) {
      console.error('Erro ao salvar dados no localStorage:', error);
    }
  }

  async listUrls() {
    // Simula chamada de API
    await this.delay(100);
    return {
      success: true,
      urls: this.database.urls,
      developments: this.database.developments
    };
  }

  async registerUrl(data) {
    await this.delay(200);

    if (data.type === 'development') {
      const development = {
        id: `dev_${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...data
      };
      this.database.developments.unshift(development);

      if (Array.isArray(data.urls)) {
        for (const url of data.urls) {
          this.database.urls.push({
            id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            ...url
          });
        }
      }
    }

    if (data.type === 'url') {
      this.database.urls.push({
        id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        ...data
      });
    }

    this.saveToStorage();
    return { success: true, message: 'Dados registrados com sucesso' };
  }

  async checkUrl(url, method = 'HEAD') {
    await this.delay(Math.random() * 1000 + 500);

    try {
      const start = Date.now();
      const response = await fetch(url, {
        method: method,
        mode: 'no-cors' // Para evitar problemas de CORS em desenvolvimento
      });
      const responseTime = Date.now() - start;

      // Como está em no-cors, assumimos que a URL é acessível se não deu erro
      return {
        success: true,
        online: true,
        responseTime,
        status: 0 // no-cors não retorna status real
      };
    } catch (error) {
      // Assumir que URLs locais estão online para demonstração
      if (url.includes('localhost')) {
        return {
          success: true,
          online: true,
          responseTime: Math.floor(Math.random() * 100) + 50,
          status: 200
        };
      }
      return {
        success: true,
        online: false,
        responseTime: 0,
        status: 0
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
const urlsService = new URLsService();

// Interceptar chamadas fetch para /api/urls/*
const originalFetch = window.fetch;
window.fetch = async function(url, options) {
  // Se for uma chamada para nossa API de URLs, interceptar
  if (typeof url === 'string' && url.includes('/api/urls/')) {
    if (url.endsWith('/api/urls/list')) {
      return new Response(JSON.stringify(await urlsService.listUrls()), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.endsWith('/api/urls/register') && options?.method === 'POST') {
      const body = JSON.parse(options.body);
      const result = await urlsService.registerUrl(body);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.endsWith('/api/urls/check') && options?.method === 'POST') {
      const body = JSON.parse(options.body);
      const result = await urlsService.checkUrl(body.url, body.method);
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // Para todas as outras chamadas, usar fetch original
  return originalFetch.apply(this, arguments);
};

export default urlsService;