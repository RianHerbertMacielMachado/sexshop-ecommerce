'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import api from '@/lib/api'
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'

// Shape do pedido retornado pela API
interface TrackingOrder {
  id: string
  orderNumber: string
  status: string
  trackingCode?: string
  createdAt: string
  updatedAt: string
  total: number
  items?: { name: string; quantity: number; price: number }[]
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; step: number }> = {
  PENDING:    { label: 'Aguardando Pagamento', icon: Clock,         color: 'text-amber-500',  step: 0 },
  PAID:       { label: 'Pagamento Confirmado', icon: CheckCircle,   color: 'text-blue-500',   step: 1 },
  PROCESSING: { label: 'Em Preparação',        icon: Package,       color: 'text-violet-500', step: 2 },
  SHIPPED:    { label: 'Enviado',              icon: Truck,         color: 'text-indigo-500', step: 3 },
  DELIVERED:  { label: 'Entregue',             icon: CheckCircle,   color: 'text-green-500',  step: 4 },
  CANCELLED:  { label: 'Cancelado',            icon: AlertCircle,   color: 'text-red-500',    step: -1 },
}

const STEPS = [
  { key: 'PAID',       label: 'Pagamento' },
  { key: 'PROCESSING', label: 'Preparação' },
  { key: 'SHIPPED',    label: 'Enviado' },
  { key: 'DELIVERED',  label: 'Entregue' },
]

export default function RastrearPedidoPage() {
  const [form, setForm] = useState({ orderNumber: '', email: '' })
  const [order, setOrder] = useState<TrackingOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.orderNumber.trim() || !form.email.trim()) {
      setError('Preencha o número do pedido e o e-mail.')
      return
    }
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      // A API usa req.body mas a rota é GET — enviamos email como query param
      const { data } = await api.get(`/orders/track/${form.orderNumber.trim()}`, {
        params: { email: form.email.trim() },
      })
      setOrder(data.data.order)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Pedido não encontrado. Verifique o número e o e-mail informados.')
    } finally {
      setLoading(false)
    }
  }

  const currentStatus = order ? STATUS_CONFIG[order.status] : null
  const currentStep = currentStatus?.step ?? -1

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <Truck className="h-12 w-12 mx-auto mb-4 text-violet-300" />
            <h1 className="text-4xl font-bold mb-4">Rastrear Pedido</h1>
            <p className="text-violet-200 text-lg">
              Acompanhe o status da sua entrega em tempo real.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-xl">

            {/* Formulário de busca */}
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8 mb-8">
              <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                <Search className="h-5 w-5 text-violet-600" />
                Buscar Pedido
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Número do Pedido
                  </label>
                  <input
                    type="text"
                    value={form.orderNumber}
                    onChange={(e) => setForm((f) => ({ ...f, orderNumber: e.target.value }))}
                    placeholder="Ex: ORD-2024-001234"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <p className="text-xs text-zinc-400 mt-1">
                    O número do pedido foi enviado no e-mail de confirmação.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    E-mail do Pedido
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="e-mail usado na compra"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Buscando...</>
                    : <><Search className="h-4 w-4" /> Rastrear Pedido</>
                  }
                </button>
              </form>
            </div>

            {/* Resultado */}
            {order && currentStatus && (
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden">
                {/* Header do resultado */}
                <div className="p-6 border-b border-zinc-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-1">Pedido</p>
                      <p className="text-lg font-bold text-zinc-900">#{order.orderNumber}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 ${currentStatus.color}`}>
                      <currentStatus.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{currentStatus.label}</span>
                    </div>
                  </div>
                </div>

                {/* Progresso (só para pedidos não cancelados) */}
                {order.status !== 'CANCELLED' && (
                  <div className="p-6 border-b border-zinc-100">
                    <div className="relative">
                      {/* Linha de progresso */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-100" />
                      <div
                        className="absolute top-5 left-0 h-0.5 bg-violet-500 transition-all duration-500"
                        style={{ width: `${(Math.max(0, currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                      />
                      <div className="relative flex justify-between">
                        {STEPS.map((step, idx) => {
                          const stepNum = idx + 1
                          const done = currentStep >= stepNum
                          const active = currentStep === stepNum
                          return (
                            <div key={step.key} className="flex flex-col items-center gap-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                                done
                                  ? 'bg-violet-600 border-violet-600 text-white'
                                  : active
                                  ? 'bg-white border-violet-600 text-violet-600'
                                  : 'bg-white border-zinc-200 text-zinc-400'
                              }`}>
                                {done && !active
                                  ? <CheckCircle className="h-5 w-5" />
                                  : <span className="text-xs font-bold">{stepNum}</span>
                                }
                              </div>
                              <p className={`text-xs font-medium text-center ${done ? 'text-violet-700' : 'text-zinc-400'}`}>
                                {step.label}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Código de rastreamento */}
                {order.trackingCode && (
                  <div className="p-6 border-b border-zinc-100">
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-2">
                      Código de Rastreamento
                    </p>
                    <div className="flex items-center gap-3">
                      <code className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm font-mono text-zinc-800">
                        {order.trackingCode}
                      </code>
                      <a
                        href={`https://rastreamento.correios.com.br/app/index.php?objeto=${order.trackingCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors shrink-0"
                      >
                        Rastrear
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                      Clique em &quot;Rastrear&quot; para acompanhar no site dos Correios.
                    </p>
                  </div>
                )}

                {/* Endereço de entrega */}
                {order.shippingAddress && (
                  <div className="p-6 border-b border-zinc-100">
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide mb-2 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> Endereço de Entrega
                    </p>
                    <p className="text-sm text-zinc-700">
                      {order.shippingAddress.street}, {order.shippingAddress.city} – {order.shippingAddress.state}
                    </p>
                    <p className="text-sm text-zinc-500">CEP: {order.shippingAddress.zipCode}</p>
                  </div>
                )}

                {/* Resumo financeiro */}
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-500">Total do Pedido</p>
                    <p className="font-bold text-zinc-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)}
                    </p>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Dica para usuário logado */}
            {!order && !loading && (
              <div className="bg-violet-50 border border-violet-100 rounded-2xl p-5 text-center">
                <p className="text-sm text-violet-800">
                  Você tem uma conta?{' '}
                  <a href="/conta" className="font-semibold hover:underline">
                    Acesse Minha Conta
                  </a>{' '}
                  para ver todos os seus pedidos e rastreamentos em um só lugar.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
