import type { Metadata } from 'next'
import { HomePageClient } from '@/components/home-page-client'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pragatinursery.com'

export const metadata: Metadata = {
  title: 'Plant Nursery in Pune | Buy Plants Online | Pragati Nursery',
  description: 'Buy healthy indoor, outdoor, flowering, fruit, and medicinal plants online from Pragati Nursery in Pune. Fresh plants delivered with care.',
  alternates: {
    canonical: `${baseUrl}/`,
  },
  openGraph: {
    title: 'Plant Nursery in Pune | Buy Plants Online | Pragati Nursery',
    description: 'Buy healthy indoor, outdoor, flowering, fruit, and medicinal plants online from Pragati Nursery in Pune. Fresh plants delivered with care.',
    url: `${baseUrl}/`,
    siteName: 'Pragati Nursery',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function Page() {
  return <HomePageClient />
}
