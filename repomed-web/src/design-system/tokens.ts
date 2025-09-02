// RepoMed IA — Tokens (TypeScript)
// Uso: import { tokens } from "@/design-system/tokens";
export const tokens = {
  colors: {
    brand: {
      50: 'oklch(0.97 0.02 240)',
      100: 'oklch(0.92 0.04 240)',
      200: 'oklch(0.86 0.06 240)',
      300: 'oklch(0.80 0.08 240)',
      400: 'oklch(0.74 0.10 240)',
      500: 'oklch(0.68 0.12 240)',
      600: 'oklch(0.62 0.12 240)',
      700: 'oklch(0.56 0.10 240)',
      800: 'oklch(0.50 0.08 240)',
      900: 'oklch(0.44 0.06 240)'
    },
    semantic: {
      success: 'oklch(0.72 0.12 160)',
      warning: 'oklch(0.88 0.12 95)',
      danger:  'oklch(0.62 0.15 25)'
    }
  },
  radius: { sm: 8, md: 12, lg: 16 },
  spacing: { 1: 4, 2: 8, 3: 12, 4: 16, 6: 24, 8: 32, 12: 48 },
  shadow: {
    1: '0 1px 2px rgba(0,0,0,.08)',
    2: '0 6px 20px rgba(0,0,0,.12)'
  },
  typography: {
    fontSans: 'var(--font-sans)',
    fontMono: 'var(--font-mono)'
  }
} as const;