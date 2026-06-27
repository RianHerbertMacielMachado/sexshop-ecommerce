import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import { AppError, NotFoundError } from '../../middleware/error.middleware'
import { generateOrderNumber } from '../../lib/crypto'
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../../lib/mailer'
import { logger } from '../../lib/logger'
import type { CreateOrderInput, UpdateOrderStatusInput, ListOrdersQuery } from './orders.schema'

export class OrdersService {
  async create(input: CreateOrderInput, userId?: string) {
    // Valida itens e estoque
    const productIds = input.items.map((i) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    })

    if (products.length !== input.items.length) {
      throw new AppError('Um ou mais produtos não foram encontrados ou estão inativos', 400)
    }

    const orderItems: Array<{
      productId: string
      variantId?: string | null
      quantity: number
      price: number
      productName: string
      productImage?: string | null
      variantName?: string | null
    }> = []

    for (const item of input.items) {
      const product = products.find((p) => p.id === item.productId)!
      let price = Number(product.price)
      let variantName: string | null = null

      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId)
        if (!variant || !variant.isActive) throw new AppError(`Variante não encontrada: ${item.variantId}`, 400)
        if (variant.stock < item.quantity) throw new AppError(`Estoque insuficiente para: ${product.name} (${variant.name})`, 400)
        if (variant.price) price = Number(variant.price)
        variantName = variant.name
      } else {
        if (product.stock < item.quantity) throw new AppError(`Estoque insuficiente para: ${product.name}`, 400)
      }

      const images = product.images as string[]
      orderItems.push({
        productId: product.id,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
        price,
        productName: product.name,
        productImage: images[0] ?? null,
        variantName,
      })
    }

    // Calcula subtotal
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

    // Aplica cupom
    let discount = 0
    let couponId: string | null = null
    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } })
      if (coupon && coupon.isActive) {
        if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            if (!coupon.minOrderValue || subtotal >= Number(coupon.minOrderValue)) {
              if (coupon.type === 'PERCENTAGE') {
                discount = subtotal * (Number(coupon.value) / 100)
                if (coupon.maxDiscountValue) {
                  discount = Math.min(discount, Number(coupon.maxDiscountValue))
                }
              } else {
                discount = Math.min(Number(coupon.value), subtotal)
              }
              couponId = coupon.id
            }
          }
        }
      }
    }

    // Calcula frete
    let shippingCost = 0
    if (input.shippingZoneId) {
      const zone = await prisma.shippingZone.findUnique({ where: { id: input.shippingZoneId } })
      if (zone && zone.isActive) {
        shippingCost = Number(zone.price)
        const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
        if (zone.freeAbove && subtotal >= Number(zone.freeAbove)) shippingCost = 0
        else if (settings?.freeShippingThreshold && subtotal >= Number(settings.freeShippingThreshold)) shippingCost = 0
      }
    }

    const total = Math.max(0, subtotal - discount + shippingCost)

    // Gera número único do pedido
    let orderNumber = generateOrderNumber()
    let attempts = 0
    while (await prisma.order.findUnique({ where: { orderNumber } })) {
      orderNumber = generateOrderNumber()
      if (++attempts > 10) throw new AppError('Falha ao gerar número de pedido único', 500)
    }

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
          userId: userId ?? null,
          guestEmail: input.guestEmail ?? null,
          guestName: input.guestName ?? null,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: input.paymentMethod,
          subtotal,
          discount,
          shippingCost,
          total,
          couponId,
          couponCode: input.couponCode?.toUpperCase() ?? null,
          notes: input.notes ?? null,
          isDiscreetPackaging: input.isDiscreetPackaging,
          items: {
            create: orderItems.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              price: item.price,
              productName: item.productName,
              productImage: item.productImage,
              variantName: item.variantName,
            })),
          },
          shippingAddress: {
            create: {
              recipientName: input.shippingAddress.recipientName,
              street: input.shippingAddress.street,
              number: input.shippingAddress.number,
              complement: input.shippingAddress.complement ?? null,
              neighborhood: input.shippingAddress.neighborhood,
              city: input.shippingAddress.city,
              state: input.shippingAddress.state,
              zipCode: input.shippingAddress.zipCode,
              phone: input.shippingAddress.phone ?? null,
            },
          },
          statusHistory: {
            create: { status: 'PENDING', comment: 'Pedido criado' },
          },
        },
        include: {
          items: true,
          shippingAddress: true,
        },
      })

      if (couponId) {
        await tx.coupon.update({ where: { id: couponId }, data: { usedCount: { increment: 1 } } })
      }

      return created
    })

    return order
  }

  async findById(id: string, userId?: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, slug: true, images: true } } },
        },
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
        user: { select: { id: true, name: true, email: true } },
      },
    })

    if (!order) throw new NotFoundError('Pedido')

    if (userId && order.userId && order.userId !== userId) {
      throw new AppError('Você não tem permissão para acessar este pedido', 403)
    }

    return order
  }

  async findByOrderNumber(orderNumber: string, email: string) {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shippingAddress: true,
        statusHistory: { orderBy: { createdAt: 'asc' } },
      },
    })

    if (!order) throw new NotFoundError('Pedido')

    const customerEmail = order.guestEmail ?? (await prisma.user.findUnique({ where: { id: order.userId ?? "" }, select: { email: true } }))?.email ?? null
    if (!customerEmail) throw new AppError('Pedido não encontrado para este e-mail', 404)

    const emailMatches =
      order.guestEmail?.toLowerCase() === email.toLowerCase() ||
      (order.userId &&
        (await prisma.user.findUnique({ where: { id: order.userId }, select: { email: true } }))
          ?.email?.toLowerCase() === email.toLowerCase())

    if (!emailMatches) throw new AppError('Pedido não encontrado para este e-mail', 404)

    return order
  }

  async listUserOrders(userId: string, query: ListOrdersQuery) {
    const { page, limit, status } = query
    const skip = (page - 1) * limit

    const where: Prisma.OrderWhereInput = { userId }
    if (status) where.status = status

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { select: { productName: true, productImage: true, quantity: true, price: true } },
          shippingAddress: { select: { city: true, state: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async listAllOrders(query: ListOrdersQuery) {
    const { page, limit, status, search, startDate, endDate, minValue, maxValue } = query
    const skip = (page - 1) * limit

    const where: Prisma.OrderWhereInput = {}
    if (status) where.status = status
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }
    if (startDate) where.createdAt = { ...(where.createdAt as object), gte: new Date(startDate) }
    if (endDate) where.createdAt = { ...(where.createdAt as object), lte: new Date(endDate) }
    if (minValue !== undefined) where.total = { ...(where.total as object), gte: minValue }
    if (maxValue !== undefined) where.total = { ...(where.total as object), lte: maxValue }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { select: { productName: true, quantity: true, price: true } },
          shippingAddress: { select: { city: true, state: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return { orders, total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async updateStatus(id: string, input: UpdateOrderStatusInput): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    })
    if (!order) throw new NotFoundError('Pedido')

    const updateData: Prisma.OrderUpdateInput = {
      status: input.status,
      statusHistory: { create: { status: input.status, comment: input.comment } },
    }

    if (input.trackingCode) updateData.trackingCode = input.trackingCode
    if (input.status === 'SHIPPED') updateData.shippedAt = new Date()
    if (input.status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (input.status === 'CANCELLED') updateData.cancelledAt = new Date()

    await prisma.order.update({ where: { id }, data: updateData })

    const customerEmail = order.guestEmail ?? (await prisma.user.findUnique({ where: { id: order.userId ?? "" }, select: { email: true } }))?.email ?? null
    const customerName = order.guestName ?? order.user?.name ?? 'Cliente'

    if (customerEmail) {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
      sendOrderStatusUpdateEmail(
        customerEmail,
        customerName,
        order.orderNumber,
        input.status,
        input.trackingCode ?? order.trackingCode ?? undefined,
        settings?.storeName ?? undefined
      ).catch((err: Error) => logger.error('Falha ao enviar e-mail de status:', err))
    }
  }

  async confirmPayment(orderId: string, paymentData: {
    paymentId?: string
    stripeSessionId?: string
    stripePaymentIntentId?: string
    mpPaymentId?: string
  }): Promise<void> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        shippingAddress: true,
        user: { select: { email: true, name: true } },
      },
    })

    if (!order) throw new NotFoundError('Pedido')
    if (order.paymentStatus === 'PAID') return

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          paidAt: new Date(),
          stripeSessionId: paymentData.stripeSessionId ?? undefined,
          mpPaymentId: paymentData.mpPaymentId ?? undefined,
          statusHistory: { create: { status: 'CONFIRMED', comment: 'Pagamento confirmado automaticamente' } },
        },
      })

      for (const item of order.items) {
        if (!item.productId) continue
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } },
          })
        }
      }
    })

    const customerEmail = order.guestEmail ?? (await prisma.user.findUnique({ where: { id: order.userId ?? "" }, select: { email: true } }))?.email ?? null
    const customerName = order.guestName ?? order.user?.name ?? 'Cliente'

    if (customerEmail && order.shippingAddress) {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'singleton' } })
      sendOrderConfirmationEmail(customerEmail, {
        orderNumber: order.orderNumber,
        customerName,
        items: order.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.price),
          variantName: item.variantName ?? undefined,
        })),
        subtotal: Number(order.subtotal),
        discount: Number(order.discountAmount),
        shippingCost: Number(order.shippingCost),
        total: Number(order.total),
        paymentMethod: order.paymentMethod ?? '',
        shippingAddress: {
          street: order.shippingAddress.street,
          number: order.shippingAddress.number,
          complement: order.shippingAddress.complement ?? undefined,
          neighborhood: order.shippingAddress.neighborhood,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.zipCode,
        },
        isDiscreetPackaging: order.isDiscreetPackaging,
      }, settings?.storeName ?? undefined).catch((err: Error) =>
        logger.error('Falha ao enviar e-mail de confirmação:', err)
      )
    }

    logger.info(`Pagamento confirmado para pedido ${order.orderNumber}`)
  }
}

export const ordersService = new OrdersService()
