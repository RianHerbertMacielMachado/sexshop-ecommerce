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
      last30DaysRevenue,
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
      prisma.$queryRaw<Array<{ date: string; revenue: number; orders: number }>>`
        SELECT
          DATE(created_at) as date,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0)::float as revenue,
          COUNT(*)::int as orders
        FROM orders
        WHERE created_at >= ${last30DaysStart}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
      prisma.product.count({ where: { isActive: true } }),
    ])

    const statusMap = Object.fromEntries(
      ordersByStatus.map((s) => [s.status, s._count.status])
    )

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
    const groupByFormat = groupBy === 'day' ? 'DAY' : groupBy === 'week' ? 'WEEK' : 'MONTH'

    const data = await prisma.$queryRaw<Array<{ period: string; revenue: number; orders: number; avgOrderValue: number }>>`
      SELECT
        DATE_TRUNC(${groupByFormat}, created_at) as period,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total ELSE 0 END), 0)::float as revenue,
        COUNT(*)::int as orders,
        COALESCE(AVG(CASE WHEN payment_status = 'PAID' THEN total ELSE NULL END), 0)::float as "avgOrderValue"
      FROM orders
      WHERE created_at BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE_TRUNC(${groupByFormat}, created_at)
      ORDER BY period ASC
    `

    return data
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
        config: encryptedConfig as unknown as Record<string, unknown>,
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
