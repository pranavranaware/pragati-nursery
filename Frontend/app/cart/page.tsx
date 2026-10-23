'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart, maxQuantity } from '@/components/cart-provider'
import { deliveryFee } from '@/types/order'
import { formatPrice, normalizeImages } from '@/types/product'
import { useLanguage } from '@/lib/language'

export default function CartPage() {
  const { t } = useLanguage()
  const { items, subtotal, update, remove } = useCart()
  const delivery = deliveryFee(subtotal)

  return (
    <main className="min-h-screen bg-background px-3.5 sm:px-5 py-6 sm:py-10 text-foreground lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Link href="/shop" className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-primary hover:bg-primary/5 transition shadow-xs">
          ← {t('continueShopping')}
        </Link>
        <h1 className="mt-6 sm:mt-8 font-serif text-3xl sm:text-5xl">{t('yourBag')}</h1>

        {!items.length ? (
          <div className="mx-auto flex max-w-lg flex-col items-center py-20 sm:py-28 text-center">
            <ShoppingBag className="size-12 sm:size-14 text-primary/40" />
            <h2 className="mt-6 font-serif text-2xl sm:text-3xl">{t('yourBagWaiting')}</h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">{t('bagEmptyDesc')}</p>
            <Link href="/shop" className="mt-7 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
              {t('shopPlants')}
            </Link>
          </div>
        ) : (
          <div className="mt-8 sm:mt-10 grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="flex flex-col gap-5">
              {items.map(({ product, quantity }) => {
                const max = maxQuantity(product)
                const isMax = max > 0 && quantity >= max
                const isMin = quantity <= 1
                const imgs = normalizeImages(product)
                const mainImg = imgs.find((image) => image.primary) || imgs[0]
                const imgSrc = mainImg?.src || '/placeholder.jpg'

                return (
                  <article key={product.id} className="flex gap-3 sm:gap-4 border-b border-border pb-5">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted sm:size-36">
                      <Image src={imgSrc} alt={mainImg?.alt || product.name} fill className="object-cover" sizes="144px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-1 sm:gap-2">
                        <Link href={`/products/${product.slug}`} className="font-serif text-base sm:text-xl font-medium leading-tight">
                          {product.name}
                        </Link>
                        <p className="font-semibold text-sm sm:text-base text-primary">{formatPrice(product.price * quantity)}</p>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t(product.category)}</p>
                      <p className="mt-1.5 text-xs font-semibold text-muted-foreground sm:hidden">{formatPrice(product.price)} each</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2.5 sm:gap-4">
                        <div className="flex items-center gap-2.5 sm:gap-3 rounded-full border border-border px-2.5 py-1 text-xs sm:text-sm">
                          <button
                            aria-label="Decrease quantity"
                            disabled={isMin}
                            className="disabled:opacity-40 p-0.5"
                            onClick={() => update(product.id, Math.max(1, quantity - 1))}
                          >
                            <Minus className="size-3 sm:size-4" />
                          </button>
                          <span className="font-semibold">{quantity}</span>
                          <button
                            aria-label="Increase quantity"
                            disabled={isMax}
                            className="disabled:opacity-40 p-0.5"
                            onClick={() => update(product.id, Math.min(max, quantity + 1))}
                          >
                            <Plus className="size-3 sm:size-4" />
                          </button>
                        </div>
                        {isMax && <span className="text-[11px] font-medium text-accent-foreground">{t('maxLimit')} ({max})</span>}
                        <button onClick={() => remove(product.id)} className="inline-flex items-center gap-1 text-xs sm:text-sm text-muted-foreground hover:text-destructive p-1">
                          <Trash2 className="size-3.5 sm:size-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </section>
            <aside className="h-fit rounded-3xl bg-card p-4 sm:p-6">
              <h2 className="font-serif text-xl sm:text-2xl">{t('orderSummary')}</h2>
              <div className="mt-5 sm:mt-6 flex flex-col gap-3.5 sm:gap-4 text-sm">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('deliveryFee')}</span>
                  <span>{delivery ? formatPrice(delivery) : t('freeDeliveryText')}</span>
                </div>
                <div className="border-t border-border pt-4 text-base font-semibold">
                  <div className="flex justify-between">
                    <span>{t('total')}</span>
                    <span>{formatPrice(subtotal + delivery)}</span>
                  </div>
                </div>
              </div>
              <Link href="/checkout" className="mt-6 block w-full rounded-full bg-primary px-5 py-3.5 text-center font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 hover:-translate-y-0.5">
                {t('continueToCheckout')}
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
