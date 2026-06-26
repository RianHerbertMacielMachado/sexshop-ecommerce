import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import toast from 'react-hot-toast'
import type { CartItem } from '@/types'

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  couponCode: string | null
  couponDiscount: number
  selectedShippingZoneId: string | null
  shippingCost: number
  isDiscreetPackaging: boolean

  addItem: (item: CartItem) => void
  removeItem: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  applyCoupon: (code: string, discount: number) => void
  removeCoupon: () => void
  setShipping: (zoneId: string, cost: number) => void
  setDiscreetPackaging: (value: boolean) => void

  getSubtotal: () => number
  getTotal: () => number
  getItemCount: () => number
  getItemQuantity: (productId: string, variantId?: string | null) => number
  hasDiscreetItems: () => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      couponCode: null,
      couponDiscount: 0,
      selectedShippingZoneId: null,
      shippingCost: 0,
      isDiscreetPackaging: false,

      addItem: (newItem) => {
        const { items } = get()
        const existingIndex = items.findIndex(
          (i) => i.productId === newItem.productId && i.variantId === newItem.variantId
        )

        if (existingIndex >= 0) {
          const existing = items[existingIndex]
          const newQuantity = existing.quantity + newItem.quantity

          if (newQuantity > newItem.stock) {
            toast.error(`Estoque disponível: ${newItem.stock} unidades`)
            return
          }

          const updated = [...items]
          updated[existingIndex] = { ...existing, quantity: newQuantity }
          set({ items: updated, isOpen: true })
          toast.success('Quantidade atualizada no carrinho')
        } else {
          if (newItem.quantity > newItem.stock) {
            toast.error(`Estoque disponível: ${newItem.stock} unidades`)
            return
          }
          set({ items: [...items, newItem], isOpen: true })
          toast.success('Produto adicionado ao carrinho!')
        }
      },

      removeItem: (productId, variantId) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && i.variantId === variantId)
          ),
        }))
        toast.success('Produto removido do carrinho')
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId)
          return
        }

        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId && item.variantId === variantId) {
              if (quantity > item.stock) {
                toast.error(`Estoque disponível: ${item.stock} unidades`)
                return item
              }
              return { ...item, quantity }
            }
            return item
          }),
        }))
      },

      clearCart: () => {
        set({
          items: [],
          couponCode: null,
          couponDiscount: 0,
          selectedShippingZoneId: null,
          shippingCost: 0,
          isDiscreetPackaging: false,
        })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      applyCoupon: (code, discount) => {
        set({ couponCode: code, couponDiscount: discount })
        toast.success(`Cupom ${code} aplicado!`)
      },

      removeCoupon: () => {
        set({ couponCode: null, couponDiscount: 0 })
        toast.success('Cupom removido')
      },

      setShipping: (zoneId, cost) => {
        set({ selectedShippingZoneId: zoneId, shippingCost: cost })
      },

      setDiscreetPackaging: (value) => {
        set({ isDiscreetPackaging: value })
      },

      getSubtotal: () => {
        return get().items.reduce((acc, item) => acc + item.price * item.quantity, 0)
      },

      getTotal: () => {
        const { couponDiscount, shippingCost } = get()
        const subtotal = get().getSubtotal()
        return Math.max(0, subtotal - couponDiscount + shippingCost)
      },

      getItemCount: () => {
        return get().items.reduce((acc, item) => acc + item.quantity, 0)
      },

      getItemQuantity: (productId, variantId) => {
        const item = get().items.find(
          (i) => i.productId === productId && i.variantId === variantId
        )
        return item?.quantity ?? 0
      },

      hasDiscreetItems: () => {
        return get().items.some((item) => item.isDiscreet)
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        couponDiscount: state.couponDiscount,
        selectedShippingZoneId: state.selectedShippingZoneId,
        shippingCost: state.shippingCost,
        isDiscreetPackaging: state.isDiscreetPackaging,
      }),
    }
  )
)
