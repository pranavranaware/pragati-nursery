'use client'

import { useState } from 'react'
import { Breadcrumbs, CartDrawer, CatalogHeader } from '@/components/catalog'
import { Footer } from '@/components/footer'
import { useCart } from '@/components/cart-provider'
import { useLanguage } from '@/lib/language'
import { policyTranslations } from '@/data/policy-translations'

export default function CancellationRefundPolicyPage() {
  const { lang } = useLanguage()
  const content = policyTranslations[lang].cancellationRefundPolicy
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
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.cancellationHeading}</h2>
              <p>
                {lang === 'mr' ? (
                  <>
                    ग्राहक <a href="mailto:info@pragatinursery.com" className="text-primary hover:underline font-medium">info@pragatinursery.com</a> किंवा <a href="tel:9822101088" className="text-primary hover:underline font-medium">+91 9822101088</a> वर आमच्या ग्राहक मदत टीमशी संपर्क साधून ऑर्डर डिस्पॅच होण्यापूर्वी त्यांची ऑर्डर रद्द करण्याची विनंती करू शकतात.
                  </>
                ) : (
                  <>
                    Customers may request cancellation of their order prior to order dispatch by contacting our customer support team at <a href="mailto:info@pragatinursery.com" className="text-primary hover:underline font-medium">info@pragatinursery.com</a> or <a href="tel:9822101088" className="text-primary hover:underline font-medium">+91 9822101088</a>.
                  </>
                )}
              </p>
              <p>{content.cancellationP2}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.damagedHeading}</h2>
              <p>{content.damagedP1}</p>
              <p>{content.damagedP2}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.conditionHeading}</h2>
              <p>{content.conditionText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.refundProcessHeading}</h2>
              <p>{content.refundProcessText}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">{content.supportHeading}</h2>
              <p>{content.supportText}</p>
              <div className="rounded-2xl border border-border bg-card p-5 text-foreground">
                <p className="font-semibold">{content.supportBoxTitle}</p>
                <p>Email: <a href="mailto:info@pragatinursery.com" className="text-primary hover:underline font-medium">info@pragatinursery.com</a></p>
                <p>Phone: <a href="tel:9822101088" className="text-primary hover:underline font-medium">+91 9822101088</a></p>
                <p className="text-xs text-muted-foreground mt-1">{content.orderIdNotice}</p>
              </div>
            </section>
          </article>
        </div>
      </div>
      <Footer />
    </main>
  )
}
