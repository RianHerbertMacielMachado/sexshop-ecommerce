'use client'

import { useWishlistStore } from '@/stores/wishlistStore'
import ProductCard from '@/components/product/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { ProductSummary } from '@/types'

export default function WishlistPage() {
  const { productIds } = useWishlistStore()

  const { data: products = [] } = useQuery<ProductSummary[]>({
    queryKey: ['wishlist-products', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return []
      const results = await Promise.all(
        productIds.map((id) =>
          api.get(`/products/${id}`).then((r) => r.data.data.product as ProductSummary).catch(() => null)
        )
      )
      return results.filter((p): p is ProductSummary => p !== null)
    },
    enabled: productIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  return (
    <div className="bg-background rounded-xl border shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">
        Lista de Desejos ({productIds.length})
      </h2>

      {productIds.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            Sua lista de desejos está vazia.
          </p>
          <Link
            href="/produtos"
            className="mt-3 inline-block text-primary hover:underline text-sm"
          >
            Explorar produtos →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map((product: ProductSummary) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
