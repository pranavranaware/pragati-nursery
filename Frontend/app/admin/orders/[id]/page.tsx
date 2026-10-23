'use client'

import { use, useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { AdminLayout, SectionCard, StatusBadge, buttonClass } from '@/components/admin'
import { adminApi, type AdminOrder } from '@/services/adminService'
import { businessSettingsService, defaultBusinessSettings, type BusinessSettings } from '@/services/businessSettingsService'
import { formatPrice } from '@/types/product'

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = use(params)
  const [order, setOrder] = useState<AdminOrder | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<AdminOrder['status']>('PLACED')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>(defaultBusinessSettings)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const loadOrder = async () => {
    setLoading(true)
    setError(null)
    try {
      const [list, settings] = await Promise.all([
        adminApi.orders.list(),
        businessSettingsService.getSettings().catch(() => defaultBusinessSettings),
      ])
      setBusinessSettings(settings)
      const found = list.find((o) => o.id === orderId || o.id.toLowerCase() === orderId.toLowerCase())
      if (found) {
        setOrder(found)
        setSelectedStatus(found.status)
      } else {
        setError(`Order ${orderId} was not found.`)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load order details from backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrder()
  }, [orderId])

  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const handleUpdateStatus = async () => {
    if (!order) return
    setUpdating(true)
    setError(null)
    try {
      const prevStatus = order.status
      await adminApi.orders.updateStatus(order.id, selectedStatus)
      setOrder((prev: AdminOrder | null) => (prev ? { ...prev, status: selectedStatus } : null))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

      if (prevStatus === 'PLACED' && selectedStatus === 'CONFIRMED') {
        setShowReceiptModal(true)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update order status on server.')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Order Details" subtitle="Loading order details...">
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Fetching order details from server...</p>
        </div>
      </AdminLayout>
    )
  }

  if (error || !order) {
    return (
      <AdminLayout title="Order Details" subtitle="Review order information">
        <Link href="/admin/orders" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="size-4" /> Back to orders
        </Link>
        <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-5 text-sm font-medium text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error || 'Order not found.'}</span>
          <button onClick={loadOrder} className="ml-auto font-semibold underline">Retry</button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title={`Order #${order.id}`} subtitle={`${order.date} · ${order.items} item(s)`}>
      <Link href="/admin/orders" className="mb-6 inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted hover:text-primary transition shadow-xs">
        <ArrowLeft className="size-4 text-primary" /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-sm">
        <div>
          <StatusBadge status={order.status} />
          <p className="mt-2 text-sm text-muted-foreground">Select a status and update to confirm customer order.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AdminOrder['status'])}
            className="rounded-xl border bg-background px-3 py-2.5 text-sm"
          >
            <option value="PLACED">PLACED</option>
            <option value="CONFIRMED">CONFIRMED</option>
          </select>
          <button onClick={handleUpdateStatus} className={buttonClass} disabled={updating}>
            {updating ? 'Updating...' : 'Update status'}
          </button>
          {order.status === 'CONFIRMED' && (
            <button
              onClick={() => setShowReceiptModal(true)}
              className="rounded-xl border bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 transition"
            >
              View Receipt
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div className="mb-5 flex items-center gap-2 rounded-xl bg-green-100 px-4 py-3 text-sm font-medium text-green-800">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>Order status updated successfully in MySQL database.</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-6">
          <SectionCard title="Customer information">
            <div className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="mt-1 font-medium">{order.customer}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mobile</p>
                <p className="mt-1 font-medium">{order.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="mt-1 font-medium">{order.email || 'N/A'}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Delivery address">
            <div className="p-5 text-sm leading-6">
              <p>{order.address || 'Standard Delivery Address'}</p>
              <p>
                {order.city} {order.state ? `, ${order.state}` : ''} {order.pincode ? `— ${order.pincode}` : ''}
              </p>
              {order.landmark && <p className="text-xs text-muted-foreground">Landmark: {order.landmark}</p>}
            </div>
          </SectionCard>

          <SectionCard title="Products">
            <div className="divide-y">
              {order.itemList && order.itemList.length > 0 ? (
                order.itemList.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-5 text-sm">
                    <div className="flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.productName} className="size-12 rounded-xl object-cover" />
                      ) : (
                        <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {item.quantity}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {order.items}
                    </div>
                    <div>
                      <p className="font-semibold">Order #{order.id} items</p>
                      <p className="text-xs text-muted-foreground">{order.items} item(s)</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="flex flex-col gap-6">
          <SectionCard title="Order summary">
            <div className="flex flex-col gap-3 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal || order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Charges</span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">{Number(order.deliveryFee || 0) > 0 ? formatPrice(order.deliveryFee!) : 'To be determined'}</span>
              </div>
              <div className="flex justify-between border-t pt-3 text-base font-bold">
                <span>Customer Paid / Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Payment">
            <div className="flex flex-col gap-3 p-5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-semibold">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
            </div>
          </SectionCard>
        </div>
      </div>

      {showReceiptModal && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 p-4">
          <style>{`
            @media print {
              body * { visibility: hidden; }
              #printable-receipt, #printable-receipt * { visibility: visible; }
              #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; box-shadow: none; border: none; }
              .no-print { display: none !important; }
            }
          `}</style>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-2xl border">
            <div className="no-print flex items-center justify-between border-b pb-4">
              <h2 className="text-xl font-bold">Order Confirmation Receipt</h2>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div id="printable-receipt" className="mt-4 flex flex-col gap-6 text-foreground">
              {/* Business Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h1 className="font-serif text-2xl font-bold text-primary">{businessSettings.storeName}</h1>
                  <p className="text-xs text-muted-foreground mt-1">{businessSettings.address}</p>
                  <p className="text-xs text-muted-foreground">
                    Phone: +91 9066665151 | Email: pragatinursery11@gmail.com
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800 uppercase">
                    CONFIRMED
                  </span>
                  <p className="text-xs text-muted-foreground mt-2">Date: {order.date}</p>
                </div>
              </div>

              {/* Order & Customer Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs border-b pb-4">
                <div>
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">Order Information</p>
                  <p><strong>Order #:</strong> {order.id}</p>
                  <p><strong>Order Status:</strong> CONFIRMED</p>
                  <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                  <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                </div>
                <div>
                  <p className="font-semibold uppercase tracking-wider text-muted-foreground mb-1">Customer & Delivery</p>
                  <p><strong>Customer:</strong> {order.customer}</p>
                  <p><strong>Mobile:</strong> {order.mobile || 'N/A'}</p>
                  <p><strong>Email:</strong> {order.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {order.address}, {order.city}, {order.state} {order.pincode}</p>
                  {order.landmark && <p><strong>Landmark:</strong> {order.landmark}</p>}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Order Items</p>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/50 font-semibold">
                      <th className="p-2">Item</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.itemList && order.itemList.length > 0 ? (
                      order.itemList.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium">{item.productName}</td>
                          <td className="p-2 text-center">{item.quantity}</td>
                          <td className="p-2 text-right">{formatPrice(item.unitPrice)}</td>
                          <td className="p-2 text-right font-semibold">{formatPrice(item.lineTotal)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-2 font-medium">Order Items ({order.items})</td>
                        <td className="p-2 text-center">{order.items}</td>
                        <td className="p-2 text-right">{formatPrice(order.total)}</td>
                        <td className="p-2 text-right font-semibold">{formatPrice(order.total)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="flex justify-end border-t pt-3 text-xs">
                <div className="w-48 flex flex-col gap-1.5">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>{formatPrice(order.subtotal || order.total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Delivery Charges:</span>
                    <span>{Number(order.deliveryFee || 0) > 0 ? formatPrice(order.deliveryFee!) : 'To be determined'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-sm font-bold text-foreground">
                    <span>Total Amount:</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              <div className="text-center text-[10px] text-muted-foreground border-t pt-4">
                Thank you for choosing Pragati Nursery. Grown with care in Pune, Maharashtra.
              </div>
            </div>

            {/* Print & Action Buttons */}
            <div className="no-print mt-6 flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="rounded-xl border px-4 py-2 text-xs font-semibold hover:bg-muted"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                PRINT RECEIPT
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
