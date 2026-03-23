import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah',
  description: 'Aplikasi Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh) - Genealogi Keluarga Interaktif dengan Pohon Silsilah Modern',
  keywords: 'silsilah, keluarga, abdur rochman, fathmiyah, genealogi, pohon silsilah',
  openGraph: {
    title: 'Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah',
    description: 'Jelajahi sejarah dan genealogi keluarga besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh) melalui pohon silsilah interaktif',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
