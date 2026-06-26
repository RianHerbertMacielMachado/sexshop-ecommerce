'use client'

import { useState } from 'react'
import { CreditCard, QrCode, ChevronLeft } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'

interface PaymentMethodOption {
  id: string
  name: string
  type: string
  instructions: string | null
  icon: string | null
}

interface Props {
  defaultValues: Record<string, unknown>
  onComplete: (data: Record<string, unknown>) => void
  onBack: () => void
  isLoading: boolean
}

export default function CheckoutPayment({ defaultValues, onComplete, onBack, isLoading }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [isDiscreet, setIsDiscreet] = useState(false)
  const { hasDiscreetItems, getTotal } = useCartStore()

  const { data: methods = [] } = useQuery<PaymentMethodOption[]>({
    queryKey: ['payment-methods'],
    queryFn: async () => {
      const { data } = await api.get('/payments/methods')
      return data.data.methods as PaymentMethodOption[]
    },
  })

  const iconMap: Record<string, React.ElementType> = {
    STRIPE_CARD: CreditCard,
    PIX: QrCode,
  }

  const handleSubmit = () => {
    if (!selectedMethod) return
    const method = methods.find((m) => m.id === selectedMethod)
    onComplete({
      paymentMethod: method?.type ?? selectedMethod,
      isDiscreetPackaging: isDiscreet,
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-6">
      <h2 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <CreditCard size={18} className="text-violet-600" /> Forma de Pagamento
      </h2>

      <div className="space-y-3 mb-6">
        {methods.length === 0 ? (
          <p className="text-zinc-400 text-sm text-center py-4">Nenhum método disponível</p>
        ) : (
          methods.map((method) => {
            const Icon = iconMap[method.type] ?? CreditCard
            return (
              <label
                key={method.id}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedMethod === method.id ? 'border-violet-500 bg-violet-50' : 'border-zinc-200 hover:border-violet-200'}`}
              >
                <input type="radio" name="payment" value={method.id} checked={selectedMethod === method.id} onChange={() => setSelectedMethod(method.id)} className="accent-violet-600" />
                <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Icon size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{method.name}</p>
                  {method.instructions && <p className="text-xs text-zinc-500 mt-0.5">{method.instructions}</p>}
                </div>
              </label>
            )
          })
        )}
      </div>

      {hasDiscreetItems() && (
        <label className="flex items-center gap-3 p-4 bg-zinc-50 rounded-xl cursor-pointer mb-6">
          <input type="checkbox" checked={isDiscreet} onChange={(e) => setIsDiscreet(e.target.checked)} className="w-4 h-4 accent-violet-600" />
          <div>
            <p className="font-medium text-zinc-900 text-sm">📦 Embalagem Discreta</p>
            <p className="text-xs text-zinc-500">Envio sem identificação do conteúdo</p>
          </div>
        </label>
      )}

      <div className="p-4 bg-zinc-50 rounded-xl mb-6">
        <div className="flex justify-between font-bold text-zinc-900">
          <span>Total a pagar:</span>
          <span className="text-violet-600 text-lg">{formatCurrency(getTotal())}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex items-center gap-2 px-5 py-3 border border-zinc-200 rounded-xl text-zinc-700 font-medium text-sm hover:bg-zinc-50">
          <ChevronLeft size={16} /> Voltar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!selectedMethod || isLoading}
          className="flex-1 flex items-center justify-center gap-2 py-3 gradient-primary text-white rounded-xl font-semibold text-sm disabled:opacity-50"
        >
          {isLoading ? 'Processando...' : 'Confirmar Pedido'}
        </button>
      </div>
    </div>
  )
}
