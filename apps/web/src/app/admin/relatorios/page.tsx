'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { FileDown, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const PERIODS = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: '365', label: 'Último ano' },
]

const COLORS = [
  'hsl(var(--primary))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
]

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('30')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', period],
    queryFn: async () => {
      const res = await api.get('/admin/reports/sales', {
        params: { period },
      })
      return res.data.data
    },
  })

  const handleExport = async () => {
    try {
      const res = await api.get('/admin/reports/sales/export', {
        params: { period },
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${period}dias.csv`
      a.click()
    } catch {
      // handle error silently
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="h-4 w-4 mr-1" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Receita Total', value: formatCurrency(data?.totalRevenue ?? 0), trend: data?.revenueTrend },
          { label: 'Pedidos', value: data?.totalOrders ?? 0, trend: data?.ordersTrend },
          { label: 'Ticket Médio', value: formatCurrency(data?.averageTicket ?? 0), trend: data?.ticketTrend },
          { label: 'Conversão', value: `${(data?.conversionRate ?? 0).toFixed(1)}%`, trend: data?.conversionTrend },
        ].map((card) => (
          <div key={card.label} className="bg-background rounded-xl border shadow-sm p-5">
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
            {card.trend !== undefined && (
              <div className={`flex items-center gap-1 mt-1 text-xs ${card.trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {card.trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(card.trend).toFixed(1)}% vs período anterior</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <h2 className="text-base font-semibold mb-4">Receita por Período</h2>
        {isLoading ? (
          <div className="h-64 bg-muted rounded animate-pulse" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data?.revenueByPeriod ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Receita']} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="orders"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Vendas por Categoria</h2>
          {isLoading ? (
            <div className="h-52 bg-muted rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data?.salesByCategory ?? []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="revenue"
                  nameKey="name"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {(data?.salesByCategory ?? []).map((_: unknown, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Top Produtos (Receita)</h2>
          {isLoading ? (
            <div className="h-52 bg-muted rounded animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={(data?.topProducts ?? []).slice(0, 6)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => `R$${v}`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
