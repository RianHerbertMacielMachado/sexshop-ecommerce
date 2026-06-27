'use client'

import { Suspense, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import Pagination from '@/components/common/Pagination'
import type { ProductSummary, CategorySummary, PaginatedResponse } from '@/types'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'popular', label: 'Mais Populares' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliados' },
]

function CategoryContent() {
  const params = useParams()
  const slug = params.slug as string
  const searchParams = useSearchParams()
  const router = useRouter()

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const sortBy = searchParams.get('sort') ?? 'newest'

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const p = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '') p.delete(k)
        else p.set(k, v)
      })
      p.set('page', '1')
      router.push(`/categorias/${slug}?${p.toString()}`)
    },
    [searchParams, router, slug]
  )

  // Busca a categoria pelo slug para obter o ID
  const { data: categories = [] } = useQuery<CategorySummary[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data.data.categories as CategorySummary[]
    },
    staleTime: 10 * 60 * 1000,
  })

  const category = categories.find(
    (c) =>
      (c.slug ?? c.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) === slug
  )

  // Busca produtos filtrando pelo categoryId
  const { data, isLoading } = useQuery<PaginatedResponse<ProductSummary> & { products: ProductSummary[] }>({
    queryKey: ['products', 'category', slug, { page, sortBy }],
    queryFn: async () => {
      const p = new URLSearchParams()
      p.set('page', String(page))
      p.set('limit', '20')
      p.set('sortBy', sortBy)
      if (category?.id) p.set('categoryId', category.id)
      else p.set('categorySlug', slug)
      const { data } = await api.get(`/products?${p.toString()}`)
      return data.data as PaginatedResponse<ProductSummary> & { products: ProductSummary[] }
    },
    enabled: categories.length > 0,
    placeholderData: (prev) => prev,
  })

  const products = data?.products ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1
  const categoryName = category?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Breadcrumb + Hero */}
        <div className="bg-white border-b border-zinc-100 py-8">
          <div className="container mx-auto px-4">
            <nav className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
              <Link href="/" className="hover:text-violet-600 transition-colors">Início</Link>
              <span>/</span>
              <Link href="/categorias" className="hover:text-violet-600 transition-colors">Categorias</Link>
              <span>/</span>
              <span className="text-zinc-900 font-medium">{categoryName}</span>
            </nav>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">{categoryName}</h1>
              {category?.description && (
                <p className="text-zinc-500 mt-1 max-w-2xl">{category.description}</p>
              )}
              {!isLoading && (
                <p className="text-zinc-400 text-sm mt-2">
                  {total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
                </p>
              )}
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <Link
              href="/categorias"
              className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-violet-600 transition-colors"
            >
              <ChevronLeft size={16} />
              Todas as categorias
            </Link>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => updateParams({ sort: e.target.value })}
                className="appearance-none pl-3 pr-8 py-2 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Grid de Produtos */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-200 animate-pulse" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-xl font-semibold text-zinc-700">Nenhum produto encontrado</p>
              <p className="text-zinc-400 mt-2">Esta categoria ainda não possui produtos cadastrados</p>
              <Link
                href="/produtos"
                className="inline-block mt-6 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
              >
                Ver Todos os Produtos
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => updateParams({ page: String(p) })}
                className="mt-8"
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CategoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-50">
          <div className="bg-white border-b border-zinc-100 py-8">
            <div className="container mx-auto px-4">
              <div className="h-4 w-64 bg-zinc-100 animate-pulse rounded mb-4" />
              <div className="h-8 w-48 bg-zinc-200 animate-pulse rounded-lg mb-2" />
              <div className="h-4 w-32 bg-zinc-100 animate-pulse rounded" />
            </div>
          </div>
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-zinc-200 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CategoryContent />
    </Suspense>
  )
}
