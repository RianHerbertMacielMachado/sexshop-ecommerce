'use client'

import { useWishlistStore } from '@/stores/wishlistStore'
import ProductCard from '@/components/product/ProductCard'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const { items } = useWishlistStore()

  return (
    <div className="bg-background rounded-xl border shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">
        Lista de Desejos ({items.length})
      </h2>

      {items.length === 0 ? (
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
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
