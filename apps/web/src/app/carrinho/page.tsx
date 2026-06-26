'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Minus, Plus, Trash2, ShoppingBag, Tag, Truck, ArrowLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    couponCode,
    couponDiscount,
    shippingCost,
    applyCoupon,
    removeCoupon,
    setShipping,
  } = useCartStore()

  const [couponInput, setCouponInput] = useState('')
  const [zipInput, setZipInput] = useState('')

  const subtotal = getSubtotal()
  const total = getTotal()

  const { mutate: validateCoupon, isPending: validatingCoupon } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/coupons/validate', {
        code: couponInput.trim().toUpperCase(),
        orderValue: subtotal,
      })
      return data.data
    },
    onSuccess: (data) => {
      if (data.valid) {
        applyCoupon(couponInput.toUpperCase(), data.discount)
      } else {
        toast.error(data.message)
      }
    },
  })

  const { mutate: calculateShipping, isPending: calculatingShipping } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/shipping/calculate', {
        zipCode: zipInput.trim(),
        orderValue: subtotal,
      })
      return data.data
    },
    onSuccess: (data) => {
      if (data.options?.length > 0) {
        const firstOption = data.options[0]
        setShipping(firstOption.zoneId, firstOption.price)
        toast.success(`Frete calculado: ${firstOption.isFree ? 'Grátis!' : formatCurrency(firstOption.price)}`)
      } else {
        toast.error('Frete não disponível para este CEP')
      }
    },
  })

  if (items.length === 0) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-zinc-50 flex items-center justify-center">
          <div className="text-center px-4">
            <ShoppingBag size={64} className="mx-auto text-zinc-300 mb-4" />
            <h1 className="text-2xl font-bold text-zinc-700 mb-2">Seu carrinho está vazio</h1>
            <p className="text-zinc-400 mb-8">Adicione produtos para continuar comprando</p>
            <Link href="/produtos" className="inline-flex items-center gap-2 px-8 py-3 gradient-primary text-white rounded-xl font-semibold">
              <ArrowLeft size={18} /> Explorar Produtos
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <ShoppingBag size={24} className="text-violet-600" />
            <h1 className="text-2xl font-bold text-zinc-900">Meu Carrinho</h1>
            <span className="text-zinc-400">({items.length} {items.length === 1 ? 'item' : 'itens'})</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variantId ?? ''}`}
                    layout
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white rounded-2xl p-4 border border-zinc-100 flex gap-4"
                  >
                    <Link href={`/produtos/${item.slug}`}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-100 shrink-0">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} width={80} height={80} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-zinc-200" />
                        )}
                      </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/produtos/${item.slug}`} className="font-semibold text-zinc-900 hover:text-violet-600 transition-colors line-clamp-2 text-sm">
                            {item.name}
                          </Link>
                          {item.variantName && <p className="text-xs text-zinc-500 mt-0.5">{item.variantName}</p>}
                        </div>
                        <button onClick={() => removeItem(item.productId, item.variantId)} className="p-1.5 hover:text-red-500 text-zinc-400 transition-colors shrink-0">
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-zinc-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="px-2.5 py-1.5 hover:bg-zinc-100 transition-colors">
                            <Minus size={14} />
                          </button>
                          <span className="px-3 py-1.5 font-semibold text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} disabled={item.quantity >= item.stock} className="px-2.5 py-1.5 hover:bg-zinc-100 transition-colors disabled:opacity-40">
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className="font-bold text-violet-600">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              <Link href="/produtos" className="flex items-center gap-2 text-sm text-violet-600 font-medium hover:text-violet-700 px-1">
                <ArrowLeft size={16} /> Continuar Comprando
              </Link>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-100">
                <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-violet-600" /> Cupom de Desconto
                </h3>
                {couponCode ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200">
                    <div>
                      <p className="text-sm font-semibold text-green-700">{couponCode}</p>
                      <p className="text-xs text-green-600">-{formatCurrency(couponDiscount)}</p>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-red-500 hover:underline">Remover</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite o cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && validateCoupon()}
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => validateCoupon()}
                      disabled={validatingCoupon || !couponInput}
                      className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      {validatingCoupon ? '...' : 'Aplicar'}
                    </button>
                  </div>
                )}
              </div>

              {/* Shipping */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-100">
                <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
                  <Truck size={16} className="text-violet-600" /> Calcular Frete
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Digite o CEP"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    onKeyDown={(e) => e.key === 'Enter' && calculateShipping()}
                    className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    onClick={() => calculateShipping()}
                    disabled={calculatingShipping || zipInput.length < 8}
                    className="px-4 py-2 gradient-primary text-white rounded-xl text-sm font-medium disabled:opacity-50"
                  >
                    {calculatingShipping ? '...' : 'OK'}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-5 border border-zinc-100">
                <h3 className="font-bold text-zinc-900 mb-4">Resumo do Pedido</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} itens)</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({couponCode})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-600">
                    <span>Frete</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600 font-medium">Grátis 🎁</span> : formatCurrency(shippingCost)}</span>
                  </div>
                  <div className="pt-2 border-t border-zinc-100 flex justify-between font-bold text-base text-zinc-900">
                    <span>Total</span>
                    <span className="text-violet-600 text-lg">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="flex items-center justify-center gap-2 w-full mt-5 py-3.5 gradient-primary text-white rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
                >
                  Finalizar Compra
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
