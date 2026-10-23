export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'ONLINE' | 'COD'
export type Address = { fullName: string; mobile: string; email: string; address: string; area?: string; city: string; district?: string; state: string; pincode: string; landmark?: string }
export type OrderItem = { productId: number; name: string; quantity: number; price: number; image: string }
export type Payment = { method: PaymentMethod; status: PaymentStatus }
export type Order = { orderNumber: string; items: OrderItem[]; address: Address; payment: Payment; subtotal: number; delivery: number; total: number; status: OrderStatus; orderDate: string }
export const statusLabels: Record<OrderStatus, string> = { PLACED: 'Order Placed', CONFIRMED: 'Order Confirmed', PROCESSING: 'Processing', SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for Delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' }
export const paymentLabels: Record<PaymentMethod, string> = { ONLINE: 'Online Payment', COD: 'Cash on Delivery' }
export type CheckoutValues = Address & { paymentMethod: PaymentMethod }
export const deliveryFee = (_subtotal: number) => 0
export const formatOrderNumber = (id: number) => `PN-2026-${String(id).padStart(5, '0')}`
