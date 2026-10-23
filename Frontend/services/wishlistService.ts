import { fetchApi } from '@/lib/apiClient'
import type { Product } from '@/types/product'

export interface WishlistItemResponse {
  productId: number
  name: string
  slug: string
  image: string
  price: number
  stockStatus: string
}

export interface WishlistResponse {
  items: WishlistItemResponse[]
}

export const wishlistService = {
  async getWishlist(): Promise<WishlistResponse> {
    return await fetchApi<WishlistResponse>('/wishlist')
  },

  async addToWishlist(productId: number): Promise<WishlistResponse> {
    return await fetchApi<WishlistResponse>('/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    })
  },

  async removeFromWishlist(productId: number): Promise<WishlistResponse> {
    return await fetchApi<WishlistResponse>(`/wishlist/items/${productId}`, {
      method: 'DELETE',
    })
  },

  async checkExists(productId: number): Promise<boolean> {
    try {
      const res = await fetchApi<{ exists: boolean }>(`/wishlist/items/${productId}/exists`)
      return Boolean(res?.exists)
    } catch {
      return false
    }
  },
}

export default wishlistService
