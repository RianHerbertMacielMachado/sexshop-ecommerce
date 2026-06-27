'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import Pagination from '@/components/ui/Pagination'
import ProductFormModal from '@/components/admin/products/ProductFormModal'
import type { Product } from '@/types'
import Image from 'next/image'

export default function AdminProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: async () => {
      const res = await api.get('/products', {
        params: { page, limit: 15, search, admin: true },
      })
      return res.data.data as { products: Product[]; total: number; pages: number }
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (product: Product) =>
      api.put(`/products/${product.id}`, { isActive: !product.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Status atualizado.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto removido.')
    },
    onError: () => toast.error('Erro ao remover produto.'),
  })

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const openNew = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo Produto
        </Button>
      </div>

      <div className="bg-background rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" /> Filtros
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Produto</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">SKU</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Preço</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Estoque</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum produto encontrado.
                  </td>
                </tr>
              ) : (
                data?.products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                          {product.images?.[0] ? (
                            <Image
                                src={product.images?.[0] || '/placeholder.svg'}
                                alt={product.name}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                            />

                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(product.price)}
                      {product.compareAtPrice && (
                        <span className="block text-xs text-muted-foreground line-through">
                          {formatCurrency(product.compareAtPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-destructive' : 'text-foreground'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMutation.mutate(product)}
                        className="flex items-center gap-1 text-sm"
                      >
                        {product.isActive ? (
                          <><ToggleRight className="h-5 w-5 text-green-500" /> <span className="text-green-600">Ativo</span></>
                        ) : (
                          <><ToggleLeft className="h-5 w-5 text-muted-foreground" /> <span className="text-muted-foreground">Inativo</span></>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(product)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('Remover produto?')) deleteMutation.mutate(product.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination page={page} totalPages={data.pages} onPageChange={setPage} />
          </div>
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={editingProduct}
      />
    </div>
  )
}
