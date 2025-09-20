import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/themes.css';
import ClientWrapper from '@/components/ClientWrapper';
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RepoMed IA - Sistema Médico Inteligente',
  description: 'Sistema médico completo com IA para gestão de pacientes, prescrições e documentos médicos',
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
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}