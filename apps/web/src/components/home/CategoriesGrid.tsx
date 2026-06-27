'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CategorySummary } from '@/types'
import { isPlaceholderUrl } from '@/lib/utils'

export default function CategoriesGrid() {
  const { data: categories = [] } = useQuery<CategorySummary[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data.data.categories as CategorySummary[]
    },
    staleTime: 10 * 60 * 1000,
  })

  if (!categories.length) return null

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">
            Categorias
          </h2>
          <p className="text-zinc-500 mt-2">Explore nossa seleção completa</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.slice(0, 8).map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/categorias/${cat.slug}`} className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-violet-50 transition-all">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-100 to-pink-100 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  {cat.imageUrl ? (
                    <Image src={cat.imageUrl} alt={cat.name} width={64} height={64} className="w-full h-full object-cover" unoptimized={isPlaceholderUrl(cat.imageUrl)} />
                  ) : (
                    <span className="text-2xl">🛍️</span>
                  )}
                </div>
                <span className="text-xs font-medium text-zinc-700 text-center group-hover:text-violet-600 transition-colors line-clamp-2">
                  {cat.name}
                </span>
                {cat._count && (
                  <span className="text-xs text-zinc-400">{cat._count.products}</span>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
