import { fetchApi } from '@/lib/apiClient'
import type { Address } from '@/types/order'

export interface BackendAddress {
  id: number
  fullName: string
  mobile: string
  email?: string
  address: string
  area?: string
  city: string
  district?: string
  state: string
  pincode: string
  landmark?: string
  isDefault: boolean
}

export const addressService = {
  async getAddresses(): Promise<BackendAddress[]> {
    return await fetchApi<BackendAddress[]>('/addresses')
  },

  async createAddress(address: Partial<BackendAddress>): Promise<BackendAddress> {
    return await fetchApi<BackendAddress>('/addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    })
  },

  async updateAddress(id: number, address: Partial<BackendAddress>): Promise<BackendAddress> {
    return await fetchApi<BackendAddress>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    })
  },

  async setDefaultAddress(id: number): Promise<BackendAddress> {
    return await fetchApi<BackendAddress>(`/addresses/${id}/default`, {
      method: 'PATCH',
    })
  },

  async deleteAddress(id: number): Promise<void> {
    await fetchApi(`/addresses/${id}`, { method: 'DELETE' })
  },
}

export default addressService
