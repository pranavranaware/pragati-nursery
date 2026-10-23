import { fetchApi } from '@/lib/apiClient'
import { StoredOrderRef } from '@/lib/customerOrdersStorage'

export const orderHistoryService = {
  async fetchCustomerOrders(orders: StoredOrderRef[]): Promise<any[]> {
    if (!orders || orders.length === 0) return []
    const res = await fetchApi<any>('/order-history/fetch', {
      method: 'POST',
      body: JSON.stringify({ orders }),
    })
    return res?.data ?? (Array.isArray(res) ? res : [])
  },
}
