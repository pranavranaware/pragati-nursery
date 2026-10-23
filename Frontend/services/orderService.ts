import { fetchApi } from '@/lib/apiClient'
import type { CheckoutValues, Order, PaymentMethod } from '@/types/order'
import { deliveryFee, formatOrderNumber } from '@/types/order'

export interface OrderCreatedResponse {
  orderId: number
  orderNumber: string
  status: string
  totalAmount: number
  paymentMethod: PaymentMethod
  paymentStatus: string
  guestCheckoutToken?: string
}

export interface RazorpayOrderResponse {
  orderId: number
  orderNumber: string
  razorpayOrderId: string
  razorpayKeyId: string
  amount: number
  amountInPaise: number
  currency: string
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
}

let latestOrder: Order | null = null

export async function createRealOrder(payload: {
  addressId?: number
  paymentMethod: PaymentMethod
  items?: any[]
  address?: any
  cancelOrderId?: number
  guestCheckoutToken?: string
}): Promise<OrderCreatedResponse> {
  return await fetchApi<OrderCreatedResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function createRazorpayOrder(orderId: number, guestCheckoutToken?: string): Promise<RazorpayOrderResponse> {
  return await fetchApi<RazorpayOrderResponse>('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ orderId, guestCheckoutToken }),
  })
}

export async function cancelOrder(orderId: number, guestCheckoutToken?: string): Promise<any> {
  const url = guestCheckoutToken
    ? `/orders/${orderId}/cancel?guestCheckoutToken=${encodeURIComponent(guestCheckoutToken)}`
    : `/orders/${orderId}/cancel`
  return await fetchApi<any>(url, { method: 'POST' })
}

export async function verifyRazorpayPayment(payload: VerifyPaymentRequest): Promise<any> {
  return await fetchApi<any>('/payments/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getCustomerOrders(page = 0, size = 10): Promise<any> {
  return await fetchApi<any>(`/orders?page=${page}&size=${size}`)
}

export async function lookupOrders(emailOrMobile: string): Promise<any[]> {
  const res = await fetchApi<any>(`/orders/lookup?emailOrMobile=${encodeURIComponent(emailOrMobile)}`)
  const list = Array.isArray(res) ? res : res?.content || res || []
  return list.map((orderVal: any) => ({
    orderNumber: orderVal.orderNumber,
    items: (orderVal.items || []).map((it: any) => ({
      productId: it.productId,
      name: it.productName,
      quantity: it.quantity,
      price: Number(it.unitPrice),
      image: it.image || '',
    })),
    address: {
      fullName: orderVal.shippingAddress?.fullName || '',
      mobile: orderVal.shippingAddress?.mobile || '',
      address: orderVal.shippingAddress?.address || '',
      city: orderVal.shippingAddress?.city || '',
      state: orderVal.shippingAddress?.state || '',
      pincode: orderVal.shippingAddress?.pincode || '',
      landmark: orderVal.shippingAddress?.landmark || '',
    },
    payment: {
      method: orderVal.payment?.method || 'COD',
      status: orderVal.payment?.status || 'PENDING',
    },
    subtotal: Number(orderVal.subtotal),
    delivery: Number(orderVal.deliveryFee),
    total: Number(orderVal.totalAmount),
    status: orderVal.status,
    orderDate: orderVal.orderDate,
  }))
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  try {
    const res = await fetchApi<any>(`/orders/number/${orderNumber}`)
    if (res) {
      const mappedOrder: Order = {
        orderNumber: res.orderNumber,
        items: (res.items || []).map((it: any) => ({
          productId: it.productId,
          name: it.productName,
          quantity: it.quantity,
          price: Number(it.unitPrice),
          image: it.image || '',
        })),
        address: {
          fullName: res.shippingAddress?.fullName || '',
          mobile: res.shippingAddress?.mobile || '',
          email: res.shippingAddress?.email || '',
          address: res.shippingAddress?.address || '',
          city: res.shippingAddress?.city || '',
          state: res.shippingAddress?.state || '',
          pincode: res.shippingAddress?.pincode || '',
          landmark: res.shippingAddress?.landmark || '',
        },
        payment: {
          method: res.payment?.method || 'COD',
          status: res.payment?.status || 'PENDING',
        },
        subtotal: Number(res.subtotal),
        delivery: Number(res.deliveryFee),
        total: Number(res.totalAmount),
        status: res.status,
        orderDate: res.orderDate,
      }
      latestOrder = mappedOrder
      return mappedOrder
    }
  } catch {
    // Fallback to local session storage
  }
  return latestOrder?.orderNumber === orderNumber ? latestOrder : null
}

export function createMockOrder(values: CheckoutValues, items: { productId: number; quantity: number }[]): Order {
  const orderItems = items.map(item => ({
    productId: item.productId,
    name: 'Plant',
    quantity: item.quantity,
    price: 250,
    image: '',
  }))
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  latestOrder = {
    orderNumber: formatOrderNumber(1),
    items: orderItems,
    address: values,
    payment: { method: values.paymentMethod, status: 'PENDING' },
    subtotal,
    delivery: 0,
    total: subtotal,
    status: 'PLACED',
    orderDate: new Date().toISOString(),
  }
  return latestOrder
}

export function getMockOrder(orderNumber: string) {
  return latestOrder?.orderNumber === orderNumber ? latestOrder : null
}
