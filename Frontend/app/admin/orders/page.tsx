'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { AdminLayout, SectionCard, StatusBadge, TableWrap } from '@/components/admin'
import { adminApi, type AdminOrder } from '@/services/adminService'
import { formatPrice } from '@/types/product'

export default function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('ALL')

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.orders.list()
      setOrders(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load orders from backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)

  const activeWindowOrders = orders.filter((o) => {
    if (!o.orderDate) return true
    const d = new Date(o.orderDate)
    return isNaN(d.getTime()) || d >= twoMonthsAgo
  })

  const filtered = activeWindowOrders.filter(
    (o) =>
      (status === 'ALL' || o.status === status) &&
      `${o.id} ${o.customer} ${o.email}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <AdminLayout title="Orders" subtitle="Review, filter and update customer orders.">
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchOrders} className="ml-auto font-semibold underline">Retry</button>
        </div>
      )}

      <SectionCard
        title={`${filtered.length} orders`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search order ID or customer"
                className="w-40 bg-transparent text-sm outline-none md:w-56"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="ALL">All statuses</option>
              {['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm">Fetching live orders...</p>
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Payment Status</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-t">
                    <td className="px-5 py-4 font-semibold">{o.id}</td>
                    <td className="px-5 py-4">
                      <p className="font-medium">{o.customer}</p>
                      <p className="text-xs text-muted-foreground">{o.email}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{o.date}</td>
                    <td className="px-5 py-4">{o.items} items</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-5 py-4">{o.paymentMethod}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={o.paymentStatus} />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${o.id}`} className="font-semibold text-primary hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        )}
      </SectionCard>
    </AdminLayout>
  )
}
