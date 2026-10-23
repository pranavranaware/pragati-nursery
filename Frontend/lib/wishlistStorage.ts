'use client'

const WISHLIST_KEY = 'pragati_wishlist_ids'

export function getWishlistIds(): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(WISHLIST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)
    }
  } catch (err) {
    console.warn('Failed to parse wishlist from localStorage:', err)
  }
  return []
}

export function saveWishlistIds(ids: number[]): void {
  if (typeof window === 'undefined') return
  try {
    const unique = Array.from(new Set(ids.filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0)))
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(unique))
    window.dispatchEvent(new CustomEvent('pragati-wishlist-changed', { detail: unique }))
  } catch (err) {
    console.warn('Failed to save wishlist to localStorage:', err)
  }
}

export function toggleWishlistId(productId: number): boolean {
  if (!productId || typeof productId !== 'number') return false
  const current = getWishlistIds()
  const exists = current.includes(productId)
  const updated = exists ? current.filter((id) => id !== productId) : [...current, productId]
  saveWishlistIds(updated)
  return !exists
}

export function removeFromWishlist(productId: number): void {
  const current = getWishlistIds()
  saveWishlistIds(current.filter((id) => id !== productId))
}

export function isInWishlist(productId: number): boolean {
  return getWishlistIds().includes(productId)
}
