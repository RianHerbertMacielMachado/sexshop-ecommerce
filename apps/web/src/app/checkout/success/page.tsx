'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Package, ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { api } from '@/lib/api'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { useCartStore } from '@/stores/cartStore'
import type { Order } from '@/types'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId') ?? ''
  const { clearCart } = useCartStore()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  const { data: order } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`)
      return data.data.order as Order
    },
    enabled: !!orderId,
  })

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50 flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Check size={48} className="text-green-600" strokeWidth={3} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">Pedido Confirmado! 🎉</h1>
            <p className="text-zinc-500 mb-8">
              Obrigado pela sua compra! Você receberá um e-mail com os detalhes.
            </p>

            {order && (
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 text-left mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-zinc-400">Número do Pedido</p>
                    <p className="font-bold text-violet-600 text-lg">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-400">Data</p>
                    <p className="text-sm font-medium">{formatDateTime(order.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {order.items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-zinc-600">{item.quantity}× {item.productName}</span>
                      <span className="font-medium">{formatCurrency(Number(item.price) * item.quantity)}</span>
                    </div>
                  ))}
                  {(order.items?.length ?? 0) > 3 && (
                    <p className="text-xs text-zinc-400">+{(order.items?.length ?? 0) - 3} mais itens</p>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-100 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-violet-600">{formatCurrency(Number(order.total))}</span>
                </div>

                {order.isDiscreetPackaging && (
                  <div className="mt-3 p-2 bg-zinc-50 rounded-lg text-xs text-zinc-500 flex items-center gap-1">
                    <Package size={12} /> Embalagem discreta solicitada
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/minha-conta/pedidos"
                className="flex-1 flex items-center justify-center gap-2 py-3 gradient-primary text-white rounded-xl font-semibold hover:opacity-90"
              >
                <Package size={18} /> Acompanhar Pedido
              </Link>
              <Link
                href="/produtos"
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-zinc-200 text-zinc-700 rounded-xl font-semibold hover:bg-zinc-50"
              >
                Continuar Comprando <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-200 animate-pulse mx-auto mb-4" />
          <p className="text-zinc-400">Carregando...</p>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
