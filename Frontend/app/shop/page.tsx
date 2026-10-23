import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ShopShell } from '@/components/catalog'

export const metadata: Metadata = {
  title: 'Shop All Plants | Pragati Nursery',
  description: 'Browse our complete catalog of healthy indoor, outdoor, flowering, fruit, and medicinal plants online from Pragati Nursery.',
  alternates: {
    canonical: 'https://pragatinursery.com/shop',
  },
  openGraph: {
    title: 'Shop All Plants | Pragati Nursery',
    description: 'Browse our complete catalog of healthy indoor, outdoor, flowering, fruit, and medicinal plants online from Pragati Nursery.',
    url: 'https://pragatinursery.com/shop',
    siteName: 'Pragati Nursery',
    type: 'website',
  },
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading catalog...</div>}>
      <ShopShell />
    </Suspense>
  )
}

export function loading() {
  return <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8"><div className="h-10 w-48 animate-pulse rounded bg-muted" /><div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="aspect-square animate-pulse rounded-2xl bg-muted" />)}</div></div>
}
