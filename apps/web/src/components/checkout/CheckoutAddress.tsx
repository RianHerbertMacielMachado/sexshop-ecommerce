'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { MapPin, ChevronLeft, ChevronRight, Truck } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import type { ShippingOption } from '@/types'

const schema = z.object({
  recipientName: z.string().min(2, 'Nome obrigatório'),
  zipCode: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  street: z.string().min(2, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
})
type FormData = z.infer<typeof schema>

interface Props {
  defaultValues: Record<string, unknown>
  subtotal: number
  onComplete: (data: Record<string, unknown>) => void
  onBack: () => void
}

export default function CheckoutAddress({ defaultValues, subtotal, onComplete, onBack }: Props) {
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedZone, setSelectedZone] = useState<string>('')

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      recipientName: (defaultValues.name as string) ?? '',
      ...(defaultValues.address as object ?? {}),
    },
  })

  const zipCode = watch('zipCode')

  const { mutate: fetchCep, isPending: fetchingCep } = useMutation({
    mutationFn: async (cep: string) => {
      const { data } = await api.get(`/shipping/cep/${cep.replace(/\D/g, '')}`)
      return data.data.address
    },
    onSuccess: (addr) => {
      setValue('street', addr.logradouro || addr.street)
      setValue('neighborhood', addr.bairro || addr.neighborhood)
      setValue('city', addr.localidade || addr.city)
      setValue('state', addr.uf || addr.state)
    },
  })

  const { mutate: calcShipping, isPending: calculatingShipping } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/shipping/calculate', {
        zipCode: zipCode.replace(/\D/g, ''),
        orderValue: subtotal,
      })
      return data.data.options as ShippingOption[]
    },
    onSuccess: (opts) => {
      setShippingOptions(opts)
      if (opts.length > 0) setSelectedZone(opts[0].zoneId)
    },
  })

  const handleZipBlur = () => {
    const clean = zipCode?.replace(/\D/g, '')
    if (clean?.length === 8) {
      fetchCep(clean)
      calcShipping()
    }
  }

  const onSubmit = (data: FormData) => {
    const selectedOption = shippingOptions.find((o) => o.zoneId === selectedZone)
    onComplete({
      address: data,
      shippingZoneId: selectedZone,
      shippingCost: selectedOption?.price ?? 0,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-zinc-100 p-6">
      <h2 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <MapPin size={18} className="text-violet-600" /> Endereço de Entrega
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Nome do Destinatário *</label>
          <input {...register('recipientName')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          {errors.recipientName && <p className="text-red-500 text-xs mt-1">{errors.recipientName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">CEP *</label>
          <input {...register('zipCode')} onBlur={handleZipBlur} maxLength={9} placeholder="00000-000" className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
          {fetchingCep && <p className="text-xs text-violet-500 mt-1">Buscando CEP...</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Rua *</label>
          <input {...register('street')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Número *</label>
          <input {...register('number')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          {errors.number && <p className="text-red-500 text-xs mt-1">{errors.number.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Complemento</label>
          <input {...register('complement')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="Apto, bloco..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Bairro *</label>
          <input {...register('neighborhood')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          {errors.neighborhood && <p className="text-red-500 text-xs mt-1">{errors.neighborhood.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Cidade *</label>
          <input {...register('city')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Estado (UF) *</label>
          <input {...register('state')} maxLength={2} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm uppercase" />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
        </div>
      </div>

      {/* Shipping Options */}
      {shippingOptions.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <Truck size={16} className="text-violet-600" /> Opções de Frete
          </h3>
          <div className="space-y-2">
            {shippingOptions.map((opt) => (
              <label key={opt.zoneId} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedZone === opt.zoneId ? 'border-violet-500 bg-violet-50' : 'border-zinc-200 hover:border-violet-200'}`}>
                <div className="flex items-center gap-3">
                  <input type="radio" name="shipping" value={opt.zoneId} checked={selectedZone === opt.zoneId} onChange={() => setSelectedZone(opt.zoneId)} className="accent-violet-600" />
                  <div>
                    <p className="font-medium text-zinc-900 text-sm">{opt.name}</p>
                    <p className="text-xs text-zinc-500">{opt.estimatedDays ?? `${opt.deliveryDays} dia(s) úteis`}</p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${opt.isFree ? 'text-green-600' : 'text-zinc-900'}`}>
                  {opt.isFree ? '🎁 Grátis' : formatCurrency(opt.price)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-zinc-200 rounded-xl text-zinc-700 font-medium text-sm hover:bg-zinc-50">
          <ChevronLeft size={16} /> Voltar
        </button>
        <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-3 gradient-primary text-white rounded-xl font-semibold text-sm">
          Continuar <ChevronRight size={16} />
        </button>
      </div>
    </form>
  )
}
