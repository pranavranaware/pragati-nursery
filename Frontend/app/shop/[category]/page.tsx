import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { ShopShell } from '@/components/catalog'
import { categoryService } from '@/services/categoryService'
import type { Product } from '@/types/product'

export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  if (slug === 'all-plants') {
    return { title: 'All Plants | Buy Online | Pragati Nursery' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://pragatinursery.com'

  try {
    const category = await categoryService.getBySlug(slug)
    if (!category) {
      return {
        title: 'Plant Category | Pragati Nursery',
        description: 'Explore healthy plants online from Pragati Nursery in Pune.',
      }
    }

    const title = `${category.name} | Buy Online | Pragati Nursery`
    const description =
      category.description ||
      `Buy healthy ${category.name.toLowerCase()} online from Pragati Nursery. Fresh plants delivered to your doorstep in Pune.`
    const url = `${baseUrl}/shop/${slug}`

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
      },
    }
  } catch {
    return {
      title: 'Plant Category | Pragati Nursery',
      description: 'Explore healthy plants online from Pragati Nursery in Pune.',
    }
  }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  if (slug === 'all-plants') notFound()

  let category = null
  let initialProducts: Product[] = []

  try {
    category = await categoryService.getBySlug(slug)
    if (category) {
      initialProducts = await categoryService.products(slug)
    }
  } catch (err) {
    console.warn('Category fetch error:', err)
  }

  if (!category) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-background py-20 text-center text-muted-foreground">Loading category...</div>}>
      <ShopShell
        initialProducts={initialProducts}
        categoryTitle={category.name}
        categoryDescription={category.description}
        categoryObj={category}
      />
    </Suspense>
  )
}

export function loading() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      <div className="h-12 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </div>
  )
}
