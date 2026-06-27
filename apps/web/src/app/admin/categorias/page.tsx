'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, ChevronRight, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import CategoryFormModal from '@/components/admin/categories/CategoryFormModal'
import type { Category } from '@/types'
import Image from 'next/image'

function CategoryRow({
  category,
  level = 0,
  onEdit,
  onDelete,
}: {
  category: Category & { children?: Category[] }
  level?: number
  onEdit: (c: Category) => void
  onDelete: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = (category.children?.length ?? 0) > 0

  return (
    <>
      <tr className="border-b hover:bg-muted/20 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
            {hasChildren ? (
              <button onClick={() => setExpanded(!expanded)}>
                <ChevronRight
                  className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`}
                />
              </button>
            ) : (
              <span className="w-4" />
            )}
            {category.imageUrl ? (
              <div className="h-8 w-8 rounded overflow-hidden shrink-0">
                <Image
                    src={category.imageUrl || '/placeholder.svg'}
                    alt={category.name}
                    width={32}
                    height={32}
                    className="object-cover"
                />

              </div>
            ) : (
              <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm font-medium">{category.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{category.slug}</td>
        <td className="px-4 py-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {category.isActive ? 'Ativa' : 'Inativa'}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => { if (confirm('Remover categoria?')) onDelete(category.id) }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
      {expanded && category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          level={level + 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  )
}

export default function AdminCategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const queryClient = useQueryClient()

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories?tree=true')
      return res.data.data as (Category & { children?: Category[] })[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success('Categoria removida.')
    },
    onError: () => toast.error('Erro ao remover categoria.'),
  })

  const openEdit = (category: Category) => { setEditingCategory(category); setIsModalOpen(true) }
  const openNew = () => { setEditingCategory(null); setIsModalOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorias</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Nova Categoria
        </Button>
      </div>

      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Nome</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Slug</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nenhuma categoria encontrada.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  onEdit={openEdit}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        categories={categories}
      />
    </div>
  )
}
