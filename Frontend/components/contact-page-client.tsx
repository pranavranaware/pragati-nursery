'use client'

import { useState } from 'react'
import { Breadcrumbs, CartDrawer, CatalogHeader } from '@/components/catalog'
import { Footer } from '@/components/footer'
import { useCart } from '@/components/cart-provider'
import { useLanguage } from '@/lib/language'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export function ContactPageClient() {
  const { t } = useLanguage()
  const [cartOpen, setCartOpen] = useState(false)
  const { count: cartCount, subtotal: cartTotal, items: cart, update, remove } = useCart()

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-foreground flex flex-col justify-between selection:bg-primary/15 selection:text-primary w-full max-w-full overflow-x-clip">
      <div>
        <CatalogHeader cartCount={cartCount} onCart={() => setCartOpen(true)} />
        {cartOpen && <CartDrawer items={cart} total={cartTotal} update={update} remove={remove} close={() => setCartOpen(false)} />}
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12 lg:px-8 lg:py-16">
          <Breadcrumbs items={['contactUs']} />

          {/* Green Hero Banner Container */}
          <section className="mt-6 sm:mt-8 rounded-[2rem] bg-[#0A3D14] text-white p-8 sm:p-12 shadow-2xl border border-white/10">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-[#D4A373]">{t('getInTouch')}</span>
            <h1 className="mt-2.5 font-serif text-3xl sm:text-5xl tracking-tight font-normal text-white">{t('contactUs')}</h1>
            <p className="mt-3.5 sm:mt-5 text-sm sm:text-base leading-relaxed text-[#FAF7F2]/85 max-w-2xl">
              {t('contactDesc')}
            </p>
          </section>

          <div className="mt-8 sm:mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                <MapPin className="size-6 text-[#D4A373]" />
              </div>
              <h3 className="font-serif text-xl font-normal text-foreground">{t('addressTitle')}</h3>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Pragati Nursery<br />
                Shahajirao Tanpure Farm,<br />
                Nandgaon Road, Vadgaon Tanpura,<br />
                Tal. Karjat, Dist. Ahilyanagar,<br />
                Maharashtra
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                <Mail className="size-6 text-[#D4A373]" />
              </div>
              <h3 className="font-serif text-xl font-normal text-foreground">{t('emailUsTitle')}</h3>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                <a href="mailto:info@pragatinursery.com" className="hover:text-[#0A3D14] transition-colors font-semibold break-all">
                  info@pragatinursery.com
                </a>
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                <Phone className="size-6 text-[#D4A373]" />
              </div>
              <h3 className="font-serif text-xl font-normal text-foreground">{t('phoneTitle')}</h3>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground">
                <a href="tel:9822101088" className="hover:text-[#0A3D14] transition-colors font-semibold">
                  +91 9822101088
                </a>
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-3xl border border-primary/20 bg-[#E8F5E9] p-6 shadow-xs transition-all hover:shadow-md hover:border-[#0A3D14]/40">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0A3D14] text-white mb-5 shadow-xs">
                <Clock className="size-6 text-[#D4A373]" />
              </div>
              <h3 className="font-serif text-xl font-normal text-foreground">{t('businessHoursTitle')}</h3>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {t('businessHoursText')}
              </p>
            </div>
          </div>

          <section className="mt-12 sm:mt-16 rounded-[2rem] bg-card border border-border/60 p-6 sm:p-10 shadow-xs">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal">{t('customerSupportTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground max-w-2xl">
              {t('customerSupportDesc')}
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  )
}
