'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { AdminLayout } from '@/components/admin'
import { ProductForm } from '@/components/admin-product-form'
import { productService } from '@/services/productService'

export default function EditProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ returnTo?: string }> }) {
  const { id } = use(params)
  const { returnTo } = use(searchParams)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    productService
      .getProductById(Number(id))
      .then((p) => {
        if (p) {
          setProduct({
            ...p,
            stock: p.stockQuantity ?? (p.stock === 'Out of Stock' ? 0 : p.stock === 'Low Stock' ? 5 : 20),
            status: p.stockStatus === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : p.stockStatus === 'LOW_STOCK' ? 'LOW_STOCK' : 'ACTIVE',
            image: p.images?.[0]?.src || '',
            createdAt: 'Recent',
          })
        } else {
          setError(`Product #${id} was not found.`)
        }
      })
      .catch(() => {
        setError('Failed to load product details.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <AdminLayout title="Edit Product" subtitle="Loading product details…">
        <p className="text-muted-foreground py-8 text-center">Loading product...</p>
      </AdminLayout>
    )
  }

  if (error || !product) {
    return (
      <AdminLayout title="Edit Product" subtitle="Error loading product">
        <div className="py-12 text-center space-y-4">
          <p className="text-destructive font-medium">{error || `Product #${id} was not found.`}</p>
          <Link
            href={returnTo || '/admin/products'}
            className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition"
          >
            ← Back to Products
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Edit Product" subtitle={`Update ${product.name} and keep inventory accurate.`}>
      <ProductForm product={product} returnTo={returnTo || '/admin/products'} />
    </AdminLayout>
  )
}
