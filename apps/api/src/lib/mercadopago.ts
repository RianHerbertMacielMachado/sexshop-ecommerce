import axios, { AxiosInstance } from 'axios'
import { env } from './env'
import { logger } from './logger'

let mpClient: AxiosInstance | null = null

function getMpClient(): AxiosInstance {
  if (!mpClient) {
    if (!env.MP_ACCESS_TOKEN) {
      throw new Error('MP_ACCESS_TOKEN não configurado')
    }
    mpClient = axios.create({
      baseURL: 'https://api.mercadopago.com',
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': '',
      },
    })
  }
  return mpClient
}

export interface CreatePixPaymentParams {
  orderId: string
  orderNumber: string
  amount: number
  customerEmail: string
  customerName: string
  customerCpf?: string
  description: string
  expirationMinutes?: number
}

export interface PixPaymentResponse {
  mpPaymentId: string
  pixKey: string
  pixQrCode: string
  pixCopyPaste: string
  expiresAt: string
  status: string
}

export async function createPixPayment(
  params: CreatePixPaymentParams
): Promise<PixPaymentResponse> {
  const client = getMpClient()

  const expirationMinutes = params.expirationMinutes ?? 30
  const expirationDate = new Date(Date.now() + expirationMinutes * 60 * 1000)
    .toISOString()
    .replace('Z', '-03:00')

  const nameParts = params.customerName.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const idempotencyKey = `${params.orderId}-${Date.now()}`

  const response = await client.post(
    '/v1/payments',
    {
      transaction_amount: params.amount,
      description: params.description.slice(0, 253),
      payment_method_id: 'pix',
      date_of_expiration: expirationDate,
      payer: {
        email: params.customerEmail,
        first_name: firstName,
        last_name: lastName,
        identification: params.customerCpf
          ? { type: 'CPF', number: params.customerCpf.replace(/\D/g, '') }
          : undefined,
      },
      external_reference: params.orderNumber,
      notification_url: env.MP_WEBHOOK_URL,
      metadata: {
        orderId: params.orderId,
        orderNumber: params.orderNumber,
      },
    },
    {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    }
  )

  const data = response.data
  const transactionData = data.point_of_interaction?.transaction_data

  if (!transactionData) {
    throw new Error('Resposta do Mercado Pago não contém dados de transação PIX')
  }

  logger.info(`PIX criado: mpPaymentId=${data.id} para pedido ${params.orderNumber}`)

  return {
    mpPaymentId: String(data.id),
    pixKey: transactionData.qr_code ?? '',
    pixQrCode: transactionData.qr_code_base64 ?? '',
    pixCopyPaste: transactionData.qr_code ?? '',
    expiresAt: expirationDate,
    status: data.status,
  }
}

export async function getPixPaymentStatus(mpPaymentId: string): Promise<{
  status: string
  statusDetail: string
  isPaid: boolean
}> {
  const client = getMpClient()
  const response = await client.get(`/v1/payments/${mpPaymentId}`)
  const data = response.data

  return {
    status: data.status,
    statusDetail: data.status_detail,
    isPaid: data.status === 'approved',
  }
}

export async function testMpConnection(): Promise<boolean> {
  try {
    const client = getMpClient()
    await client.get('/v1/payment_methods')
    return true
  } catch (error) {
    logger.error('Mercado Pago connection test failed:', error)
    return false
  }
}

export function verifyMpWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  try {
    if (!env.MP_ACCESS_TOKEN) return false
    const crypto = require('crypto')
    const secret = env.MP_ACCESS_TOKEN
    const message = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(',')[0]?.split('=')[1]};`
    const hash = crypto.createHmac('sha256', secret).update(message).digest('hex')
    const receivedHash = xSignature.split(',')[1]?.split('=')[1]
    return hash === receivedHash
  } catch {
    return false
  }
}
