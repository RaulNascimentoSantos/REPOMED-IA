// CORREÇÃO CRÍTICA 6: UI/UX 2025 MEDICAL-GRADE
// Data: 31/08/2025 - Prioridade: P0
// DESIGN TOKENS 2025 COM OKLCH

export const tokens = {
  colors: {
    // Escala de cores OKLCH para precisão
    primary: {
      50: 'oklch(97% 0.02 237)',
      100: 'oklch(94% 0.05 237)',
      200: 'oklch(88% 0.08 237)',
      300: 'oklch(80% 0.11 237)',
      400: 'oklch(70% 0.13 237)',
      500: 'oklch(59% 0.15 237)', // Base
      600: 'oklch(50% 0.16 237)',
      700: 'oklch(42% 0.15 237)',
      800: 'oklch(35% 0.13 237)',
      900: 'oklch(28% 0.10 237)',
      950: 'oklch(20% 0.08 237)'
    },
    success: {
      50: 'oklch(96% 0.03 145)',
      100: 'oklch(92% 0.05 145)',
      200: 'oklch(85% 0.08 145)',
      300: 'oklch(77% 0.11 145)',
      400: 'oklch(68% 0.14 145)',
      500: 'oklch(64% 0.17 145)',
      600: 'oklch(52% 0.16 145)',
      700: 'oklch(44% 0.15 145)',
      800: 'oklch(37% 0.13 145)',
      900: 'oklch(30% 0.12 145)',
      950: 'oklch(22% 0.10 145)'
    },
    warning: {
      50: 'oklch(96% 0.03 85)',
      100: 'oklch(92% 0.06 85)',
      200: 'oklch(86% 0.09 85)',
      300: 'oklch(79% 0.12 85)',
      400: 'oklch(74% 0.14 85)',
      500: 'oklch(70% 0.15 85)',
      600: 'oklch(58% 0.14 85)',
      700: 'oklch(48% 0.13 85)',
      800: 'oklch(40% 0.11 85)',
      900: 'oklch(35% 0.10 85)',
      950: 'oklch(25% 0.08 85)'
    },
    danger: {
      50: 'oklch(96% 0.03 25)',
      100: 'oklch(92% 0.06 25)',
      200: 'oklch(86% 0.10 25)',
      300: 'oklch(78% 0.14 25)',
      400: 'oklch(68% 0.18 25)',
      500: 'oklch(53% 0.21 25)',
      600: 'oklch(45% 0.20 25)',
      700: 'oklch(38% 0.18 25)',
      800: 'oklch(33% 0.16 25)',
      900: 'oklch(28% 0.15 25)',
      950: 'oklch(20% 0.12 25)'
    },
    // Superfícies
    surface: {
      0: 'oklch(100% 0 0)',
      50: 'oklch(98% 0.01 247)',
      100: 'oklch(96% 0.01 247)',
      200: 'oklch(93% 0.02 247)',
      300: 'oklch(90% 0.02 247)',
      400: 'oklch(85% 0.03 247)',
      500: 'oklch(80% 0.03 247)',
      600: 'oklch(70% 0.04 247)',
      700: 'oklch(60% 0.04 247)',
      800: 'oklch(45% 0.03 247)',
      900: 'oklch(30% 0.02 247)',
      950: 'oklch(15% 0.01 247)'
    },
    // Texto
    text: {
      primary: 'oklch(20% 0.02 247)',
      secondary: 'oklch(45% 0.02 247)',
      tertiary: 'oklch(60% 0.02 247)',
      disabled: 'oklch(75% 0.01 247)',
      inverse: 'oklch(98% 0.01 247)',
      onPrimary: 'oklch(98% 0.01 247)',
      onSuccess: 'oklch(98% 0.01 247)',
      onWarning: 'oklch(20% 0.02 85)',
      onDanger: 'oklch(98% 0.01 25)'
    },
    // Bordas
    border: {
      primary: 'oklch(85% 0.02 247)',
      secondary: 'oklch(90% 0.01 247)',
      tertiary: 'oklch(93% 0.01 247)',
      focus: 'oklch(59% 0.15 237)',
      danger: 'oklch(53% 0.21 25)',
      success: 'oklch(64% 0.17 145)'
    }
  },
  
  typography: {
    fonts: {
      sans: '"Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, monospace',
      medical: '"Inter var", system-ui, sans-serif'
    },
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.375rem',   // 22px
      '2xl': '1.75rem', // 28px
      '3xl': '2.25rem', // 36px
      '4xl': '3rem',    // 48px
      '5xl': '3.75rem', // 60px
      '6xl': '4.5rem'   // 72px
    },
    weights: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeights: {
      none: 1,
      tight: 1.25,
      snug: 1.375,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2
    },
    letterSpacing: {
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em'
    }
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    7: '1.75rem',   // 28px
    8: '2rem',      // 32px
    9: '2.25rem',   // 36px
    10: '2.5rem',   // 40px
    11: '2.75rem',  // 44px
    12: '3rem',     // 48px
    14: '3.5rem',   // 56px
    16: '4rem',     // 64px
    18: '4.5rem',   // 72px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    28: '7rem',     // 112px
    32: '8rem',     // 128px
    36: '9rem',     // 144px
    40: '10rem',    // 160px
    44: '11rem',    // 176px
    48: '12rem',    // 192px
    52: '13rem',    // 208px
    56: '14rem',    // 224px
    60: '15rem',    // 240px
    64: '16rem'     // 256px
  },
  
  radii: {
    none: '0',
    xs: '0.125rem',   // 2px
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px'
  },
  
  shadows: {
    none: 'none',
    xs: '0 1px 2px oklch(0% 0 0 / 0.05)',
    sm: '0 1px 3px oklch(0% 0 0 / 0.08), 0 1px 2px oklch(0% 0 0 / 0.06)',
    md: '0 4px 6px oklch(0% 0 0 / 0.04), 0 2px 4px oklch(0% 0 0 / 0.06)',
    lg: '0 8px 15px oklch(0% 0 0 / 0.08), 0 4px 6px oklch(0% 0 0 / 0.04)',
    xl: '0 12px 24px oklch(0% 0 0 / 0.12), 0 8px 12px oklch(0% 0 0 / 0.08)',
    '2xl': '0 16px 48px oklch(0% 0 0 / 0.16), 0 12px 24px oklch(0% 0 0 / 0.12)',
    inner: 'inset 0 2px 4px oklch(0% 0 0 / 0.08)',
    outline: '0 0 0 3px oklch(59% 0.15 237 / 0.5)',
    focus: '0 0 0 3px oklch(59% 0.15 237 / 0.3), 0 1px 3px oklch(0% 0 0 / 0.08)',
    danger: '0 0 0 3px oklch(53% 0.21 25 / 0.3)',
    success: '0 0 0 3px oklch(64% 0.17 145 / 0.3)'
  },
  
  motion: {
    easings: {
      linear: 'cubic-bezier(0, 0, 1, 1)',
      ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
      'ease-out': 'cubic-bezier(0, 0, 0.58, 1)',
      'ease-in-out': 'cubic-bezier(0.42, 0, 0.58, 1)',
      standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
      anticipate: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    },
    durations: {
      instant: '0ms',
      fast: '120ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
      slowest: '800ms'
    }
  },
  
  zIndices: {
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800
  },
  
  // Breakpoints para responsividade
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  
  // Componentes específicos para medicina
  medical: {
    alerts: {
      critical: {
        bg: 'oklch(96% 0.03 25)',
        border: 'oklch(53% 0.21 25)',
        text: 'oklch(33% 0.16 25)',
        icon: 'oklch(53% 0.21 25)'
      },
      warning: {
        bg: 'oklch(96% 0.03 85)',
        border: 'oklch(70% 0.15 85)',
        text: 'oklch(40% 0.11 85)',
        icon: 'oklch(70% 0.15 85)'
      },
      info: {
        bg: 'oklch(97% 0.02 237)',
        border: 'oklch(59% 0.15 237)',
        text: 'oklch(35% 0.13 237)',
        icon: 'oklch(59% 0.15 237)'
      },
      success: {
        bg: 'oklch(96% 0.03 145)',
        border: 'oklch(64% 0.17 145)',
        text: 'oklch(37% 0.13 145)',
        icon: 'oklch(64% 0.17 145)'
      }
    },
    status: {
      draft: 'oklch(60% 0.02 247)',
      pending: 'oklch(70% 0.15 85)',
      validated: 'oklch(64% 0.17 145)',
      signed: 'oklch(59% 0.15 237)',
      expired: 'oklch(53% 0.21 25)',
      cancelled: 'oklch(45% 0.02 247)'
    },
    priority: {
      low: 'oklch(64% 0.17 145)',
      normal: 'oklch(59% 0.15 237)',
      high: 'oklch(70% 0.15 85)',
      critical: 'oklch(53% 0.21 25)'
    }
  }
}

// Exportar para CSS custom properties
export function generateCSSVariables() {
  const vars = []
  
  // Colors
  Object.entries(tokens.colors).forEach(([category, values]) => {
    if (typeof values === 'string') {
      vars.push(`--color-${category}: ${values};`)
    } else {
      Object.entries(values).forEach(([key, value]) => {
        vars.push(`--color-${category}-${key}: ${value};`)
      })
    }
  })
  
  // Typography
  Object.entries(tokens.typography.sizes).forEach(([key, value]) => {
    vars.push(`--text-${key}: ${value};`)
  })
  
  Object.entries(tokens.typography.weights).forEach(([key, value]) => {
    vars.push(`--font-${key}: ${value};`)
  })
  
  // Spacing
  Object.entries(tokens.spacing).forEach(([key, value]) => {
    vars.push(`--space-${key}: ${value};`)
  })
  
  // Radii
  Object.entries(tokens.radii).forEach(([key, value]) => {
    vars.push(`--radius-${key}: ${value};`)
  })
  
  // Shadows
  Object.entries(tokens.shadows).forEach(([key, value]) => {
    vars.push(`--shadow-${key}: ${value};`)
  })
  
  // Motion
  Object.entries(tokens.motion.durations).forEach(([key, value]) => {
    vars.push(`--duration-${key}: ${value};`)
  })
  
  Object.entries(tokens.motion.easings).forEach(([key, value]) => {
    vars.push(`--easing-${key}: ${value};`)
  })
  
  // Z-indices
  Object.entries(tokens.zIndices).forEach(([key, value]) => {
    vars.push(`--z-${key}: ${value};`)
  })
  
  return `:root {\n  ${vars.join('\n  ')}\n}`
}

// Utilitário para classes condicionais
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

// Utilitários para acessibilidade
export const a11y = {
  srOnly: 'sr-only absolute -m-px h-px w-px overflow-hidden whitespace-nowrap border-0 p-0',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
  skipLink: 'absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full bg-primary-600 px-4 py-2 text-white transition-transform focus:translate-y-0'
}

// Utilitários para animações
export const animations = {
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  slideUp: 'animate-slideUp',
  slideDown: 'animate-slideDown',
  scaleIn: 'animate-scaleIn',
  pulse: 'animate-pulse',
  spin: 'animate-spin',
  bounce: 'animate-bounce'
}

// Breakpoints utilitários
export const media = {
  xs: `(min-width: ${tokens.breakpoints.xs})`,
  sm: `(min-width: ${tokens.breakpoints.sm})`,
  md: `(min-width: ${tokens.breakpoints.md})`,
  lg: `(min-width: ${tokens.breakpoints.lg})`,
  xl: `(min-width: ${tokens.breakpoints.xl})`,
  '2xl': `(min-width: ${tokens.breakpoints['2xl']})`
}

export default tokens