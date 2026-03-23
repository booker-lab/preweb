"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface StoreState {
  // Cart
  cartItems: { id: number; quantity: number }[]
  addToCart: (id: number, quantity?: number) => void
  removeFromCart: (id: number) => void
  updateCartQuantity: (id: number, quantity: number) => void
  getCartCount: () => number
  clearCart: () => void

  // Wishlist
  wishlist: number[]
  toggleWishlist: (id: number) => void
  isInWishlist: (id: number) => boolean
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Cart
      cartItems: [],
      addToCart: (id, quantity = 1) =>
        set((state) => {
          const existing = state.cartItems.find((item) => item.id === id)
          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.id === id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            }
          }
          return { cartItems: [...state.cartItems, { id, quantity }] }
        }),
      removeFromCart: (id) =>
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.id !== id),
        })),
      updateCartQuantity: (id, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),
      getCartCount: () => {
        const state = get()
        return state.cartItems.reduce((sum, item) => sum + item.quantity, 0)
      },
      clearCart: () => set({ cartItems: [] }),

      // Wishlist
      wishlist: [],
      toggleWishlist: (id) =>
        set((state) => ({
          wishlist: state.wishlist.includes(id)
            ? state.wishlist.filter((i) => i !== id)
            : [...state.wishlist, id],
        })),
      isInWishlist: (id) => get().wishlist.includes(id),
    }),
    {
      name: "green-hub-store",
    }
  )
)
