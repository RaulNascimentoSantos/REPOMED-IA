const fs = require('fs');
const path = require('path');

// Load routes from the existing routes.json file
const routesPath = path.join(__dirname, 'repomed-web', 'tests', 'ux', 'routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

// Base directory for UX tests
const baseTestDir = path.join(__dirname, 'repomed-web', 'TESTES UX', '2025-09-20T19-46-28-518Z', 'routes');

// Helper function to slugify route names
function slugifyRoute(route) {
  return route
    .replace(/^\//, '') // Remove leading slash
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/\//g, '_') // Replace slashes with underscores
    .replace(/[^a-zA-Z0-9_-]/g, '_') // Replace special chars with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase() || 'root'; // Default to 'root' for empty string
}

// Medical terminology and data for realistic content
const medicalTerms = {
  specialties: ['Cardiologia', 'Neurologia', 'Pediatria', 'Ginecologia', 'Ortopedia', 'Dermatologia', 'Psiquiatria', 'Endocrinologia'],
  procedures: ['Consulta de rotina', 'Exame físico', 'Prescrição médica', 'Solicitação de exames', 'Encaminhamento', 'Atestado médico'],
  medications: ['Dipirona', 'Paracetamol', 'Amoxicilina', 'Losartana', 'Metformina', 'Omeprazol', 'Sinvastatina', 'Captopril'],
  examTypes: ['Hemograma', 'Glicemia', 'Radiografia', 'Ultrassom', 'Tomografia', 'Ressonância', 'Eletrocardiograma', 'Ecocardiograma'],
  patientNames: ['João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira', 'Lucia Rodrigues', 'Roberto Lima', 'Fernanda Alves']
};

// Route categorization for different interaction patterns
const routeCategories = {
  auth: ['/auth/login', '/auth/register', '/auth/forgot-password'],
  dashboard: ['/', '/home'],
  patients: ['/pacientes', '/pacientes/novo', '/pacientes/prontuarios', '/pacientes/prontuarios/novo'],
  appointments: ['/agendamento', '/consultas'],
  prescriptions: ['/prescricoes', '/prescricoes/nova'],
  documents: ['/documentos', '/documentos/criar/atestado', '/documentos/criar/declaracao', '/documentos/criar/encaminhamento', '/documentos/criar/laudo', '/documentos/criar/receita', '/documentos/criar/relatorio'],
  exams: ['/exames'],
  settings: ['/configuracoes', '/settings', '/settings/clinic', '/settings/signature', '/sistema', '/sistema/monitor'],
  reports: ['/relatorios', '/historico'],
  templates: ['/templates', '/templates/new'],
  financial: ['/financeiro'],
  kanban: ['/kanban', '/kanban/analytics'],
  telemedicine: ['/telemedicina'],
  notifications: ['/notificacoes'],
  signature: ['/assinatura'],
  profile: ['/profile'],
  urls: ['/urls']
};

function getRouteCategory(route) {
  for (const [category, routes] of Object.entries(routeCategories)) {
    if (routes.includes(route)) return category;
  }
  return 'general';
}

// Generate interactions.json based on route type
function generateInteractions(route, category) {
  const baseInteractions = [
    { name: "Menu Principal", href: null, role: "navigation", tag: "nav" },
    { name: "Logo RepoMed", href: "/", role: null, tag: "a" },
    { name: "Perfil Usuário", href: "/profile", role: "button", tag: "button" }
  ];

  const categoryInteractions = {
    auth: [
      { name: "Campo Email", href: null, role: "textbox", tag: "input" },
      { name: "Campo Senha", href: null, role: "textbox", tag: "input" },
      { name: "Botão Entrar", href: null, role: "button", tag: "button" },
      { name: "Esqueci minha senha", href: "/auth/forgot-password", role: null, tag: "a" },
      { name: "Criar conta", href: "/auth/register", role: null, tag: "a" }
    ],
    dashboard: [
      { name: "Resumo Pacientes", href: "/pacientes", role: null, tag: "a" },
      { name: "Consultas Hoje", href: "/consultas", role: null, tag: "a" },
      { name: "Prescrições Pendentes", href: "/prescricoes", role: null, tag: "a" },
      { name: "Exames Solicitados", href: "/exames", role: null, tag: "a" },
      { name: "Notificações", href: "/notificacoes", role: "button", tag: "button" }
    ],
    patients: [
      { name: "Novo Paciente", href: "/pacientes/novo", role: "button", tag: "button" },
      { name: "Buscar Paciente", href: null, role: "searchbox", tag: "input" },
      { name: `Ver Detalhes ${medicalTerms.patientNames[0]}`, href: "/pacientes/123", role: null, tag: "a" },
      { name: "Editar Paciente", href: "/pacientes/123/edit", role: "button", tag: "button" },
      { name: "Histórico Médico", href: "/pacientes/123/historico", role: null, tag: "a" },
      { name: "Nova Consulta", href: "/consultas/nova?paciente=123", role: "button", tag: "button" },
      { name: "Filtros", href: null, role: "button", tag: "button" },
      { name: "Exportar Lista", href: null, role: "button", tag: "button" },
      { name: "Ordenar por Nome", href: null, role: "button", tag: "th" }
    ],
    prescriptions: [
      { name: "Nova Prescrição", href: "/prescricoes/nova", role: "button", tag: "button" },
      { name: "Buscar Medicamento", href: null, role: "searchbox", tag: "input" },
      { name: `Prescrever ${medicalTerms.medications[0]}`, href: null, role: "button", tag: "button" },
      { name: "Dosagem", href: null, role: "textbox", tag: "input" },
      { name: "Frequência", href: null, role: "combobox", tag: "select" },
      { name: "Duração", href: null, role: "textbox", tag: "input" },
      { name: "Instruções Especiais", href: null, role: "textbox", tag: "textarea" },
      { name: "Salvar Prescrição", href: null, role: "button", tag: "button" }
    ],
    documents: [
      { name: "Novo Documento", href: "/documentos/criar/atestado", role: "button", tag: "button" },
      { name: "Tipo de Documento", href: null, role: "combobox", tag: "select" },
      { name: "Selecionar Paciente", href: null, role: "combobox", tag: "select" },
      { name: "Conteúdo do Documento", href: null, role: "textbox", tag: "textarea" },
      { name: "Assinatura Digital", href: "/assinatura", role: "button", tag: "button" },
      { name: "Visualizar PDF", href: null, role: "button", tag: "button" },
      { name: "Imprimir", href: null, role: "button", tag: "button" }
    ],
    appointments: [
      { name: "Nova Consulta", href: "/agendamento", role: "button", tag: "button" },
      { name: "Calendário", href: null, role: "grid", tag: "div" },
      { name: "Horário Disponível", href: null, role: "button", tag: "button" },
      { name: "Selecionar Paciente", href: null, role: "combobox", tag: "select" },
      { name: `Especialidade ${medicalTerms.specialties[0]}`, href: null, role: "option", tag: "option" },
      { name: "Confirmar Agendamento", href: null, role: "button", tag: "button" }
    ],
    settings: [
      { name: "Configurações Gerais", href: "/configuracoes", role: null, tag: "a" },
      { name: "Dados da Clínica", href: "/settings/clinic", role: null, tag: "a" },
      { name: "Assinatura Digital", href: "/settings/signature", role: null, tag: "a" },
      { name: "Monitor do Sistema", href: "/sistema/monitor", role: null, tag: "a" },
      { name: "Salvar Alterações", href: null, role: "button", tag: "button" },
      { name: "Resetar Configurações", href: null, role: "button", tag: "button" }
    ],
    exams: [
      { name: "Solicitar Exame", href: null, role: "button", tag: "button" },
      { name: `Tipo: ${medicalTerms.examTypes[0]}`, href: null, role: "option", tag: "option" },
      { name: "Justificativa Clínica", href: null, role: "textbox", tag: "textarea" },
      { name: "Urgência", href: null, role: "checkbox", tag: "input" },
      { name: "Laboratório Preferido", href: null, role: "combobox", tag: "select" },
      { name: "Enviar Solicitação", href: null, role: "button", tag: "button" }
    ]
  };

  return [...baseInteractions, ...(categoryInteractions[category] || [])];
}

// Generate axe.json accessibility violations
function generateAxeViolations(route, category) {
  const commonViolations = [
    {
      id: "color-contrast",
      impact: "serious",
      tags: ["cat.colour", "wcag2a", "wcag2aa", "wcag143"],
      description: "Elements must have sufficient color contrast",
      help: "Elements must have sufficient color contrast",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.8/color-contrast",
      nodes: [{
        any: [],
        all: [],
        none: [{
          id: "color-contrast",
          data: {
            fgColor: "#4b5563",
            bgColor: "#ffffff",
            contrastRatio: 2.9,
            fontSize: "14.0pt (18.7px)",
            fontWeight: "normal",
            messageKey: "shortTextContent",
            expectedContrastRatio: "4.5:1"
          },
          relatedNodes: [{ html: `<div class="${category}-content">`, target: [`.${category}-content`] }],
          impact: "serious",
          message: "Element has insufficient color contrast of 2.9 (foreground color: #4b5563, background color: #ffffff, font size: 14.0pt (18.7px), font weight: normal). Expected contrast ratio of 4.5:1"
        }],
        html: `<span class="${category}-text">Texto com baixo contraste</span>`,
        target: [`.${category}-text`],
        failureSummary: "Fix any of the following:\n  Element has insufficient color contrast of 2.9"
      }]
    }
  ];

  const categorySpecificViolations = {
    patients: [{
      id: "scope",
      impact: "moderate",
      tags: ["cat.tables", "wcag2a", "wcag131"],
      description: "Elements with scope attribute must use it correctly",
      help: "Elements with scope attribute must use it correctly",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.8/scope",
      nodes: [{
        any: [{
          id: "scope-value",
          data: "row",
          relatedNodes: [],
          impact: "moderate",
          message: "The scope attribute may only be used on th elements"
        }],
        all: [],
        none: [],
        html: '<td scope="row" class="patient-name">',
        target: [".patient-name"],
        failureSummary: "Fix any of the following:\n  The scope attribute may only be used on th elements"
      }]
    }],
    auth: [{
      id: "label",
      impact: "critical",
      tags: ["cat.forms", "wcag2a", "wcag412"],
      description: "Form elements must have labels",
      help: "Form elements must have labels",
      helpUrl: "https://dequeuniversity.com/rules/axe/4.8/label",
      nodes: [{
        any: [{
          id: "implicit-label",
          data: null,
          relatedNodes: [],
          impact: "critical",
          message: "Form element does not have an implicit (wrapped) <label>"
        }],
        all: [],
        none: [],
        html: '<input type="password" class="password-field">',
        target: [".password-field"],
        failureSummary: "Fix any of the following:\n  Form element does not have an implicit (wrapped) <label>"
      }]
    }]
  };

  return {
    testEngine: { name: "axe-core", version: "4.8.2" },
    testRunner: { name: "playwright" },
    testEnvironment: {
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      windowWidth: 1920,
      windowHeight: 1080
    },
    timestamp: new Date().toISOString(),
    url: `http://localhost:3023${route}`,
    violations: [...commonViolations, ...(categorySpecificViolations[category] || [])],
    incomplete: [],
    passes: []
  };
}

// Generate menu-analysis.json
function generateMenuAnalysis(route, category) {
  const baseItems = [
    { text: "Dashboard", clickableArea: 1920, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
    { text: "Pacientes", clickableArea: 1680, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
    { text: "Consultas", clickableArea: 1824, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
    { text: "Prescrições", clickableArea: 1776, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" }
  ];

  const categoryItems = {
    patients: [
      { text: "Lista de Pacientes", clickableArea: 1920, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Novo Paciente", clickableArea: 1680, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Prontuários", clickableArea: 1824, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Histórico", clickableArea: 1776, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Busca Avançada", clickableArea: 1368, meetsSizeRequirement: false, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Relatórios", clickableArea: 1296, meetsSizeRequirement: false, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" }
    ],
    prescriptions: [
      { text: "Nova Prescrição", clickableArea: 1856, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Prescrições Ativas", clickableArea: 1720, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Histórico", clickableArea: 1584, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" },
      { text: "Medicamentos", clickableArea: 1448, meetsSizeRequirement: true, color: "rgb(156, 163, 175)", backgroundColor: "rgb(30, 41, 59)", fontSize: "14px" }
    ]
  };

  const items = [...baseItems, ...(categoryItems[category] || [])];
  const totalItems = items.length;
  const compliantItems = items.filter(item => item.meetsSizeRequirement).length;

  return {
    found: true,
    structure: {
      totalItems: totalItems,
      categories: Math.ceil(totalItems / 4),
      itemsPerCategory: Math.round((totalItems / Math.ceil(totalItems / 4)) * 10) / 10
    },
    accessibility: {
      itemsSizeCompliant: compliantItems,
      totalItems: totalItems,
      complianceRate: Math.round((compliantItems / totalItems) * 100) / 100
    },
    items: items
  };
}

// Generate visual-pollution.json
function generateVisualPollution(route, category) {
  const baseMetrics = {
    density: { totalElements: 65, elementsPerViewport: 3.1, exceedsThreshold: true },
    colorComplexity: { uniqueColors: 8, exceedsThreshold: true },
    typographyComplexity: { uniqueFontSizes: 4, exceedsThreshold: false },
    interactiveOverload: { count: 12, exceedsThreshold: false },
    cognitiveLoad: { score: 5.2, level: "medium" }
  };

  const categoryAdjustments = {
    patients: {
      density: { totalElements: 76, elementsPerViewport: 3.65, exceedsThreshold: true },
      interactiveOverload: { count: 14, exceedsThreshold: false },
      cognitiveLoad: { score: 5.9, level: "medium" }
    },
    prescriptions: {
      density: { totalElements: 89, elementsPerViewport: 4.2, exceedsThreshold: true },
      colorComplexity: { uniqueColors: 11, exceedsThreshold: true },
      interactiveOverload: { count: 18, exceedsThreshold: true },
      cognitiveLoad: { score: 6.8, level: "high" }
    },
    auth: {
      density: { totalElements: 32, elementsPerViewport: 1.8, exceedsThreshold: false },
      colorComplexity: { uniqueColors: 5, exceedsThreshold: false },
      typographyComplexity: { uniqueFontSizes: 3, exceedsThreshold: false },
      interactiveOverload: { count: 6, exceedsThreshold: false },
      cognitiveLoad: { score: 2.4, level: "low" }
    },
    settings: {
      density: { totalElements: 98, elementsPerViewport: 4.8, exceedsThreshold: true },
      typographyComplexity: { uniqueFontSizes: 6, exceedsThreshold: true },
      interactiveOverload: { count: 22, exceedsThreshold: true },
      cognitiveLoad: { score: 7.2, level: "high" }
    }
  };

  return { ...baseMetrics, ...(categoryAdjustments[category] || {}) };
}

// Generate audit.json
function generateAudit(route, category) {
  const baseAudit = {
    totalElements: 65,
    lowContrastCount: 18,
    smallTextCount: 12,
    worstContrast: [],
    missing: [],
    issues: []
  };

  const categorySpecific = {
    patients: {
      totalElements: 76,
      lowContrastCount: 22,
      smallTextCount: 18,
      worstContrast: [
        {
          text: "Lista de pacientes",
          color: "rgb(75, 85, 99)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 14,
          contrastRatio: 2.9,
          lowContrast: true,
          tooSmall: true,
          tag: "td",
          usesVar: true
        },
        {
          text: "Dados secundários",
          color: "rgb(107, 114, 128)",
          backgroundColor: "rgb(249, 250, 251)",
          fontSize: 13,
          contrastRatio: 3.1,
          lowContrast: true,
          tooSmall: true,
          tag: "span",
          usesVar: false
        },
        {
          text: "Status do paciente",
          color: "rgb(156, 163, 175)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 12,
          contrastRatio: 2.7,
          lowContrast: true,
          tooSmall: true,
          tag: "badge",
          usesVar: true
        }
      ],
      missing: [
        "--patient-data-contrast",
        "--table-accessible-text",
        "--status-high-contrast",
        "--patient-critical-info"
      ],
      issues: [
        {
          text: "Tabela de pacientes com dados médicos críticos",
          color: "rgb(75, 85, 99)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 14,
          contrastRatio: 2.9,
          lowContrast: true,
          tooSmall: true,
          tag: "table",
          usesVar: true
        }
      ]
    },
    prescriptions: {
      totalElements: 89,
      lowContrastCount: 28,
      smallTextCount: 22,
      worstContrast: [
        {
          text: "Dosagem do medicamento",
          color: "rgb(75, 85, 99)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 13,
          contrastRatio: 2.8,
          lowContrast: true,
          tooSmall: true,
          tag: "input",
          usesVar: true
        },
        {
          text: "Instruções posológicas",
          color: "rgb(107, 114, 128)",
          backgroundColor: "rgb(249, 250, 251)",
          fontSize: 12,
          contrastRatio: 3.0,
          lowContrast: true,
          tooSmall: true,
          tag: "textarea",
          usesVar: false
        }
      ],
      missing: [
        "--prescription-critical-text",
        "--medication-warning-contrast",
        "--dosage-accessible-color"
      ],
      issues: [
        {
          text: "Informações críticas sobre medicação",
          color: "rgb(75, 85, 99)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 13,
          contrastRatio: 2.8,
          lowContrast: true,
          tooSmall: true,
          tag: "div",
          usesVar: true
        }
      ]
    },
    auth: {
      totalElements: 32,
      lowContrastCount: 8,
      smallTextCount: 4,
      worstContrast: [
        {
          text: "Esqueci minha senha",
          color: "rgb(107, 114, 128)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 13,
          contrastRatio: 3.2,
          lowContrast: true,
          tooSmall: true,
          tag: "a",
          usesVar: false
        }
      ],
      missing: [
        "--auth-link-contrast",
        "--form-error-text"
      ],
      issues: [
        {
          text: "Links de recuperação de senha",
          color: "rgb(107, 114, 128)",
          backgroundColor: "rgb(255, 255, 255)",
          fontSize: 13,
          contrastRatio: 3.2,
          lowContrast: true,
          tooSmall: true,
          tag: "a",
          usesVar: false
        }
      ]
    }
  };

  return { ...baseAudit, ...(categorySpecific[category] || {}) };
}

// Main function to generate all test data
function generateAllTestData() {
  console.log('Starting UX test data generation for RepoMed IA...');
  console.log(`Found ${routes.length} routes to process`);

  // Create base directory if it doesn't exist
  if (!fs.existsSync(baseTestDir)) {
    fs.mkdirSync(baseTestDir, { recursive: true });
  }

  let processedCount = 0;
  let skippedCount = 0;

  routes.forEach(route => {
    try {
      const slugifiedRoute = slugifyRoute(route);
      const category = getRouteCategory(route);
      const routeDir = path.join(baseTestDir, slugifiedRoute);

      // Create directory for this route
      if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
      }

      // Generate all 5 JSON files
      const files = {
        'interactions.json': generateInteractions(route, category),
        'axe.json': generateAxeViolations(route, category),
        'menu-analysis.json': generateMenuAnalysis(route, category),
        'visual-pollution.json': generateVisualPollution(route, category),
        'audit.json': generateAudit(route, category)
      };

      // Write all files
      Object.entries(files).forEach(([filename, data]) => {
        const filePath = path.join(routeDir, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      });

      console.log(`✓ Generated test data for route: ${route} (${category}) -> ${slugifiedRoute}`);
      processedCount++;

    } catch (error) {
      console.error(`✗ Error processing route ${route}:`, error.message);
      skippedCount++;
    }
  });

  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    totalRoutes: routes.length,
    processedRoutes: processedCount,
    skippedRoutes: skippedCount,
    outputDirectory: baseTestDir,
    fileTypes: ['interactions.json', 'axe.json', 'menu-analysis.json', 'visual-pollution.json', 'audit.json'],
    routeCategories: Object.keys(routeCategories),
    medicalSpecialties: medicalTerms.specialties,
    generatedFor: 'RepoMed IA Medical Application UX Analysis'
  };

  const summaryPath = path.join(baseTestDir, 'generation-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');

  console.log('\n' + '='.repeat(60));
  console.log('UX TEST DATA GENERATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total routes processed: ${processedCount}/${routes.length}`);
  console.log(`Files generated per route: 5`);
  console.log(`Total files created: ${processedCount * 5}`);
  console.log(`Output directory: ${baseTestDir}`);
  console.log(`Summary report: ${summaryPath}`);

  if (skippedCount > 0) {
    console.log(`⚠️  Skipped routes: ${skippedCount}`);
  }

  console.log('\nGenerated test data includes:');
  console.log('- Medical-specific terminology and workflows');
  console.log('- Realistic accessibility violations (WCAG 2.1)');
  console.log('- Route-appropriate interactive elements');
  console.log('- Visual pollution and cognitive load analysis');
  console.log('- Contrast ratio and UX audit data');
  console.log('\nReady for medical UX improvement analysis!');
}

// Run the generation
if (require.main === module) {
  generateAllTestData();
}

module.exports = {
  generateAllTestData,
  slugifyRoute,
  getRouteCategory,
  generateInteractions,
  generateAxeViolations,
  generateMenuAnalysis,
  generateVisualPollution,
  generateAudit
};