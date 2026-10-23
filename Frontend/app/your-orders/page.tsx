'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Loader2, ShoppingBag, X } from 'lucide-react'
import { orderHistoryService } from '@/services/orderHistoryService'
import { getRememberedOrderRefs, removeRememberedOrderRef } from '@/lib/customerOrdersStorage'
import { formatMediaUrl, formatPrice } from '@/types/product'
import { useLanguage } from '@/lib/language'

export default function YourOrdersPage() {
  const { t } = useLanguage()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)

  const formatStatus = (status?: string) => {
    if (!status) return t('statusPlaced')
    const s = status.toUpperCase()
    if (s === 'PLACED') return t('statusPlaced')
    if (s === 'CONFIRMED') return t('statusConfirmed')
    if (s === 'SHIPPED') return t('statusShipped')
    if (s === 'DELIVERED') return t('statusDelivered')
    if (s === 'CANCELLED') return t('statusCancelled')
    return status
  }

  const formatPaymentMethod = (method?: string) => {
    if (!method) return t('paymentMethodCod')
    const m = method.toUpperCase()
    if (m === 'COD') return t('paymentMethodCod')
    if (m === 'ONLINE') return t('paymentMethodOnline')
    return method
  }

  const formatPaymentStatus = (status?: string) => {
    if (!status) return t('paymentStatusPending')
    const s = status.toUpperCase()
    if (s === 'PENDING') return t('paymentStatusPending')
    if (s === 'PAID') return t('paymentStatusPaid')
    if (s === 'FAILED') return t('paymentStatusFailed')
    return status
  }

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const refs = getRememberedOrderRefs()
      if (!refs || refs.length === 0) {
        setOrders([])
        setLoading(false)
        return
      }

      const fetchedOrders = await orderHistoryService.fetchCustomerOrders(refs)
      setOrders(fetchedOrders)

      // Prune any stale local references that backend rejected
      if (Array.isArray(fetchedOrders)) {
        const returnedOrderNumbers = new Set(fetchedOrders.map((o) => o.orderNumber))
        refs.forEach((ref) => {
          if (!returnedOrderNumbers.has(ref.orderNumber)) {
            removeRememberedOrderRef(ref.orderNumber)
          }
        })
      }
    } catch (err: any) {
      console.error('Failed to load customer orders:', err)
      setError(err.message || 'Unable to load orders at this time.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  return (
    <main className="min-h-screen bg-background px-3.5 sm:px-5 py-6 sm:py-10 md:py-12">
      <div className="mx-auto max-w-3xl">
        {/* TOP BAR */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-2xs transition-all duration-200 hover:border-primary/50 hover:bg-primary/10 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 active:scale-98"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t('backToShop')}</span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">{t('yourDeviceOrders')}</span>
        </div>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold md:text-4xl">{t('yourOrdersTitle')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('yourOrdersDesc')}
          </p>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-2xs">
            <Loader2 className="mx-auto size-8 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-muted-foreground">{t('loadingRememberedOrders')}</p>
          </div>
        ) : orders.length === 0 ? (
          /* EMPTY STATE */
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 text-center shadow-2xs">
            <ShoppingBag className="mx-auto size-12 text-primary/30" />
            <p className="mt-4 font-serif text-2xl font-bold">{t('noOrdersOnDevice')}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('noOrdersOnDeviceDesc')}
            </p>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition"
            >
              {t('explorePlants')}
            </Link>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div
                key={order.id || order.orderNumber}
                className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-2xs hover:border-primary/40 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-border/70 pb-4">
                  <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2">
                    <span className="font-serif text-lg sm:text-xl font-bold">{order.orderNumber}</span>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {formatStatus(order.status)}
                    </span>
                  </div>
                  <span className="font-bold text-base sm:text-lg text-primary shrink-0">
                    {formatPrice(Number(order.totalAmount || order.total))}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
                  {Array.isArray(order.items) &&
                    order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-xs sm:text-sm gap-2">
                        <span className="font-medium text-foreground min-w-0 flex-1 truncate">
                          {item.productName || item.name} × {item.quantity}
                        </span>
                        <span className="shrink-0">{formatPrice(Number(item.lineTotal || item.unitPrice * item.quantity))}</span>
                      </div>
                    ))}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4 text-xs text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground">
                      {t('paymentLabel')}: {formatPaymentMethod(order.payment?.method)} ({formatPaymentStatus(order.payment?.status)})
                    </p>
                    <p className="mt-0.5">
                      {t('dateLabel')}: {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition cursor-pointer"
                  >
                    {t('viewOrderDetails')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ORDER DETAIL MODAL */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-foreground/40 backdrop-blur-xs">
            <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border bg-background p-4 sm:p-6 md:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold">{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {t('placedOn')} {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-full p-2 hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('orderItems')}</h3>
                  <div className="mt-3 flex flex-col gap-3">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 border-b border-border/40 pb-3">
                        {item.image && (
                          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                            <Image
                              src={formatMediaUrl(item.image)}
                              alt={item.productName || item.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{item.productName || item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(Number(item.unitPrice || item.price))} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold text-sm">
                          {formatPrice(Number(item.lineTotal || (item.unitPrice || item.price) * item.quantity))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedOrder.shippingAddress && (
                  <div className="rounded-2xl bg-muted/40 p-4 text-xs">
                    <h4 className="font-bold text-foreground mb-1">{t('deliveryAddress')}</h4>
                    <p className="font-medium text-foreground">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="mt-1 text-muted-foreground">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-muted-foreground">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.district || ''} {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                    <p className="mt-1 font-mono text-muted-foreground">{t('phoneLabel')}: {selectedOrder.shippingAddress.mobile}</p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 border-t pt-4 text-sm font-medium">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('subtotal')}</span>
                    <span>{formatPrice(Number(selectedOrder.subtotal || 0))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('deliveryCharges')}</span>
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {Number(selectedOrder.deliveryFee || selectedOrder.delivery || 0) > 0
                        ? formatPrice(Number(selectedOrder.deliveryFee || selectedOrder.delivery))
                        : t('deliveryToBeDetermined')}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-foreground border-t pt-2 mt-1">
                    <span>{t('totalPayableNow')}</span>
                    <span className="text-primary">{formatPrice(Number(selectedOrder.totalAmount || selectedOrder.total))}</span>
                  </div>
                  <div className="mt-2 rounded-2xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground border border-border/60">
                    <p>{t('deliveryNotice')}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="mt-6 w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/95 transition"
              >
                {t('closeOrderDetails')}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
