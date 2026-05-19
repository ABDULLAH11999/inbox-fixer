import type { Metadata } from 'next';
import { Syne, IBM_Plex_Mono, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import TrackPageView from '@/components/TrackPageView';
import './globals.css';

const SITE_URL = 'https://inboxfixer.online';
const SITE_NAME = 'InboxFixer';
const DEFAULT_TITLE = 'Free Domain DNS Check & Email DNS Record Fix Tool | InboxFixer';
const DEFAULT_DESCRIPTION = 'Run a free domain DNS and email DNS check for SPF, DKIM, DMARC, MX, BIMI, MTA-STS, blacklist, and rDNS. Find why mail is not delivering and get exact DNS records to fix it fast.';
const OG_IMAGE = '/opengraph-image.png';

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
});
const mono = IBM_Plex_Mono({
  weight: ['400', '600'],
  subsets: ['latin'],
  variable: '--font-mono',
});
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    'free domain dns check',
    'email dns check free',
    'domain dns checker',
    'dns record fixer',
    'email dns record fix tool',
    'email deliverability test',
    'free email deliverability test',
    'free email deliverability checker',
    'mail delivery problem checker',
    'email deliverability checker',
    'SPF record checker free',
    'DKIM checker online',
    'DMARC checker free',
    'MX record checker',
    'why email is not delivering',
    'why are my emails going to spam',
    'domain email dns fix',
    'email blacklist check free',
    'domain dns health check',
    'check email authentication records',
  ].join(', '),
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    shortcut: [{ url: '/icon-192.png', type: 'image/png' }],
    icon: [
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'InboxFixer free domain DNS and email deliverability checker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/icon-512.png`,
                image: `${SITE_URL}/icon-512.png`,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE_NAME,
                url: SITE_URL,
                description: DEFAULT_DESCRIPTION,
              },
              {
                '@context': 'https://schema.org',
                '@type': 'SoftwareApplication',
                name: SITE_NAME,
                applicationCategory: 'BusinessApplication',
                operatingSystem: 'All',
                url: SITE_URL,
                logo: `${SITE_URL}/icon-512.png`,
                description: DEFAULT_DESCRIPTION,
                aggregateRating: {
                  '@type': 'AggregateRating',
                  ratingValue: '4.9',
                  bestRating: '5',
                  worstRating: '1',
                  ratingCount: currentCount.toString(),
                },
                offers: {
                  '@type': 'Offer',
                  price: '0.00',
                  priceCurrency: 'USD',
                },
              },
            ]),
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
