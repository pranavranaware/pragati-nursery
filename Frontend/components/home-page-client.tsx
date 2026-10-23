'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { productService } from '@/services/productService'
import { categoryService as canonicalCategoryService } from '@/services/categoryService'
import { wishlistService } from '@/services/wishlistService'
import { getWishlistIds, toggleWishlistId } from '@/lib/wishlistStorage'
import { getAuthToken } from '@/lib/apiClient'
import { formatMediaUrl, formatPrice, normalizeImages, getLocalizedName, getLocalizedDescription, getLocalizedCategoryName } from '@/types/product'
import { CartDrawer } from '@/components/catalog'
import { Footer } from '@/components/footer'
import { useCart } from '@/components/cart-provider'
import { useLanguage, LanguageSwitcher } from '@/lib/language'
import {
  ArrowRight,
  ChevronDown,
  Heart,
  Leaf,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Truck,
  User,
  X,
} from 'lucide-react'

export function HomePageClient() {
  const router = useRouter()
  const [homeProducts, setHomeProducts] = useState<any[]>([])
  const [homeCategories, setHomeCategories] = useState<any[]>([])
  const [rawCatalog, setRawCatalog] = useState<any[]>([])

  const { items: cart, count: cartCount, subtotal: cartTotal, add, update, remove } = useCart()
  const { lang, t } = useLanguage()

  useEffect(() => {
    const sync = async () => {
      try {
        const catalog = await productService.getProducts()
        if (Array.isArray(catalog)) {
          setRawCatalog(catalog)
          setHomeProducts(catalog)
        }
        const cats = await canonicalCategoryService.fetchAll()
        if (Array.isArray(cats)) {
          setHomeCategories(cats.slice(0, 4))
        }
      } catch (err) {
        console.warn('Home page catalog sync error:', err)
      }
    }
    sync()
    window.addEventListener('pragati-products-changed', sync)
    return () => window.removeEventListener('pragati-products-changed', sync)
  }, [])

  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [liked, setLiked] = useState<number[]>([])

  useEffect(() => {
    setLiked(getWishlistIds())
    const syncWishlist = () => setLiked(getWishlistIds())
    window.addEventListener('pragati-wishlist-changed', syncWishlist)
    return () => window.removeEventListener('pragati-wishlist-changed', syncWishlist)
  }, [])

  const toggleLiked = (id: number) => {
    toggleWishlistId(id)
    setLiked(getWishlistIds())
  }

  const searchSuggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return rawCatalog.filter((product) => {
      const pName = getLocalizedName(product, lang)
      const pCat = getLocalizedCategoryName(product, lang)
      return pName.toLowerCase().includes(q) || pCat.toLowerCase().includes(q) || (product.sku || '').toLowerCase().includes(q)
    }).slice(0, 5)
  }, [query, rawCatalog, lang])



  const handleAddProduct = (item: (typeof homeProducts)[0]) => {
    const matched = rawCatalog.find((p) => p.id === item.id)
    if (matched) {
      add(matched, 1)
    }
    setCartOpen(true)
  }

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-foreground selection:bg-[#0A3D14]/15 selection:text-[#0A3D14] w-full max-w-full overflow-x-clip">
      {/* Announcement Bar */}
      <div className="bg-[#0A3D14] px-4 py-2.5 text-center text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#FAF7F2]">
        {t('freeDeliveryBanner')}
      </div>

      {/* Header — Clean High-Contrast Branded Sticky Header */}
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-[#FAF7F2]/95 backdrop-blur-md text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3.5 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button className="lg:hidden p-1.5 sm:p-2 rounded-lg hover:bg-primary/5 text-foreground transition-colors" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              <Menu className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90" title="Pragati Nursery - Home">
              <Image src="/pragati-nursery-logo.png" alt="Pragati Nursery Logo" width={160} height={90} className="h-8 w-auto object-contain sm:h-11" priority />
            </Link>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-semibold tracking-wide lg:flex">
            <a href="/shop" className="text-foreground/85 hover:text-[#0A3D14] transition-colors font-medium py-1">{t('Shop plants')}</a>
            <a href="#categories" className="text-foreground/85 hover:text-[#0A3D14] transition-colors font-medium py-1">{t('Collections')}</a>
            <a href="#story" className="text-foreground/85 hover:text-[#0A3D14] transition-colors font-medium py-1">{t('Our story')}</a>
            <a href="#care" className="text-foreground/85 hover:text-[#0A3D14] transition-colors font-medium py-1">{t('Plant care')}</a>
          </nav>

          {/* Desktop Search Bar */}
          <div className="hidden sm:block relative min-w-0 sm:w-56 md:w-64">
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3.5 py-1.5 text-xs sm:text-sm focus-within:border-[#0A3D14] focus-within:ring-2 focus-within:ring-[#0A3D14]/15 transition-all text-foreground shadow-2xs">
              <Search className="size-3.5 sm:size-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground text-xs sm:text-sm truncate text-foreground"
              />
              {query && (
                <button onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="Clear search" className="shrink-0 p-0.5 hover:text-foreground">
                  <X className="size-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {searchOpen && searchSuggestions.length > 0 && (
              <div className="absolute right-0 top-full mt-2 z-50 rounded-2xl border border-primary/15 bg-[#FAF7F2] text-foreground p-3 shadow-2xl max-h-80 overflow-y-auto w-72 sm:w-80">
                <div className="flex justify-between items-center px-2 pb-2 mb-1 border-b border-primary/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('searchResults')} ({searchSuggestions.length})</span>
                  <button onClick={() => setSearchOpen(false)} className="text-xs text-[#0A3D14] font-semibold hover:underline">{t('close')}</button>
                </div>
                <div className="flex flex-col gap-1">
                  {searchSuggestions.map((product) => {
                    const pName = getLocalizedName(product, lang)
                    const pCat = getLocalizedCategoryName(product, lang)
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { setSearchOpen(false); setQuery(''); }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#E8F5E9] transition-colors group"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40">
                          <Image src={normalizeImages(product)[0]?.src || '/placeholder.jpg'} alt={pName} fill className="object-cover group-hover:scale-105 transition-transform" sizes="40px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-[#0A3D14] transition-colors">{pName}</p>
                          <p className="text-[11px] text-muted-foreground">{pCat}</p>
                        </div>
                        <span className="text-xs font-bold text-[#0A3D14] shrink-0">{formatPrice(product.price)}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Icons & Language Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Link href="/account/wishlist" aria-label="Wishlist" className="rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors">
              <Heart className="size-5" />
            </Link>
            <Link href="/your-orders" aria-label="Your Orders" className="rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors">
              <User className="size-5" />
            </Link>
            <button onClick={() => setCartOpen(true)} aria-label="Open cart" className="relative rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#0A3D14] text-[9px] font-bold text-white shadow-xs">{cartCount}</span>}
            </button>
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile Search Row — Positioned cleanly below top bar on mobile screens */}
        <div className="px-3 pb-2.5 pt-0.5 sm:hidden">
          <div className="relative w-full">
            <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-white px-3.5 py-1.5 text-xs focus-within:border-[#0A3D14] focus-within:ring-2 focus-within:ring-[#0A3D14]/15 transition-all text-foreground shadow-2xs">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted-foreground text-xs truncate text-foreground"
              />
              {query && (
                <button onClick={() => { setQuery(''); setSearchOpen(false); }} aria-label="Clear search" className="shrink-0 p-0.5 hover:text-foreground">
                  <X className="size-3 text-muted-foreground" />
                </button>
              )}
            </div>

            {searchOpen && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl border border-primary/15 bg-[#FAF7F2] text-foreground p-3 shadow-2xl max-h-72 overflow-y-auto w-full">
                <div className="flex justify-between items-center px-2 pb-2 mb-1 border-b border-primary/10">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('searchResults')} ({searchSuggestions.length})</span>
                  <button onClick={() => setSearchOpen(false)} className="text-xs text-[#0A3D14] font-semibold hover:underline">{t('close')}</button>
                </div>
                <div className="flex flex-col gap-1">
                  {searchSuggestions.map((product) => {
                    const pName = getLocalizedName(product, lang)
                    const pCat = getLocalizedCategoryName(product, lang)
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { setSearchOpen(false); setQuery(''); }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#E8F5E9] transition-colors group"
                      >
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted border border-border/40">
                          <Image src={normalizeImages(product)[0]?.src || '/placeholder.jpg'} alt={pName} fill className="object-cover group-hover:scale-105 transition-transform" sizes="40px" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold truncate group-hover:text-[#0A3D14] transition-colors">{pName}</p>
                          <p className="text-[11px] text-muted-foreground">{pCat}</p>
                        </div>
                        <span className="text-xs font-bold text-[#0A3D14] shrink-0">{formatPrice(product.price)}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs lg:hidden" onClick={() => setMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#FAF7F2] text-foreground p-6 shadow-2xl lg:hidden border-r border-primary/10">
            <div className="flex items-center justify-between border-b border-primary/10 pb-4">
              <Link href="/" onClick={() => setMenuOpen(false)}>
                <Image src="/pragati-nursery-logo.png" alt="Pragati Nursery Logo" width={140} height={80} className="h-9 w-auto object-contain" />
              </Link>
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-2 rounded-full hover:bg-primary/5 text-foreground">
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-5 text-lg font-serif">
              <a href="/shop" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Shop plants')}</a>
              <a href="#categories" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Collections')}</a>
              <a href="#story" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Our story')}</a>
              <a href="#care" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Plant care')}</a>
            </nav>
          </aside>
        </>
      )}

      {/* Hero Section — High-Contrast Fresh Natural Composition */}
      <section id="top" className="relative border-b border-primary/10 bg-[#FAF7F2] text-foreground overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-8 lg:gap-12 px-4 sm:px-6 py-10 sm:py-16 lg:grid-cols-[1fr_1fr] lg:items-center lg:px-8 lg:py-20">
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0A3D14]/25 bg-[#E8F5E9] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#0A3D14] mb-5 sm:mb-6">
              <Sparkles className="size-3.5 text-[#0A3D14]" /> {t('grownInPune')}
            </div>
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl leading-[1.06] tracking-tight text-foreground font-normal">
              {t('heroTitleLine1')}<span className="text-[#0A3D14] italic font-serif font-normal">{t('heroTitleItalic')}</span>{t('heroTitleLine2')}
            </h1>
            <p className="mt-5 max-w-xl text-sm sm:text-base sm:leading-relaxed text-muted-foreground font-normal">
              {t('heroSubtitle')}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a href="/shop" className="inline-flex items-center gap-2.5 rounded-full bg-[#0A3D14] px-7 py-4 text-xs sm:text-sm font-bold tracking-wide text-white transition-all hover:bg-[#062A0D] hover:shadow-lg hover:-translate-y-0.5">
                {t('shopPlants')} <ArrowRight className="size-4" />
              </a>
              <a href="#categories" className="inline-flex items-center gap-2.5 rounded-full border border-[#0A3D14]/30 bg-transparent px-7 py-4 text-xs sm:text-sm font-bold tracking-wide text-[#0A3D14] transition-all hover:bg-[#E8F5E9]">
                {t('exploreCollections')}
              </a>
            </div>
            <div className="mt-10 sm:mt-14 flex items-center gap-8 border-t border-primary/15 pt-6">
              <div>
                <span className="block font-serif text-3xl font-normal text-foreground">10k+</span>
                <span className="text-xs text-muted-foreground font-medium">{t('statParents')}</span>
              </div>
              <div className="h-10 w-px bg-primary/15" />
              <div>
                <span className="block font-serif text-3xl font-normal text-foreground">4.9/5</span>
                <span className="text-xs text-muted-foreground font-medium">{t('statReviews')}</span>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2 min-h-[340px] sm:min-h-[500px] lg:min-h-[560px] overflow-hidden rounded-[2rem] border border-primary/15 shadow-xl bg-muted group">
            <Image src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=1400&q=90" alt="Lush green houseplants in a sunlit room" fill priority className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" sizes="(max-width: 1024px) 100vw, 50vw" />
            <div className="absolute bottom-5 left-5 right-5 sm:right-auto sm:bottom-8 sm:left-8 rounded-2xl bg-white/95 p-4 sm:p-5 backdrop-blur-md border border-primary/15 shadow-xl max-w-xs text-foreground">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('plantOfTheWeek')}</p>
              <p className="mt-1 font-serif text-xl text-foreground font-normal">Monstera Deliciosa</p>
              <p className="mt-1 text-xs font-bold text-[#0A3D14]">{t('fromPrice')} ₹499</p>
            </div>
          </div>
        </div>
      </section>

      {/* "Why Pragati Nursery" — Fresh Natural Green Feature Panel */}
      <section className="border-b border-white/10 bg-[#0A3D14] text-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4A373]">WHY CHOOSE US</span>
              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl font-normal leading-tight text-white">
                Cultivated with Care, Delivered Fresh
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[#FAF7F2]/85 max-w-md">
                We take pride in providing robust, healthy plants directly from our nursery to your home.
              </p>
            </div>

            <div className="flex flex-col border-t border-white/20">
              <div className="flex gap-6 py-6 border-b border-white/20 items-start">
                <span className="font-serif text-3xl font-normal text-[#D4A373] shrink-0">01</span>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-normal text-white">Safe Doorstep Delivery</h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#FAF7F2]/85 leading-relaxed">Specially packed with protective eco-materials to arrive healthy and stress-free.</p>
                </div>
                <Truck className="size-6 text-[#D4A373] shrink-0 hidden sm:block" />
              </div>

              <div className="flex gap-6 py-6 border-b border-white/20 items-start">
                <span className="font-serif text-3xl font-normal text-[#D4A373] shrink-0">02</span>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-normal text-white">Nursery Fresh Plants</h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#FAF7F2]/85 leading-relaxed">Directly grown and nurtured by our experienced local horticulturists.</p>
                </div>
                <Leaf className="size-6 text-[#D4A373] shrink-0 hidden sm:block" />
              </div>

              <div className="flex gap-6 py-6 border-b border-white/20 items-start">
                <span className="font-serif text-3xl font-normal text-[#D4A373] shrink-0">03</span>
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-normal text-white">Care Support Included</h3>
                  <p className="mt-1 text-xs sm:text-sm text-[#FAF7F2]/85 leading-relaxed">Detailed plant care instructions and expert advice available for every plant.</p>
                </div>
                <Sparkles className="size-6 text-[#D4A373] shrink-0 hidden sm:block" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Collection Section — Light Green Background */}
      <section id="categories" className="py-16 sm:py-24 bg-[#E8F5E9] border-b border-[#0A3D14]/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#0A3D14]/20 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#0A3D14]">{t('exploreCollections')}</span>
              <h2 className="mt-2 font-serif text-3xl sm:text-5xl font-normal tracking-tight text-foreground">{t('collections')}</h2>
            </div>
            <a href="/shop" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0A3D14] hover:underline">
              {t('viewAll')} <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeCategories.map((category) => {
              const catName = getLocalizedName(category, lang) || t(category.name);
              return (
                <a href="/shop" key={category.id || category.slug || category.name} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#0A3D14]/20 bg-white shadow-sm transition-all duration-500 hover:shadow-xl">
                    <Image src={formatMediaUrl(category.image)} alt={catName} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#062A0D]/90 via-[#062A0D]/25 to-transparent transition-opacity duration-300 group-hover:opacity-95" />
                    <div className="absolute bottom-5 left-5 right-5 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4A373] block mb-1">COLLECTION</span>
                      <h3 className="font-serif text-2xl font-normal leading-tight">{catName}</h3>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Plants Product Grid */}
      <section id="shop" className="py-16 sm:py-24 bg-[#FAF7F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-primary/15 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#0A3D14]">{t('lovedByParents')}</span>
              <h2 className="mt-2 font-serif text-3xl sm:text-5xl font-normal tracking-tight text-foreground">{t('popularRightNow')}</h2>
            </div>
            <a href="/shop" className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0A3D14] hover:underline">
              {t('viewAll')} <ArrowRight className="size-4" />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {homeProducts.map((product: any) => {
              const pName = getLocalizedName(product, lang);
              const pCat = getLocalizedCategoryName(product, lang);
              const pImg = normalizeImages(product)[0]?.src || '';
              return (
                <article key={product.id} className="group flex flex-col justify-between border border-primary/15 rounded-2xl bg-white p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:border-[#0A3D14]/40">
                  <div>
                    <div className="relative aspect-square overflow-hidden rounded-xl bg-muted border border-primary/10">
                      <Image src={pImg} alt={pName} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 50vw, 25vw" />
                      {product.badge && (
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-[#0A3D14] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs border border-white/20">
                          {t(product.badge)}
                        </span>
                      )}
                      <button aria-label={`Add ${pName} to wishlist`} onClick={() => toggleLiked(product.id)} className="absolute right-2.5 top-2.5 rounded-full bg-white/90 p-2 shadow-2xs backdrop-blur-xs transition-transform hover:scale-110 active:scale-95">
                        <Heart className={`size-4 ${liked.includes(product.id) ? 'fill-accent text-accent' : 'text-foreground/70'}`} />
                      </button>
                      <button onClick={() => handleAddProduct(product)} className="absolute bottom-2.5 left-2.5 right-2.5 rounded-full bg-[#0A3D14] py-2.5 text-xs font-bold text-white shadow-md opacity-100 sm:opacity-0 transition-all duration-300 sm:group-hover:opacity-100 hover:bg-[#062A0D]">
                        {t('addToCart')}
                      </button>
                    </div>
                    <div className="pt-3 sm:pt-4">
                      <h3 className="font-serif text-base sm:text-xl font-normal leading-snug truncate">{pName}</h3>
                      <p className="mt-1 text-xs text-muted-foreground font-medium">{pCat}</p>
                    </div>
                  </div>
                  <div className="pt-3 flex items-center justify-between border-t border-primary/10 mt-3">
                    <div className="flex items-baseline gap-2 text-xs sm:text-sm font-bold">
                      <span className="text-[#0A3D14] text-base">{formatPrice(product.price)}</span>
                      {product.originalPrice && <del className="text-[11px] font-normal text-muted-foreground">{formatPrice(product.originalPrice)}</del>}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {homeProducts.length === 0 && <p className="py-16 text-center text-muted-foreground font-serif text-xl">{t('noPlantsFound')}</p>}
        </div>
      </section>

      {/* Nursery / Agricultural Story Section — Light Green Background Split */}
      <section id="story" className="py-16 sm:py-24 bg-[#E8F5E9] border-b border-[#0A3D14]/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative min-h-[300px] sm:min-h-[460px] overflow-hidden rounded-[2rem] border border-[#0A3D14]/20 shadow-xl bg-muted">
              <Image src="/our-story.jpg" alt="Hands caring for a young plant" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
            </div>
            <div className="rounded-[2rem] bg-[#0A3D14] text-[#FAF7F2] p-8 sm:p-12 shadow-2xl border border-white/10">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4A373]">{t('greenerWayToLive')}</span>
              <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-normal leading-tight text-white">{t('storyHeading')}</h2>
              <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#FAF7F2]/85">{t('storyText')}</p>
              <a href="#care" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#D4A373] hover:text-white transition-colors">
                {t('meetOurGrowers')} <ArrowRight className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Care / Call-to-Action Section */}
      <section id="care" className="bg-[#0A3D14] text-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#D4A373]">{t('needHelp')}</span>
            <h2 className="mt-2 font-serif text-3xl sm:text-5xl font-normal leading-tight max-w-2xl text-white">{t('expertHeading')}</h2>
          </div>
          <a href="tel:9822101088" className="inline-flex max-w-full items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-[#FAF7F2] px-5 sm:px-7 py-3.5 sm:py-4 text-xs sm:text-sm font-bold text-[#0A3D14] shadow-xl transition-all hover:bg-white hover:-translate-y-0.5 text-center">
            <span className="truncate">{t('talkToExpert')}</span> <ArrowRight className="size-4 shrink-0" />
          </a>
        </div>
      </section>

      <Footer />

      {cartOpen && <CartDrawer items={cart} total={cartTotal} update={update} remove={remove} close={() => setCartOpen(false)} />}
    </main>
  )
}
