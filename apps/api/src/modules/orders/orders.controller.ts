import { Request, Response } from 'express'
import { ordersService } from './orders.service'
import { asyncHandler } from '../../middleware/error.middleware'
import { validate } from '../../lib/validate'
import { createOrderSchema, updateOrderStatusSchema, listOrdersSchema } from './orders.schema'

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { body } = validate(createOrderSchema, req)
  const order = await ordersService.create(body, req.user?.id)
  res.status(201).json({ success: true, message: 'Pedido criado com sucesso', data: { order } })
})

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { query } = validate(listOrdersSchema, req)
  const result = await ordersService.listUserOrders(req.user!.id, query)
  res.json({ success: true, message: 'Pedidos listados com sucesso', data: result })
})

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await ordersService.findById(req.params.id, req.user?.id)
  res.json({ success: true, message: 'Pedido encontrado', data: { order } })
})

export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderNumber } = req.params
  const { email } = req.body as { email: string }
  if (!email) {
    res.status(400).json({ success: false, message: 'E-mail é obrigatório para rastrear pedido' })
    return
  }
  const order = await ordersService.findByOrderNumber(orderNumber, email)
  res.json({ success: true, message: 'Pedido encontrado', data: { order } })
})

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { query } = validate(listOrdersSchema, req)
  const result = await ordersService.listAllOrders(query)
  res.json({ success: true, message: 'Pedidos listados com sucesso', data: result })
})

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { params, body } = validate(updateOrderStatusSchema, req)
  await ordersService.updateStatus(params.id, body)
  res.json({ success: true, message: 'Status do pedido atualizado com sucesso' })
})

export const getAdminOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await ordersService.findById(req.params.id)
  res.json({ success: true, message: 'Pedido encontrado', data: { order } })
})
