import { Router } from 'express'
import { authMiddleware, isAdmin } from '../../middleware/auth.middleware'
import { asyncHandler } from '../../middleware/error.middleware'
import { auditLog } from '../../middleware/audit.middleware'
import { adminService } from './admin.service'
import { ordersService } from '../orders/orders.service'
import { validate } from '../../lib/validate'
import { updateOrderStatusSchema, listOrdersSchema } from '../orders/orders.schema'
import { z } from 'zod'
import { validateBody } from '../../lib/validate'
import { format } from 'fast-csv'
import { Response } from 'express'

const router = Router()

router.use(authMiddleware, isAdmin)

// Dashboard
router.get('/dashboard', asyncHandler(async (_req, res) => {
  const data = await adminService.getDashboard()
  res.json({ success: true, message: 'Dashboard carregado', data })
}))

// Orders
router.get('/orders', asyncHandler(async (req, res) => {
  const { query } = validate(listOrdersSchema, req)
  const result = await ordersService.listAllOrders(query)
  res.json({ success: true, message: 'Pedidos listados', data: result })
}))

router.get('/orders/:id', asyncHandler(async (req, res) => {
  const order = await ordersService.findById(req.params.id)
  res.json({ success: true, message: 'Pedido encontrado', data: { order } })
}))

router.put('/orders/:id/status', auditLog({ entity: 'Order', action: 'UPDATE_ORDER_STATUS' }), asyncHandler(async (req, res) => {
  const { params, body } = validate(updateOrderStatusSchema, req)
  await ordersService.updateStatus(params.id, body)
  res.json({ success: true, message: 'Status atualizado com sucesso' })
}))

// Customers
router.get('/customers', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page as string || '1', 10)
  const limit = parseInt(req.query.limit as string || '20', 10)
  const result = await adminService.getCustomers(page, limit, req.query.search as string)
  res.json({ success: true, message: 'Clientes listados', data: result })
}))

router.get('/customers/:id', asyncHandler(async (req, res) => {
  const customer = await adminService.getCustomerById(req.params.id)
  res.json({ success: true, message: 'Cliente encontrado', data: { customer } })
}))

// Reports
router.get('/reports/sales', asyncHandler(async (req, res) => {
  const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate = new Date().toISOString(), groupBy = 'day' } = req.query as Record<string, string>
  const data = await adminService.getSalesReport(new Date(startDate), new Date(endDate), groupBy as 'day' | 'week' | 'month')
  res.json({ success: true, message: 'Relatório gerado', data })
}))

router.get('/reports/sales/export', asyncHandler(async (req, res: Response) => {
  const { startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), endDate = new Date().toISOString() } = req.query as Record<string, string>
  const orders = await adminService.exportSalesCSV(new Date(startDate), new Date(endDate))

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', `attachment; filename=relatorio-vendas-${new Date().toISOString().split('T')[0]}.csv`)

  const csvStream = format({ headers: true })
  csvStream.pipe(res)

  for (const order of orders) {
    csvStream.write({
      'Número do Pedido': order.orderNumber,
      'Data': order.createdAt.toLocaleDateString('pt-BR'),
      'Cliente': order.user?.name ?? order.guestName ?? 'Convidado',
      'Email': order.user?.email ?? order.guestEmail ?? '',
      'Status': order.status,
      'Método de Pagamento': order.paymentMethod,
      'Subtotal': Number(order.subtotal).toFixed(2),
      'Desconto': Number(order.discountAmount).toFixed(2),
      'Frete': Number(order.shippingCost).toFixed(2),
      'Total': Number(order.total).toFixed(2),
      'Cidade': order.shippingAddress?.city ?? '',
      'Estado': order.shippingAddress?.state ?? '',
    })
  }

  csvStream.end()
}))

router.get('/reports/products', asyncHandler(async (_req, res) => {
  const data = await adminService.getProductsReport()
  res.json({ success: true, message: 'Relatório de produtos', data })
}))

// Payment Methods
router.get('/payment-methods', asyncHandler(async (_req, res) => {
  const methods = await adminService.getPaymentMethods()
  const safeMethods = methods.map((m) => ({
    ...m,
    config: '[ENCRYPTED]',
  }))
  res.json({ success: true, message: 'Métodos listados', data: { methods: safeMethods } })
}))

const paymentMethodSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['STRIPE_CARD', 'PIX', 'BOLETO', 'MANUAL']),
  config: z.record(z.unknown()).default({}),
  instructions: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

router.post('/payment-methods', auditLog({ entity: 'PaymentMethod' }), asyncHandler(async (req, res) => {
  const input = validateBody(paymentMethodSchema, req.body)
  const method = await adminService.createPaymentMethod(input as Parameters<typeof adminService.createPaymentMethod>[0])
  res.status(201).json({ success: true, message: 'Método criado', data: { method } })
}))

router.put('/payment-methods/:id', auditLog({ entity: 'PaymentMethod' }), asyncHandler(async (req, res) => {
  const method = await adminService.updatePaymentMethod(req.params.id, req.body)
  res.json({ success: true, message: 'Método atualizado', data: { method } })
}))

router.patch('/payment-methods/:id/toggle', auditLog({ entity: 'PaymentMethod', action: 'TOGGLE_PAYMENT_METHOD' }), asyncHandler(async (req, res) => {
  const method = await adminService.togglePaymentMethod(req.params.id)
  res.json({ success: true, message: `Método ${method?.isActive ? 'ativado' : 'desativado'}`, data: { method } })
}))

router.delete('/payment-methods/:id', auditLog({ entity: 'PaymentMethod', action: 'DELETE_PAYMENT_METHOD' }), asyncHandler(async (req, res) => {
  await adminService.deletePaymentMethod(req.params.id)
  res.json({ success: true, message: 'Método removido' })
}))

export { router as adminRoutes }
