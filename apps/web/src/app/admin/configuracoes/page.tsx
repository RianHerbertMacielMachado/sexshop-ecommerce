'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { Loader2, Settings } from 'lucide-react'
import type { SiteSettings } from '@/types'

const settingsSchema = z.object({
  storeName: z.string().min(1, 'Nome obrigatório'),
  storeDescription: z.string().optional(),
  storeEmail: z.string().email('E-mail inválido'),
  storePhone: z.string().optional(),
  storeCnpj: z.string().optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional(),
  maintenanceMode: z.boolean().optional(),
  allowGuestCheckout: z.boolean().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/settings/admin')
      return res.data.data.settings as SiteSettings
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({ resolver: zodResolver(settingsSchema) })

  useEffect(() => {
    if (settings) reset(settings as SettingsFormData)
  }, [settings, reset])

  const mutation = useMutation({
    mutationFn: (data: SettingsFormData) => api.put('/settings/admin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      toast.success('Configurações salvas!')
    },
    onError: () => toast.error('Erro ao salvar configurações.'),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Settings className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        {/* Store Info */}
        <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold">Informações da Loja</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="storeName">Nome da Loja *</Label>
              <Input id="storeName" {...register('storeName')} />
              {errors.storeName && <p className="text-xs text-destructive">{errors.storeName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storeEmail">E-mail da Loja *</Label>
              <Input id="storeEmail" type="email" {...register('storeEmail')} />
              {errors.storeEmail && <p className="text-xs text-destructive">{errors.storeEmail.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="storePhone">Telefone</Label>
              <Input id="storePhone" {...register('storePhone')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="storeCnpj">CNPJ</Label>
              <Input id="storeCnpj" {...register('storeCnpj')} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="storeDescription">Descrição</Label>
            <Textarea
              id="storeDescription"
              {...register('storeDescription')}
              rows={3}
            />
          </div>
        </div>

        {/* Commerce Settings */}
        <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold">Configurações da Loja</h2>

          <div className="space-y-1">
            <Label htmlFor="freeShippingThreshold">
              Valor Mínimo para Frete Grátis (R$)
            </Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              step="0.01"
              {...register('freeShippingThreshold')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Checkout sem Cadastro</p>
              <p className="text-xs text-muted-foreground">
                Permite finalizar pedido sem criar conta
              </p>
            </div>
            <Switch
              checked={watch('allowGuestCheckout') ?? true}
              onCheckedChange={(v) => setValue('allowGuestCheckout', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Modo Manutenção</p>
              <p className="text-xs text-muted-foreground text-destructive">
                ⚠️ Desabilita o acesso público à loja
              </p>
            </div>
            <Switch
              checked={watch('maintenanceMode') ?? false}
              onCheckedChange={(v) => setValue('maintenanceMode', v)}
            />
          </div>
        </div>

        {/* SEO */}
        <div className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold">SEO</h2>
          <div className="space-y-1">
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input id="metaTitle" {...register('metaTitle')} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              {...register('metaDescription')}
              rows={2}
            />
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Configurações
        </Button>
      </form>
    </div>
  )
}
