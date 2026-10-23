'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { AdminLayout, ProductRow, SectionCard, TableWrap, buttonClass } from '@/components/admin'
import { productEvents, productService } from '@/services/productService'
import type { Product } from '@/types/product'

export default function ProductsPage() {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [deleted, setDeleted] = useState<Product | null>(null)
  useEffect(() => {
    const sync = async () => {
      try {
        const list = await productService.getProducts()
        if (Array.isArray(list)) setProducts(list)
      } catch { /* Fallback */ }
    }
    sync()
    window.addEventListener('pragati-products-changed', sync)
    return () => window.removeEventListener('pragati-products-changed', sync)
  }, [])
  const filtered = products.filter((product) => `${product.name} ${product.sku || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <AdminLayout title="Products" subtitle="Manage your nursery catalog, inventory and pricing." action={<Link href="/admin/products/new" className={buttonClass}><Plus className="size-4" />Add Product</Link>}><SectionCard title={`${filtered.length} products`} action={<div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-36 bg-transparent text-sm outline-none md:w-56" /></div>}><TableWrap><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground"><tr>{['Image','Product Name','Category','Price','Stock','Status','Created','Actions'].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody>{filtered.map((product) => <ProductRow key={product.id} product={product} onDelete={(item) => setDeleted(item as Product)} />)}</tbody></table></TableWrap>{deleted && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/30 p-4"><div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl"><h2 className="text-xl font-bold">Delete this product?</h2><p className="mt-2 text-sm text-muted-foreground">Are you sure you want to delete {deleted.name}?</p><div className="mt-6 flex justify-end gap-3"><button onClick={() => setDeleted(null)} className="rounded-xl border px-4 py-2.5 text-sm font-semibold">Cancel</button><button onClick={async () => { await productService.deleteProduct(deleted.id); productEvents.emit(); setDeleted(null) }} className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground">Delete</button></div></div></div>}</SectionCard></AdminLayout>
}
