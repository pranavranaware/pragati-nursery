'use client'

import { useState } from 'react'
import { Breadcrumbs, CartDrawer, CatalogHeader } from '@/components/catalog'
import { Footer } from '@/components/footer'
import { useCart } from '@/components/cart-provider'
import { useLanguage } from '@/lib/language'
import { policyTranslations } from '@/data/policy-translations'

export default function TermsAndConditionsPage() {
  const { lang } = useLanguage()
  const content = policyTranslations[lang].termsAndConditions
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

          <article className="mt-10 space-y-8 text-muted-foreground text-sm leading-7">
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.overviewHeading}</h2>
              <p>{content.overviewText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.variationsHeading}</h2>
              <p>{content.variationsText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.pricingHeading}</h2>
              <p>{content.pricingText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.ordersHeading}</h2>
              <p>{content.ordersText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.paymentsHeading}</h2>
              <p>{content.paymentsText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.responsibilitiesHeading}</h2>
              <p>{content.responsibilitiesText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.liabilityHeading}</h2>
              <p>{content.liabilityText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.contactHeading}</h2>
              <p>{content.contactText}</p>
              <div className="rounded-2xl border border-border bg-card p-5 text-foreground leading-6">
                <p className="font-semibold">Pragati Nursery</p>
                <p>Shahajirao Tanpure Farm, Nandgaon Road, Vadgaon Tanpura, Tal. Karjat, Dist. Ahilyanagar, Maharashtra</p>
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
