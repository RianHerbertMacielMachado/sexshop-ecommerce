'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import type { CategorySummary } from '@/types'

const CATEGORY_EMOJIS: Record<string, string> = {
  vibradores: '💜',
  lubrificantes: '💧',
  fantasias: '🎭',
  acessorios: '✨',
  'jogos-eroticos': '🎲',
  masculino: '💙',
  feminino: '🌸',
  casais: '❤️',
}

function CategoriasContent() {
  const { data: categories = [], isLoading } = useQuery<CategorySummary[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data.data.categories as CategorySummary[]
    },
    staleTime: 10 * 60 * 1000,
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Hero */}
        <div className="bg-white border-b border-zinc-100 py-10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-zinc-900">Categorias</h1>
              <p className="text-zinc-500 mt-2">Explore nossa coleção por categoria</p>
            </motion.div>
          </div>
        </div>

        {/* Grid de Categorias */}
        <div className="container mx-auto px-4 py-10">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-zinc-200 animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📦</p>
              <p className="text-xl font-semibold text-zinc-700">Nenhuma categoria encontrada</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((cat, i) => {
                const slug = cat.slug ?? cat.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                const emoji = CATEGORY_EMOJIS[slug] ?? '🛍️'
                const count = cat._count?.products ?? 0

                return (
                  <motion.div
                    key={cat.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Link
                      href={`/categorias/${slug}`}
                      className="group flex flex-col items-center justify-center aspect-square bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 hover:shadow-md hover:border-violet-200 hover:-translate-y-1 transition-all duration-200"
                    >
                      <span className="text-4xl mb-3">{emoji}</span>
                      <h2 className="font-semibold text-zinc-900 text-center text-sm md:text-base group-hover:text-violet-700 transition-colors">
                        {cat.name}
                      </h2>
                      {count > 0 && (
                        <span className="mt-1 text-xs text-zinc-400">
                          {count} produto{count !== 1 ? 's' : ''}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CategoriasPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50">
          <div className="bg-white border-b border-zinc-100 py-10">
            <div className="container mx-auto px-4">
              <div className="h-9 w-40 bg-zinc-200 animate-pulse rounded-lg mb-2" />
              <div className="h-4 w-56 bg-zinc-100 animate-pulse rounded" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-zinc-200 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CategoriasContent />
    </Suspense>
  )
}
