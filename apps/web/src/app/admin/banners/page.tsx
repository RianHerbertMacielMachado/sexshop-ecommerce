'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Plus, Pencil, Trash2, Image as ImageIcon, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import BannerFormModal from '@/components/admin/banners/BannerFormModal'
import Image from 'next/image'
import type { Banner } from '@/types'

export default function AdminBannersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const queryClient = useQueryClient()

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      const res = await api.get('/banners/all')
      return res.data.data as Banner[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/banners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Banner removido.')
    },
    onError: () => toast.error('Erro ao remover banner.'),
  })

  const toggleMutation = useMutation({
    mutationFn: (banner: Banner) =>
      api.put(`/banners/${banner.id}`, { isActive: !banner.isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success('Status atualizado.')
    },
  })

  const openEdit = (banner: Banner) => { setEditingBanner(banner); setIsModalOpen(true) }
  const openNew = () => { setEditingBanner(null); setIsModalOpen(true) }

  const positionLabel = (pos: string) => {
    const map: Record<string, string> = {
      HOME_HERO: 'Hero Principal',
      HOME_MIDDLE: 'Meio da Home',
      HOME_BOTTOM: 'Rodapé da Home',
      CATEGORY_TOP: 'Topo de Categoria',
    }
    return map[pos] || pos
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Banners</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo Banner
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-16 bg-background rounded-xl border">
          <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhum banner cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="bg-background rounded-xl border shadow-sm overflow-hidden"
            >
              <div className="relative h-36 bg-muted">
                {banner.imageUrl ? (
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || 'Banner'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                    {positionLabel(banner.position)}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${banner.isActive ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                    {banner.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm truncate">{banner.title || '(sem título)'}</p>
                  {banner.subtitle && (
                    <p className="text-xs text-muted-foreground truncate">{banner.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => toggleMutation.mutate(banner)}>
                    {banner.isActive ? '🔴' : '🟢'}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(banner)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { if (confirm('Remover banner?')) deleteMutation.mutate(banner.id) }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        banner={editingBanner}
      />
    </div>
  )
}
