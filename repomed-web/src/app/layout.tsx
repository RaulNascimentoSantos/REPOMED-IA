import type { Metadata } from 'next';
import './globals.css';
import '@/styles/tokens.css';
import '@/styles/clinical-theme.css';
import '@/styles/themes.css';
import '@/styles/design-tokens-2025.css';
import '@/styles/medical-design-system-2025.css';
import ClientWrapper from '@/components/ClientWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FeatureFlagProvider } from '@/components/providers/FeatureFlagProvider';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'RepoMed IA - Sistema Médico Inteligente',
  description: 'Sistema médico completo com IA para gestão de pacientes, prescrições e documentos médicos',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#1e293b" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-sans antialiased min-h-screen" style={{ backgroundColor: 'var(--semantic-bg-primary)', color: 'var(--semantic-text-primary)' }}>
        <ThemeProvider>
          <FeatureFlagProvider>
            <ClientWrapper>
              {children}
            </ClientWrapper>
          </FeatureFlagProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}