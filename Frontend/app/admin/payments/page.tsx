'use client'

import { useEffect, useState } from 'react'
import { AdminLayout, SectionCard, StatusBadge, TableWrap } from '@/components/admin'
import { adminApi, type AdminPayment } from '@/services/adminService'
import { formatPrice } from '@/types/product'
import { Loader2 } from 'lucide-react'

export default function PaymentsPage() {
  const [method, setMethod] = useState('ALL')
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.payments.list().then((list) => {
      setPayments(list)
      setLoading(false)
    }).catch(() => {
      setPayments([])
      setLoading(false)
    })
  }, [])

  const filtered = payments.filter((p) => method === 'ALL' || p.method === method)

  return (
    <AdminLayout title="Payments" subtitle="Monitor online and cash-on-delivery collections.">
      <SectionCard
        title={`${filtered.length} payment transactions`}
        action={
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm"
          >
            <option value="ALL">All methods</option>
            <option value="ONLINE">ONLINE</option>
            <option value="COD">COD</option>
          </select>
        }
      >
        {loading ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-sm">Loading payment transactions...</p>
          </div>
        ) : filtered.length > 0 ? (
          <TableWrap>
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Payment ID</th>
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-5 py-4 font-mono text-xs">{p.id}</td>
                    <td className="px-5 py-4 font-semibold">{p.orderId}</td>
                    <td className="px-5 py-4">{p.customer}</td>
                    <td className="px-5 py-4 font-semibold">{formatPrice(p.amount)}</td>
                    <td className="px-5 py-4">{p.method}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No payment transactions recorded in database.
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  )
}
