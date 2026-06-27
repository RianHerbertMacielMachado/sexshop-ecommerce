'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react'
import { formatCurrency, calculateDiscount, cn, isPlaceholderUrl } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import type { ProductSummary } from '@/types'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: ProductSummary
  className?: string
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addProduct } = useCart()
  const { isAuthenticated } = useAuthStore()
  const { toggleWishlist, isInWishlist } = useWishlistStore()

  const discount = calculateDiscount(product.price, product.compareAtPrice ?? 0)
  const inWishlist = isInWishlist(product.id)
  const isOutOfStock = product.stock === 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isOutOfStock) return
    addProduct(product, 1)
  }

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Faça login para salvar produtos')
      return
    }
    await toggleWishlist(product.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('group relative bg-white rounded-2xl border border-zinc-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300', className)}
    >
      {/* Image */}
      <Link href={`/produtos/${product.slug}`}>
        <div className="relative aspect-square overflow-hidden bg-zinc-100">
          {product.images[0] ? (
          <Image
            src={product.images?.[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={isPlaceholderUrl(product.images?.[0])}
          />

          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-100 flex items-center justify-center">
              <ShoppingCart size={32} className="text-zinc-400" />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                -{discount}%
              </span>
            )}
            {product.isDiscreet && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/80 text-white text-xs font-medium">
                🔒 Discreto
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-500 text-white text-xs font-medium">
                Esgotado
              </span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleWishlist}
              className={cn(
                'w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all',
                inWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white text-zinc-600 hover:bg-red-50 hover:text-red-500'
              )}
            >
              <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <Link
              href={`/produtos/${product.slug}`}
              className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-zinc-600 hover:bg-violet-50 hover:text-violet-600 transition-all"
            >
              <Eye size={14} />
            </Link>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3">
        <Link href={`/produtos/${product.slug}`}>
          <p className="text-xs text-zinc-400 mb-1 truncate">
            {product.category?.name}
          </p>
          <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 mb-2 hover:text-violet-600 transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {(product.reviewCount ?? 0) > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={11}
                  className={
                    star <= Math.round(product.averageRating ?? 0)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-zinc-200 fill-zinc-200'
                  }
                />
              ))}
            </div>
            <span className="text-xs text-zinc-400">({product.reviewCount})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base font-bold text-violet-600">
            {formatCurrency(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-zinc-400 line-through">
              {formatCurrency(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={cn(
            'flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-sm font-medium transition-all',
            isOutOfStock
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'gradient-primary text-white hover:opacity-90 active:scale-95'
          )}
        >
          <ShoppingCart size={14} />
          {isOutOfStock ? 'Esgotado' : 'Adicionar'}
        </button>
      </div>
    </motion.div>
  )
}
