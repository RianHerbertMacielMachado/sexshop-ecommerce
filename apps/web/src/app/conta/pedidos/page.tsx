'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency, formatDate, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils'
import { Package, ChevronRight, Search } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import Pagination from '@/components/ui/Pagination'
import type { Order } from '@/types'

export default function OrdersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['my-orders', page, search],
    queryFn: async () => {
      const res = await api.get('/orders', {
        params: { page, limit: 10, search },
      })
      return res.data.data as { orders: Order[]; total: number; pages: number }
    },
  })

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meus Pedidos</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedido..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-48 sm:w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : data?.orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">Você ainda não tem pedidos.</p>
            <Link
              href="/produtos"
              className="mt-3 inline-block text-primary hover:underline text-sm"
            >
              Começar a comprar →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.orders.map((order) => (
              <Link
                key={order.id}
                href={`/conta/pedidos/${order.id}`}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      Pedido #{order.orderNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} •{' '}
                      {order.items?.length ?? 0} item(s)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="font-semibold text-sm">
                      {formatCurrency(order.total)}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${getOrderStatusColor(order.status)}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {data && data.pages > 1 && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={data.pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
