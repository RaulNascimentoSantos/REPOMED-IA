export const BASE_URL = process.env.BASE_URL || "http://localhost:3023";
export const SAFE_WRITE = process.env.SAFE_WRITE === "1";
export const MAX_DEPTH = Number(process.env.MAX_DEPTH || "3");
export const THEME = process.env.THEME || "medical";
export const OUT_DIR = process.env.UX_OUT_DIR || "TESTES UX";

// Configurações expandidas para poluição visual
export const VISUAL_POLLUTION_THRESHOLD = {
  maxElementsPerScreen: 50,
  maxColorVariations: 8,
  maxFontSizes: 4,
  maxInteractiveElements: 15,
  maxTextDensity: 0.7, // 70% da tela ocupada por texto
  minContrastRatio: 4.5,
  aaaContrastRatio: 7.0,
  minFontSize: 16
};

// Configurações específicas para ambiente médico
export const MEDICAL_UX_CONFIG = {
  criticalRoutes: ["/", "/prescricoes", "/prescricoes/nova", "/pacientes", "/documentos"],
  menuAnalysis: {
    maxItemsPerLevel: 12,
    minClickableArea: 44, // pixels
    requiredStates: ["default", "hover", "active", "focus", "disabled"]
  },
  accessibilityLevel: "AAA", // WCAG 2.1 AAA para ambiente médico
  performanceThresholds: {
    lcp: 2.5, // Largest Contentful Paint
    fid: 100, // First Input Delay
    cls: 0.1   // Cumulative Layout Shift
  }
};

// Configurações para análise de densidade visual
export const DENSITY_ANALYSIS = {
  viewportSizes: [
    { width: 1920, height: 1080, name: "desktop-xl" },
    { width: 1440, height: 900, name: "desktop-standard" },
    { width: 1024, height: 768, name: "tablet" }
  ],
  cognitiveLoadMetrics: {
    maxElementsVisible: 7, // Miller's rule
    maxDecisionPoints: 3,
    maxColorComplexity: 5
  }
};