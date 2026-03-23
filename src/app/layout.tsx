import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { PWARegister } from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah',
  description: 'Aplikasi Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh) - Genealogi Keluarga Interaktif dengan Pohon Silsilah Modern',
  keywords: 'silsilah, keluarga, abdur rochman, fathmiyah, genealogi, pohon silsilah, keluarga besar, sejarah keluarga, tawasul',
  authors: [{ name: 'dastrevas.coding', url: 'https://dastrevas.com' }],
  creator: 'dastrevas.coding',
  openGraph: {
    title: 'Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah',
    description: 'Jelajahi sejarah dan genealogi keluarga besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh) melalui pohon silsilah interaktif',
    type: 'website',
    url: 'https://bani-fatmiyah.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah',
    description: 'Aplikasi Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh)',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Silsilah Keluarga',
  },
  formatDetection: {
    telephone: false,
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
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>❤️</text></svg>" />
        
        {/* PWA & Mobile Web App */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9333ea" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Silsilah Keluarga" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'><rect fill='%239333ea' width='180' height='180' rx='40'/><text x='50%' y='50%' font-size='100' dominant-baseline='middle' text-anchor='middle' fill='white'>❤️</text></svg>" />
        
        {/* SEO & Social Meta Tags */}
        <meta name="description" content="Aplikasi Silsilah Keluarga Besar H. Abdur Rochman (Alm) & Hajjah Fathmiyah (Almh) - Genealogi Keluarga Interaktif dengan Pohon Silsilah Modern" />
        <meta name="keywords" content="silsilah, keluarga, abdur rochman, fathmiyah, genealogi, pohon silsilah, keluarga besar, sejarah keluarga" />
        <meta name="author" content="dastrevas.coding" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah" />
        <meta property="og:description" content="Jelajahi sejarah dan genealogi keluarga besar melalui pohon silsilah interaktif" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="id_ID" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Silsilah Keluarga Besar H. Abdur Rochman & Hajjah Fathmiyah" />
        <meta name="twitter:description" content="Aplikasi Silsilah Keluarga Interaktif dengan Pohon Silsilah Modern" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://bani-fatmiyah.vercel.app" />
      </head>
      <body className="bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors">
        <PWARegister />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
