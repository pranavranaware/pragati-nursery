import { products, categoryList, formatPrice } from '@/types/product'

export type AdminProduct = {
  id: number
  nameEn?: string
  nameMr?: string
  name: string
  slug: string
  categoryEn?: string
  categoryMr?: string
  category: string
  price: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'LOW_STOCK'
  image: string
  createdAt: string
  sku: string
  descriptionEn?: string
  descriptionMr?: string
  description: string
}

export type AdminCategory = {
  id: number
  nameEn?: string
  nameMr?: string
  name: string
  slug: string
  descriptionEn?: string
  descriptionMr?: string
  description: string
  image: string
  status: 'ACTIVE' | 'INACTIVE'
  productCount: number
}

export type AdminOrderItem = {
  productId?: number
  productName: string
  sku?: string
  unitPrice: number
  quantity: number
  lineTotal: number
  image?: string
}

export type AdminOrder = {
  id: string
  customer: string
  email: string
  mobile: string
  date: string
  orderDate?: string
  items: number
  total: number
  subtotal?: number
  deliveryFee?: number
  paymentMethod: 'ONLINE' | 'COD'
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  status: 'PLACED' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  address: string
  city: string
  state: string
  pincode: string
  landmark?: string
  paymentId?: string
  itemList?: AdminOrderItem[]
}

export type AdminPayment = {
  id: string
  orderId: string
  customer: string
  amount: number
  method: 'ONLINE' | 'COD'
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
  date: string
}

export type AdminCustomer = {
  id: number
  userId?: number
  name: string
  mobile: string
  email: string
  address?: string
  city?: string
  district?: string
  state?: string
  pincode?: string
  orders: number
  spent: number
  firstOrderDate?: string
  lastOrderDate?: string
  lastOrder?: string
  status: 'New' | 'Returning'
}

/**
 * @deprecated FALLBACK MOCK DATA ONLY. Do not use for primary UI rendering.
 * All admin components must read from and write to the Spring Boot REST API (adminApi / backend endpoints).
 */
export const adminProducts: AdminProduct[] = products.map((p, i) => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  category: p.category,
  price: p.price,
  stock: i === 3 ? 4 : i === 6 ? 0 : 24 + i * 7,
  status: i === 6 ? 'OUT_OF_STOCK' : i === 3 ? 'LOW_STOCK' : 'ACTIVE',
  image: p.images[0]?.src || '',
  createdAt: 'Aug 08, 2026',
  sku: `PN-${String(p.id).padStart(4, '0')}`,
  description: p.description,
}))

/**
 * @deprecated FALLBACK MOCK DATA ONLY. Use adminApi.categories.list() instead.
 */
export const adminCategories: AdminCategory[] = categoryList.slice(1).map((c, i) => ({
  id: i + 1,
  ...c,
  status: 'ACTIVE',
  productCount: adminProducts.filter((p) => p.category === c.name).length,
}))

/**
 * @deprecated FALLBACK MOCK DATA ONLY. Use adminApi.orders.list() instead.
 */
export const adminOrders: AdminOrder[] = [
  {
    id: 'PN-2026-00001',
    customer: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    mobile: '+91 98765 43210',
    date: 'Aug 13, 2026',
    items: 3,
    total: 1250,
    paymentMethod: 'ONLINE',
    paymentStatus: 'PAID',
    status: 'PROCESSING',
    address: '24 Green Park Society',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411045',
    paymentId: 'pay_demo_8H2K91',
  },
  {
    id: 'PN-2026-00002',
    customer: 'Meera Joshi',
    email: 'meera.j@example.com',
    mobile: '+91 98220 11223',
    date: 'Aug 13, 2026',
    items: 2,
    total: 848,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'CONFIRMED',
    address: '18 Lake View Road',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400050',
  },
]

export const adminPayments: AdminPayment[] = adminOrders.map((o, i) => ({
  id: o.paymentId || `COD-${i + 1}`,
  orderId: o.id,
  customer: o.customer,
  amount: o.total,
  method: o.paymentMethod,
  status: o.paymentStatus,
  date: o.date,
}))

export const adminCustomers: AdminCustomer[] = [
  { id: 1, name: 'Rahul Sharma', mobile: '+91 98765 43210', email: 'rahul.sharma@example.com', orders: 8, spent: 12450, lastOrder: 'Aug 13, 2026', status: 'Returning' },
  { id: 2, name: 'Meera Joshi', mobile: '+91 98220 11223', email: 'meera.j@example.com', orders: 5, spent: 6840, lastOrder: 'Aug 13, 2026', status: 'Returning' },
]

export const dashboardStats = {
  totalOrders: 1248,
  todayOrders: 32,
  revenue: 384500,
  pending: 18,
  delivered: 967,
  products: adminProducts.length,
  lowStock: 3,
  online: 912,
  cod: 336,
}
export const revenueData = [42, 55, 48, 66, 58, 72, 68, 82, 76, 91, 86, 98]
export { formatPrice }

export function getAdminProduct(id: string) {
  return adminProducts.find((p) => String(p.id) === id)
}
export function getAdminOrder(id: string) {
  return adminOrders.find((o) => o.id === id)
}
