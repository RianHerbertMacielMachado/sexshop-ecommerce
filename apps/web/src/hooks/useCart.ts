'use client'

import { useCartStore } from '@/stores/cartStore'
import type { ProductSummary, ProductVariant } from '@/types'

export function useCart() {
  const store = useCartStore()

  const addProduct = (
    product: ProductSummary,
    quantity: number = 1,
    variant?: ProductVariant
  ) => {
    store.addItem({
      id: product.id,
      productId: product.id,
      variantId: variant?.id ?? undefined,
      quantity,
      name: product.name,
      slug: product.slug,
      price: variant?.price ? Number(variant.price) : Number(product.price),
      image: product.images[0] ?? undefined,
      variantName: variant?.name ?? undefined,
      stock: variant ? variant.stock : product.stock,
      isDiscreet: product.isDiscreet,
    })
  }

  return {
    ...store,
    addProduct,
  }
}
