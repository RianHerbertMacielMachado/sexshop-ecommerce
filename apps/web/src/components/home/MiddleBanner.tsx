'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Banner } from '@/types'

export default function MiddleBanner() {
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['banners', 'HOME_MIDDLE'],
    queryFn: async () => {
      const { data } = await api.get('/banners?position=HOME_MIDDLE')
      return data.data.banners as Banner[]
    },
  })

  const banner = banners[0]
  if (!banner) return null

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative h-48 md:h-64 overflow-hidden bg-zinc-900 my-2"
    >
      <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover opacity-80" sizes="100vw" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      <div className="absolute inset-0 flex items-center container mx-auto px-4 md:px-12">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{banner.title}</h3>
          {banner.subtitle && <p className="text-white/80 mb-4">{banner.subtitle}</p>}
          {banner.link && (
            <Link href={banner.link} className="inline-block px-6 py-2.5 bg-white text-violet-700 rounded-full font-bold text-sm hover:bg-violet-50 transition-colors">
              Conferir
            </Link>
          )}
        </div>
      </div>
    </motion.section>
  )
}
