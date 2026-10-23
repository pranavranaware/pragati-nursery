import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { DM_Serif_Display, Geist } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart-provider'
import { LocalBusinessJsonLd, WebSiteJsonLd } from '@/components/json-ld'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pragatinursery.com'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Plant Nursery in Pune | Buy Plants Online | Pragati Nursery',
    template: '%s | Pragati Nursery',
  },
  description: 'Buy healthy indoor, outdoor, flowering, fruit, and medicinal plants online from Pragati Nursery in Pune. Fresh plants delivered with care.',
  keywords: [
    'plant nursery in Pune',
    'nursery in Pune',
    'buy plants online in Pune',
    'indoor plants in Pune',
    'outdoor plants in Pune',
    'flowering plants in Pune',
    'buy indoor plants online',
    'plant shop in Pune',
    'nursery near me',
    'buy plants online',
  ],
  authors: [{ name: 'Pragati Nursery' }],
  creator: 'Pragati Nursery',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName: 'Pragati Nursery',
    title: 'Plant Nursery in Pune | Buy Plants Online | Pragati Nursery',
    description: 'Explore healthy indoor, outdoor, flowering, and fruit plants online. Delivered fresh from our nursery in Pune.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
        width: 1200,
        height: 630,
        alt: 'Pragati Nursery Plants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plant Nursery in Pune | Buy Plants Online | Pragati Nursery',
    description: 'Explore healthy indoor, outdoor, flowering, and fruit plants online. Delivered fresh from our nursery in Pune.',
    images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411'],
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  colorScheme: 'light',
  themeColor: '#2d5a3d',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geist.variable} ${dmSerif.variable} bg-background`}>
      <body className="antialiased">
        <WebSiteJsonLd />
        <LocalBusinessJsonLd />
        <CartProvider>{children}</CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
