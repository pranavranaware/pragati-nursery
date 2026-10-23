export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
export type MediaSource = 'UPLOAD' | 'INSTAGRAM' | 'NONE'
export type ProductMedia = { id: string; url: string; alt: string; sortOrder: number; primary: boolean; video?: { source: MediaSource; url?: string } }
export type ProductDomain = { id: number; sku: string; slug: string; name: string; categorySlug: string; price: number; originalPrice?: number; stockQuantity: number; stockStatus: StockStatus; media: ProductMedia[]; active: boolean }
export type CategoryDomain = { id: number; name: string; slug: string; description: string; image: string; active: boolean; productCount: number }
export type UserRole = 'ADMIN' | 'STAFF' | 'CUSTOMER'
export type AuthUser = { id: string; name: string; email: string; role: UserRole }
export type ApiState<T> = { data: T | null; loading: boolean; error: string | null }
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
export const orderStatusLabels: Record<OrderStatus, string> = { PENDING: 'Order placed', CONFIRMED: 'Confirmed', PROCESSING: 'Processing', SHIPPED: 'Shipped', OUT_FOR_DELIVERY: 'Out for delivery', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' }
export const orderStatusProgress: OrderStatus[] = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','OUT_FOR_DELIVERY','DELIVERED']
export function getStatusTimeline(status: OrderStatus) { const index = orderStatusProgress.indexOf(status); return orderStatusProgress.map((step, i) => ({ status: step, complete: i <= index, current: step === status })) }
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export const stockStatus = (quantity: number): StockStatus => quantity <= 0 ? 'OUT_OF_STOCK' : quantity <= 5 ? 'LOW_STOCK' : 'IN_STOCK'
export const toLegacyStock = (status: StockStatus) => status === 'IN_STOCK' ? 'In Stock' : status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'
export const fromLegacyStock = (status: string): StockStatus => status === 'In Stock' ? 'IN_STOCK' : status === 'Low Stock' ? 'LOW_STOCK' : 'OUT_OF_STOCK'
export const apiError = (message = 'Something went wrong. Please try again.') => ({ data: null, loading: false, error: message })
export const apiLoading = <T>(): ApiState<T> => ({ data: null, loading: true, error: null })
export const apiSuccess = <T>(data: T): ApiState<T> => ({ data, loading: false, error: null })
