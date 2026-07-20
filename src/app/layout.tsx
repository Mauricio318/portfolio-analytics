import type { Metadata } from 'next';
import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'Mauricio Garcia Bimbu - Cientista e Engenheiro de Dados',
  description: 'Portfólio profissional de Mauricio Garcia Bimbu, especialista em Data Science, Engenharia de Dados e Big Data',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="64x64" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="64x64" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
