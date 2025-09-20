
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { StudentProvider } from '@/contexts/student-context';
import { Header } from '@/components/layout/header';

export const metadata: Metadata = {
  title: 'Ccomp uerj progress',
  description: 'Visualização do Fluxograma Curricular',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.React.Node;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <StudentProvider>
          <Header />
          {children}
        </StudentProvider>
        <Toaster />
      </body>
    </html>
  );
}
