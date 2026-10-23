'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag, Video } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Breadcrumbs, CartDrawer, CatalogHeader, CareGuide, ProductCard, Rating } from '@/components/catalog'
import { getLocalizedName, getLocalizedDescription, getLocalizedCategoryName, discountPercent, formatMediaUrl, formatPrice } from '@/types/product'
import { useCart } from '@/components/cart-provider'
import { isInWishlist, toggleWishlistId } from '@/lib/wishlistStorage'
import { useLanguage } from '@/lib/language'
import type { Product } from '@/types/product'

export function ProductViewClient({ product, related }: { product: Product; related: Product[] }) {
  const router = useRouter()
  const { lang, t } = useLanguage()
  const productName = getLocalizedName(product, lang)
  const productDesc = getLocalizedDescription(product, lang)
  const categoryName = getLocalizedCategoryName(product, lang)
  const [active, setActive] = useState(Math.max(0, product.images.findIndex((image) => image.primary || image.isPrimary)))
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [feedback, setFeedback] = useState(false)
  const { items: cart, count: cartCount, subtotal: cartTotal, add, update, remove } = useCart()
  const discount = discountPercent(product)
  const outOfStock = product.stock === 'Out of Stock'

  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  useEffect(() => {
    if (product) {
      setLiked(isInWishlist(product.id))
    }
    const syncWishlist = () => {
      if (product) setLiked(isInWishlist(product.id))
    }
    window.addEventListener('pragati-wishlist-changed', syncWishlist)
    return () => window.removeEventListener('pragati-wishlist-changed', syncWishlist)
  }, [product])

  const toggleWishlist = () => {
    if (!product) return
    toggleWishlistId(product.id)
    setLiked(isInWishlist(product.id))
  }

  const addToCart = () => {
    if (outOfStock) return
    add(product, quantity)
    setFeedback(true)
    setCartOpen(true)
    window.setTimeout(() => setFeedback(false), 2400)
  }

  const handleBuyNow = async () => {
    if (outOfStock) return
    await add(product, quantity)
    router.push('/checkout')
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-foreground selection:bg-primary/15 selection:text-primary w-full max-w-full overflow-x-clip">
      <CatalogHeader cartCount={cartCount} onCart={() => setCartOpen(true)} />
      {cartOpen && <CartDrawer items={cart} total={cartTotal} update={update} remove={remove} close={() => setCartOpen(false)} />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10 lg:px-8 lg:py-14">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Breadcrumbs items={['Shop', categoryName, productName]} />
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background px-4 py-1.5 text-xs font-bold text-primary hover:bg-primary/5 transition shadow-2xs cursor-pointer">
            {t('goBack')}
          </button>
        </div>
        <section className="mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            {(() => {
              const hasVideo = Boolean(product.videoUrl || (product.video && product.video.source !== 'NONE' && product.video.url))
              const rawUrl = product.videoUrl || product.video?.url
              const formattedUrl = rawUrl ? formatMediaUrl(rawUrl) : ''
              const isDirectVideo = rawUrl?.endsWith('.mp4') || rawUrl?.startsWith('/uploads/') || product.video?.source === 'UPLOAD'
              const totalMedia = product.images.length + (hasVideo ? 1 : 0)
              const isVideoActive = hasVideo && active === product.images.length

              const handleTouchStart = (e: React.TouchEvent) => {
                touchStartX.current = e.touches[0].clientX
                touchStartY.current = e.touches[0].clientY
              }

              const handleTouchEnd = (e: React.TouchEvent) => {
                if (touchStartX.current === null || touchStartY.current === null) return
                const deltaX = e.changedTouches[0].clientX - touchStartX.current
                const deltaY = e.changedTouches[0].clientY - touchStartY.current
                const absX = Math.abs(deltaX)
                const absY = Math.abs(deltaY)

                if (absX > absY && absX > 40) {
                  if (deltaX < 0) {
                    if (active < totalMedia - 1) {
                      setActive((prev) => Math.min(totalMedia - 1, prev + 1))
                    }
                  } else {
                    if (active > 0) {
                      setActive((prev) => Math.max(0, prev - 1))
                    }
                  }
                }
                touchStartX.current = null
                touchStartY.current = null
              }

              return (
                <>
                  <div
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="relative aspect-square overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-muted flex items-center justify-center touch-pan-y select-none"
                  >
                    {isVideoActive ? (
                      isDirectVideo ? (
                        <div className="w-full h-full max-w-[360px] aspect-[9/16] overflow-hidden rounded-xl bg-black flex items-center justify-center">
                          <video
                            src={formattedUrl}
                            controls
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-6 text-center">
                          <a href={formattedUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                            <Video className="size-5" /> {t('watchVideo')}
                          </a>
                        </div>
                      )
                    ) : (
                      <Image
                        src={product.images[active]?.src || ''}
                        alt={product.images[active]?.alt || productName}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 55vw"
                      />
                    )}

                    {totalMedia > 1 && (
                      <>
                        <button
                          aria-label="Previous media"
                          onClick={() => setActive((active - 1 + totalMedia) % totalMedia)}
                          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full border border-border/70 bg-background/90 shadow-md backdrop-blur-md flex items-center justify-center transition hover:bg-background hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-20 cursor-pointer"
                        >
                          <ChevronLeft className="size-4 sm:size-5 text-foreground" />
                        </button>
                        <button
                          aria-label="Next media"
                          onClick={() => setActive((active + 1) % totalMedia)}
                          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 size-9 sm:size-11 rounded-full border border-border/70 bg-background/90 shadow-md backdrop-blur-md flex items-center justify-center transition hover:bg-background hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary z-20 cursor-pointer"
                        >
                          <ChevronRight className="size-4 sm:size-5 text-foreground" />
                        </button>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {product.images.map((image, index) => (
                      <button
                        key={image.src}
                        aria-label={`View image ${index + 1}`}
                        onClick={() => setActive(index)}
                        className={`relative size-16 sm:size-20 shrink-0 aspect-square overflow-hidden rounded-xl sm:rounded-2xl border transition cursor-pointer ${
                          active === index ? 'ring-2 ring-primary ring-offset-2 border-primary shadow-xs' : 'opacity-70 hover:opacity-100 border-border/70'
                        }`}
                      >
                        <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="80px" />
                      </button>
                    ))}

                    {hasVideo && (
                      <button
                        aria-label="View plant video"
                        onClick={() => setActive(product.images.length)}
                        className={`relative size-16 sm:size-20 shrink-0 aspect-square overflow-hidden rounded-xl sm:rounded-2xl border flex flex-col items-center justify-center gap-1 bg-card transition cursor-pointer ${
                          active === product.images.length ? 'ring-2 ring-primary ring-offset-2 border-primary bg-primary/10' : 'opacity-70 hover:opacity-100 border-border/70'
                        }`}
                      >
                        <Video className="size-5 sm:size-6 text-primary" />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary">Video</span>
                      </button>
                    )}
                  </div>

                  {/* Plant Information section directly below media gallery */}
                  <div className="mt-8 sm:mt-10 border-t border-border/70 pt-6 sm:pt-8">
                    <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground">{t('plantInformation')}</h2>
                    <div className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-3.5 sm:grid-cols-3">
                      {product.info.map((item) => (
                        <div key={item.label} className="rounded-2xl bg-card p-3.5 sm:p-4 border border-border/60 shadow-xs">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{t(item.label)}</p>
                          <p className="mt-1 text-xs sm:text-sm font-semibold leading-relaxed text-foreground">{t(item.value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )
            })()}
          </div>

          <div className="flex flex-col justify-center">
            <Link href={`/shop/${product.categorySlug}`} className="text-xs font-bold uppercase tracking-[0.2em] text-primary hover:underline">{categoryName}</Link>
            <div className="mt-3 sm:mt-4 flex items-start justify-between gap-3">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl leading-tight tracking-tight text-balance font-normal">{productName}</h1>
              <button aria-label={`Add ${productName} to wishlist`} onClick={toggleWishlist} className="shrink-0 rounded-full border border-border/80 bg-card p-3 shadow-xs hover:border-primary/50 transition-all">
                <Heart className={`size-5 ${liked ? 'fill-accent text-accent' : 'text-foreground/70'}`} />
              </button>
            </div>
            <div className="mt-4 sm:mt-5"><Rating value={product.rating} count={product.reviewCount} /></div>
            <div className="mt-4 sm:mt-5 flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
              {product.originalPrice && <del className="text-sm sm:text-base text-muted-foreground">{formatPrice(product.originalPrice)}</del>}
              {discount > 0 && <span className="rounded-full bg-secondary/80 px-3 py-1 text-xs font-bold text-secondary-foreground">{discount}% OFF</span>}
            </div>
            <p className={`mt-3 sm:mt-4 text-xs sm:text-sm font-semibold ${product.stock === 'Low Stock' ? 'text-accent-foreground' : 'text-primary'}`}>✓ {t(product.stock)}</p>
            <p className="mt-4 sm:mt-5 max-w-lg text-sm sm:text-base leading-relaxed text-muted-foreground">{productDesc}</p>
            <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 sm:gap-4 rounded-full border border-border/80 bg-card px-4 py-3 shadow-xs">
                <button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-0.5 hover:text-primary transition-colors"><Minus className="size-4" /></button>
                <span className="min-w-4 text-center text-sm font-bold">{quantity}</span>
                <button aria-label="Increase quantity" onClick={() => setQuantity(quantity + 1)} className="p-0.5 hover:text-primary transition-colors"><Plus className="size-4" /></button>
              </div>
              <button onClick={addToCart} disabled={outOfStock} className="flex min-w-36 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
                <ShoppingBag className="size-4 shrink-0" /> <span className="truncate">{outOfStock ? t('outOfStock') : feedback ? t('addedToCart') : t('addToCart')}</span>
              </button>
              <button onClick={handleBuyNow} disabled={outOfStock} className="rounded-full border border-primary/40 bg-card px-6 py-3.5 text-xs sm:text-sm font-bold text-primary shadow-xs hover:bg-primary/10 transition-all">{t('buyNow')}</button>
            </div>
            <p className="mt-4 sm:mt-5 text-xs text-muted-foreground font-medium">{t('freeDeliveryDetail')}</p>
          </div>
        </section>

        <section className="mt-16 grid gap-10 lg:grid-cols-2 border-t border-border/60 pt-12">
          <div>
            <h2 className="font-serif text-3xl font-normal">{t('description')}</h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground text-sm sm:text-base">{productDesc}</p>
          </div>
          <div>
            <h2 className="font-serif text-3xl font-normal">{t('careGuide')}</h2>
            <div className="mt-5">
              <CareGuide care={product.care} />
            </div>
          </div>
        </section>

        {/* Talk to Expert section */}
        <section className="mt-14 rounded-[2rem] bg-primary px-6 py-8 text-primary-foreground sm:px-10 shadow-xl border border-primary-foreground/10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground/70">{t('needHelp')}</span>
              <h3 className="mt-2 font-serif text-3xl font-normal sm:text-4xl">{t('expertHeading')}</h3>
              <p className="mt-2 max-w-xl text-sm text-primary-foreground/80 leading-relaxed">{t('expertSubtitle')}</p>
            </div>
            <a
              href="tel:9822101088"
              className="inline-flex max-w-full items-center justify-center gap-2 sm:gap-2.5 rounded-full bg-background px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-primary shadow-md hover:bg-background/90 transition-all text-center"
            >
              <span className="truncate">{t('talkToExpert')}</span> <ArrowRight className="size-4 shrink-0" />
            </a>
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-20 border-t border-border/60 pt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{t('keepGrowing')}</span>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal">{t('youMayAlsoLike')}</h2>
              </div>
              <Link href={`/shop/${product.categorySlug}`} className="hidden items-center gap-2 text-sm font-bold text-primary hover:underline sm:flex">
                {t('viewCategory')} <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3.5 sm:gap-6 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} liked={false} onLike={() => {}} onAdd={() => add(item)} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export function ProductNotFound() {
  const { t } = useLanguage()
  return (
    <main className="min-h-screen bg-background">
      <CatalogHeader cartCount={0} onCart={() => {}} />
      <div className="mx-auto flex max-w-7xl flex-col items-center px-5 py-28 text-center">
        <h1 className="font-serif text-5xl">{t('plantNotFoundTitle')}</h1>
        <p className="mt-4 text-muted-foreground">{t('plantNotFoundDesc')}</p>
        <Link href="/shop" className="mt-7 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
          {t('shopPlants')}
        </Link>
      </div>
    </main>
  )
}
