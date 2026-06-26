'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CreditCard, Smartphone, Search } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import Pagination from '@/components/ui/Pagination'

interface Payment {
  id: string
  orderId: string
  orderNumber: string
  method: 'STRIPE' | 'PIX'
  amount: number
  status: string
  createdAt: string
  customerName: string
  customerEmail: string
}

export default function AdminPaymentsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, search],
    queryFn: async () => {
      const res = await api.get('/admin/payments', {
        params: { page, limit: 15, search },
      })
      return res.data.data as { payments: Payment[]; total: number; pages: number }
    },
  })

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'bg-green-100 text-green-700',
      PENDING: 'bg-yellow-100 text-yellow-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-blue-100 text-blue-700',
    }
    return map[status] || 'bg-muted text-muted-foreground'
  }

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      PAID: 'Pago',
      PENDING: 'Pendente',
      FAILED: 'Falhou',
      REFUNDED: 'Reembolsado',
    }
    return map[status] || status
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pagamentos</h1>

      <div className="bg-background rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pagamentos..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pedido</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Método</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Valor</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Data</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    Nenhum pagamento encontrado.
                  </td>
                </tr>
              ) : (
                data?.payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium">#{payment.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{payment.customerName}</p>
                      <p className="text-xs text-muted-foreground">{payment.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {payment.method === 'STRIPE' ? (
                          <><CreditCard className="h-4 w-4 text-blue-500" /><span className="text-sm">Cartão</span></>
                        ) : (
                          <><Smartphone className="h-4 w-4 text-green-500" /><span className="text-sm">PIX</span></>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(payment.status)}`}>
                        {statusLabel(payment.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination page={page} totalPages={data.pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
