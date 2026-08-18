import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'EduWeave (v2.0) - AI Academic Coordination & Anti-Burnout Platform',
  description: 'AI-powered, multi-role academic coordination platform designed to prevent student burnout through proactive workload management, cross-subject deadline visibility, contextual learning tools, and intelligent stress forecasting.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
