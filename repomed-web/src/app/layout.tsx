import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'RepoMed IA v3.0 - Sistema Médico Completo',
    template: '%s | RepoMed IA'
  },
  description: 'Sistema completo de documentação médica com IA, prescrições digitais, assinatura certificada e prontuário eletrônico',
  keywords: [
    'sistema médico',
    'prontuário eletrônico',
    'prescrição digital',
    'assinatura digital',
    'documentação médica',
    'telemedicina',
    'IA médica'
  ],
  authors: [{ name: 'RepoMed IA Team' }],
  creator: 'RepoMed IA',
  metadataBase: new URL('https://repomed-ia.com'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://repomed-ia.com',
    siteName: 'RepoMed IA',
    title: 'RepoMed IA - Sistema Médico Completo',
    description: 'Plataforma profissional para documentação médica digital',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RepoMed IA - Sistema Médico'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RepoMed IA - Sistema Médico Completo',
    description: 'Plataforma profissional para documentação médica digital',
    images: ['/og-image.png']
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false
    }
  },
  manifest: '/manifest.json'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="pt-BR" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body 
        className={`
          ${inter.className} 
          antialiased 
          bg-gradient-to-br from-slate-50 to-blue-50 
          dark:from-slate-900 dark:to-slate-800 
          min-h-screen
          selection:bg-blue-600/20
        `}
        suppressHydrationWarning
      >
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            expand={false}
            richColors
            closeButton
            theme="system"
          />
        </Providers>
        <div id="modal-root" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent FOUC
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch {}
            `,
          }}
        />
      </body>
    </html>
  )
}