# RepoMed IA - Suite de Testes

Esta documentação descreve a estratégia de testes implementada no RepoMed IA, cobrindo testes unitários, integração, end-to-end e de performance.

## 🏗️ Arquitetura de Testes

### 1. Testes Unitários
- **Backend** (`repomed-api/tests/unit/`): Testam funções isoladas e componentes individuais
- **Frontend** (`repomed-web/tests/unit/`): Testam componentes React e hooks
- **Framework**: Vitest com ambiente Node.js/jsdom
- **Cobertura**: Mínimo 70% em todas as métricas

### 2. Testes de Integração
- **Localização**: `repomed-api/tests/integration/`
- **Escopo**: APIs completas, fluxos de dados, integrações com banco/cache
- **Framework**: Vitest + Fastify testing

### 3. Testes de Contrato
- **Localização**: `tests/contracts/`
- **Escopo**: Validação de schemas Zod, consistência de APIs
- **Framework**: Vitest

### 4. Testes End-to-End
- **Localização**: `tests/e2e/`
- **Escopo**: Fluxos completos de usuário, interface + backend
- **Framework**: Playwright

### 5. Testes de Performance
- **Localização**: `tests/load/`
- **Escopo**: Teste de carga, latência, throughput
- **Framework**: Autocannon

## 🚀 Executando os Testes

### Comandos Principais

```bash
# Executar toda a suite de testes
npm run test:all

# Testes unitários apenas
npm run test:unit

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Testes específicos por tipo
npm run test:api      # Backend unit tests
npm run test:web      # Frontend unit tests  
npm run test:e2e      # End-to-end tests
npm run test:load     # Performance tests
npm run test:contracts # Contract tests
```

### Pré-requisitos

#### Para Testes Unitários e Contratos
- Node.js 18+
- Dependencies instaladas: `npm install`

#### Para Testes de Integração
- Banco PostgreSQL rodando
- Redis rodando (opcional, fallback para in-memory)
- Variáveis de ambiente configuradas (ver `.env.example`)

#### Para Testes E2E
- API rodando em `http://localhost:8082`
- Frontend rodando em `http://localhost:3002`
- Navegadores instalados: `npx playwright install`

#### Para Testes de Carga
- API rodando e acessível
- Usuário de teste criado automaticamente

## 📊 Critérios de Qualidade

### Performance Mínima (API)
- **RPS**: > 100 requests/segundo
- **Latência**: < 200ms média
- **P95**: < 500ms
- **Taxa de Erro**: 0%

### Cobertura de Código
- **Mínimo**: 70% em todas as métricas
- **Meta**: 85% lines, 80% branches
- **Exclusões**: Tipos, mocks, arquivos de configuração

### Critérios de Aprovação
- ✅ Taxa de sucesso > 80%
- ✅ Zero falhas críticas
- ✅ Tempo total < 10 minutos
- ✅ Build bem-sucedido
- ✅ Critérios de performance atendidos

## 🛠️ Configuração

### Vitest (Unitários/Contratos)
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // ou 'jsdom' para frontend
    coverage: {
      thresholds: {
        global: { branches: 70, functions: 70, lines: 70, statements: 70 }
      }
    }
  }
})
```

### Playwright (E2E)
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry'
  }
})
```

## 📁 Estrutura de Arquivos

```
tests/
├── contracts/           # Testes de contrato Zod
│   └── api-contracts.test.ts
├── e2e/                # Testes end-to-end
│   ├── repomed.spec.ts
│   └── frontend-integration.spec.ts
├── load/               # Testes de performance
│   └── smoke.js
└── README.md

repomed-api/tests/
├── unit/               # Testes unitários backend
│   ├── hash.test.ts
│   ├── validation.test.ts
│   └── cache.test.ts
├── integration/        # Testes de integração
│   └── documents.test.ts
└── setup.ts

repomed-web/tests/
├── unit/               # Testes unitários frontend
│   ├── LoadingSpinner.test.tsx
│   └── useApi.test.tsx
└── setup.ts
```

## 🔧 Mocks e Utilities

### Backend Testing Utils
```typescript
// tests/setup.ts
export const createTestContext = () => ({
  headers: { 'Authorization': 'Bearer test-token' }
})

export const createMockUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com'
})
```

### Frontend Testing Utils
```typescript
// tests/setup.ts
export const createTestWrapper = ({ queryClient }) => {
  const TestWrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
  return TestWrapper
}
```

## 📈 Métricas e Relatórios

### Localização dos Resultados
- **Unit Tests**: `./test-results/`
- **Coverage**: `./coverage/`
- **E2E Reports**: `./test-results/` (Playwright HTML report)
- **Load Test Results**: Console + JSON export
- **Consolidated Report**: `./test-results/test-report.json`

### CI/CD Integration
```yaml
# .github/workflows/tests.yml
- name: Run Tests
  run: |
    npm run test:all
    
- name: Upload Coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## 🐛 Debugging

### Testes Unitários
```bash
# Executar teste específico
npx vitest run tests/unit/hash.test.ts

# Debug mode
npx vitest --inspect-brk tests/unit/hash.test.ts
```

### Testes E2E
```bash
# Modo headed (ver o navegador)
npx playwright test --headed

# Debug específico
npx playwright test --debug tests/e2e/repomed.spec.ts
```

### Testes de Carga
```bash
# Com mais detalhes
API_URL=http://localhost:8082 LOAD_TEST_DURATION=60s npm run test:load

# Custom connections
LOAD_TEST_CONNECTIONS=20 npm run test:load
```

## 📝 Convenções

### Naming
- **Unit Tests**: `ComponentName.test.ts/tsx`
- **Integration**: `feature.integration.test.ts`
- **E2E**: `feature.spec.ts`
- **Load**: `scenario.js`

### Structure
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Arrange
      const input = createTestInput()
      
      // Act  
      const result = methodUnderTest(input)
      
      // Assert
      expect(result).toBe(expected)
    })
  })
})
```

### Mock Strategy
- **Unit**: Mock external dependencies
- **Integration**: Use real services with test database
- **E2E**: Use real services, minimal mocking

## 🚨 Troubleshooting

### Problemas Comuns

1. **Tests timeout**: Verificar se serviços estão rodando
2. **Coverage baixa**: Adicionar mais casos de teste
3. **E2E instável**: Adicionar waits apropriados
4. **Load tests falham**: Verificar recursos do sistema

### Logs úteis
```bash
# Ver logs detalhados do Vitest
DEBUG=vitest* npm run test:unit

# Logs do Playwright
DEBUG=pw:api npm run test:e2e

# Logs de performance
DEBUG=autocannon npm run test:load
```

## 🎯 Best Practices

1. **Testes devem ser**: Rápidos, Isolados, Repetíveis, Auto-validáveis
2. **Usar** Given-When-Then ou Arrange-Act-Assert
3. **Mock** apenas o necessário
4. **Asserts** específicos e claros
5. **Cleanup** após cada teste
6. **Documentar** cenários complexos

---

Para mais detalhes sobre estratégias específicas de teste, consulte a documentação de cada framework utilizado.