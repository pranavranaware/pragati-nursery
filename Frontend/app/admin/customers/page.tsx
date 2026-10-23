'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { AdminLayout, SectionCard, StatusBadge, TableWrap } from '@/components/admin'
import { adminApi, type AdminCustomer } from '@/services/adminService'
import { formatPrice } from '@/types/product'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [search, setSearch] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('ALL')
  const [sortOption, setSortOption] = useState<'A-Z' | 'Z-A'>('A-Z')

  const fetchDistricts = useCallback(async () => {
    try {
      const list = await adminApi.customers.getDistricts()
      setDistricts(list)
    } catch {
      setDistricts([])
    }
  }, [])

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const districtParam = selectedDistrict !== 'ALL' ? selectedDistrict : undefined
      const sortParam = 'district'
      const directionParam = sortOption === 'A-Z' ? 'asc' : 'desc'

      const data = await adminApi.customers.list({
        search: search.trim() || undefined,
        district: districtParam,
        sort: sortParam,
        direction: directionParam,
      })
      setCustomers(data)
    } catch (err: any) {
      setError(err.message || 'Failed to load customer list from server.')
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [search, selectedDistrict, sortOption])

  useEffect(() => {
    fetchDistricts()
  }, [fetchDistricts])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 300)
    return () => clearTimeout(timer)
  }, [fetchCustomers])

  const countLabel =
    selectedDistrict !== 'ALL'
      ? `${customers.length} customer${customers.length === 1 ? '' : 's'} in ${selectedDistrict}`
      : `${customers.length} customer${customers.length === 1 ? '' : 's'}`

  return (
    <AdminLayout title="Customers" subtitle="Track registered and guest customer orders across districts.">
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchCustomers} className="ml-auto font-semibold underline">
            Retry
          </button>
        </div>
      )}

      <SectionCard
        title={countLabel}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <Search className="size-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, mobile or email..."
                className="w-44 bg-transparent text-sm outline-none md:w-60"
              />
            </div>

            {/* Dynamic District Dropdown Filter */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            {/* District Sorting Selector */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'A-Z' | 'Z-A')}
              className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="A-Z">District A → Z</option>
              <option value="Z-A">District Z → A</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="text-sm">Fetching customers...</p>
          </div>
        ) : customers.length > 0 ? (
          <TableWrap>
            <table className="w-full min-w-[950px] text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">District</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3 text-center">Orders</th>
                  <th className="px-5 py-3">Total Spent</th>
                  <th className="px-5 py-3">First Order</th>
                  <th className="px-5 py-3">Last Order</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const firstDateStr = c.firstOrderDate
                    ? new Date(c.firstOrderDate).toLocaleDateString('en-IN')
                    : 'N/A'
                  const lastDateStr = c.lastOrderDate
                    ? new Date(c.lastOrderDate).toLocaleDateString('en-IN')
                    : c.lastOrder || 'N/A'

                  return (
                    <tr key={c.id} className="border-t hover:bg-muted/20 transition">
                      <td className="px-5 py-4">
                        <p className="font-semibold">{c.name}</p>
                        {c.userId && (
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                            Registered
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-muted-foreground font-mono text-xs">{c.mobile || 'N/A'}</td>
                      <td className="px-5 py-4 text-xs">{c.email || 'N/A'}</td>
                      <td className="px-5 py-4 font-medium">
                        {c.district ? (
                          <span className="rounded-md bg-secondary/20 px-2 py-1 text-xs font-semibold text-secondary-foreground">
                            {c.district}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not specified</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">{c.city || 'N/A'}</td>
                      <td className="px-5 py-4 text-center font-bold">{c.orders}</td>
                      <td className="px-5 py-4 font-semibold text-primary">{formatPrice(c.spent)}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{firstDateStr}</td>
                      <td className="px-5 py-4 text-xs text-muted-foreground">{lastDateStr}</td>
                      <td className="px-5 py-4">
                        <StatusBadge status={c.status === 'Returning' ? 'CONFIRMED' : 'PLACED'} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableWrap>
        ) : (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {selectedDistrict !== 'ALL' || search ? (
              <p>No customer accounts found matching the current search/district filter.</p>
            ) : (
              <p>No customer records found in database.</p>
            )}
          </div>
        )}
      </SectionCard>
    </AdminLayout>
  )
}
