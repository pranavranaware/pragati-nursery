'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { getWishlistIds, removeFromWishlist } from '@/lib/wishlistStorage'
import { productService } from '@/services/productService'
import { useCart } from '@/components/cart-provider'
import { formatMediaUrl, formatPrice, normalizeImages, getLocalizedName, getLocalizedCategoryName, type Product } from '@/types/product'
import { useLanguage } from '@/lib/language'
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react'

export default function AccountWishlist() {
  const { lang, t } = useLanguage()
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { add } = useCart()

  const loadWishlistData = useCallback(async () => {
    const ids = getWishlistIds()
    if (ids.length === 0) {
      setWishlistProducts([])
      setLoading(false)
      return
    }

    try {
      const allProducts = await productService.getProducts()
      if (Array.isArray(allProducts)) {
        const matched = allProducts.filter((p) => ids.includes(p.id))
        setWishlistProducts(matched)
      }
    } catch (err) {
      console.warn('Failed to load products for wishlist:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadWishlistData()
    const handleSync = () => loadWishlistData()
    window.addEventListener('pragati-wishlist-changed', handleSync)
    return () => window.removeEventListener('pragati-wishlist-changed', handleSync)
  }, [loadWishlistData])

  const handleRemove = (productId: number) => {
    removeFromWishlist(productId)
    setWishlistProducts((prev) => prev.filter((p) => p.id !== productId))
  }

  const handleAddToCart = (product: Product) => {
    add(product, 1)
  }

  return (
    <main className="min-h-screen bg-background px-3.5 sm:px-5 py-6 sm:py-12 md:py-16">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/5 transition shadow-xs"
        >
          <ArrowLeft className="size-3.5 sm:size-4" /> Back to Home
        </Link>
        <h1 className="mt-6 sm:mt-8 font-serif text-3xl sm:text-4xl">Your Wishlist</h1>
        <p className="mt-2 text-sm text-muted-foreground">Plants you save for later appear here (saved on this browser).</p>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading wishlist...</p>
        ) : wishlistProducts.length === 0 ? (
          <div className="mt-8 sm:mt-10 text-center py-10 sm:py-12 rounded-3xl border border-dashed border-border bg-card px-4">
            <Heart className="mx-auto size-12 text-primary/30" />
            <p className="mt-4 font-serif text-2xl">Your wishlist is empty</p>
            <p className="mt-2 text-sm text-muted-foreground">Browse plants and click the heart icon to save items.</p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md"
            >
              Explore Plants
            </Link>
          </div>
        ) : (
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {wishlistProducts.map((product) => {
              const images = normalizeImages(product)
              const primaryImg = images.find((i) => i.primary) || images[0]
              const imgSrc = primaryImg?.src || '/placeholder.jpg'

              return (
                <div
                  key={product.id}
                  className="flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border bg-card p-3 sm:p-4 shadow-2xs hover:border-primary/40 transition"
                >
                  <div>
                    <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-muted">
                      <Image
                        src={formatMediaUrl(imgSrc)}
                        alt={getLocalizedName(product, lang)}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                    <h3 className="mt-3 font-serif text-base sm:text-xl leading-tight truncate">{getLocalizedName(product, lang)}</h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">{getLocalizedCategoryName(product, lang)}</p>
                    <p className="mt-1.5 text-sm sm:text-base font-bold text-primary">{formatPrice(product.price)}</p>
                  </div>

                  <div className="mt-4 flex items-center gap-1.5 sm:gap-2 border-t border-border/50 pt-3">
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 'Out of Stock'}
                      className="flex-1 inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full bg-primary py-2 sm:py-2.5 text-[11px] sm:text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                    >
                      <ShoppingBag className="size-3 sm:size-3.5 shrink-0" />
                      <span className="truncate">{product.stock === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}</span>
                    </button>

                    <button
                      onClick={() => handleRemove(product.id)}
                      aria-label={`Remove ${product.name} from wishlist`}
                      className="rounded-full border border-border p-2 sm:p-2.5 hover:bg-muted text-muted-foreground hover:text-destructive transition cursor-pointer shrink-0"
                    >
                      <Trash2 className="size-3.5 sm:size-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
