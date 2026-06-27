'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Plus, Pencil, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import ShippingZoneFormModal from '@/components/admin/shipping/ShippingZoneFormModal'
import type { ShippingZone } from '@/types'

export default function AdminShippingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null)
  const queryClient = useQueryClient()

  const { data: zones = [], isLoading } = useQuery({
    queryKey: ['admin-shipping-zones'],
    queryFn: async () => {
      const res = await api.get('/shipping/admin/zones')
      return res.data.data?.zones as ShippingZone[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/shipping/admin/zones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] })
      toast.success('Zona removida.')
    },
    onError: () => toast.error('Erro ao remover zona.'),
  })

  const openEdit = (zone: ShippingZone) => { setEditingZone(zone); setIsModalOpen(true) }
  const openNew = () => { setEditingZone(null); setIsModalOpen(true) }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zonas de Frete</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Nova Zona
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : zones.length === 0 ? (
        <div className="text-center py-16 bg-background rounded-xl border">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma zona de frete cadastrada.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-background rounded-xl border shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{zone.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${zone.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                      {zone.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Estados: {zone.states.join(', ') || 'Todos'}
                  </p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span>
                      <strong>Prazo:</strong> {zone.deliveryDays} dias
                    </span>
                    <span>
                      <strong>Valor:</strong> {zone.price === 0 ? 'Grátis' : formatCurrency(zone.price)}
                    </span>
                    {zone.freeShippingThreshold && (
                      <span className="text-green-600">
                        Frete grátis acima de {formatCurrency(zone.freeShippingThreshold)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(zone)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => { if (confirm('Remover zona?')) deleteMutation.mutate(zone.id) }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ShippingZoneFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        zone={editingZone}
      />
    </div>
  )
}
