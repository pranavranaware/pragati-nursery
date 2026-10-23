import { fetchApi } from '@/lib/apiClient'

export type BusinessSettings = {
  storeName: string
  phone: string
  email: string
  address: string
  deliveryFee: number
  minOrderValue: number
  maxCodValue: number
}

const LEGACY_STORAGE_KEY = 'pragati-business-settings-v1'

export const defaultBusinessSettings: BusinessSettings = {
  storeName: 'Pragati Nursery',
  phone: '+91 9822101088',
  email: 'info@pragatinursery.com',
  address: 'Shahajirao Tanpure Farm, Nandgaon Road, Vadgaon Tanpura, Tal. Karjat, Dist. Ahilyanagar, Maharashtra',
  deliveryFee: 50,
  minOrderValue: 299,
  maxCodValue: 5000,
}

export const businessSettingsService = {
  async getSettings(): Promise<BusinessSettings> {
    try {
      const res = await fetchApi<any>('/settings/business')
      const data = res?.data ?? res
      if (data && data.storeName) {
        const fetched: BusinessSettings = {
          storeName: data.storeName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          deliveryFee: Number(data.deliveryFee ?? 50),
          minOrderValue: Number(data.minOrderValue ?? 299),
          maxCodValue: Number(data.maxCodValue ?? 5000),
        }

        // Automatic one-time migration from legacy localStorage if custom data exists
        if (typeof window !== 'undefined') {
          try {
            const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
            if (legacy) {
              const parsed = JSON.parse(legacy)
              if (
                parsed.storeName !== fetched.storeName ||
                parsed.phone !== fetched.phone ||
                parsed.email !== fetched.email ||
                parsed.address !== fetched.address
              ) {
                await this.saveSettings({ ...fetched, ...parsed }).catch(() => {})
              }
              localStorage.removeItem(LEGACY_STORAGE_KEY)
            }
          } catch (e) {
            console.warn('Legacy localStorage migration check failed:', e)
          }
        }

        return fetched
      }
    } catch (err) {
      console.warn('Failed to fetch business settings from backend database:', err)
    }
    return defaultBusinessSettings
  },

  async saveSettings(settings: Partial<BusinessSettings>): Promise<BusinessSettings> {
    const current = await this.getSettings().catch(() => defaultBusinessSettings)
    const payload = {
      storeName: settings.storeName ?? current.storeName,
      phone: settings.phone ?? current.phone,
      email: settings.email ?? current.email,
      address: settings.address ?? current.address,
      deliveryFee: settings.deliveryFee ?? current.deliveryFee,
      minOrderValue: settings.minOrderValue ?? current.minOrderValue,
      maxCodValue: settings.maxCodValue ?? current.maxCodValue,
    }

    const res = await fetchApi<any>('/admin/settings/business', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    const data = res?.data ?? res
    const updated: BusinessSettings = {
      storeName: data.storeName || payload.storeName,
      phone: data.phone || payload.phone,
      email: data.email || payload.email,
      address: data.address || payload.address,
      deliveryFee: Number(data.deliveryFee ?? payload.deliveryFee),
      minOrderValue: Number(data.minOrderValue ?? payload.minOrderValue),
      maxCodValue: Number(data.maxCodValue ?? payload.maxCodValue),
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      window.dispatchEvent(new Event('pragati-settings-changed'))
    }

    return updated
  },
}
