'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Copy, Check, Clock, QrCode } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { api } from '@/lib/api'
import { useCartStore } from '@/stores/cartStore'
import toast from 'react-hot-toast'

function PixContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId') ?? ''
  const [copied, setCopied] = useState(false)
  const [paid, setPaid] = useState(false)
  const { clearCart } = useCartStore()

  const { data: pixData, isLoading } = useQuery({
    queryKey: ['pix', orderId],
    queryFn: async () => {
      const { data } = await api.post('/payments/checkout/pix', { orderId })
      return data.data as {
        pixCopyPaste: string
        pixQrCode: string
        expiresAt: string
        mpPaymentId: string
      }
    },
    enabled: !!orderId,
  })

  const checkStatus = useCallback(async () => {
    if (!orderId || paid) return
    try {
      const { data } = await api.get(`/payments/pix/status/${orderId}`)
      if (data.data.isPaid) {
        setPaid(true)
        clearCart()
        setTimeout(() => router.push(`/checkout/sucesso?orderId=${orderId}`), 1500)
      }
    } catch {
      // silently fail
    }
  }, [orderId, paid, clearCart, router])

  useEffect(() => {
    if (!orderId || paid) return
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [checkStatus, orderId, paid])

  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!pixData?.expiresAt) return
    const expiresAt = new Date(pixData.expiresAt).getTime()

    const updateTimer = () => {
      const remaining = Math.max(0, expiresAt - Date.now())
      setTimeLeft(Math.floor(remaining / 1000))
      if (remaining === 0) clearInterval(timer)
    }
    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [pixData?.expiresAt])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const handleCopy = async () => {
    if (!pixData?.pixCopyPaste) return
    await navigator.clipboard.writeText(pixData.pixCopyPaste)
    setCopied(true)
    toast.success('Código PIX copiado!')
    setTimeout(() => setCopied(false), 3000)
  }

  if (paid) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Pagamento Confirmado! 🎉</h2>
          <p className="text-zinc-500">Redirecionando...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50 py-8">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4">
              <QrCode size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Pagar com PIX</h1>
            <p className="text-zinc-500 mt-2">Escaneie o QR Code ou copie o código PIX</p>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-zinc-100 p-8 text-center">
              <div className="w-48 h-48 bg-zinc-100 animate-pulse rounded-xl mx-auto mb-4" />
              <p className="text-zinc-400">Gerando PIX...</p>
            </div>
          ) : pixData ? (
            <div className="space-y-4">
              {/* Timer */}
              {timeLeft !== null && timeLeft > 0 && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-xl ${timeLeft < 300 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  <Clock size={16} />
                  <span className="font-semibold text-sm">
                    Expira em {formatTime(timeLeft)}
                  </span>
                </div>
              )}

              {/* QR Code */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-6 text-center">
                <div className="w-52 h-52 mx-auto mb-4 bg-white border-4 border-zinc-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {pixData.pixQrCode ? (
                    <img
                      src={`data:image/png;base64,${pixData.pixQrCode}`}
                      alt="QR Code PIX"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <QrCode size={120} className="text-zinc-300" />
                  )}
                </div>
                <p className="text-sm text-zinc-500">Use o app do seu banco para escanear</p>
              </div>

              {/* Copy paste */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-5">
                <p className="text-sm font-semibold text-zinc-700 mb-3">Ou copie o código PIX:</p>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-zinc-50 rounded-xl text-xs text-zinc-600 break-all font-mono overflow-hidden">
                    {pixData.pixCopyPaste?.slice(0, 60)}...
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 p-3 rounded-xl transition-all ${copied ? 'bg-green-500 text-white' : 'gradient-primary text-white'}`}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-white rounded-2xl border border-zinc-100 p-5">
                <p className="font-semibold text-zinc-900 mb-3 text-sm">Como pagar:</p>
                <ol className="space-y-2 text-sm text-zinc-600">
                  {[
                    'Abra o aplicativo do seu banco',
                    'Acesse a área PIX',
                    'Escaneie o QR Code ou cole o código',
                    'Confirme o pagamento',
                    'Aguarde a confirmação automática',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full gradient-primary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  Aguardando pagamento...
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <p>Erro ao gerar PIX. Tente novamente.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function PixPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-200 animate-pulse mx-auto mb-4" />
          <p className="text-zinc-400">Carregando PIX...</p>
        </div>
      </div>
    }>
      <PixContent />
    </Suspense>
  )
}
