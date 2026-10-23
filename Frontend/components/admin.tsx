'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { adminApi } from '@/services/adminService'
import { LayoutDashboard, Package, Tags, ShoppingBag, CreditCard, Users, Settings, LogOut, Menu, X, Bell, Search, ChevronRight, Plus, MoreHorizontal, CheckCircle2, AlertTriangle, XCircle, Clock3 } from 'lucide-react'
import type { AdminProduct } from '@/data/admin'
import { formatPrice } from '@/data/admin'
import { normalizeImages, type Product } from '@/types/product'

const nav = [{ href: '/admin', label: 'Dashboard', icon: LayoutDashboard }, { href: '/admin/products', label: 'Products', icon: Package }, { href: '/admin/categories', label: 'Categories', icon: Tags }, { href: '/admin/orders', label: 'Orders', icon: ShoppingBag }, { href: '/admin/payments', label: 'Payments', icon: CreditCard }, { href: '/admin/customers', label: 'Customers', icon: Users }, { href: '/admin/settings', label: 'Settings', icon: Settings }]
export function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const path = usePathname()
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity lg:hidden ${open ? 'block' : 'hidden'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card text-card-foreground shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-border px-5">
          <Link href="/admin" className="flex items-center gap-2" title="Pragati Nursery Admin Dashboard">
            <Image src="/pragati-nursery-logo.png" alt="Pragati Nursery Logo" width={160} height={90} className="h-10 w-auto object-contain" priority />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</span>
          </Link>
          <button className="rounded-lg p-1.5 hover:bg-muted lg:hidden" onClick={onClose} aria-label="Close menu">
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1.5 p-4">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/admin' && path.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Link href="/admin/login" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-destructive transition-colors">
            <LogOut className="size-4 shrink-0" />
            Logout
          </Link>
        </div>
      </aside>
    </>
  )
}
export const LOW_STOCK_THRESHOLD = 49

export function AdminHeader({ onMenu }: { onMenu: () => void }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [lowStockItems, setLowStockItems] = useState<{ id: number; name: string; stock: number; status: string }[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    adminApi.products.list().then((list) => {
      if (Array.isArray(list)) {
        const low = list
          .filter((p) => p.stock < 50)
          .map((p) => {
            const statusLabel = p.status === 'OUT_OF_STOCK' || p.stock <= 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'Running Low'
            return { id: p.id, name: p.name, stock: p.stock, status: statusLabel }
          })
        setLowStockItems(low)
      }
    }).catch(() => { })
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false)
      }
    }
    if (notificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notificationsOpen])

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/95 px-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-2 hover:bg-muted lg:hidden" aria-label="Open menu">
          <Menu />
        </button>
        <Link href="/admin" className="flex items-center gap-2 lg:hidden" title="Pragati Nursery Admin Dashboard">
          <Image src="/pragati-nursery-logo.png" alt="Pragati Nursery Logo" width={140} height={80} className="h-8 w-auto object-contain" />
        </Link>
      </div>
      <div className="flex items-center gap-3">
        <Link href="/" className="hidden rounded-xl border px-3 py-2 text-sm font-semibold text-primary hover:bg-muted sm:inline-flex">
          View Store
        </Link>
        <div className="flex items-center gap-4">
          <div className="relative" ref={containerRef}>
            <button
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative rounded-xl p-2.5 hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="size-5 text-muted-foreground" />
              {lowStockItems.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {lowStockItems.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-2xl border bg-card p-4 shadow-xl">
                <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-semibold text-sm">Notifications</h3>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {lowStockItems.length} Alert{lowStockItems.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto text-xs">
                  {lowStockItems.length > 0 ? (
                    lowStockItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-xl bg-muted/60 p-2.5">
                        <div>
                          <p className="font-semibold text-foreground">{item.name}</p>
                          <p className="text-muted-foreground text-[11px] mt-0.5">{item.status}</p>
                        </div>
                        <span className="font-semibold text-accent-foreground rounded-lg bg-accent/10 px-2 py-1 text-[11px]">{item.stock} left</span>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-muted-foreground">All plant stocks are healthy (above 30).</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-l pl-4">
            <div className="flex size-9 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
              AD
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold">Admin Demo</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
export function AdminLayout({ children, title, subtitle, action }: { children: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode }) { const [open, setOpen] = useState(false); return <div className="min-h-screen bg-muted/40"><AdminSidebar open={open} onClose={() => setOpen(false)} /><div className="lg:pl-64"><AdminHeader onMenu={() => setOpen(true)} /><main className="mx-auto max-w-[1600px] p-4 md:p-8"><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Pragati Nursery</p><h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>{subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}</div>{action}</div>{children}</main></div></div> }
export function StatCard({ label, value, detail, icon: Icon, tone = 'default' }: { label: string; value: string; detail?: string; icon: React.ElementType; tone?: string }) { return <div className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>{detail && <p className="mt-2 text-xs text-muted-foreground">{detail}</p>}</div><span className={`flex size-10 items-center justify-center rounded-xl ${tone === 'warning' ? 'bg-yellow-100 text-yellow-700' : tone === 'success' ? 'bg-green-100 text-green-700' : 'bg-accent text-accent-foreground'}`}><Icon className="size-5" /></span></div></div> }
export function StatusBadge({ status }: { status: string }) { const normalized = status.toUpperCase(); const map: Record<string, { cls: string; icon: React.ElementType }> = { ACTIVE: { cls: 'bg-green-100 text-green-700', icon: CheckCircle2 }, PAID: { cls: 'bg-green-100 text-green-700', icon: CheckCircle2 }, DELIVERED: { cls: 'bg-green-100 text-green-700', icon: CheckCircle2 }, LOW_STOCK: { cls: 'bg-yellow-100 text-yellow-700', icon: AlertTriangle }, PENDING: { cls: 'bg-yellow-100 text-yellow-700', icon: Clock3 }, PROCESSING: { cls: 'bg-blue-100 text-blue-700', icon: Clock3 }, CONFIRMED: { cls: 'bg-blue-100 text-blue-700', icon: Clock3 }, SHIPPED: { cls: 'bg-purple-100 text-purple-700', icon: Package }, OUT_OF_STOCK: { cls: 'bg-red-100 text-red-700', icon: XCircle }, FAILED: { cls: 'bg-red-100 text-red-700', icon: XCircle }, CANCELLED: { cls: 'bg-red-100 text-red-700', icon: XCircle }, INACTIVE: { cls: 'bg-muted text-muted-foreground', icon: XCircle }, REFUNDED: { cls: 'bg-muted text-muted-foreground', icon: Clock3 }, PLACED: { cls: 'bg-blue-100 text-blue-700', icon: Clock3 }, OUT_FOR_DELIVERY: { cls: 'bg-orange-100 text-orange-700', icon: Package } }; const item = map[normalized] || { cls: 'bg-muted text-muted-foreground', icon: Clock3 }; const Icon = item.icon; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${item.cls}`}><Icon className="size-3" />{status.replaceAll('_', ' ')}</span> }
export function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-2xl border bg-card shadow-sm"><div className="flex items-center justify-between border-b px-5 py-4"><h2 className="font-semibold">{title}</h2>{action}</div>{children}</section> }
export function TableWrap({ children }: { children: React.ReactNode }) { return <div className="overflow-x-auto">{children}</div> }
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="flex min-h-48 flex-col items-center justify-center gap-2 p-8 text-center"><Package className="size-8 text-muted-foreground/40" /><h3 className="font-semibold">{title}</h3><p className="max-w-sm text-sm text-muted-foreground">{description}</p></div> }
export function ProductRow({ product, onDelete }: { product: (AdminProduct | Product); onDelete: (product: AdminProduct | Product) => void }) { const image = 'images' in product ? normalizeImages(product)[0]?.src : product.image; const nameEn = product.nameEn || product.name; const nameMr = product.nameMr; return <tr className="border-b last:border-0"><td className="px-5 py-4"><img src={image} alt={nameEn} className="size-12 rounded-xl object-cover" /></td><td className="px-5 py-4"><p className="font-semibold">{nameEn}{nameMr ? <span className="ml-1 font-normal text-muted-foreground">({nameMr})</span> : null}</p><p className="text-xs text-muted-foreground">{'sku' in product ? product.sku : product.slug}</p></td><td className="px-5 py-4 text-sm text-muted-foreground">{product.category}</td><td className="px-5 py-4 font-medium">{formatPrice(product.price)}</td><td className="px-5 py-4 text-sm">{'stockQuantity' in product ? product.stockQuantity ?? 0 : product.stock}</td><td className="px-5 py-4"><StatusBadge status={'status' in product ? product.status : product.stockStatus === 'LOW_STOCK' ? 'LOW_STOCK' : product.stockStatus === 'OUT_OF_STOCK' ? 'OUT_OF_STOCK' : 'ACTIVE'} /></td><td className="px-5 py-4 text-sm text-muted-foreground">{'createdAt' in product ? product.createdAt : 'Catalog'}</td><td className="px-5 py-4"><div className="flex items-center gap-2"><Link href={`/admin/products/${product.id}/edit`} className="text-xs font-semibold text-primary hover:underline">Edit</Link><button onClick={() => onDelete(product)} className="text-xs font-semibold text-destructive hover:underline">Delete</button></div></td></tr> }
export const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90'
