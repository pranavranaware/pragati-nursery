import type { Metadata } from 'next'
import { cache } from 'react'
import { ProductJsonLd } from '@/components/json-ld'
import { ProductViewClient, ProductNotFound } from '@/components/product-view-client'
import { productService } from '@/services/productService'
import { formatMediaUrl } from '@/types/product'

const getCachedProduct = cache(async (slug: string) => {
  return await productService.getProductBySlug(slug)
})

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) {
    return {
      title: 'Plant Not Found | Pragati Nursery',
      description: 'The requested plant could not be found at Pragati Nursery.',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pragatinursery.com'
  const title = `${product.name} | Buy Online | Pragati Nursery`
  const description =
    product.description ||
    `Buy healthy ${product.name} online from Pragati Nursery. Fresh plants delivered with care.`
  const url = `${baseUrl}/products/${product.slug}`

  const rawImage = product.images?.[0]?.src
  const formattedImage = rawImage ? formatMediaUrl(rawImage) : ''
  const absoluteImageUrl = formattedImage.startsWith('http')
    ? formattedImage
    : `${baseUrl}${formattedImage.startsWith('/') ? '' : '/'}${formattedImage || 'pragati-nursery-logo.png'}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Pragati Nursery',
      type: 'website',
      images: [
        {
          url: absoluteImageUrl,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [absoluteImageUrl],
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getCachedProduct(slug)

  if (!product) return <ProductNotFound />

  const allProducts = await productService.getProducts()
  const related = allProducts
    .filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id)
    .slice(0, 4)

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductViewClient product={product} related={related} />
    </>
  )
}
