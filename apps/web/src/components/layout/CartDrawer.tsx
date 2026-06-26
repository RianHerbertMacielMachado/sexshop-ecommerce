'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatCurrency } from '@/lib/utils'

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotal,
    getTotal,
    couponDiscount,
    shippingCost,
    couponCode,
  } = useCartStore()

  const subtotal = getSubtotal()
  const total = getTotal()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-violet-600" />
                <h2 className="font-bold text-zinc-900">
                  Carrinho
                  {items.length > 0 && (
                    <span className="ml-2 text-sm font-normal text-zinc-500">
                      ({items.length} {items.length === 1 ? 'item' : 'itens'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center">
                    <ShoppingCart size={32} className="text-zinc-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-700">Carrinho vazio</p>
                    <p className="text-sm text-zinc-400 mt-1">
                      Adicione produtos para continuar
                    </p>
                  </div>
                  <Link
                    href="/produtos"
                    onClick={closeCart}
                    className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium"
                  >
                    Ver Produtos
                  </Link>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variantId ?? 'no-variant'}`}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    className="flex gap-3 p-3 bg-zinc-50 rounded-xl"
                  >
                    {/* Image */}
                    <Link href={`/produtos/${item.slug}`} onClick={closeCart}>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-zinc-200 shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-200" />
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/produtos/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium text-zinc-900 hover:text-violet-600 line-clamp-2 transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.variantName && (
                        <p className="text-xs text-zinc-500 mt-0.5">{item.variantName}</p>
                      )}
                      <p className="text-sm font-bold text-violet-600 mt-1">
                        {formatCurrency(item.price * item.quantity)}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, item.variantId)
                          }
                          className="w-6 h-6 rounded-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, item.variantId)
                          }
                          disabled={item.quantity >= item.stock}
                          className="w-6 h-6 rounded-md border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-40"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.variantId)}
                          className="ml-auto p-1 hover:text-red-500 text-zinc-400 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-t border-zinc-100 px-5 py-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({couponCode})</span>
                      <span>- {formatCurrency(couponDiscount)}</span>
                    </div>
                  )}
                  {shippingCost > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Frete</span>
                      <span>{formatCurrency(shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-zinc-900 text-base pt-1 border-t border-zinc-100">
                    <span>Total</span>
                    <span className="text-violet-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
                >
                  Finalizar Compra
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/carrinho"
                  onClick={closeCart}
                  className="flex items-center justify-center w-full py-2.5 rounded-xl border border-zinc-200 text-zinc-700 text-sm font-medium hover:bg-zinc-50 transition-colors"
                >
                  Ver Carrinho Completo
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
