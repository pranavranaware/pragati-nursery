'use client'

import { useState } from 'react'
import { Breadcrumbs, CartDrawer, CatalogHeader } from '@/components/catalog'
import { Footer } from '@/components/footer'
import { useCart } from '@/components/cart-provider'
import { useLanguage } from '@/lib/language'
import { policyTranslations } from '@/data/policy-translations'
import { Truck, Package } from 'lucide-react'

export default function ShippingPolicyPage() {
  const { lang } = useLanguage()
  const content = policyTranslations[lang].shippingPolicy
  const [cartOpen, setCartOpen] = useState(false)
  const { count: cartCount, subtotal: cartTotal, items: cart, update, remove } = useCart()

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <CatalogHeader cartCount={cartCount} onCart={() => setCartOpen(true)} />
        {cartOpen && <CartDrawer items={cart} total={cartTotal} update={update} remove={remove} close={() => setCartOpen(false)} />}
        
        <div className="mx-auto max-w-4xl px-3.5 sm:px-5 py-6 sm:py-8 lg:px-8 lg:py-12">
          <Breadcrumbs items={[content.breadcrumb]} />

          <header className="mt-6 sm:mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{content.category}</p>
            <h1 className="mt-2 sm:mt-3 font-serif text-3xl sm:text-5xl tracking-tight">{content.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{content.lastUpdated}</p>
          </header>

          {/* Highlights */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-start gap-4">
              <Truck className="size-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{content.freeDeliveryTitle}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {content.freeDeliveryDesc}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-start gap-4">
              <Package className="size-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">{content.packagingTitle}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {content.packagingDesc}
                </p>
              </div>
            </div>
          </div>

          <article className="mt-10 space-y-8 text-muted-foreground text-sm leading-7">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.chargesHeading}</h2>
              <p>{content.chargesIntro}</p>
              <div className="rounded-2xl border border-border bg-card p-5 text-foreground space-y-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="font-medium">{content.above999Label}</span>
                  <span className="font-bold text-primary">{content.above999Value}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-medium">{content.below999Label}</span>
                  <span className="font-bold text-foreground">{content.below999Value}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.locationsHeading}</h2>
              <p>{content.locationsText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.timelinesHeading}</h2>
              <p>{content.timelinesP1}</p>
              <p>{content.timelinesP2}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.receivingHeading}</h2>
              <p>{content.receivingText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.supportHeading}</h2>
              <p>{content.supportText}</p>
              <div className="rounded-2xl border border-border bg-card p-5 text-foreground">
                <p className="font-semibold">{content.supportBoxTitle}</p>
                <p>Email: <a href="mailto:info@pragatinursery.com" className="text-primary hover:underline font-medium">info@pragatinursery.com</a></p>
                <p>Phone: <a href="tel:9822101088" className="text-primary hover:underline font-medium">+91 9822101088</a></p>
              </div>
            </section>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}
