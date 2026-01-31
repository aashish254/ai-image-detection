import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from '@/components/ClientLayout';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'AI Forensic Analyzer | Detect AI-Generated Images',
  description: 'Advanced forensic analysis of AI-generated content using multi-modal detection pipelines with three novel research contributions: DACC, SAM, and DRWF.',
  keywords: ['AI detection', 'deepfake detection', 'synthetic media', 'forensic analysis', 'image authentication', 'research'],
  authors: [
    { name: 'Rahul Yadav' },
    { name: 'Aashish Kumar Mahato' },
    { name: 'Bibek Gami' },
  ],
  openGraph: {
    title: 'AI Forensic Analyzer',
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
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0a0f1e" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
