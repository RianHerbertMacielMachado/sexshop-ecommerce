'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShoppingCart, Heart, Star, Minus, Plus, Package, ChevronRight, Share2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCart } from '@/hooks/useCart'
import { useAuthStore } from '@/stores/authStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatCurrency, calculateDiscount, cn, isPlaceholderUrl } from '@/lib/utils'
import { formatStockStatus } from '@/lib/formatters'
import type { Product, ProductVariant } from '@/types'
import ProductCard from './ProductCard'
import ProductReviews from './ProductReviews'
import toast from 'react-hot-toast'

interface Props {
  product: Product
}

export default function ProductDetailClient({ product }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description')
  const [isDiscreet, setIsDiscreet] = useState(false)

  const { addProduct } = useCart()
  const { isAuthenticated } = useAuthStore()
  const { toggleWishlist, isInWishlist } = useWishlistStore()

  const { data: related = [] } = useQuery({
    queryKey: ['products', 'related', product.id],
    queryFn: async () => {
      const { data } = await api.get(`/products/related/${product.id}`)
      return data.data.products
    },
  })

  const currentPrice = selectedVariant?.price ? Number(selectedVariant.price) : Number(product.price)
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock
  const discount = calculateDiscount(currentPrice, Number(product.compareAtPrice ?? 0))
  const stockStatus = formatStockStatus(currentStock)
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = () => {
    addProduct(
      { ...product, price: currentPrice, stock: currentStock } as Parameters<typeof addProduct>[0],
      quantity,
      selectedVariant ?? undefined
    )
    if (isDiscreet) {
      import('@/stores/cartStore').then(({ useCartStore }) => {
        useCartStore.getState().setDiscreetPackaging(true)
      })
    }
  }

  const handleBuyNow = async () => {
    handleAddToCart()
    window.location.href = '/checkout'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
        <Link href="/" className="hover:text-violet-600 transition-colors">Home</Link>
        <ChevronRight size={14} />
        {product.category?.parent && (
          <>
            <Link href={`/categorias/${product.category.parent.slug}`} className="hover:text-violet-600 transition-colors">
              {product.category.parent.name}
            </Link>
            <ChevronRight size={14} />
          </>
        )}
        <Link href={`/categorias/${product.category?.slug}`} className="hover:text-violet-600 transition-colors">
          {product.category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-zinc-600 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-zinc-100 mb-3 group">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized={isPlaceholderUrl(product.images[selectedImage])}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart size={48} className="text-zinc-300" />
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
                -{discount}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    'shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all',
                    i === selectedImage ? 'border-violet-500 scale-95' : 'border-transparent hover:border-zinc-300'
                  )}
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} width={64} height={64} className="w-full h-full object-cover" unoptimized={isPlaceholderUrl(img)} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            {product.category && (
              <Link href={`/categorias/${product.category.slug}`} className="text-xs font-medium text-violet-600 uppercase tracking-wider">
                {product.category.name}
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mt-1 leading-tight">{product.name}</h1>
          </div>

          {(product.reviewCount ?? 0) > 0 && (
            <a href="#reviews" className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= Math.round(product.averageRating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'} />
                ))}
              </div>
              <span className="text-sm text-zinc-500">{(product.averageRating ?? 0).toFixed(1)} ({product.reviewCount} avaliações)</span>
            </a>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-violet-600">{formatCurrency(currentPrice)}</span>
            {product.compareAtPrice && Number(product.compareAtPrice) > currentPrice && (
              <span className="text-lg text-zinc-400 line-through">{formatCurrency(Number(product.compareAtPrice))}</span>
            )}
            {discount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-sm font-semibold">
                Economia de {formatCurrency(Number(product.compareAtPrice) - currentPrice)}
              </span>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-zinc-600 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-zinc-900 mb-2">Opções disponíveis:</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.filter((v) => v.isActive).map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id === selectedVariant?.id ? null : variant)}
                    disabled={variant.stock === 0}
                    className={cn(
                      'px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                      variant.id === selectedVariant?.id
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
                        : variant.stock === 0
                        ? 'border-zinc-100 text-zinc-300 cursor-not-allowed line-through'
                        : 'border-zinc-200 text-zinc-700 hover:border-violet-300'
                    )}
                  >
                    {variant.name}
                    {variant.price && Number(variant.price) !== Number(product.price) && (
                      <span className="ml-1 text-xs opacity-70">+{formatCurrency(Number(variant.price) - Number(product.price))}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium w-fit', stockStatus.bgColor, stockStatus.color)}>
            <Package size={14} />
            {stockStatus.label}
          </div>

          {/* Quantity */}
          {currentStock > 0 && (
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-zinc-700">Quantidade:</p>
              <div className="flex items-center border border-zinc-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-zinc-100 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 font-semibold text-zinc-900 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(Math.min(currentStock, quantity + 1))} className="px-3 py-2 hover:bg-zinc-100 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Discreet packaging */}
          {product.isDiscreet && (
            <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 rounded-xl p-3">
              <input type="checkbox" checked={isDiscreet} onChange={(e) => setIsDiscreet(e.target.checked)} className="w-4 h-4 accent-violet-600" />
              <div>
                <p className="text-sm font-medium text-zinc-900">📦 Solicitar Embalagem Discreta</p>
                <p className="text-xs text-zinc-500">Enviado sem identificação do conteúdo</p>
              </div>
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={currentStock === 0}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all',
                currentStock === 0
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'gradient-primary text-white hover:opacity-90 active:scale-95'
              )}
            >
              <ShoppingCart size={18} />
              {currentStock === 0 ? 'Produto Esgotado' : 'Adicionar ao Carrinho'}
            </button>
            <button
              onClick={() => {
                if (!isAuthenticated) { toast.error('Faça login para salvar'); return }
                toggleWishlist(product.id)
              }}
              className={cn(
                'p-3.5 rounded-xl border-2 transition-all',
                inWishlist ? 'border-red-200 bg-red-50 text-red-500' : 'border-zinc-200 text-zinc-500 hover:border-red-200 hover:text-red-500'
              )}
            >
              <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          {currentStock > 0 && (
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 rounded-xl border-2 border-violet-500 text-violet-700 font-semibold text-sm hover:bg-violet-50 transition-colors"
            >
              Comprar Agora
            </button>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {[
              { icon: '🔒', label: 'Compra Segura' },
              { icon: '📦', label: 'Entrega Discreta' },
              { icon: '↩️', label: 'Troca em 30 dias' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-1 p-2 bg-zinc-50 rounded-xl text-center">
                <span className="text-lg">{icon}</span>
                <span className="text-xs text-zinc-600 font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div id="description" className="mb-16">
        <div className="flex border-b border-zinc-200 mb-8 overflow-x-auto scrollbar-hide">
          {(['description', 'specs', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-6 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all -mb-px',
                activeTab === tab ? 'border-violet-600 text-violet-600' : 'border-transparent text-zinc-500 hover:text-zinc-700'
              )}
            >
              {{ description: 'Descrição', specs: 'Especificações', reviews: `Avaliações (${product.reviewCount ?? 0})` }[tab]}
            </button>
          ))}
        </div>

        {activeTab === 'description' && (
          <div className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: product.description ?? '' }} />
        )}
        {activeTab === 'specs' && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {product.weight && (
              <div className="p-4 bg-zinc-50 rounded-xl">
                <p className="text-xs text-zinc-400 mb-1">Peso</p>
                <p className="font-medium text-zinc-900">{product.weight}g</p>
              </div>
            )}
            {product.sku && (
              <div className="p-4 bg-zinc-50 rounded-xl">
                <p className="text-xs text-zinc-400 mb-1">SKU</p>
                <p className="font-medium text-zinc-900">{product.sku}</p>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="p-4 bg-zinc-50 rounded-xl col-span-full">
                <p className="text-xs text-zinc-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {product.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'reviews' && (
          <div id="reviews">
            <ProductReviews productId={product.id} productName={product.name} />
          </div>
        )}
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">Produtos Relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.slice(0, 6).map((p: Parameters<typeof ProductCard>[0]['product']) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
