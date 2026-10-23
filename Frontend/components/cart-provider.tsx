'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { formatMediaUrl, type Product, type CartItem } from '@/types/product'

type CartContextValue = {
  items: CartItem[]
  count: number
  subtotal: number
  add: (product: Product, quantity?: number) => void
  update: (id: number, quantity: number) => void
  remove: (id: number) => void
  clear: () => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)
const CART_KEY = 'pragati-cart'
const maxQuantity = (product: Product) =>
  product.stock === 'Out of Stock' ? 0 : product.stock === 'Low Stock' ? 5 : 20

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const skipInitialPersist = useRef(true)

  const refreshCart = async () => {
    try {
      const saved = sessionStorage.getItem(CART_KEY)
      if (saved) setItems(JSON.parse(saved) as CartItem[])
    } catch { /* Ignore */ }
  }

  useEffect(() => {
    refreshCart()
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (skipInitialPersist.current) {
      skipInitialPersist.current = false
      return
    }
    sessionStorage.setItem(CART_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const add = (product: Product, quantity = 1) => {
    setItems((current) => {
      const limit = maxQuantity(product)
      if (limit === 0) return current
      const found = current.find((i) => i.product.id === product.id)
      return found
        ? current.map((i) =>
            i.product.id === product.id
              ? { ...i, product, quantity: Math.min(limit, i.quantity + Math.max(1, quantity)) }
              : i
          )
        : [...current, { product, quantity: Math.min(limit, Math.max(1, quantity)) }]
    })
  }

  const update = (id: number, quantity: number) => {
    if (quantity <= 0) {
      return remove(id)
    }
    setItems((current) =>
      current
        .map((i) => (i.product.id === id ? { ...i, quantity: Math.min(maxQuantity(i.product), Math.max(0, quantity)) } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const remove = (id: number) => {
    setItems((current) => current.filter((i) => i.product.id !== id))
  }

  const clear = () => {
    setItems([])
    try {
      sessionStorage.removeItem(CART_KEY)
    } catch { /* Ignore */ }
  }

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal: items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
      add,
      update,
      remove,
      clear,
      refreshCart,
    }),
    [items]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
export { maxQuantity }
