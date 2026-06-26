'use client'

import { Truck, Shield, RefreshCw, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettings } from '@/hooks/useSettings'
import { formatCurrency } from '@/lib/utils'

export default function PromoSection() {
  const { data: settings } = useSettings()

  const features = [
    {
      icon: Truck,
      title: settings?.freeShippingThreshold
        ? `Frete Grátis acima de ${formatCurrency(settings.freeShippingThreshold)}`
        : 'Frete Grátis',
      desc: 'Para regiões Sul e Sudeste',
      color: 'from-violet-500 to-violet-600',
    },
    {
      icon: Lock,
      title: 'Embalagem 100% Discreta',
      desc: 'Sem identificação do conteúdo',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Shield,
      title: 'Pagamento Seguro',
      desc: 'SSL e criptografia avançada',
      color: 'from-violet-600 to-pink-500',
    },
    {
      icon: RefreshCw,
      title: 'Troca em 30 Dias',
      desc: 'Satisfação garantida',
      color: 'from-pink-600 to-violet-500',
    },
  ]

  return (
    <section className="py-12 bg-gradient-to-r from-violet-700 via-purple-700 to-pink-700">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0 shadow-lg`}>
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{title}</p>
                <p className="text-white/70 text-xs mt-0.5">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
