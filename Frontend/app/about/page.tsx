import type { Metadata } from 'next'
import { AboutPageClient } from '@/components/about-page-client'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pragatinursery.com'

export const metadata: Metadata = {
  title: 'About Us | Pragati Nursery',
  description: 'Learn about Pragati Nursery, our story, and our commitment to growing and nurturing healthy plants in Pune, Maharashtra.',
  alternates: {
    canonical: `${baseUrl}/about`,
  },
  openGraph: {
    title: 'About Us | Pragati Nursery',
    description: 'Learn about Pragati Nursery, our story, and our commitment to growing and nurturing healthy plants in Pune, Maharashtra.',
    url: `${baseUrl}/about`,
    siteName: 'Pragati Nursery',
    locale: 'en_IN',
    type: 'website',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
