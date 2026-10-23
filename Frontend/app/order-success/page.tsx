'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Leaf } from 'lucide-react'
import type { Order } from '@/types/order'
import { formatPrice } from '@/types/product'
import { getOrderByNumber } from '@/services/orderService'

import { useLanguage } from '@/lib/language'

function SuccessContent() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const orderNumberParam = searchParams.get('orderNumber')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const targetNumber = orderNumberParam || sessionStorage.getItem('pragati-order-number')
      if (targetNumber) {
        const fetched = await getOrderByNumber(targetNumber)
        if (fetched) {
          setOrder(fetched)
        }
      }
      setLoading(false)
    }
    fetchOrder()
  }, [orderNumberParam])

  return (
    <main className="min-h-screen bg-background px-3.5 sm:px-5 py-8 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex size-16 sm:size-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Leaf className="size-8 sm:size-10" />
        </div>
        <h1 className="mt-5 sm:mt-7 font-serif text-3xl sm:text-5xl">{t('orderConfirmed')}</h1>
        <p className="mx-auto mt-3 sm:mt-4 max-w-lg text-sm sm:text-base text-muted-foreground">
          {t('orderSuccessDesc')}
        </p>

        {loading ? (
          <div className="mt-8 sm:mt-10 py-10 text-center text-muted-foreground">Loading...</div>
        ) : order ? (
          <div className="mt-8 sm:mt-10 rounded-3xl bg-card p-4 sm:p-6 text-left">
            <div className="flex flex-wrap justify-between gap-3 border-b border-border pb-5">
              <div>
                <p className="text-sm text-muted-foreground">{t('orderId')}</p>
                <p className="mt-1 font-semibold">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('deliveryCharges')}</p>
                <p className="mt-1 font-semibold text-emerald-700 dark:text-emerald-400">
                  {order.delivery > 0 ? formatPrice(order.delivery) : t('deliveryToBeDetermined')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('totalPayableNow')}</p>
                <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('paymentMethod')}</p>
                <p className="mt-1 font-semibold">
                  {order.payment.method === 'COD' ? t('cashOnDelivery') : t('onlinePayment')}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-muted/60 p-3.5 text-xs leading-relaxed text-muted-foreground border border-border/60">
              <p>{t('deliveryNotice')}</p>
            </div>
            <div className="grid gap-6 py-5 sm:grid-cols-2">
              <div>
                <p className="text-sm font-semibold">{t('shippingAddress')}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {order.address.fullName}
                  <br />
                  {order.address.address}, {order.address.city}
                  <br />
                  {order.address.state} – {order.address.pincode}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold">{t('allPlants')}</p>
                {order.items.map((item) => (
                  <p key={item.productId} className="mt-2 text-sm text-muted-foreground">
                    {item.name} × {item.quantity}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
            {t('continueShopping')}
          </Link>
        </div>
      </div>
    </main>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
