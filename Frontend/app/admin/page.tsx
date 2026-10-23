'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, CreditCard, Package, ShoppingBag, TrendingUp, Users, AlertTriangle, Truck, Loader2 } from 'lucide-react'
import { AdminLayout, SectionCard, StatCard, StatusBadge, TableWrap } from '@/components/admin'
import { adminApi, type AdminOrder } from '@/services/adminService'
import { productService } from '@/services/productService'
import { formatPrice } from '@/types/product'

export default function AdminDashboard() {
  const router = useRouter()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [productCount, setProductCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (sessionStorage.getItem('pragati-admin-auth') !== 'true') {
      router.replace('/admin/login')
      return
    }

    const loadDashboard = async () => {
      setLoading(true)
      try {
        const [orderList, prodList] = await Promise.all([
          adminApi.orders.list().catch(() => []),
          productService.getProducts().catch(() => []),
        ])
        setOrders(orderList)
        setProducts(prodList)
        setProductCount(prodList.length)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [router])

  if (!mounted) return null
  if (sessionStorage.getItem('pragati-admin-auth') !== 'true') return null

  const now = new Date()
  const todayStr = now.toDateString()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const parseOrderDate = (o: AdminOrder): Date => {
    if (o.orderDate) return new Date(o.orderDate)
    return new Date(o.date)
  }

  const todaysOrdersCount = orders.filter((o) => {
    const d = parseOrderDate(o)
    return !isNaN(d.getTime()) && d.toDateString() === todayStr && o.status !== 'CANCELLED'
  }).length

  const currentMonthOrders = orders.filter((o) => {
    const d = parseOrderDate(o)
    return !isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear && o.status !== 'CANCELLED'
  })

  const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const pendingOrdersCount = orders.filter((o) => o.status === 'PLACED').length
  const confirmedDeliveredCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'DELIVERED').length
  const lowStockCount = products.filter((p) => (p.stockQuantity ?? p.stock ?? 0) < 50).length

  return (
    <AdminLayout title="Dashboard" subtitle="Here’s what’s happening with your nursery today.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Orders" value={String(orders.length)} detail="Live from backend database" icon={ShoppingBag} tone="success" />
        <StatCard label="Today's Orders" value={String(todaysOrdersCount)} detail="Placed today" icon={ShoppingBag} tone="success" />
        <StatCard label="Current Month Revenue" value={formatPrice(currentMonthRevenue)} detail="This month's earnings" icon={CreditCard} tone="success" />
        <StatCard label="Pending Orders" value={String(pendingOrdersCount)} detail="Awaiting admin confirmation" icon={AlertTriangle} tone="warning" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Confirmed & Delivered" value={String(confirmedDeliveredCount)} detail="Processed orders" icon={Truck} tone="success" />
        <StatCard label="Total Products" value={String(productCount)} detail="In catalog" icon={Package} />
        <StatCard label="Low Stock Products" value={String(lowStockCount)} detail="Stock < 50" icon={AlertTriangle} tone="warning" />
        <StatCard label="Current Month Orders" value={String(currentMonthOrders.length)} detail="This month's orders" icon={TrendingUp} tone="success" />
      </div>

      <SectionCard title="Recent orders" action={<Link href="/admin/orders" className="text-sm font-semibold text-primary">View all</Link>}>
        {loading ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm">Loading recent orders...</p>
          </div>
        ) : (
          <TableWrap>
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-t">
                    <td className="px-5 py-4 font-semibold">{order.id}</td>
                    <td className="px-5 py-4">{order.customer}</td>
                    <td className="px-5 py-4 text-muted-foreground">{order.date}</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium">{order.paymentMethod}</span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="font-semibold text-primary hover:underline">
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
