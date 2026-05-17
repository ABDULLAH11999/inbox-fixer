import type { Metadata } from 'next';
import { Syne, IBM_Plex_Mono, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import TrackPageView from '@/components/TrackPageView';
import './globals.css';

const syne = Syne({ 
  subsets: ['latin'], 
  variable: '--font-syne' 
});
const mono = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-mono'
});
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
});

export const metadata: Metadata = {
  title: 'Free Email Deliverability Checker — SPF, DKIM, DMARC | InboxFixer',
  description: 'Instantly check if your emails reach the inbox. Free SPF checker, DKIM verifier, DMARC validator, and blacklist scanner. Get plain English fixes for every issue.',
  keywords: [
    'email deliverability checker',
    'SPF record checker free',
    'DKIM checker online',
    'DMARC checker free',
    'why are my emails going to spam',
    'email blacklist check',
    'domain email health check',
    'check email authentication',
  ].join(', '),
  metadataBase: new URL('https://inboxfixer.online'),
  openGraph: {
    title: 'InboxFixer — Email Deliverability Checker',
    description: 'Check why your emails go to spam. Free instant diagnosis.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InboxFixer Email Health Security Shield',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InboxFixer — Email Deliverability Checker',
    description: 'Check why your emails go to spam. Free instant diagnosis.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${syne.variable} ${mono.variable} ${inter.variable} font-sans bg-[#0a0f1e] text-white antialiased min-h-screen flex flex-col`}>
        <TrackPageView />
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
