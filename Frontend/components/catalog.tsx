'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Heart, Menu, Minus, Plus, Search, ShoppingBag, SlidersHorizontal, Star, Sun, Droplets, Sprout, X, Trash2, ChevronDown, User } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { categoryList, discountPercent, formatPrice, normalizeImages, products, getLocalizedName, getLocalizedDescription, getLocalizedCategoryName, type Category, type Product } from '@/types/product'
import { productService } from '@/services/productService'
import { categoryService } from '@/services/categoryService'
import { wishlistService } from '@/services/wishlistService'
import { getWishlistIds, toggleWishlistId } from '@/lib/wishlistStorage'
import { getAuthToken } from '@/lib/apiClient'
import { useCart, maxQuantity } from '@/components/cart-provider'
import { Footer } from '@/components/footer'
import { useLanguage, LanguageSwitcher } from '@/lib/language'

export function ShopShell({ initialProducts, categoryTitle, categoryDescription, categoryObj }: { initialProducts?: Product[]; categoryTitle?: string; categoryDescription?: string; categoryObj?: Category | null }) {
  const searchParams = useSearchParams()
  const urlSearch = searchParams?.get('search') || ''
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(initialProducts || [])
  const [categories, setCategories] = useState<Category[]>([{ name: 'All Plants', slug: 'all-plants', description: '', image: '' }])
  const [loading, setLoading] = useState(!initialProducts)
  const [query, setQuery] = useState(urlSearch)
  const [category, setCategory] = useState('All Plants')

  useEffect(() => {
    if (urlSearch) setQuery(urlSearch)
  }, [urlSearch])

  useEffect(() => {
    const sync = async () => {
      try {
        const prods = await productService.getProducts()
        if (Array.isArray(prods)) {
          setCatalogProducts(
            categoryTitle
              ? prods.filter(
                  (product) =>
                    product.category.toLowerCase() === categoryTitle.toLowerCase() ||
                    product.categorySlug.toLowerCase() === categoryTitle.toLowerCase()
                )
              : prods
          )
        }
        const cats = await categoryService.fetchAll()
        if (Array.isArray(cats)) {
          setCategories([{ name: 'All Plants', slug: 'all-plants', description: '', image: '' }, ...cats])
        }
      } catch (err) {
        console.warn('Catalog sync error:', err)
      } finally {
        setLoading(false)
      }
    }
    sync()
    window.addEventListener('pragati-products-changed', sync)
    return () => window.removeEventListener('pragati-products-changed', sync)
  }, [categoryTitle])

  const router = useRouter()
  const [sort, setSort] = useState('Popular')
  const [price, setPrice] = useState('Any price')
  const [availability, setAvailability] = useState('All stock')
  const [filterOpen, setFilterOpen] = useState(false)
  const [liked, setLiked] = useState<number[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { items: cart, count: cartCount, subtotal: cartTotal, add, update, remove } = useCart()

  useEffect(() => {
    setLiked(getWishlistIds())
    const syncWishlist = () => setLiked(getWishlistIds())
    window.addEventListener('pragati-wishlist-changed', syncWishlist)
    return () => window.removeEventListener('pragati-wishlist-changed', syncWishlist)
  }, [])

  const handleLike = (productId: number) => {
    toggleWishlistId(productId)
    setLiked(getWishlistIds())
  }

  const { lang, t } = useLanguage()

  const visible = useMemo(() => {
    const filtered = catalogProducts.filter((product) => {
      const pName = getLocalizedName(product, lang)
      const pCat = getLocalizedCategoryName(product, lang)
      const pDesc = getLocalizedDescription(product, lang)
      const matchesQuery = `${pName} ${pCat} ${pDesc} ${product.nameEn || ''} ${product.nameMr || ''} ${product.sku || ''}`.toLowerCase().includes(query.toLowerCase())
      const matchesCategory =
        category === 'All Plants' ||
        product.category.toLowerCase() === category.toLowerCase() ||
        product.categorySlug.toLowerCase() === category.toLowerCase()
      const matchesPrice = price === 'Any price' || (price === 'Under ₹300' ? product.price < 300 : price === '₹300–₹600' ? product.price >= 300 && product.price <= 600 : product.price > 600)
      const matchesAvailability = availability === 'All stock' || product.stock === availability
      return matchesQuery && matchesCategory && matchesPrice && matchesAvailability
    })
    return [...filtered].sort((a, b) => sort === 'Price: Low to High' ? a.price - b.price : sort === 'Price: High to Low' ? b.price - a.price : sort === 'Newest' ? b.id - a.id : a.id - b.id)
  }, [catalogProducts, query, category, price, availability, sort, lang])

  const addToCart = (product: Product, quantity = 1) => {
    const pName = getLocalizedName(product, lang)
    add(product, quantity)
    setFeedback(`${pName} ${t('addedToCart')}`)
    setCartOpen(true)
    window.setTimeout(() => setFeedback(''), 2400)
  }

  return <main className="min-h-screen bg-[#FAF7F2] text-foreground selection:bg-primary/15 selection:text-primary w-full max-w-full overflow-x-clip">
    <CatalogHeader cartCount={cartCount} onCart={() => setCartOpen(true)} />
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-8 sm:pb-10 pt-8 sm:pt-12 lg:px-8 lg:pt-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={categoryObj ? [t('shopPlants'), getLocalizedName(categoryObj, lang)] : categoryTitle ? [t('shopPlants'), t(categoryTitle)] : [t('shopPlants')]} />
          <span className="mt-5 sm:mt-7 text-xs font-bold uppercase tracking-[0.25em] text-primary block">{t('growYourCollection')}</span>
          <h1 className="mt-2 font-serif text-3xl sm:text-5xl lg:text-6xl tracking-tight font-normal">{categoryObj ? getLocalizedName(categoryObj, lang) : categoryTitle ? t(categoryTitle) : t('shopPlants')}</h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base leading-relaxed text-muted-foreground">{categoryObj ? getLocalizedDescription(categoryObj, lang) : categoryDescription || t('shopPlantsDesc')}</p>
        </div>
        <div className="w-full lg:max-w-sm">
          <label htmlFor="plant-search" className="sr-only">{t('searchPlaceholder')}</label>
          <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-background px-4 py-3 shadow-2xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15 transition-all">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input id="plant-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('searchPlaceholder')} className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground truncate" />
            {query && <button aria-label="Clear search" onClick={() => setQuery('')} className="shrink-0 p-0.5 hover:text-foreground"><X className="size-4 text-muted-foreground" /></button>}
          </div>
        </div>
      </div>
    </section>

    <section className="border-y border-primary/10 bg-[#F7F5F0]">
      <div className="mx-auto flex max-w-7xl gap-2.5 overflow-x-auto px-4 sm:px-6 py-3.5 lg:px-8 scrollbar-none">
        {categories.map((item) => {
          const catLabel = getLocalizedName(item, lang) || t(item.name);
          return (
            <button key={item.slug} onClick={() => setCategory(item.name)} className={`whitespace-nowrap rounded-full px-4.5 py-2 text-xs sm:text-sm font-bold transition-all ${category === item.name ? 'bg-[#0A3D14] text-white shadow-sm' : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'}`}>
              {catLabel}
            </button>
          )
        })}
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-4">
        <p className="text-sm text-muted-foreground font-medium"><span className="font-bold text-foreground">{visible.length}</span> {t('plantsFound')}</p>
        <div className="flex items-center gap-2">
          <button onClick={() => setFilterOpen(true)} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background px-4 py-2 text-xs sm:text-sm font-semibold lg:hidden shadow-2xs">
            <SlidersHorizontal className="size-3.5 sm:size-4 text-primary" /> {t('filters')}
          </button>
          <label htmlFor="sort" className="sr-only">{t('sortBy')}</label>
          <div className="relative">
            <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)} className="appearance-none rounded-full border border-primary/20 bg-background pl-4 pr-9 py-2 text-xs sm:text-sm font-semibold outline-none hover:border-primary/40 focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all cursor-pointer shadow-2xs">
              <option value="Popular">{t('popular')}</option>
              <option value="Newest">{t('newest')}</option>
              <option value="Price: Low to High">{t('priceLowHigh')}</option>
              <option value="Price: High to Low">{t('priceHighLow')}</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 size-3.5 -translate-y-1/2 pointer-events-none text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block border-r border-primary/10 pr-6">
          <FilterContent price={price} setPrice={setPrice} availability={availability} setAvailability={setAvailability} />
        </aside>
        <div className="min-w-0 flex-1">
          {loading && catalogProducts.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center text-muted-foreground font-serif text-xl">Loading...</div>
          ) : visible.length ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {visible.map((product) => (
                <ProductCard key={product.id} product={product} liked={liked.includes(product.id)} onLike={() => handleLike(product.id)} onAdd={() => addToCart(product)} />
              ))}
            </div>
          ) : (
            <EmptyState clear={() => { setQuery(''); setCategory('All Plants'); setPrice('Any price'); setAvailability('All stock') }} />
          )}
        </div>
      </div>
    </section>

    {filterOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button aria-label="Close filters" className="absolute inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setFilterOpen(false)} />
        <div className="absolute inset-x-0 bottom-0 rounded-t-[2rem] bg-[#FAF7F2] p-6 shadow-2xl max-h-[85vh] overflow-y-auto border-t border-primary/15">
          <div className="flex items-center justify-between border-b border-primary/10 pb-4">
            <h2 className="font-serif text-2xl font-normal">{t('filterTitle')}</h2>
            <button aria-label="Close filters" onClick={() => setFilterOpen(false)} className="p-2 rounded-full hover:bg-primary/5">
              <X className="size-5" />
            </button>
          </div>
          <FilterContent price={price} setPrice={setPrice} availability={availability} setAvailability={setAvailability} />
          <button onClick={() => setFilterOpen(false)} className="mt-6 w-full rounded-full bg-[#0A3D14] py-3.5 font-bold text-white shadow-md hover:bg-[#062A0D] transition-all">
            {t('showPlantsBtn')} ({visible.length})
          </button>
        </div>
      </div>
    )}

    {feedback && <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-[#0A3D14] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xl border border-white/10">{feedback}</div>}
    {cartOpen && <CartDrawer items={cart} total={cartTotal} update={update} remove={remove} close={() => setCartOpen(false)} />}
  </main>
}

export function CatalogHeader({ cartCount, onCart }: { cartCount: number; onCart: () => void }) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-[#0A3D14] px-4 py-2.5 text-center text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-[#FAF7F2]">{t('freeDeliveryBanner')}</div>
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-[#FAF7F2]/95 backdrop-blur-md text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3.5 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors lg:hidden">
              <Menu className="size-5" />
            </button>
            <Link href="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-90" title="Pragati Nursery - Home">
              <Image src="/pragati-nursery-logo.png" alt="Pragati Nursery Logo" width={160} height={90} className="h-8 w-auto object-contain sm:h-11" priority />
            </Link>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-semibold lg:flex">
            <Link href="/shop" className="text-primary font-bold">{t('Shop plants')}</Link>
            <Link href="/#categories" className="text-foreground/80 hover:text-primary transition-colors font-medium">{t('Collections')}</Link>
            <Link href="/#story" className="text-foreground/80 hover:text-primary transition-colors font-medium">{t('Our story')}</Link>
            <Link href="/#care" className="text-foreground/80 hover:text-primary transition-colors font-medium">{t('Plant care')}</Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            <LanguageSwitcher />
            <Link href="/account/wishlist" aria-label="Wishlist" className="rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors">
              <Heart className="size-5" />
            </Link>
            <Link href="/your-orders" aria-label="Your Orders" className="rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors">
              <User className="size-5" />
            </Link>
            <button onClick={onCart} aria-label="Open cart" className="relative rounded-full p-1.5 sm:p-2 hover:bg-primary/5 text-foreground transition-colors">
              <ShoppingBag className="size-5" />
              {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-[#0A3D14] text-[9px] font-bold text-white shadow-xs">{cartCount}</span>}
            </button>
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
              <Link href="/shop" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Shop plants')}</Link>
              <Link href="/#categories" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Collections')}</Link>
              <Link href="/#story" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Our story')}</Link>
              <Link href="/#care" onClick={() => setMenuOpen(false)} className="hover:text-[#0A3D14] transition-colors py-1">{t('Plant care')}</Link>
            </nav>
          </aside>
        </>
      )}
    </>
  )
}


export function Breadcrumbs({ items }: { items: string[] }) {
  const { t } = useLanguage();
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-muted-foreground overflow-x-auto scrollbar-none">
      <Link href="/" className="shrink-0 hover:text-foreground transition-colors">Home</Link>
      <span className="shrink-0 text-muted-foreground/60">/</span>
      {items.map((item, index) => (
        <span key={item} className={`shrink-0 flex items-center gap-2 ${index === items.length - 1 ? 'font-bold text-foreground' : ''}`}>
          {index > 0 && <span className="text-muted-foreground/60">/</span>}
          {t(item)}
        </span>
      ))}
    </nav>
  )
}

export function ProductCard({ product, liked, onLike, onAdd }: { product: Product; liked: boolean; onLike: () => void; onAdd: () => void }) {
  const { lang, t } = useLanguage()
  const discount = discountPercent(product)
  const productName = getLocalizedName(product, lang)
  const categoryName = getLocalizedCategoryName(product, lang)

  return (
    <article className="group flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-border/60 bg-card p-2.5 sm:p-3.5 transition-all duration-300 hover:shadow-lg hover:border-primary/30">
      <div>
        <div className="relative aspect-square overflow-hidden rounded-xl sm:rounded-2xl bg-muted border border-border/30">
          <Link href={`/products/${product.slug}`}>
            <Image
              src={(normalizeImages(product).find((image) => image.primary) || normalizeImages(product)[0]).src}
              alt={(normalizeImages(product).find((image) => image.primary) || normalizeImages(product)[0]).alt || productName}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          </Link>
          {product.badge && (
            <span className="absolute left-2.5 top-2.5 sm:left-3 sm:top-3 rounded-full bg-background/95 px-2.5 py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary shadow-xs border border-border/40 backdrop-blur-xs">
              {t(product.badge)}
            </span>
          )}
          <button onClick={onLike} aria-label={`Add ${productName} to wishlist`} className="absolute right-2.5 top-2.5 sm:right-3 sm:top-3 rounded-full bg-background/90 p-2 shadow-xs backdrop-blur-xs transition-transform hover:scale-110 active:scale-95">
            <Heart className={`size-3.5 sm:size-4 ${liked ? 'fill-accent text-accent' : 'text-foreground/70'}`} />
          </button>
          <button onClick={onAdd} disabled={product.stock === 'Out of Stock'} className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-3 sm:left-3 sm:right-3 rounded-full bg-primary py-2.5 sm:py-3 text-[11px] sm:text-xs font-bold text-primary-foreground shadow-md opacity-100 sm:opacity-0 transition-all duration-300 sm:group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100">
            {product.stock === 'Out of Stock' ? t('outOfStock') : t('addToCart')}
          </button>
        </div>
        <Link href={`/products/${product.slug}`} className="block pt-3 sm:pt-4 px-1">
          <h3 className="font-serif text-base sm:text-xl font-normal leading-snug truncate">{productName}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground font-medium">{categoryName}</p>
        </Link>
      </div>
      <div className="pt-2 px-1">
        <div className="flex items-baseline gap-2 text-xs sm:text-sm font-bold">
          <span className="text-primary">{formatPrice(product.price)}</span>
          {product.originalPrice && <del className="text-[11px] sm:text-xs font-normal text-muted-foreground">{formatPrice(product.originalPrice)}</del>}
          {discount > 0 && <span className="text-[9px] sm:text-[10px] font-bold text-primary">{discount}% OFF</span>}
        </div>
        <p className={`mt-1 text-[11px] font-semibold ${product.stock === 'Low Stock' ? 'text-accent-foreground' : 'text-primary'}`}>{t(product.stock)}</p>
      </div>
    </article>
  )
}

function FilterContent({ price, setPrice, availability, setAvailability }: { price: string; setPrice: (value: string) => void; availability: string; setAvailability: (value: string) => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col gap-6 pt-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">{t('priceRange')}</p>
        <div className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground font-medium">
          {[{ label: t('anyPrice'), val: 'Any price' }, { label: t('under300'), val: 'Under ₹300' }, { label: t('range300to600'), val: '₹300–₹600' }, { label: t('above600'), val: 'Above ₹600' }].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer hover:text-foreground transition-colors">
              <input type="radio" name="price" checked={price === val} onChange={() => setPrice(val)} className="accent-primary size-4" />
              {label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-foreground">{t('availability')}</p>
        <div className="mt-3 flex flex-col gap-2.5 text-sm text-muted-foreground font-medium">
          {[{ label: t('allStock'), val: 'All stock' }, { label: t('inStock'), val: 'In Stock' }, { label: t('lowStock'), val: 'Low Stock' }].map(({ label, val }) => (
            <label key={val} className="flex items-center gap-2.5 cursor-pointer hover:text-foreground transition-colors">
              <input type="radio" name="availability" checked={availability === val} onChange={() => setAvailability(val)} className="accent-primary size-4" />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ clear }: { clear: () => void }) {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
        <Sprout className="size-7" />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl font-normal">{t('noPlantsFound')}</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground leading-relaxed">{t('noPlantsDesc')}</p>
      <button onClick={clear} className="mt-6 rounded-full bg-primary px-6 py-3 text-xs sm:text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all">
        {t('browseAllPlants')}
      </button>
    </div>
  )
}

export function CartDrawer({
  items,
  total,
  update,
  remove,
  close,
}: {
  items: { product: Product; quantity: number }[]
  total: number
  update: (id: number, quantity: number) => void
  remove?: (id: number) => void
  close: () => void
}) {
  const { lang, t } = useLanguage()
  return (
    <div className="fixed inset-0 z-[100] motion-safe:animate-in motion-safe:fade-in">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-xs" onClick={close} />
      <aside
        aria-label="Shopping cart"
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background p-5 sm:p-6 shadow-2xl motion-safe:animate-in motion-safe:slide-in-from-right border-l border-border/60"
      >
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <h2 className="font-serif text-2xl font-normal">{t('yourBag')}</h2>
          <button aria-label="Close cart" onClick={close} className="rounded-full p-2 hover:bg-muted transition-colors">
            <X className="size-5" />
          </button>
        </div>
        {items.length ? (

          <>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto py-6">
              {items.map(({ product, quantity }) => {
                const max = maxQuantity(product)
                const isMax = max > 0 && quantity >= max
                const isMin = quantity <= 1
                const imgs = normalizeImages(product)
                const mainImg = imgs.find((image) => image.primary) || imgs[0]
                const imgSrc = mainImg?.src || '/placeholder.jpg'
                const pName = getLocalizedName(product, lang)

                return (
                  <div className="flex gap-3 border-b border-border/50 pb-4" key={product.id}>
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                      <Image
                        src={imgSrc}
                        alt={pName}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between">
                        <p className="font-serif text-lg leading-tight">{pName}</p>
                        {remove && (
                          <button
                            onClick={() => remove(product.id)}
                            className="text-muted-foreground hover:text-destructive p-1"
                            aria-label={`Remove ${pName}`}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-primary mt-1">{formatPrice(product.price)}</p>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          className="rounded-full border p-1 hover:bg-muted disabled:opacity-40"
                          aria-label={`Decrease ${product.name}`}
                          disabled={isMin}
                          onClick={() => update(product.id, Math.max(1, quantity - 1))}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-sm font-semibold px-1">{quantity}</span>
                        <button
                          className="rounded-full border p-1 hover:bg-muted disabled:opacity-40"
                          aria-label={`Increase ${product.name}`}
                          disabled={isMax}
                          onClick={() => update(product.id, Math.min(max, quantity + 1))}
                        >
                          <Plus className="size-3" />
                        </button>
                        {isMax && <span className="text-[10px] text-accent-foreground font-medium">{t('maxLimit')} ({max})</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-border pt-5">
              <div className="flex justify-between text-lg font-bold">
                <span>{t('total')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <Link
                href="/checkout"
                onClick={close}
                className="mt-4 block w-full rounded-full bg-primary py-3.5 text-center font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                {t('continueToCheckout')}
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingBag className="size-12 text-primary/40" />
            <p className="mt-4 font-serif text-2xl">{t('yourBagWaiting')}</p>
            <p className="mt-2 text-sm text-muted-foreground">{t('bagEmptyDesc')}</p>
            <Link
              href="/shop"
              onClick={close}
              className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md"
            >
              {t('continueShopping')}
            </Link>
          </div>
        )}
      </aside>
    </div>
  )
}

export function CareGuide({ care }: { care: Product['care'] }) {
  const { lang } = useLanguage()
  if (!care || !Array.isArray(care) || care.length === 0) return null

  const itemsToRender: { key: string; Icon: typeof Sun; label: string; value: string }[] = []

  for (const item of care) {
    const Icon = item.icon === 'sun' ? Sun : item.icon === 'water' ? Droplets : Sprout

    const rawLabel = lang === 'mr'
      ? (item.labelMr || item.labelEn || item.label)
      : (item.labelEn || item.label)

    const rawValue = lang === 'mr'
      ? (item.valueMr || item.valueEn || item.value)
      : (item.valueEn || item.value)

    const label = rawLabel && rawLabel.trim()
      ? rawLabel.trim()
      : (item.icon === 'sun'
          ? (lang === 'mr' ? 'सूर्यप्रकाशाची गरज' : 'Sunlight Requirement')
          : item.icon === 'water'
          ? (lang === 'mr' ? 'पाणी देण्याची गरज' : 'Watering Requirement')
          : (lang === 'mr' ? 'मातीची गरज' : 'Soil Requirement'))
    const value = rawValue && rawValue.trim() ? rawValue.trim() : ''

    if (value) {
      itemsToRender.push({
        key: String(item.id || item.icon || label),
        Icon,
        label,
        value,
      })
    }
  }

  if (itemsToRender.length === 0) return null

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      {itemsToRender.map((item) => (
        <div key={item.key} className="rounded-2xl border border-border bg-card p-5 min-w-0 h-full flex flex-col justify-between shadow-2xs">
          <item.Icon className="size-5 text-primary shrink-0" />
          <p className="mt-3.5 font-semibold text-foreground">{item.label}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground min-w-0 break-words whitespace-normal [overflow-wrap:anywhere]">{item.value}</p>
        </div>
      ))}
    </div>
  )
}
export function Rating({ value, count }: { value: number; count: number }) { return <div className="flex items-center gap-2 text-sm"><span className="flex items-center gap-1 text-accent-foreground"><Star className="size-4 fill-current" /> {value}</span><span className="text-muted-foreground">({count} reviews)</span></div> }
