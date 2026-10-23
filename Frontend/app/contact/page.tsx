import type { Metadata } from 'next'
import { ContactPageClient } from '@/components/contact-page-client'

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://pragatinursery.com/contact',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
