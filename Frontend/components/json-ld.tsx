import { formatMediaUrl } from '@/types/product'

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pragati Nursery',
    url: 'https://pragatinursery.com/',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'GardenStore',
    name: 'Pragati Nursery',
    image: 'https://pragatinursery.com/pragati-nursery-logo.png',
    description: 'Online plant nursery offering healthy indoor, outdoor, flowering, fruit, and medicinal plants with delivery in Pune and surrounding areas.',
    url: 'https://pragatinursery.com/',
    telephone: '+91 9822101088',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Shahajirao Tanpure Farm, Vadgaon Tanpura',
      addressLocality: 'Karjat',
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    priceRange: '₹',
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '08:00',
      closes: '20:00',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ProductJsonLd({ product }: { product: import('@/types/product').Product }) {
  if (!product) return null

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pragatinursery.com'
  const rawImage = product.images?.[0]?.src
  const formattedImage = rawImage ? formatMediaUrl(rawImage) : ''
  const absoluteImageUrl = formattedImage
    ? formattedImage.startsWith('http://') || formattedImage.startsWith('https://')
      ? formattedImage
      : `${baseUrl}${formattedImage.startsWith('/') ? '' : '/'}${formattedImage}`
    : `${baseUrl}/pragati-nursery-logo.png`

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: absoluteImageUrl,
    description: product.description,
    sku: product.sku,
    category: product.category,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stockStatus === 'OUT_OF_STOCK'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/InStock',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
