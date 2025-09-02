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
      500: 'oklch(64% 0.17 145)',
      900: 'oklch(30% 0.12 145)'
    },
    warning: {
      50: 'oklch(96% 0.03 85)',
      500: 'oklch(70% 0.15 85)',
      900: 'oklch(35% 0.10 85)'
    },
    danger: {
      50: 'oklch(96% 0.03 25)',
      500: 'oklch(53% 0.21 25)',
      900: 'oklch(28% 0.15 25)'
    },
    // Superfícies
    surface: {
      0: 'oklch(100% 0 0)',
      50: 'oklch(98% 0.01 247)',
      100: 'oklch(96% 0.01 247)',
      200: 'oklch(93% 0.02 247)',
      300: 'oklch(90% 0.02 247)'
    },
    // TEXTO
    text: {
      primary: 'oklch(20% 0.02 247)',
      secondary: 'oklch(45% 0.02 247)',
      tertiary: 'oklch(60% 0.02 247)',
      disabled: 'oklch(75% 0.01 247)',
      inverse: 'oklch(98% 0.01 247)'
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
      '3xl': '2.25rem'  // 36px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
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
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem'      // 80px
  },
  
  radii: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px'
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 3px oklch(0% 0 0 / 0.08)',
    md: '0 4px 12px oklch(0% 0 0 / 0.12)',
    lg: '0 8px 24px oklch(0% 0 0 / 0.16)',
    xl: '0 12px 48px oklch(0% 0 0 / 0.20)',
    inner: 'inset 0 2px 4px oklch(0% 0 0 / 0.08)'
  },
  
  motion: {
    easings: {
      standard: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
      decelerate: 'cubic-bezier(0, 0, 0.2, 1)'
    },
    durations: {
      instant: '0ms',
      fast: '120ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms'
    }
  },
  
  zIndices: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    overlay: 30,
    modal: 40,
    popover: 50,
    tooltip: 60,
    toast: 70
  }
} as const

// Exportar para Tailwind
export function generateTailwindTheme() {
  return {
    extend: {
      colors: {
        primary: tokens.colors.primary,
        success: tokens.colors.success,
        warning: tokens.colors.warning,
        danger: tokens.colors.danger,
        surface: tokens.colors.surface
      },
      fontFamily: {
        sans: tokens.typography.fonts.sans.split(','),
        mono: tokens.typography.fonts.mono.split(',')
      },
      fontSize: tokens.typography.sizes,
      spacing: tokens.spacing,
      borderRadius: tokens.radii,
      boxShadow: tokens.shadows,
      transitionTimingFunction: {
        standard: tokens.motion.easings.standard
      },
      transitionDuration: tokens.motion.durations,
      zIndex: tokens.zIndices
    }
  }
}

// Exportar para CSS custom properties
export function generateCSSVariables() {
  const vars: string[] = []
  
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
  
  return `:root {
  ${vars.join('
  ')}
}`
}
