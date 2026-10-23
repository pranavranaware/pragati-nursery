'use client'

import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { ArrowLeft, Pencil, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { AdminLayout, SectionCard, StatusBadge, buttonClass } from '@/components/admin'
import { ConfirmDialog, EmptyState } from '@/components/api-states'
import { formatMediaUrl, formatPrice, type Category } from '@/types/product'
import { productEvents, productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { adminApi, type AdminProduct } from '@/services/adminService'

export default function CategoryManagementPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = use(params)
  const [category, setCategory] = useState<Category | null>(null)
  const [items, setItems] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [remove, setRemove] = useState<AdminProduct | null>(null)

  const sync = async () => {
    setLoading(true)
    setError(null)
    try {
      const cat = await categoryService.getBySlug(slug)
      setCategory(cat)
      if (cat) {
        const prods = await adminApi.products.list({ category: slug })
        setItems(prods)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load category details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    sync()
    window.addEventListener('pragati-products-changed', sync)
    return () => window.removeEventListener('pragati-products-changed', sync)
  }, [slug])

  if (loading) {
    return (
      <AdminLayout title="Category Management" subtitle="Loading category details...">
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Fetching category details...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !category) {
    return (
      <AdminLayout title="Category not found" subtitle="This category may have been removed or is unavailable.">
        <div className="flex flex-col items-start gap-4">
          {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          <Link href="/admin/categories" className="font-semibold text-primary underline">
            ← Back to Categories
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const returnTo = `/admin/categories/${category.slug}`

  return (
    <AdminLayout
      title={category.name}
      subtitle="Manage every plant in this category."
      action={
        <div className="flex gap-2">
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted hover:text-primary transition shadow-xs"
          >
            <ArrowLeft className="size-4 text-primary" /> Categories
          </Link>
          <Link
            href={`/admin/products/new?category=${category.slug}&returnTo=${encodeURIComponent(returnTo)}`}
            className={buttonClass}
          >
            <Plus className="size-4" /> Add Plant
          </Link>
        </div>
      }
    >
      <div className="mb-6 overflow-hidden rounded-2xl border bg-card shadow-sm sm:flex">
        <img src={formatMediaUrl(category.image)} alt={`${category.name} category`} className="h-44 w-full object-cover sm:h-auto sm:w-72" />
        <div className="flex flex-1 flex-col justify-center gap-3 p-6">
          <h2 className="font-serif text-3xl">{category.name}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{category.description}</p>
          <p className="text-sm font-semibold text-primary">{items.length} plant(s) in this category</p>
        </div>
      </div>

      <SectionCard title="Plants in this category">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Plant</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Stock</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((product) => (
                <tr key={product.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image || 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e'} alt="" className="size-12 rounded-xl object-cover" />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-semibold">{formatPrice(product.price)}</td>
                  <td className="px-5 py-4">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit?returnTo=${encodeURIComponent(returnTo)}`}
                        className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"
                      >
                        <Pencil className="size-3" /> Edit
                      </Link>
                      <button
                        onClick={() => setRemove(product)}
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs font-semibold text-destructive"
                      >
                        <Trash2 className="size-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!items.length && <EmptyState title="No plants yet" description="Add the first plant to this category." />}
        </div>
      </SectionCard>

      {remove && (
        <ConfirmDialog
          title={`Delete ${remove.name}?`}
          description="This permanently removes the product from the backend catalog."
          onCancel={() => setRemove(null)}
          onConfirm={async () => {
            await productService.deleteProduct(remove.id)
            productEvents.emit()
            window.dispatchEvent(new CustomEvent('pragati-catalog-changed'))
            setRemove(null)
            await sync()
          }}
        />
      )}
    </AdminLayout>
  )
}
