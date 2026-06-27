import nodemailer, { Transporter, SentMessageInfo } from 'nodemailer'
import { env } from './env'
import { logger } from './logger'

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    })
  }
  return transporter
}

export async function verifyMailConnection(): Promise<void> {
  if (!env.SMTP_HOST || !env.SMTP_USER) {
    logger.warn('⚠️ SMTP não configurado — emails desativados')
    return
  }
  try {
    await getTransporter().verify()
    logger.info('✅ Conexão SMTP verificada com sucesso')
  } catch (error) {
    logger.warn('⚠️ Falha ao verificar conexão SMTP:', error)
  }
}

interface SendMailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendMail(options: SendMailOptions): Promise<SentMessageInfo> {
  try {
    const info = await getTransporter().sendMail({
      from: env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? options.html.replace(/<[^>]*>/g, ''),
    })
    logger.info(`Email enviado para ${options.to}: ${info.messageId}`)
    return info
  } catch (error) {
    logger.error(`Falha ao enviar email para ${options.to}:`, error)
    throw error
  }
}

function baseTemplate(content: string, storeName: string = 'Minha Sexy Shop'): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${storeName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #18181b; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #7c3aed, #db2777); padding: 32px 40px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin-top: 6px; font-size: 14px; }
    .body { padding: 40px; }
    .footer { padding: 24px 40px; text-align: center; background: #fafafa; border-top: 1px solid #e4e4e7; }
    .footer p { font-size: 12px; color: #71717a; line-height: 1.6; }
    .btn { display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 24px 0; }
    .divider { border: none; border-top: 1px solid #e4e4e7; margin: 24px 0; }
    .info-box { background: #f4f4f5; border-radius: 8px; padding: 20px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e4e4e7; }
    .info-row:last-child { border-bottom: none; font-weight: 700; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #16a34a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>${storeName}</h1>
        <p>+18 | Discrição garantida em todas as compras</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>Este e-mail foi enviado automaticamente. Por favor, não responda.</p>
        <p style="margin-top:8px;">© ${new Date().getFullYear()} ${storeName}. Todos os direitos reservados.</p>
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  storeName?: string
): Promise<void> {
  const content = `
    <h2 style="font-size:22px;margin-bottom:8px;">Bem-vindo(a), ${name}! 🎉</h2>
    <p style="color:#52525b;line-height:1.7;margin-bottom:16px;">
      Sua conta foi criada com sucesso. Explore nosso catálogo exclusivo com total discrição e segurança.
    </p>
    <div class="info-box">
      <p style="font-weight:600;margin-bottom:8px;">✅ O que você pode fazer agora:</p>
      <ul style="padding-left:20px;color:#52525b;line-height:1.9;">
        <li>Navegar pelo catálogo completo de produtos</li>
        <li>Adicionar produtos à sua lista de desejos</li>
        <li>Fazer pedidos com total discrição</li>
        <li>Acompanhar seus pedidos em tempo real</li>
      </ul>
    </div>
    <p style="text-align:center;">
      <a href="${env.FRONTEND_URL}/produtos" class="btn">Explorar Produtos</a>
    </p>
  `
  await sendMail({
    to,
    subject: `Bem-vindo(a) à ${storeName ?? 'Minha Sexy Shop'}! 🎉`,
    html: baseTemplate(content, storeName),
  })
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string,
  storeName?: string
): Promise<void> {
  const content = `
    <h2 style="font-size:22px;margin-bottom:8px;">Redefinir sua senha</h2>
    <p style="color:#52525b;line-height:1.7;margin-bottom:16px;">
      Olá, <strong>${name}</strong>. Recebemos uma solicitação para redefinir a senha da sua conta.
    </p>
    <p style="text-align:center;">
      <a href="${resetUrl}" class="btn">Redefinir Senha</a>
    </p>
    <hr class="divider" />
    <p style="color:#71717a;font-size:13px;line-height:1.7;">
      ⚠️ Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, ignore este e-mail — sua senha permanece a mesma.
    </p>
    <p style="color:#71717a;font-size:12px;margin-top:12px;">
      Ou copie e cole este link no navegador:<br/>
      <span style="word-break:break-all;color:#7c3aed;">${resetUrl}</span>
    </p>
  `
  await sendMail({
    to,
    subject: `Redefinir senha — ${storeName ?? 'Minha Sexy Shop'}`,
    html: baseTemplate(content, storeName),
  })
}

export interface OrderEmailData {
  orderNumber: string
  customerName: string
  items: Array<{ name: string; quantity: number; price: number; variantName?: string }>
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  paymentMethod: string
  shippingAddress: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  isDiscreetPackaging: boolean
  estimatedDelivery?: string
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderEmailData,
  storeName?: string
): Promise<void> {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const itemsHtml = data.items
    .map(
      (item) => `
      <div class="info-row">
        <span>${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''}</span>
        <span>${formatCurrency(item.price * item.quantity)}</span>
      </div>`
    )
    .join('')

  const addr = data.shippingAddress
  const addressStr = `${addr.street}, ${addr.number}${addr.complement ? ` - ${addr.complement}` : ''}, ${addr.neighborhood}, ${addr.city}/${addr.state} — CEP ${addr.zipCode}`

  const content = `
    <h2 style="font-size:22px;margin-bottom:8px;">Pedido confirmado! 🎉</h2>
    <p style="color:#52525b;line-height:1.7;margin-bottom:8px;">
      Olá, <strong>${data.customerName}</strong>! Seu pedido foi recebido e está sendo processado.
    </p>
    <p style="margin-bottom:24px;">
      <span class="badge">✅ Pedido ${data.orderNumber}</span>
    </p>

    <div class="info-box">
      <strong style="display:block;margin-bottom:12px;">🛍️ Itens do Pedido</strong>
      ${itemsHtml}
      <div class="info-row">
        <span>Subtotal</span><span>${formatCurrency(data.subtotal)}</span>
      </div>
      ${data.discount > 0 ? `<div class="info-row"><span>Desconto</span><span style="color:#16a34a;">- ${formatCurrency(data.discount)}</span></div>` : ''}
      <div class="info-row">
        <span>Frete</span><span>${data.shippingCost === 0 ? '🎁 Grátis' : formatCurrency(data.shippingCost)}</span>
      </div>
      <div class="info-row">
        <span>Total</span><span>${formatCurrency(data.total)}</span>
      </div>
    </div>

    <div class="info-box" style="margin-top:16px;">
      <strong style="display:block;margin-bottom:12px;">🚚 Endereço de Entrega</strong>
      <p style="color:#52525b;font-size:14px;">${addressStr}</p>
      ${data.isDiscreetPackaging ? '<p style="margin-top:8px;font-size:13px;color:#7c3aed;">📦 Embalagem discreta solicitada</p>' : ''}
      ${data.estimatedDelivery ? `<p style="margin-top:8px;font-size:13px;color:#52525b;">📅 Previsão de entrega: <strong>${data.estimatedDelivery}</strong></p>` : ''}
    </div>

    <p style="text-align:center;margin-top:24px;">
      <a href="${env.FRONTEND_URL}/minha-conta/pedidos" class="btn">Acompanhar Pedido</a>
    </p>
  `

  await sendMail({
    to,
    subject: `Pedido ${data.orderNumber} confirmado! — ${storeName ?? 'Minha Sexy Shop'}`,
    html: baseTemplate(content, storeName),
  })
}

export async function sendOrderStatusUpdateEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  newStatus: string,
  trackingCode?: string,
  storeName?: string
): Promise<void> {
  const statusMessages: Record<string, { title: string; message: string; emoji: string }> = {
    PROCESSING: {
      title: 'Pedido em processamento',
      message: 'Seu pedido está sendo preparado com cuidado.',
      emoji: '⚙️',
    },
    SHIPPED: {
      title: 'Pedido enviado!',
      message: 'Seu pedido foi enviado e está a caminho.',
      emoji: '🚚',
    },
    DELIVERED: {
      title: 'Pedido entregue!',
      message: 'Seu pedido foi entregue. Esperamos que curta!',
      emoji: '🎉',
    },
    CANCELLED: {
      title: 'Pedido cancelado',
      message: 'Seu pedido foi cancelado. Entre em contato se tiver dúvidas.',
      emoji: '❌',
    },
    REFUNDED: {
      title: 'Reembolso realizado',
      message: 'O reembolso do seu pedido foi processado.',
      emoji: '💰',
    },
  }

  const statusInfo = statusMessages[newStatus] ?? {
    title: `Status atualizado: ${newStatus}`,
    message: 'O status do seu pedido foi atualizado.',
    emoji: '📦',
  }

  const content = `
    <h2 style="font-size:22px;margin-bottom:8px;">${statusInfo.emoji} ${statusInfo.title}</h2>
    <p style="color:#52525b;line-height:1.7;margin-bottom:16px;">
      Olá, <strong>${customerName}</strong>! ${statusInfo.message}
    </p>
    <p style="margin-bottom:24px;">
      <span class="badge">Pedido ${orderNumber}</span>
    </p>
    ${
      trackingCode
        ? `<div class="info-box">
            <strong>📍 Código de Rastreio:</strong>
            <p style="font-size:20px;font-weight:700;color:#7c3aed;margin-top:8px;">${trackingCode}</p>
            <p style="font-size:12px;color:#71717a;margin-top:4px;">Use este código para rastrear sua encomenda nos Correios ou transportadora.</p>
           </div>`
        : ''
    }
    <p style="text-align:center;">
      <a href="${env.FRONTEND_URL}/minha-conta/pedidos" class="btn">Ver Meu Pedido</a>
    </p>
  `

  await sendMail({
    to,
    subject: `${statusInfo.emoji} ${statusInfo.title} — Pedido ${orderNumber}`,
    html: baseTemplate(content, storeName),
  })
}
