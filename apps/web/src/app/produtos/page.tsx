'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ProductCard from '@/components/product/ProductCard'
import Pagination from '@/components/common/Pagination'
import type { ProductSummary, CategorySummary, PaginatedResponse } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mais Recentes' },
  { value: 'popular', label: 'Mais Populares' },
  { value: 'price_asc', label: 'Menor Preço' },
  { value: 'price_desc', label: 'Maior Preço' },
  { value: 'rating', label: 'Melhor Avaliados' },
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [filtersOpen, setFiltersOpen] = useState(false)

  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const search = searchParams.get('search') ?? ''
  const categoryId = searchParams.get('category') ?? ''
  const sortBy = searchParams.get('sort') ?? 'newest'
  const minPrice = searchParams.get('minPrice') ?? ''
  const maxPrice = searchParams.get('maxPrice') ?? ''
  const inStock = searchParams.get('inStock') === 'true'
  const featured = searchParams.get('featured') === 'true'

  const [localSearch, setLocalSearch] = useState(search)
  const [localMin, setLocalMin] = useState(minPrice)
  const [localMax, setLocalMax] = useState(maxPrice)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v === null || v === '') params.delete(k)
        else params.set(k, v)
      })
      params.set('page', '1')
      router.push(`/produtos?${params.toString()}`)
    },
    [searchParams, router]
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (localSearch !== search) updateParams({ search: localSearch })
    }, 400)
    return () => clearTimeout(timeout)
  }, [localSearch])

  const { data, isLoading } = useQuery<PaginatedResponse<ProductSummary> & { products: ProductSummary[] }>({
    queryKey: ['products', { page, search, categoryId, sortBy, minPrice, maxPrice, inStock, featured }],
    queryFn: async () => {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      if (categoryId) params.set('categoryId', categoryId)
      if (sortBy) params.set('sortBy', sortBy)
      if (minPrice) params.set('minPrice', minPrice)
      if (maxPrice) params.set('maxPrice', maxPrice)
      if (inStock) params.set('inStock', 'true')
      if (featured) params.set('featured', 'true')
      const { data } = await api.get(`/products?${params.toString()}`)
      return data.data as PaginatedResponse<ProductSummary> & { products: ProductSummary[] }
    },
    placeholderData: (prev) => prev,
  })

  const { data: categories = [] } = useQuery<CategorySummary[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get('/categories')
      return data.data.categories as CategorySummary[]
    },
    staleTime: 10 * 60 * 1000,
  })

  const products = data?.products ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-zinc-900 mb-3 text-sm">Categorias</h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParams({ category: null })}
            className={cn('block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors', !categoryId ? 'bg-violet-100 text-violet-700 font-medium' : 'text-zinc-600 hover:bg-zinc-100')}
          >
            Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParams({ category: cat.id })}
              className={cn('block w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors', categoryId === cat.id ? 'bg-violet-100 text-violet-700 font-medium' : 'text-zinc-600 hover:bg-zinc-100')}
            >
              {cat.name}
              {cat._count && <span className="ml-1 text-zinc-400">({cat._count.products})</span>}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-zinc-900 mb-3 text-sm">Faixa de Preço</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            onBlur={() => updateParams({ minPrice: localMin })}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
          <input
            type="number"
            placeholder="Máx"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            onBlur={() => updateParams({ maxPrice: localMax })}
            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-zinc-900 mb-3 text-sm">Filtros</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParams({ inStock: e.target.checked ? 'true' : null })}
            className="w-4 h-4 rounded accent-violet-600"
          />
          <span className="text-sm text-zinc-700">Apenas em estoque</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => updateParams({ featured: e.target.checked ? 'true' : null })}
            className="w-4 h-4 rounded accent-violet-600"
          />
          <span className="text-sm text-zinc-700">Em destaque</span>
        </label>
      </div>

      <button
        onClick={() => router.push('/produtos')}
        className="w-full py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
      >
        Limpar Filtros
      </button>
    </div>
  )

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        <div className="bg-white border-b border-zinc-100 py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl md:text-3xl font-bold text-zinc-900">Produtos</h1>
            <p className="text-zinc-500 mt-1">{total} produto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Sidebar Filters — Desktop */}
            <aside className="hidden lg:block w-60 shrink-0">
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 sticky top-24">
                <FiltersPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => updateParams({ sort: e.target.value })}
                    className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-medium"
                >
                  <SlidersHorizontal size={16} /> Filtros
                </button>
              </div>

              {/* Grid */}
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
                  <p className="text-zinc-400 mt-2">Tente outros filtros ou termos de busca</p>
                  <button onClick={() => router.push('/produtos')} className="mt-6 px-6 py-2.5 gradient-primary text-white rounded-xl font-medium">
                    Ver Todos
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  <Pagination page={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: String(p) })} className="mt-8" />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setFiltersOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-zinc-900">Filtros</h2>
                <button onClick={() => setFiltersOpen(false)}>
                  <X size={20} />
                </button>
              </div>
              <FiltersPanel />
            </motion.div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50">
        <div className="bg-white border-b border-zinc-100 py-8">
          <div className="container mx-auto px-4">
            <div className="h-8 w-32 bg-zinc-200 animate-pulse rounded-lg mb-2" />
            <div className="h-4 w-48 bg-zinc-100 animate-pulse rounded" />
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
    }>
      <ProductsContent />
    </Suspense>
  )
}
