'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Search, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Pagination from '@/components/ui/Pagination'
import type { User } from '@/types'

export default function AdminCustomersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: async () => {
      const res = await api.get('/admin/customers', {
        params: { page, limit: 15, search },
      })
      return res.data.data as {
        customers: (User & { ordersCount: number; totalSpent: number })[]
        total: number
        pages: number
      }
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{data?.total ?? 0} total</span>
        </div>
      </div>

      <div className="bg-background rounded-xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou e-mail..."
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
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cliente</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Cadastro</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Pedidos</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Total Gasto</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-muted-foreground">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                data?.customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">{customer.ordersCount}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${customer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {customer.isActive ? 'Ativo' : 'Bloqueado'}
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
