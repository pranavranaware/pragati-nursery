'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { getCustomerOrders, lookupOrders } from '@/services/orderService'
import { formatPrice } from '@/types/product'
import { getAuthToken } from '@/lib/apiClient'

export default function AccountOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const isAuthenticated = Boolean(getAuthToken())

  // Unauthenticated lookup state
  const [searchQuery, setSearchQuery] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [searchedOrders, setSearchedOrders] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      getCustomerOrders(0, 20)
        .then((res) => {
          setOrders(res?.content || res || [])
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [isAuthenticated])

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setLookupLoading(true)
    setLookupError(null)
    try {
      const results = await lookupOrders(searchQuery.trim())
      setSearchedOrders(results)
      setHasSearched(true)
    } catch (err: any) {
      setLookupError(err.message || 'Failed to search orders. Please check your input.')
    } finally {
      setLookupLoading(false)
    }
  }

  const renderOrderList = (orderList: any[]) => {
    return (
      <div className="mt-8 flex flex-col gap-6">
        {orderList.map((order) => (
          <div key={order.id || order.orderNumber} className="rounded-3xl border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="font-serif text-xl font-semibold">{order.orderNumber}</span>
                <span className="ml-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {order.status}
                </span>
              </div>
              <span className="font-semibold">{formatPrice(Number(order.totalAmount || order.total))}</span>
            </div>

            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
              {Array.isArray(order.items) &&
                order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {item.productName || item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(Number(item.lineTotal || item.unitPrice * item.quantity))}</span>
                  </div>
                ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span>Payment: {order.payment?.method || 'COD'} ({order.payment?.status || 'PENDING'})</span>
              <span>{order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : ''}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/5 transition shadow-xs">
          ← Back to Home
        </Link>
        <h1 className="mt-8 font-serif text-4xl">Your orders</h1>

        {!isAuthenticated ? (
          <div className="mt-8 flex flex-col gap-8">
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-serif text-2xl font-medium">View Order History without Login</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter either your email address or phone/mobile number to view your past guest or registered orders.
              </p>
              <form onSubmit={handleLookupSubmit} className="mt-6 flex flex-col gap-4 sm:flex-row">
                <input
                  type="text"
                  required
                  placeholder="e.g. email@example.com or 9876543210"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                />
                <button
                  type="submit"
                  disabled={lookupLoading}
                  className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition cursor-pointer"
                >
                  {lookupLoading ? 'Searching...' : 'Search Orders'}
                </button>
              </form>
              {lookupError && (
                <p className="mt-3 text-xs font-semibold text-destructive">{lookupError}</p>
              )}
            </div>

            {hasSearched && (
              <div>
                <h3 className="font-serif text-xl font-medium">Search Results</h3>
                {searchedOrders.length === 0 ? (
                  <div className="mt-4 rounded-3xl bg-card p-8 text-center border border-border">
                    <p className="font-serif text-lg">No orders found</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      We couldn't find any orders matching "{searchQuery}".
                    </p>
                  </div>
                ) : (
                  renderOrderList(searchedOrders)
                )}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="mt-8 py-10 text-center text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-card p-8 text-center border border-border">
            <p className="font-serif text-xl">No orders found</p>
            <p className="mt-2 text-sm text-muted-foreground">You haven't placed any orders yet.</p>
            <Link href="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">
              Start Shopping
            </Link>
          </div>
        ) : (
          renderOrderList(orders)
        )}
      </div>
    </main>
  )
}
