'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Breadcrumbs, CartDrawer, CatalogHeader } from '@/components/catalog'
import { Footer } from '@/components/footer'
import { useCart } from '@/components/cart-provider'
import { useLanguage } from '@/lib/language'
import { ArrowRight, Leaf, Sparkles, Truck } from 'lucide-react'

export function AboutPageClient() {
  const { t } = useLanguage()
  const [cartOpen, setCartOpen] = useState(false)
  const { count: cartCount, subtotal: cartTotal, items: cart, update, remove } = useCart()

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-foreground flex flex-col justify-between selection:bg-primary/15 selection:text-primary w-full max-w-full overflow-x-clip">
      <div>
        <CatalogHeader cartCount={cartCount} onCart={() => setCartOpen(true)} />
        {cartOpen && <CartDrawer items={cart} total={cartTotal} update={update} remove={remove} close={() => setCartOpen(false)} />}
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8 lg:py-16">
          <Breadcrumbs items={['aboutUs']} />

          {/* Green Hero Banner Container */}
          <section className="mt-6 sm:mt-8 rounded-[2rem] bg-[#0A3D14] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-white/10 overflow-hidden">
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A373]">{t('aboutSubtitle')}</span>
                <h1 className="mt-3 font-serif text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-tight font-normal text-white">
                  {t('aboutHeadline')}
                </h1>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-relaxed text-[#FAF7F2]/85 max-w-xl">
                  {t('aboutBody')}
                </p>
                <div className="mt-7 sm:mt-9 flex flex-wrap gap-3 sm:gap-4">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2.5 rounded-full bg-[#FAF7F2] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#0A3D14] shadow-md transition-all hover:bg-white hover:-translate-y-0.5"
                  >
                    {t('shopPlants')} <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-transparent px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-white/10 transition-all"
                  >
                    {t('contactUs')}
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[280px] overflow-hidden rounded-[1.75rem] bg-muted sm:min-h-[420px] sm:rounded-[2rem] border border-white/20 shadow-xl">
                <Image
                  src="/our-story.jpg"
                  alt="Hands caring for a young plant in nursery"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>
          </section>

          <section className="mt-16 sm:mt-24 border-t border-primary/15 pt-12 sm:pt-16">
            <h2 className="font-serif text-3xl sm:text-4xl text-center font-normal text-foreground">{t('ourStory')}</h2>
            <div className="mt-8 sm:mt-12 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 sm:p-8 text-center shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
                <div className="mx-auto flex size-13 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                  <Leaf className="size-6 text-[#D4A373]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">{t('grownInPune')}</h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('heroSubtitle')}
                </p>
              </div>

              <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 sm:p-8 text-center shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
                <div className="mx-auto flex size-13 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                  <Truck className="size-6 text-[#D4A373]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">{t('freeDeliveryText')}</h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('freeDeliveryDetail')}
                </p>
              </div>

              <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 sm:p-8 text-center shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
                <div className="mx-auto flex size-13 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                  <Sparkles className="size-6 text-[#D4A373]" />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-foreground">{t('plantCare')}</h3>
                <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {t('expertSubtitle')}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16 sm:mt-20 rounded-[2rem] bg-[#0A3D14] px-6 py-10 text-white sm:px-12 shadow-2xl border border-white/10">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4A373]">{t('needHelp')}</span>
                <h3 className="mt-2 font-serif text-3xl font-normal sm:text-4xl text-white">{t('expertHeading')}</h3>
                <p className="mt-2 max-w-xl text-sm text-[#FAF7F2]/85 leading-relaxed">{t('expertSubtitle')}</p>
              </div>
              <a
                href="tel:9822101088"
                className="inline-flex shrink-0 items-center gap-2.5 rounded-full bg-[#FAF7F2] px-6 py-3.5 text-sm font-bold text-[#0A3D14] shadow-md hover:bg-white transition-all"
              >
                {t('talkToExpert')} <ArrowRight className="size-4" />
              </a>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
