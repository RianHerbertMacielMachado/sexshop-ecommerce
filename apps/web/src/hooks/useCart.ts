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
      productId: product.id,
      variantId: variant?.id ?? null,
      quantity,
      name: product.name,
      slug: product.slug,
      price: variant?.price ? Number(variant.price) : Number(product.price),
      originalPrice: Number(product.price),
      image: product.images[0] ?? null,
      variantName: variant?.name ?? null,
      stock: variant ? variant.stock : product.stock,
      isDiscreet: product.isDiscreet,
      sku: product.id,
    })
  }

  return {
    ...store,
    addProduct,
  }
}
