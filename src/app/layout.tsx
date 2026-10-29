import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'OriginLayer | Detect AI-Generated Images',
  description: 'Advanced forensic analysis of AI-generated content using multi-modal detection pipelines with seven novel research contributions: DACC, SAM, DRWF, FSFN, XAI, EUQ, and GFI.',
  keywords: ['AI detection', 'deepfake detection', 'synthetic media', 'forensic analysis', 'image authentication', 'research'],
  authors: [
    { name: 'Aashish Kumar Mahato' },
    { name: 'Rahul Yadav' },
    { name: 'Bibek Gami' },
  ],
  openGraph: {
    title: 'OriginLayer',
    description: 'Detect and analyze AI-generated images with explainable AI',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#f1f2f4" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#14161a" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var s=localStorage.getItem('originlayer-theme');var t=s==='dark'||s==='light'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}",
          }}
        />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
