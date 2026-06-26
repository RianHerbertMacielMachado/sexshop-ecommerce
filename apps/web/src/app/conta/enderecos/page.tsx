'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { Plus, MapPin, Pencil, Trash2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AddressFormModal from '@/components/account/AddressFormModal'
import type { Address } from '@/types'

export default function AddressesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const queryClient = useQueryClient()

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/auth/me/addresses')
      return res.data.data as Address[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/me/addresses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Endereço removido.')
    },
    onError: () => toast.error('Erro ao remover endereço.'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: (id: string) =>
      api.patch(`/auth/me/addresses/${id}/default`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Endereço padrão atualizado.')
    },
  })

  const openEdit = (address: Address) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const openNew = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-background rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Meus Endereços</h2>
        <Button onClick={openNew} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Adicionar
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-10">
          <MapPin className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-sm">
            Nenhum endereço cadastrado.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="flex items-start justify-between p-4 rounded-lg border"
            >
              <div className="flex gap-3">
                <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-sm">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium">{address.label || 'Endereço'}</p>
                    {address.isDefault && (
                      <span className="flex items-center gap-0.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                        <Star className="h-2.5 w-2.5" /> Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement ? `, ${address.complement}` : ''}
                  </p>
                  <p className="text-muted-foreground">
                    {address.neighborhood} – {address.city}/{address.state} –
                    CEP {address.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!address.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDefaultMutation.mutate(address.id)}
                    title="Definir como padrão"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEdit(address)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteMutation.mutate(address.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={editingAddress}
      />
    </div>
  )
}
