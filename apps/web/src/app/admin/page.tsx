'use client'

import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  Clock,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import type { DashboardData } from '@/types'

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-background rounded-xl border shadow-sm p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground">{title}</span>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await api.get('/admin/dashboard')
      return res.data.data as DashboardData
    },
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-xl bg-muted animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Atualizado há alguns segundos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Receita (30 dias)"
          value={formatCurrency(data?.revenue30d ?? 0)}
          subtitle={`${data?.ordersCount30d ?? 0} pedidos`}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Pedidos Pendentes"
          value={String(data?.pendingOrders ?? 0)}
          icon={Clock}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          title="Total de Clientes"
          value={String(data?.totalCustomers ?? 0)}
          subtitle={`+${data?.newCustomers30d ?? 0} novos (30 dias)`}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Produtos Ativos"
          value={String(data?.activeProducts ?? 0)}
          subtitle={`${data?.lowStockProducts ?? 0} com estoque baixo`}
          icon={Package}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-background rounded-xl border shadow-sm p-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> Receita dos últimos 30 dias
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data?.revenueChart ?? []}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), 'Receita']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(var(--primary))"
              fill="url(#colorRevenue)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Orders by status */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" /> Pedidos por Status
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.ordersByStatus ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="status" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-background rounded-xl border shadow-sm p-6">
          <h2 className="text-base font-semibold mb-4">Produtos Mais Vendidos</h2>
          <div className="space-y-3">
            {(data?.topProducts ?? []).slice(0, 5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground w-4">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.totalSold} vendidos
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
