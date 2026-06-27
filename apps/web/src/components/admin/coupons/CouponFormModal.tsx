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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Coupon } from '@/types'

const couponSchema = z.object({
  code: z.string().min(3, 'Código muito curto').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_SHIPPING']),
  value: z.coerce.number().min(0),
  minOrderAmount: z.coerce.number().optional(),
  maxUses: z.coerce.number().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
})

type CouponFormData = z.infer<typeof couponSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  coupon?: Coupon | null
}

export default function CouponFormModal({ isOpen, onClose, coupon }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!coupon

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        code: coupon?.code ?? '',
        type: coupon?.type ?? 'PERCENTAGE',
        value: coupon?.value ?? 0,
        minOrderAmount: coupon?.minOrderAmount ?? undefined,
        maxUses: coupon?.maxUses ?? undefined,
        expiresAt: coupon?.expiresAt
          ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
          : '',
        isActive: coupon?.isActive ?? true,
      })
    }
  }, [isOpen, coupon, reset])

  const mutation = useMutation({
    mutationFn: (data: CouponFormData) =>
      isEditing
        ? api.put(`/coupons/admin/${coupon!.id}`, data)
        : api.post('/coupons/admin', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success(isEditing ? 'Cupom atualizado!' : 'Cupom criado!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar cupom.'),
  })

  if (!isOpen) return null

  const type = watch('type')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Cupom' : 'Novo Cupom'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="code">Código *</Label>
            <Input id="code" {...register('code')} className="uppercase" />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Tipo *</Label>
            <Select
              value={watch('type') || 'PERCENTAGE'}
              onValueChange={(v) => setValue('type', v as CouponFormData['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
                <SelectItem value="FIXED">Valor Fixo (R$)</SelectItem>
                <SelectItem value="FREE_SHIPPING">Frete Grátis</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {type !== 'FREE_SHIPPING' && (
            <div className="space-y-1">
              <Label htmlFor="value">
                {type === 'PERCENTAGE' ? 'Desconto (%)' : 'Valor (R$)'} *
              </Label>
              <Input id="value" type="number" step="0.01" {...register('value')} />
              {errors.value && <p className="text-xs text-destructive">{errors.value.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="minOrderAmount">Pedido Mínimo (R$)</Label>
              <Input id="minOrderAmount" type="number" step="0.01" {...register('minOrderAmount')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxUses">Limite de Usos</Label>
              <Input id="maxUses" type="number" {...register('maxUses')} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="expiresAt">Expira em</Label>
            <Input id="expiresAt" type="datetime-local" {...register('expiresAt')} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Ativo</Label>
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
