'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Lock } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { api } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import CheckoutIdentification from '@/components/checkout/CheckoutIdentification'
import CheckoutAddress from '@/components/checkout/CheckoutAddress'
import CheckoutPayment from '@/components/checkout/CheckoutPayment'

import type { ShippingOption } from '@/types'

export type CheckoutFormData = {
  name: string
  email: string
  phone?: string
  address: {
    recipientName: string
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    phone?: string
  }
  shippingZoneId: string
  shippingCost: number
  shippingOptions?: ShippingOption[]   // persiste ao navegar entre steps
  paymentMethod: string
  isDiscreetPackaging: boolean
}

const STEPS = ['Identificação', 'Endereço', 'Pagamento']

export default function CheckoutPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { items, getSubtotal, couponCode, couponDiscount, clearCart, setShipping } = useCartStore()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CheckoutFormData>>({})

  const subtotal = getSubtotal()
  const shippingCost = formData.shippingCost ?? 0
  const displayTotal = Math.max(0, subtotal - couponDiscount + shippingCost)

  useEffect(() => {
    if (items.length === 0) {
      router.push('/carrinho')
    }
  }, [items.length, router])

  const { mutate: createOrder, isPending } = useMutation({
    mutationFn: async (data: CheckoutFormData) => {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          // omite variantId se undefined para não quebrar a validação Zod de cuid
          ...(i.variantId ? { variantId: i.variantId } : {}),
          quantity: i.quantity,
        })),
        shippingAddress: data.address,
        couponCode: couponCode ?? undefined,
        shippingZoneId: data.shippingZoneId,
        isDiscreetPackaging: data.isDiscreetPackaging,
        paymentMethod: data.paymentMethod,
        guestEmail: !isAuthenticated ? data.email : undefined,
        guestName: !isAuthenticated ? data.name : undefined,
      }
      const res = await api.post('/orders', payload)
      return res.data.data.order as { id: string; orderNumber: string }
    },
    onSuccess: async (order) => {
      const method = formData.paymentMethod ?? ''

      if (method === 'PIX') {
        // Fluxo PIX: gera QR Code e redireciona
        await api.post('/payments/checkout/pix', { orderId: order.id })
        router.push(`/checkout/pix?orderId=${order.id}`)
      } else if (method === 'STRIPE_CARD' || method === 'STRIPE') {
        // Fluxo Stripe: redireciona para Stripe Checkout
        const stripeRes = await api.post('/payments/checkout/stripe', { orderId: order.id })
        const { checkoutUrl } = stripeRes.data.data
        clearCart()
        window.location.href = checkoutUrl
      } else {
        // Fluxo manual (BOLETO, MANUAL, etc.): pedido criado, aguarda pagamento
        clearCart()
        router.push(`/checkout/success?orderId=${order.id}&manual=true`)
      }
    },
  })

  const handleStepComplete = (data: Partial<CheckoutFormData>) => {
    const updated = { ...formData, ...data }
    setFormData(updated)

    // Sincroniza o frete no cartStore para que o total seja calculado corretamente
    if (data.shippingZoneId !== undefined && data.shippingCost !== undefined) {
      setShipping(data.shippingZoneId, data.shippingCost)
    }

    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      createOrder(updated as CheckoutFormData)
    }
  }

  if (items.length === 0) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-2 mb-8">
            <Lock size={20} className="text-violet-600" />
            <h1 className="text-2xl font-bold text-zinc-900">Checkout Seguro</h1>
          </div>

          {/* Stepper */}
          <div className="flex items-center mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-violet-600' : 'text-zinc-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i < step ? 'gradient-primary border-transparent text-white' : i === step ? 'border-violet-600 text-violet-600 bg-white' : 'border-zinc-200 bg-white text-zinc-400'}`}>
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-violet-600' : ''}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-3 transition-colors ${i < step ? 'bg-violet-600' : 'bg-zinc-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.25 }}
                >
                  {step === 0 && (
                    <CheckoutIdentification
                      user={user}
                      isAuthenticated={isAuthenticated}
                      defaultValues={formData}
                      onComplete={handleStepComplete}
                    />
                  )}
                  {step === 1 && (
                    <CheckoutAddress
                      defaultValues={formData}
                      subtotal={subtotal}
                      onComplete={handleStepComplete}
                      onBack={() => setStep(0)}
                    />
                  )}
                  {step === 2 && (
                    <CheckoutPayment
                      defaultValues={formData}
                      onComplete={handleStepComplete}
                      onBack={() => setStep(1)}
                      isLoading={isPending}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-2xl border border-zinc-100 p-5 sticky top-24">
                <h2 className="font-bold text-zinc-900 mb-4">Resumo</h2>
                <div className="space-y-2 max-h-52 overflow-y-auto mb-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                      <span className="text-zinc-600 truncate flex-1 mr-2">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-zinc-900 shrink-0">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 text-sm border-t border-zinc-100 pt-3">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto</span><span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  {step >= 1 && formData.shippingZoneId && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Frete</span>
                      <span>{shippingCost === 0 ? 'Grátis' : formatCurrency(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-zinc-900 text-base pt-2 border-t border-zinc-100">
                    <span>Total</span>
                    <span className="text-violet-600">{formatCurrency(displayTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
