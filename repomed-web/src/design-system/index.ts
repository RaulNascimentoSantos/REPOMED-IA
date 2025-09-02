// Design tokens inspirados em aplicativos médicos modernos
export const tokens = {
  colors: {
    // Paleta médica profissional (OKLCH para consistência)
    primary: {
      50: 'oklch(97% 0.02 240)',  // Azul médico suave
      100: 'oklch(94% 0.04 240)',
      200: 'oklch(88% 0.08 240)',
      300: 'oklch(79% 0.14 240)',
      400: 'oklch(67% 0.20 240)',
      500: 'oklch(55% 0.22 240)',  // Primary main
      600: 'oklch(47% 0.20 240)',
      700: 'oklch(40% 0.18 240)',
      800: 'oklch(33% 0.15 240)',
      900: 'oklch(27% 0.12 240)',
    },
    semantic: {
      success: 'oklch(67% 0.20 145)',  // Verde médico
      warning: 'oklch(75% 0.15 60)',   // Amarelo alerta
      error: 'oklch(60% 0.25 25)',     // Vermelho vital
      info: 'oklch(65% 0.15 220)',     // Azul informação
    },
    clinical: {
      urgent: 'oklch(55% 0.28 15)',    // Vermelho urgência
      routine: 'oklch(70% 0.18 145)',  // Verde rotina
      priority: 'oklch(65% 0.22 45)',  // Laranja prioridade
    },
    neutral: {
      0: 'oklch(100% 0 0)',    // Branco puro
      50: 'oklch(98% 0 0)',
      100: 'oklch(96% 0 0)',
      200: 'oklch(91% 0 0)',
      300: 'oklch(84% 0 0)',
      400: 'oklch(64% 0 0)',
      500: 'oklch(50% 0 0)',
      600: 'oklch(37% 0 0)',
      700: 'oklch(27% 0 0)',
      800: 'oklch(18% 0 0)',
      900: 'oklch(10% 0 0)',
      1000: 'oklch(0% 0 0)',   // Preto puro
    }
  },
  
  typography: {
    fontFamily: {
      sans: 'Inter var, SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
      mono: 'JetBrains Mono, SF Mono, Consolas, monospace',
      medical: 'IBM Plex Sans, Roboto, sans-serif'
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
    }
  },
  
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    base: '0.5rem',   // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.5rem',     // 24px
    full: '9999px',
  },
  
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    md: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    lg: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    clinical: '0 0 0 3px oklch(55% 0.22 240 / 0.1)',
  },
  
  animation: {
    duration: {
      instant: '50ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    }
  }
};