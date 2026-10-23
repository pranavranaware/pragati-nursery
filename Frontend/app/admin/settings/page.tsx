'use client'

import { useEffect, useState } from 'react'
import { Save, Loader2, AlertCircle } from 'lucide-react'
import { AdminLayout, SectionCard, buttonClass } from '@/components/admin'
import { businessSettingsService, defaultBusinessSettings, type BusinessSettings } from '@/services/businessSettingsService'

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings>(defaultBusinessSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetched = await businessSettingsService.getSettings()
        setSettings(fetched)
      } catch (err: any) {
        setError('Failed to fetch settings from server.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const updated = await businessSettingsService.saveSettings(settings)
      setSettings(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save business settings to server.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="Settings" subtitle="Configure the business rules for your nursery storefront.">
      <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary">
        Configure your nursery business details. Settings are saved directly to MySQL database and reflected on receipts.
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm font-medium text-destructive">
          <AlertCircle className="size-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm">Loading business settings from database...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title="Business information">
          <div className="grid gap-4 p-5">
            <label className="grid gap-2 text-sm font-medium">
              Store Name
              <input
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="rounded-xl border bg-background px-3 py-2.5 font-normal"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium">
                Phone
                <input
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Email
                <input
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="rounded-xl border bg-background px-3 py-2.5 font-normal"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-medium">
              Address
              <textarea
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                rows={3}
                className="rounded-xl border bg-background px-3 py-2.5 font-normal"
              />
            </label>
          </div>
        </SectionCard>
        <SectionCard title="Store settings">
          <div className="grid gap-4 p-5">
            <label className="grid gap-2 text-sm font-medium">
              Currency
              <select className="rounded-xl border bg-background px-3 py-2.5 font-normal">
                <option>INR — Indian Rupee</option>
              </select>
            </label>
            <div className="rounded-xl border bg-muted/50 p-3.5 text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold block text-foreground mb-1">Manual Delivery Fee Determination</span>
              Delivery fees are no longer automatically charged at online checkout. Delivery cost is determined manually after receiving orders based on location, plant quantities, distance, and transport.
            </div>
            <label className="flex items-center justify-between rounded-xl border p-4 text-sm font-medium">
              COD Availability
              <input type="checkbox" defaultChecked className="size-4 accent-primary" />
            </label>
          </div>
        </SectionCard>
        <SectionCard title="Order settings">
          <div className="grid gap-4 p-5">
            <label className="grid gap-2 text-sm font-medium">
              Minimum Order Value
              <input
                type="number"
                value={settings.minOrderValue}
                onChange={(e) => setSettings({ ...settings, minOrderValue: Number(e.target.value) })}
                className="rounded-xl border bg-background px-3 py-2.5 font-normal"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Maximum COD Order Value
              <input
                type="number"
                value={settings.maxCodValue}
                onChange={(e) => setSettings({ ...settings, maxCodValue: Number(e.target.value) })}
                className="rounded-xl border bg-background px-3 py-2.5 font-normal"
              />
            </label>
          </div>
        </SectionCard>
      </div>
        <div className="mt-6 flex items-center gap-4">
          <button onClick={handleSave} className={buttonClass} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saving ? 'Saving...' : 'Save settings'}
          </button>
          {saved && <span className="text-sm font-semibold text-green-700">Business settings saved to database successfully.</span>}
        </div>
        </>
      )}
    </AdminLayout>
  )
}
