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
import type { Address } from '@/types'

const addressSchema = z.object({
  label: z.string().optional(),
  zipCode: z.string().min(8, 'CEP inválido'),
  street: z.string().min(3, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Use a sigla do estado (ex: SP)'),
})

type AddressFormData = z.infer<typeof addressSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  address?: Address | null
}

export default function AddressFormModal({ isOpen, onClose, address }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!address

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        label: address?.label ?? '',
        zipCode: address?.zipCode ?? '',
        street: address?.street ?? '',
        number: address?.number ?? '',
        complement: address?.complement ?? '',
        neighborhood: address?.neighborhood ?? '',
        city: address?.city ?? '',
        state: address?.state ?? '',
      })
    }
  }, [isOpen, address, reset])

  const lookupCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    try {
      const res = await api.get(`/shipping/cep/${clean}`)
      const d = res.data.data
      setValue('street', d.street || '')
      setValue('neighborhood', d.neighborhood || '')
      setValue('city', d.city || '')
      setValue('state', d.state || '')
    } catch {
      // noop
    }
  }

  const mutation = useMutation({
    mutationFn: (data: AddressFormData) =>
      isEditing
        ? api.put(`/auth/me/addresses/${address!.id}`, data)
        : api.post('/auth/me/addresses', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
      toast.success(isEditing ? 'Endereço atualizado!' : 'Endereço adicionado!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar endereço.'),
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Endereço' : 'Novo Endereço'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="label">Apelido (opcional)</Label>
            <Input id="label" {...register('label')} placeholder="Casa, Trabalho..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="zipCode">CEP *</Label>
              <Input
                id="zipCode"
                {...register('zipCode')}
                onBlur={(e) => lookupCep(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
              />
              {errors.zipCode && <p className="text-xs text-destructive">{errors.zipCode.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">UF *</Label>
              <Input id="state" {...register('state')} maxLength={2} className="uppercase" />
              {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="street">Rua *</Label>
            <Input id="street" {...register('street')} />
            {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="number">Nº *</Label>
              <Input id="number" {...register('number')} />
              {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
            </div>
            <div className="col-span-2 space-y-1">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" {...register('complement')} placeholder="Apto, Bloco..." />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input id="neighborhood" {...register('neighborhood')} />
            {errors.neighborhood && <p className="text-xs text-destructive">{errors.neighborhood.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="city">Cidade *</Label>
            <Input id="city" {...register('city')} />
            {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
