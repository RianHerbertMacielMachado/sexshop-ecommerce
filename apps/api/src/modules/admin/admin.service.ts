import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'

export class AdminService {
  async getDashboard() {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      revenueToday,
      revenueWeek,
      revenueMonth,
      revenueYear,
      ordersByStatus,
      totalCustomers,
      newCustomersMonth,
      lowStockProducts,
      topProducts,
      recentOrders,
      ordersLast30Days,
      totalProducts,
    ] = await Promise.all([
      prisma.order.aggregate({ where: { paymentStatus: 'PAID', paidAt: { gte: todayStart } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID', paidAt: { gte: weekStart } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID', paidAt: { gte: monthStart } }, _sum: { total: true }, _count: true }),
      prisma.order.aggregate({ where: { paymentStatus: 'PAID', paidAt: { gte: yearStart } }, _sum: { total: true }, _count: true }),
      prisma.order.groupBy({ by: ['status'], _count: { status: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: monthStart } } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 5 } },
        select: { id: true, name: true, sku: true, stock: true, images: true },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, soldCount: true, images: true, price: true },
        orderBy: { soldCount: 'desc' },
        take: 5,
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { productName: true }, take: 1 },
        },
      }),
      // Substituído $queryRaw por query Prisma — agrupa por dia em memória
      prisma.order.findMany({
        where: { createdAt: { gte: last30DaysStart } },
        select: { createdAt: true, total: true, paymentStatus: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ])

    const statusMap = Object.fromEntries(
      ordersByStatus.map((s) => [s.status, s._count.status])
    )

    // Agrupa pedidos por dia em memória (evita $queryRaw com sintaxe PostgreSQL)
    const revenueByDay = new Map<string, { revenue: number; orders: number }>()
    for (const order of ordersLast30Days) {
      const date = order.createdAt.toISOString().split('T')[0]
      const entry = revenueByDay.get(date) ?? { revenue: 0, orders: 0 }
      entry.orders += 1
      if (order.paymentStatus === 'PAID') {
        entry.revenue += Number(order.total)
      }
      revenueByDay.set(date, entry)
    }
    const last30DaysRevenue = Array.from(revenueByDay.entries())
      .map(([date, v]) => ({ date, revenue: v.revenue, orders: v.orders }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      revenue: {
        today: Number(revenueToday._sum.total ?? 0),
        week: Number(revenueWeek._sum.total ?? 0),
        month: Number(revenueMonth._sum.total ?? 0),
        year: Number(revenueYear._sum.total ?? 0),
        todayOrders: revenueToday._count,
        monthOrders: revenueMonth._count,
      },
      orders: {
        byStatus: statusMap,
        total: Object.values(statusMap).reduce((a, b) => a + b, 0),
      },
      customers: {
        total: totalCustomers,
        newThisMonth: newCustomersMonth,
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        topSelling: topProducts,
      },
      recentOrders,
      revenueChart: last30DaysRevenue,
    }
  }

  async getCustomers(page: number = 1, limit: number = 20, search?: string) {
    const skip = (page - 1) * limit
    const where = search
      ? {
          role: 'CUSTOMER' as const,
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { role: 'CUSTOMER' as const }

    const [customers, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          isActive: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const spent = await prisma.order.aggregate({
          where: { userId: customer.id, paymentStatus: 'PAID' },
          _sum: { total: true },
        })
        return { ...customer, totalSpent: Number(spent._sum.total ?? 0) }
      })
    )

    return { customers: customersWithStats, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async getCustomerById(id: string) {
    const customer = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: true,
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { items: { select: { productName: true, quantity: true, price: true } } },
        },
        _count: { select: { orders: true } },
      },
    })

    if (!customer) return null

    const spent = await prisma.order.aggregate({
      where: { userId: id, paymentStatus: 'PAID' },
      _sum: { total: true },
    })

    const { password: _, ...safeCustomer } = customer
    return { ...safeCustomer, totalSpent: Number(spent._sum.total ?? 0) }
  }

  async getSalesReport(startDate: Date, endDate: Date, groupBy: 'day' | 'week' | 'month' = 'day') {
    // Período anterior com mesma duração (para calcular trends)
    const periodMs = endDate.getTime() - startDate.getTime()
    const prevStart = new Date(startDate.getTime() - periodMs)
    const prevEnd = new Date(startDate.getTime())

    // Busca pedidos do período atual e anterior com Prisma nativo
    const [currentOrders, prevOrders, orderItemsWithCategory] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        select: { createdAt: true, total: true, paymentStatus: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: prevStart, lte: prevEnd } },
        select: { total: true, paymentStatus: true },
      }),
      // Vendas por categoria
      prisma.orderItem.findMany({
        where: { order: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' } },
        select: {
          price: true,
          quantity: true,
          product: { select: { category: { select: { name: true } } } },
        },
      }),
    ])

    // Métricas do período atual
    const paidOrders = currentOrders.filter((o) => o.paymentStatus === 'PAID')
    const totalRevenue = paidOrders.reduce((sum, o) => sum + Number(o.total), 0)
    const totalOrders = currentOrders.length
    const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0
    const conversionRate = totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0

    // Métricas do período anterior (para trends)
    const prevPaid = prevOrders.filter((o) => o.paymentStatus === 'PAID')
    const prevRevenue = prevPaid.reduce((sum, o) => sum + Number(o.total), 0)
    const prevTotalOrders = prevOrders.length
    const prevTicket = prevPaid.length > 0 ? prevRevenue / prevPaid.length : 0
    const prevConversion = prevTotalOrders > 0 ? (prevPaid.length / prevTotalOrders) * 100 : 0

    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return ((curr - prev) / prev) * 100
    }

    // Agrupa receita por período (dia/semana/mês) em memória
    const buckets = new Map<string, { revenue: number; orders: number }>()
    for (const order of currentOrders) {
      let key: string
      const d = order.createdAt
      if (groupBy === 'day') {
        key = d.toISOString().split('T')[0] // YYYY-MM-DD
      } else if (groupBy === 'week') {
        // ISO week: YYYY-Www
        const jan1 = new Date(d.getFullYear(), 0, 1)
        const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
        key = `${d.getFullYear()}-W${String(week).padStart(2, '0')}`
      } else {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // YYYY-MM
      }
      const bucket = buckets.get(key) ?? { revenue: 0, orders: 0 }
      bucket.orders += 1
      if (order.paymentStatus === 'PAID') bucket.revenue += Number(order.total)
      buckets.set(key, bucket)
    }
    const revenueByPeriod = Array.from(buckets.entries())
      .map(([date, v]) => ({ date, revenue: Math.round(v.revenue * 100) / 100, orders: v.orders }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Vendas por categoria
    const catMap = new Map<string, number>()
    for (const item of orderItemsWithCategory) {
      const catName = item.product?.category?.name ?? 'Sem categoria'
      catMap.set(catName, (catMap.get(catName) ?? 0) + Number(item.price) * (item.quantity ?? 1))
    }
    const salesByCategory = Array.from(catMap.entries())
      .map(([name, revenue]) => ({ name, revenue: Math.round(revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8)

    // Top produtos por receita
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productName'],
      where: { order: { createdAt: { gte: startDate, lte: endDate }, paymentStatus: 'PAID' } },
      _sum: { price: true },
      _count: { productId: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 6,
    })
    const topProducts = topProductsRaw.map((p) => ({
      name: p.productName,
      revenue: Math.round(Number(p._sum.price ?? 0) * 100) / 100,
      orders: p._count.productId,
    }))

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageTicket: Math.round(averageTicket * 100) / 100,
      conversionRate: Math.round(conversionRate * 10) / 10,
      revenueTrend: Math.round(calcTrend(totalRevenue, prevRevenue) * 10) / 10,
      ordersTrend: Math.round(calcTrend(totalOrders, prevTotalOrders) * 10) / 10,
      ticketTrend: Math.round(calcTrend(averageTicket, prevTicket) * 10) / 10,
      conversionTrend: Math.round(calcTrend(conversionRate, prevConversion) * 10) / 10,
      revenueByPeriod,
      salesByCategory,
      topProducts,
    }
  }

  async getProductsReport() {
    const [topSelling, topRevenue, lowStock, outOfStock] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true, sku: true, soldCount: true, price: true, images: true },
        orderBy: { soldCount: 'desc' },
        take: 10,
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'productName'],
        _sum: { price: true },
        _count: { productId: true },
        orderBy: { _sum: { price: 'desc' } },
        take: 10,
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: { gt: 0, lte: 5 } },
        select: { id: true, name: true, sku: true, stock: true },
        orderBy: { stock: 'asc' },
      }),
      prisma.product.findMany({
        where: { isActive: true, stock: 0 },
        select: { id: true, name: true, sku: true },
      }),
    ])

    return { topSelling, topRevenue, lowStock, outOfStock }
  }

  async exportSalesCSV(startDate: Date, endDate: Date) {
    return prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'PAID',
      },
      include: {
        user: { select: { name: true, email: true } },
        items: true,
        shippingAddress: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getPaymentMethods() {
    return prisma.paymentMethod.findMany({ orderBy: { order: 'asc' } })
  }

  async createPaymentMethod(input: {
    name: string
    type: 'STRIPE_CARD' | 'PIX' | 'BOLETO' | 'MANUAL'
    config: Record<string, unknown>
    instructions?: string
    icon?: string
    order?: number
  }) {
    const { encryptObject } = await import('../../lib/crypto')
    const encryptedConfig = encryptObject(input.config)

    return prisma.paymentMethod.create({
      data: {
        name: input.name,
        type: input.type,
        config: encryptedConfig as unknown as Prisma.InputJsonValue,
        instructions: input.instructions ?? null,
        icon: input.icon ?? null,
        order: input.order ?? 0,
        isActive: false,
      },
    })
  }

  async updatePaymentMethod(id: string, input: {
    name?: string
    config?: Record<string, unknown>
    instructions?: string | null
    icon?: string | null
    order?: number
    isActive?: boolean
  }) {
    const data: Record<string, unknown> = { ...input }

    if (input.config) {
      const { encryptObject } = await import('../../lib/crypto')
      data.config = encryptObject(input.config)
    }

    return prisma.paymentMethod.update({ where: { id }, data: { ...data, updatedAt: new Date() } })
  }

  async togglePaymentMethod(id: string) {
    const method = await prisma.paymentMethod.findUnique({ where: { id } })
    if (!method) return null
    return prisma.paymentMethod.update({
      where: { id },
      data: { isActive: !method.isActive },
    })
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await prisma.paymentMethod.delete({ where: { id } })
  }
}

export const adminService = new AdminService()
