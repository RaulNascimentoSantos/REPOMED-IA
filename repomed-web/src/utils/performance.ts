/**
 * RepoMed IA v6.0 - Performance Monitoring & Optimization
 *
 * Sistema de monitoramento e otimização de performance para aplicações médicas:
 * - Métricas Core Web Vitals específicas para medicina
 * - Monitoramento de componentes críticos médicos
 * - Otimização automática baseada em contexto clínico
 * - Alertas de performance que podem afetar atendimento
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: string;
  critical?: boolean;
}

interface MedicalPerformanceThresholds {
  criticalActionTime: number;    // Tempo máximo para ações críticas (prescrições, etc)
  formResponseTime: number;      // Tempo máximo de resposta de formulários
  navigationTime: number;        // Tempo máximo de navegação entre páginas
  autoSaveTime: number;         // Tempo máximo para auto-save
  searchTime: number;           // Tempo máximo para busca de pacientes/medicamentos
}

class MedicalPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private thresholds: MedicalPerformanceThresholds = {
    criticalActionTime: 2000,    // 2s para ações críticas
    formResponseTime: 1000,      // 1s para resposta de formulários
    navigationTime: 1500,        // 1.5s para navegação
    autoSaveTime: 500,          // 500ms para auto-save
    searchTime: 800             // 800ms para busca
  };

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    if (typeof window === 'undefined') return;

    // Monitor Core Web Vitals
    this.observeWebVitals();

    // Monitor Long Tasks
    this.observeLongTasks();

    // Monitor Navigation
    this.observeNavigation();

    // Monitor Resource Loading
    this.observeResources();
  }

  private observeWebVitals() {
    try {
      // First Input Delay (FID)
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric({
              name: 'first-input-delay',
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              critical: entry.processingStart - entry.startTime > 100
            });
          }
        });

        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      }

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.recordMetric({
          name: 'largest-contentful-paint',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          critical: lastEntry.startTime > 2500
        });
      });

      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(lcpObserver);

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }

        this.recordMetric({
          name: 'cumulative-layout-shift',
          value: clsValue,
          timestamp: Date.now(),
          critical: clsValue > 0.1
        });
      });

      clsObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(clsObserver);

    } catch (error) {
      console.warn('[Performance] Erro ao configurar Web Vitals:', error);
    }
  }

  private observeLongTasks() {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            name: 'long-task',
            value: entry.duration,
            timestamp: Date.now(),
            context: 'main-thread-blocking',
            critical: entry.duration > 100 // Tasks > 100ms são críticas
          });

          // Log warning para tasks muito longas que podem afetar UX médica
          if (entry.duration > 200) {
            console.warn(`[Performance] Long task detectada: ${entry.duration}ms - pode afetar responsividade médica`);
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
      this.observers.push(longTaskObserver);
    } catch (error) {
      console.warn('[Performance] Long task monitoring não suportado:', error);
    }
  }

  private observeNavigation() {
    try {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const navigationEntry = entry as PerformanceNavigationTiming;

          // Tempo total de carregamento
          const loadTime = navigationEntry.loadEventEnd - navigationEntry.navigationStart;

          this.recordMetric({
            name: 'navigation-load-time',
            value: loadTime,
            timestamp: Date.now(),
            context: window.location.pathname,
            critical: loadTime > this.thresholds.navigationTime
          });

          // Time to Interactive aproximado
          const tti = navigationEntry.domInteractive - navigationEntry.navigationStart;

          this.recordMetric({
            name: 'time-to-interactive',
            value: tti,
            timestamp: Date.now(),
            context: window.location.pathname,
            critical: tti > 3000
          });
        }
      });

      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);
    } catch (error) {
      console.warn('[Performance] Navigation monitoring não suportado:', error);
    }
  }

  private observeResources() {
    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;

          // Monitorar recursos críticos (CSS, JS, imagens importantes)
          if (this.isCriticalResource(resourceEntry.name)) {
            const loadTime = resourceEntry.responseEnd - resourceEntry.startTime;

            this.recordMetric({
              name: 'critical-resource-load',
              value: loadTime,
              timestamp: Date.now(),
              context: resourceEntry.name,
              critical: loadTime > 1000
            });
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);
    } catch (error) {
      console.warn('[Performance] Resource monitoring não suportado:', error);
    }
  }

  private isCriticalResource(url: string): boolean {
    const criticalPatterns = [
      '/clinical-theme.css',
      '/globals.css',
      '/main-layout',
      '/medical-notification',
      '/prescription',
      '/patient'
    ];

    return criticalPatterns.some(pattern => url.includes(pattern));
  }

  // Método público para registrar métricas customizadas
  public recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Limitar histórico de métricas
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Log métricas críticas
    if (metric.critical) {
      console.warn(`[Performance] Métrica crítica: ${metric.name} = ${metric.value}ms`, metric);
    }

    // Enviar para analytics se configurado
    this.sendToAnalytics(metric);
  }

  // Métricas específicas para medicina
  public measureMedicalAction(actionName: string, startTime: number) {
    const duration = performance.now() - startTime;
    const isCritical = this.isCriticalMedicalAction(actionName);

    this.recordMetric({
      name: `medical-action-${actionName}`,
      value: duration,
      timestamp: Date.now(),
      context: 'medical-workflow',
      critical: isCritical && duration > this.thresholds.criticalActionTime
    });

    return duration;
  }

  private isCriticalMedicalAction(action: string): boolean {
    const criticalActions = [
      'prescription-save',
      'patient-search',
      'drug-interaction-check',
      'medical-form-submit',
      'emergency-alert',
      'critical-notification'
    ];

    return criticalActions.some(critical => action.includes(critical));
  }

  // Otimizações automáticas
  public optimizePerformance() {
    const recentMetrics = this.metrics.filter(m =>
      Date.now() - m.timestamp < 60000 // Últimos 60 segundos
    );

    // Detectar padrões de performance ruim
    const slowActions = recentMetrics.filter(m =>
      m.critical && m.name.includes('medical-action')
    );

    if (slowActions.length > 3) {
      console.warn('[Performance] Múltiplas ações médicas lentas detectadas. Aplicando otimizações...');
      this.applyEmergencyOptimizations();
    }

    // Otimizar baseado em Core Web Vitals
    const recentLCP = recentMetrics.find(m => m.name === 'largest-contentful-paint');
    if (recentLCP && recentLCP.value > 4000) {
      console.warn('[Performance] LCP alto detectado. Otimizando carregamento...');
      this.optimizeResourceLoading();
    }
  }

  private applyEmergencyOptimizations() {
    // Reduzir animações para melhorar performance
    document.documentElement.style.setProperty('--animation-duration', '0.1s');

    // Priorizar carregamento de componentes críticos
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Executar tarefas não críticas quando possível
        this.cleanupMetrics();
      });
    }

    // Notificar sobre otimizações ativas
    console.log('[Performance] Modo de otimização de emergência ativado');
  }

  private optimizeResourceLoading() {
    // Implementar lazy loading mais agressivo
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      img.setAttribute('loading', 'lazy');
    });

    // Priorizar recursos críticos
    const criticalLinks = document.querySelectorAll('link[rel="stylesheet"]');
    criticalLinks.forEach(link => {
      if (!link.hasAttribute('media')) {
        link.setAttribute('media', 'print');
        link.setAttribute('onload', "this.media='all'");
      }
    });
  }

  private sendToAnalytics(metric: PerformanceMetric) {
    // Em produção, enviar para serviço de analytics
    if (process.env.NODE_ENV === 'production' && metric.critical) {
      // Implementar envio para analytics
      console.log('[Performance] Enviando métrica crítica para analytics:', metric);
    }
  }

  private cleanupMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  // Obter relatório de performance
  public getPerformanceReport() {
    const recent = this.metrics.filter(m =>
      Date.now() - m.timestamp < 300000 // Últimos 5 minutos
    );

    const critical = recent.filter(m => m.critical);
    const avgTimes = this.calculateAverageTimes(recent);

    return {
      totalMetrics: recent.length,
      criticalIssues: critical.length,
      averageTimes: avgTimes,
      recommendations: this.generateRecommendations(recent)
    };
  }

  private calculateAverageTimes(metrics: PerformanceMetric[]) {
    const groups = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) acc[metric.name] = [];
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as Record<string, number[]>);

    return Object.entries(groups).reduce((acc, [name, values]) => {
      acc[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as Record<string, number>);
  }

  private generateRecommendations(metrics: PerformanceMetric[]): string[] {
    const recommendations: string[] = [];

    const longTasks = metrics.filter(m => m.name === 'long-task');
    if (longTasks.length > 2) {
      recommendations.push('Considere otimizar código JavaScript para reduzir long tasks');
    }

    const slowForms = metrics.filter(m =>
      m.name.includes('medical-action') && m.value > this.thresholds.formResponseTime
    );
    if (slowForms.length > 0) {
      recommendations.push('Formulários médicos estão respondendo lentamente - considere otimização');
    }

    const cls = metrics.find(m => m.name === 'cumulative-layout-shift');
    if (cls && cls.value > 0.1) {
      recommendations.push('Layout shifts detectados - verifique dimensões de imagens e elementos');
    }

    return recommendations;
  }

  // Cleanup
  public destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Instância global do monitor
let performanceMonitor: MedicalPerformanceMonitor | null = null;

export function initializePerformanceMonitoring() {
  if (typeof window !== 'undefined' && !performanceMonitor) {
    performanceMonitor = new MedicalPerformanceMonitor();

    // DESABILITADO: Executar otimizações periodicamente
    // setInterval(() => {
    //   performanceMonitor?.optimizePerformance();
    // }, 30000); // A cada 30 segundos

    console.log('[Performance] Sistema de monitoramento médico inicializado');
  }

  return performanceMonitor;
}

export function measureMedicalAction(actionName: string) {
  const startTime = performance.now();

  return {
    end: () => {
      if (performanceMonitor) {
        return performanceMonitor.measureMedicalAction(actionName, startTime);
      }
      return performance.now() - startTime;
    }
  };
}

export function getPerformanceReport() {
  return performanceMonitor?.getPerformanceReport() || null;
}

export function recordCustomMetric(name: string, value: number, context?: string, critical?: boolean) {
  if (performanceMonitor) {
    performanceMonitor.recordMetric({
      name,
      value,
      timestamp: Date.now(),
      context,
      critical
    });
  }
}