'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import ProductCard from '@/components/product/ProductCard'
import type { ProductSummary } from '@/types'

export default function NewArrivals() {
  const { data: products = [], isLoading } = useQuery<ProductSummary[]>({
    queryKey: ['products', 'new-arrivals'],
    queryFn: async () => {
      const { data } = await api.get('/products/new-arrivals')
      return data.data.products as ProductSummary[]
    },
  })

  if (!isLoading && !products.length) return null

  return (
    <section className="py-14 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">🆕 Novidades</h2>
            <p className="text-zinc-500 mt-1">Recém chegados na loja</p>
          </div>
          <Link href="/produtos?sort=newest" className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700">
            Ver todos <ArrowRight size={16} />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
