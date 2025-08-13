import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vision Platform - Multimodal Translation & Accessibility',
  description: 'AI-powered platform for cross-language translation and accessibility assistance for visually impaired users.',
  keywords: 'translation, accessibility, AI, speech-to-text, text-to-speech, OCR, scene description',
  authors: [{ name: 'Vision Platform Team' }],
  creator: 'Vision Platform',
  publisher: 'Vision Platform',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Vision Platform - Multimodal Translation & Accessibility',
    description: 'AI-powered platform for cross-language translation and accessibility assistance',
    url: 'http://localhost:3000',
    siteName: 'Vision Platform',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vision Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vision Platform - Multimodal Translation & Accessibility',
    description: 'AI-powered platform for cross-language translation and accessibility assistance',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
