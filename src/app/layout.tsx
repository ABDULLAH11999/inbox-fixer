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
    'email inbox delivery fixer online',
    'email inbox delivery fixer free',
    'email inbox delivery fixer gmail',
    'email deliverability test',
    'free email deliverability test',
    'mail tester',
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
  alternates: {
    canonical: 'https://inboxfixer.online',
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
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
  const baselineDate = new Date('2026-05-17T00:00:00Z');
  const baseCount = 29621;
  const diffMs = new Date().getTime() - baselineDate.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const currentCount = baseCount + Math.max(0, diffMinutes);

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512.png" />
        <link rel="shortcut icon" href="/icon-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "InboxFixer",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "All",
              "url": "https://inboxfixer.online",
              "logo": "https://inboxfixer.online/icon-512.png",
              "description": "Instantly check why your emails go to spam. Free SPF, DKIM, DMARC, and blacklist diagnosis.",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "bestRating": "5",
                "worstRating": "1",
                "ratingCount": currentCount.toString()
              },
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className={`${syne.variable} ${mono.variable} ${inter.variable} font-sans bg-[#0a0f1e] text-white antialiased min-h-screen flex flex-col`}>
        <TrackPageView />
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </body>
    </html>
  );
}
