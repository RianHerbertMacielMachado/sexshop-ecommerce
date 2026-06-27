'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { ShippingZone } from '@/types'

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
]

const zoneSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  states: z.string().min(2, 'Informe ao menos um estado'),
  price: z.coerce.number().min(0),
  deliveryDays: z.coerce.number().int().min(1),
  freeShippingThreshold: z.coerce.number().optional(),
  isActive: z.boolean().optional(),
})

type ZoneFormData = z.infer<typeof zoneSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  zone?: ShippingZone | null
}

export default function ShippingZoneFormModal({ isOpen, onClose, zone }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!zone

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: zone?.name ?? '',
        states: zone?.states?.join(', ') ?? '',
        price: zone?.price ?? 0,
        deliveryDays: zone?.deliveryDays ?? 7,
        freeShippingThreshold: zone?.freeShippingThreshold ?? undefined,
        isActive: zone?.isActive ?? true,
      })
    }
  }, [isOpen, zone, reset])

  const mutation = useMutation({
    mutationFn: (data: ZoneFormData) => {
      const payload = {
        ...data,
        states: data.states.split(',').map((s) => s.trim().toUpperCase()).filter((s) => BR_STATES.includes(s)),
      }
      return isEditing
        ? api.put(`/shipping/admin/zones/${zone!.id}`, payload)
        : api.post('/shipping/admin/zones', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-shipping-zones'] })
      toast.success(isEditing ? 'Zona atualizada!' : 'Zona criada!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar zona.'),
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Zona' : 'Nova Zona de Frete'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome da Zona *</Label>
            <Input id="name" {...register('name')} placeholder="Ex: Sul e Sudeste" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="states">
              Estados * <span className="text-xs text-muted-foreground">(siglas separadas por vírgula ou "ALL")</span>
            </Label>
            <Input id="states" {...register('states')} placeholder="SP, RJ, MG" />
            {errors.states && <p className="text-xs text-destructive">{errors.states.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="price">Valor do Frete (R$) *</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="deliveryDays">Prazo (dias) *</Label>
              <Input id="deliveryDays" type="number" {...register('deliveryDays')} />
              {errors.deliveryDays && (
                <p className="text-xs text-destructive">{errors.deliveryDays.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="freeShippingThreshold">
              Frete Grátis acima de (R$) — opcional
            </Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              step="0.01"
              {...register('freeShippingThreshold')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Zona Ativa</Label>
            <Switch
              checked={watch('isActive') ?? true}
              onCheckedChange={(v) => setValue('isActive', v)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
