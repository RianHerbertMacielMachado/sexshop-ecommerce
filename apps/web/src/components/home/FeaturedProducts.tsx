'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import type { ProductSummary } from '@/types'

export default function FeaturedProducts() {
  const { data: products = [], isLoading } = useQuery<ProductSummary[]>({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/products/featured')
      return data.data.products as ProductSummary[]
    },
    staleTime: 5 * 60 * 1000,
  })

  if (!isLoading && !products.length) return null

  return (
    <section className="py-14 bg-zinc-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
              ✨ Produtos em Destaque
            </h2>
            <p className="text-zinc-500 mt-1">Os favoritos dos nossos clientes</p>
          </div>
          <Link href="/produtos?featured=true" className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors">
            Ver todos <ArrowRight size={16} />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/produtos?featured=true"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full border-2 border-violet-600 text-violet-600 font-semibold hover:bg-violet-600 hover:text-white transition-all"
          >
            Ver Todos os Destaques <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}
