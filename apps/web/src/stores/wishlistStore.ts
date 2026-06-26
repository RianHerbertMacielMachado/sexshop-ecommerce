import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

interface WishlistStore {
  productIds: string[]
  isLoading: boolean

  fetchWishlist: () => Promise<void>
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  toggleWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      productIds: [],
      isLoading: false,

      fetchWishlist: async () => {
        try {
          const { data } = await api.get('/wishlist')
          const ids = (data.data.wishlist as Array<{ productId: string }>).map((w) => w.productId)
          set({ productIds: ids })
        } catch {
          // silencia erros de fetch
        }
      },

      addToWishlist: async (productId) => {
        set({ isLoading: true })
        try {
          await api.post('/wishlist', { productId })
          set((state) => ({
            productIds: [...new Set([...state.productIds, productId])],
            isLoading: false,
          }))
          toast.success('Adicionado à lista de desejos ❤️')
        } catch {
          set({ isLoading: false })
          throw new Error('Falha ao adicionar à lista de desejos')
        }
      },

      removeFromWishlist: async (productId) => {
        set({ isLoading: true })
        try {
          await api.delete(`/wishlist/${productId}`)
          set((state) => ({
            productIds: state.productIds.filter((id) => id !== productId),
            isLoading: false,
          }))
          toast.success('Removido da lista de desejos')
        } catch {
          set({ isLoading: false })
        }
      },

      toggleWishlist: async (productId) => {
        if (get().isInWishlist(productId)) {
          await get().removeFromWishlist(productId)
        } else {
          await get().addToWishlist(productId)
        }
      },

      isInWishlist: (productId) => get().productIds.includes(productId),

      clearWishlist: () => set({ productIds: [] }),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ productIds: state.productIds }),
    }
  )
)
