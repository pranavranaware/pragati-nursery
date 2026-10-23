import { fetchApi } from '@/lib/apiClient'
import { adminCategories, adminCustomers, adminOrders, adminPayments, adminProducts, type AdminCategory, type AdminCustomer, type AdminOrder, type AdminPayment, type AdminProduct } from '@/data/admin'
import { mapBackendProduct } from '@/services/catalogRepository'
import { productService } from '@/services/productService'

export type { AdminCategory, AdminCustomer, AdminOrder, AdminPayment, AdminProduct } from '@/data/admin'
export type AdminUser = { id: string; name: string; email: string; role: 'ADMIN' | 'STAFF' }
export type AuthState = { isAuthenticated: boolean; adminUser: AdminUser | null }

export const adminApi = {
  uploadMediaFile: async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      throw new Error('Only image and video files are allowed.')
    }
    const MAX_MB = 50
    if (file.size > MAX_MB * 1024 * 1024) {
      throw new Error(`File size exceeds maximum allowed limit of ${MAX_MB}MB.`)
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await fetchApi<any>('/admin/upload', {
      method: 'POST',
      body: formData,
    })
    const url = res?.data?.url || res?.url || ''
    if (!url) throw new Error('Failed to obtain uploaded file URL from server.')
    return url
  },
  products: {
    list: async (params?: { category?: string }): Promise<AdminProduct[]> => {
      try {
        const query = new URLSearchParams({ size: '100' })
        if (params?.category) query.set('category', params.category)
        const res = await fetchApi<any>(`/admin/products?${query.toString()}`)
        const data = res?.data ?? res
        const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : null

        if (items !== null) {
          return items.map((p: any): AdminProduct => {
            const mapped = mapBackendProduct(p)
            const status: AdminProduct['status'] =
              mapped.stockStatus === 'OUT_OF_STOCK'
                ? 'OUT_OF_STOCK'
                : mapped.stockStatus === 'LOW_STOCK'
                ? 'LOW_STOCK'
                : 'ACTIVE'

            return {
              id: mapped.id,
              nameEn: mapped.nameEn,
              nameMr: mapped.nameMr,
              name: mapped.name,
              slug: mapped.slug,
              categoryEn: mapped.categoryEn,
              categoryMr: mapped.categoryMr,
              category: mapped.category,
              price: mapped.price,
              stock: mapped.stockQuantity ?? 0,
              status,
              image: mapped.images?.[0]?.src || '',
              createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : 'Recent',
              sku: mapped.sku || '',
              descriptionEn: mapped.descriptionEn,
              descriptionMr: mapped.descriptionMr,
              description: mapped.description || '',
            }
          })
        }
      } catch (err) {
        console.warn('API admin products list error:', err)
      }
      return []
    },
    create: async (payload: Partial<AdminProduct> & { categoryId?: number }) => {
      return await productService.createProduct(payload as any)
    },
    update: async (id: number, payload: Partial<AdminProduct> & { categoryId?: number }) => {
      return await productService.updateProduct(id, payload as any)
    },
    remove: async (id: number) => {
      await productService.deleteProduct(id)
      return { id }
    },
  },
  categories: {
    list: async (): Promise<AdminCategory[]> => {
      try {
        const res = await fetchApi<any>('/admin/categories?size=100')
        const data = res?.data ?? res
        const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : null

        if (items !== null) {
          return items.map((c: any): AdminCategory => ({
            id: c.id,
            nameEn: c.nameEn || c.name,
            nameMr: c.nameMr,
            name: c.nameEn || c.name,
            slug: c.slug,
            descriptionEn: c.descriptionEn || c.description || '',
            descriptionMr: c.descriptionMr || '',
            description: c.descriptionEn || c.description || '',
            image: c.image || 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e',
            status: c.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
            productCount: c.productCount || 0,
          }))
        }
      } catch (err) {
        console.warn('API admin categories list error:', err)
      }
      return []
    },
    create: async (payload: Partial<AdminCategory>) => {
      const nameEn = payload.nameEn || payload.name || ''
      const res = await fetchApi<any>('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          nameEn,
          nameMr: payload.nameMr || '',
          name: nameEn,
          slug: payload.slug,
          descriptionEn: payload.descriptionEn || payload.description || '',
          descriptionMr: payload.descriptionMr || '',
          description: payload.descriptionEn || payload.description || '',
          image: payload.image,
          status: payload.status || 'ACTIVE',
        }),
      })
      return res
    },
    update: async (id: number, payload: Partial<AdminCategory>) => {
      const nameEn = payload.nameEn || payload.name
      const res = await fetchApi<any>(`/admin/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          nameEn,
          nameMr: payload.nameMr,
          name: nameEn,
          slug: payload.slug,
          descriptionEn: payload.descriptionEn || payload.description,
          descriptionMr: payload.descriptionMr,
          description: payload.descriptionEn || payload.description,
          image: payload.image,
          status: payload.status,
        }),
      })
      return res
    },
    remove: async (id: number) => {
      await fetchApi(`/admin/categories/${id}`, { method: 'DELETE' })
      return { id }
    },
  },
  orders: {
    list: async (): Promise<AdminOrder[]> => {
      try {
        const res = await fetchApi<any>('/admin/orders?size=100')
        const data = res?.data ?? res
        const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : null

        if (items !== null) {
          return items.map((o: any): AdminOrder => {
            const paymentStatus: AdminOrder['paymentStatus'] =
              o.payment?.status === 'PAID'
                ? 'PAID'
                : o.payment?.status === 'FAILED'
                ? 'FAILED'
                : o.payment?.status === 'REFUNDED'
                ? 'REFUNDED'
                : 'PENDING'

            const orderStatus: AdminOrder['status'] =
              ['PLACED', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(o.status)
                ? o.status
                : 'PLACED'

            const itemList = Array.isArray(o.items)
              ? o.items.map((item: any) => ({
                  productId: item.productId,
                  productName: item.productName || item.name || 'Plant Product',
                  sku: item.sku || '',
                  unitPrice: Number(item.unitPrice || item.price || 0),
                  quantity: Number(item.quantity || 1),
                  lineTotal: Number(item.lineTotal || (item.unitPrice || item.price || 0) * (item.quantity || 1)),
                  image: item.image || '',
                }))
              : []

            return {
              id: o.orderNumber,
              customer: o.shippingAddress?.fullName || 'Customer',
              email: o.shippingAddress?.email || '',
              mobile: o.shippingAddress?.mobile || '',
              date: o.orderDate ? new Date(o.orderDate).toLocaleDateString('en-IN') : 'Recent',
              orderDate: o.orderDate || undefined,
              items: itemList.length || 1,
              total: Number(o.totalAmount || 0),
              subtotal: o.subtotal ? Number(o.subtotal) : Number(o.totalAmount || 0),
              deliveryFee: o.deliveryFee !== undefined ? Number(o.deliveryFee) : 0,
              paymentMethod: o.payment?.method === 'COD' ? 'COD' : 'ONLINE',
              paymentStatus,
              status: orderStatus,
              address: o.shippingAddress?.address || '',
              city: o.shippingAddress?.city || '',
              state: o.shippingAddress?.state || '',
              pincode: o.shippingAddress?.pincode || '',
              landmark: o.shippingAddress?.landmark || '',
              paymentId: o.payment?.razorpayPaymentId || o.payment?.razorpayOrderId || undefined,
              itemList,
            }
          })
        }
      } catch (err) {
        console.warn('API admin orders list error:', err)
      }
      return []
    },
    updateStatus: async (id: string, status: AdminOrder['status']) => {
      return await fetchApi<any>(`/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },
  },
  payments: {
    list: async (): Promise<AdminPayment[]> => {
      try {
        const orders = await adminApi.orders.list()
        return orders.map((o, i) => ({
          id: o.paymentId || `PAY-${o.id}`,
          orderId: o.id,
          customer: o.customer,
          amount: o.total,
          method: o.paymentMethod,
          status: o.paymentStatus,
          date: o.date,
        }))
      } catch {
        return []
      }
    },
  },
  customers: {
    list: async (params?: { search?: string; district?: string; sort?: string; direction?: string }): Promise<AdminCustomer[]> => {
      try {
        const query = new URLSearchParams({ size: '100' })
        if (params?.search) query.set('search', params.search)
        if (params?.district) query.set('district', params.district)
        if (params?.sort) query.set('sort', params.sort)
        if (params?.direction) query.set('direction', params.direction)

        const res = await fetchApi<any>(`/admin/customers?${query.toString()}`)
        const data = res?.data ?? res
        const items = Array.isArray(data?.content) ? data.content : Array.isArray(data) ? data : null

        if (items !== null) {
          return items.map((c: any): AdminCustomer => ({
            id: c.id,
            userId: c.userId,
            name: c.name || 'Customer',
            mobile: c.mobile || '',
            email: c.email || '',
            address: c.address || '',
            city: c.city || '',
            district: c.district || '',
            state: c.state || '',
            pincode: c.pincode || '',
            orders: Number(c.totalOrders || 0),
            spent: Number(c.totalSpent || 0),
            firstOrderDate: c.firstOrderDate || undefined,
            lastOrderDate: c.lastOrderDate || undefined,
            lastOrder: c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('en-IN') : 'Recent',
            status: c.status === 'Returning' ? 'Returning' : 'New',
          }))
        }
      } catch (err) {
        console.warn('API admin customers list error:', err)
      }
      return []
    },
    getDistricts: async (): Promise<string[]> => {
      try {
        const res = await fetchApi<any>('/admin/customers/districts')
        const data = res?.data ?? res
        return Array.isArray(data) ? data : []
      } catch (err) {
        console.warn('API admin districts list error:', err)
        return []
      }
    },
  },
  auth: {
    login: async (email: string, password: string) => ({ email, password }),
    me: async (): Promise<AdminUser | null> => null,
    logout: async () => undefined,
  },
}
