'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Banner } from '@/types'

export default function BottomBanner() {
  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['banners', 'HOME_BOTTOM'],
    queryFn: async () => {
      const { data } = await api.get('/banners?position=HOME_BOTTOM')
      return data.data.banners as Banner[]
    },
  })

  const banner = banners[0]
  if (!banner) return null

  return (
    <section className="relative h-48 md:h-64 overflow-hidden bg-zinc-900">
      <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover opacity-70" sizes="100vw" />
      <div className="absolute inset-0 flex items-center justify-center text-center">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{banner.title}</h3>
          {banner.subtitle && <p className="text-white/80 mb-4">{banner.subtitle}</p>}
          {banner.link && (
            <Link href={banner.link} className="inline-block px-8 py-3 gradient-primary text-white rounded-full font-bold hover:opacity-90 transition-opacity">
              Aproveitar
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
