import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Listing } from "@/types"
type CartItem = { listing: Listing; quantity: number }
type CartState = { items: CartItem[]; add: (listing: Listing) => void; remove: (listingId: string) => void; clear: () => void; total: () => number; count: () => number }
export const useCart = create<CartState>()(persist((set, get) => ({
  items: [], add: (listing) => set((s) => { if (s.items.find((i) => i.listing.id === listing.id)) return s; return { items: [...s.items, { listing, quantity: 1 }] } }),
  remove: (listingId) => set((s) => ({ items: s.items.filter((i) => i.listing.id !== listingId) })),
  clear: () => set({ items: [] }), total: () => get().items.reduce((sum, i) => sum + i.listing.price * i.quantity, 0),
  count: () => get().items.length,
}), { name: "eduswap-cart" }))
