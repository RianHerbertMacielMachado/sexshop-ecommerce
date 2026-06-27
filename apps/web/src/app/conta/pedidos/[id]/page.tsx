'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { ArrowLeft, Package, MapPin, CreditCard, Copy } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import type { Order } from '@/types'

export default function OrderDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { data: order, isLoading } = useQuery({
    queryKey: ['order', params.id],
    queryFn: async () => {
      const res = await api.get(`/orders/${params.id}`)
      return res.data.data as Order
    },
  })

  if (isLoading)
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )

  if (!order) return <p className="text-muted-foreground">Pedido não encontrado.</p>

  const copyTracking = () => {
    if (order.trackingCode) {
      navigator.clipboard.writeText(order.trackingCode)
      toast.success('Código de rastreio copiado!')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/conta/pedidos"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Pedido #{order.orderNumber}</span>
      </div>

      {/* Status & Tracking */}
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">
              Pedido #{order.orderNumber}
            </h2>
            <p className="text-sm text-muted-foreground">
              Realizado em {formatDate(order.createdAt)}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        {order.trackingCode && (
          <div className="mt-4 flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              Código de rastreio:{' '}
              <strong>{order.trackingCode}</strong>
            </span>
            <button
              onClick={copyTracking}
              className="ml-auto p-1 hover:text-primary transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="h-4 w-4" /> Itens do Pedido
        </h3>
        <div className="space-y-3">
          {order.items?.map((item) => (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                {item.product?.images?.[0] ? (
                    <Image
                        src={item.product?.images?.[0] || '/placeholder.svg'}
                        alt={item.productName}
                        fill
                        className="object-cover"
                    />

                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.productName}</p>
                {item.variantName && (
                  <p className="text-xs text-muted-foreground">{item.variantName}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Qtd: {item.quantity}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-sm">
                  {formatCurrency(item.price * item.quantity)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.price)} un.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping Address */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Endereço de Entrega
          </h3>
          {order.shippingAddress && (
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.street}, {order.shippingAddress.number}</p>
              {order.shippingAddress.complement && <p>{order.shippingAddress.complement}</p>}
              <p>{order.shippingAddress.neighborhood}</p>
              <p>{order.shippingAddress.city} – {order.shippingAddress.state}</p>
              <p>CEP: {order.shippingAddress.zipCode}</p>
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> Resumo do Pagamento
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>- {formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frete</span>
              <span>
                {order.shippingCost === 0
                  ? 'Grátis'
                  : formatCurrency(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between font-bold border-t pt-2 mt-2">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
