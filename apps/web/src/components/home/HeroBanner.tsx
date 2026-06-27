'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Banner } from '@/types'
import { cn } from '@/lib/utils'

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['banners', 'HOME_HERO'],
    queryFn: async () => {
      const { data } = await api.get('/banners?position=HOME_HERO')
      return data.data.banners as Banner[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % (banners.length || 1))
  }, [banners.length])

  const prev = () => {
    setCurrent((c) => (c - 1 + (banners.length || 1)) % (banners.length || 1))
  }

  useEffect(() => {
    if (paused || banners.length <= 1) return
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [paused, next, banners.length])

  if (!banners.length) {
    return (
      <div className="relative h-[400px] md:h-[520px] bg-gradient-to-r from-violet-700 to-pink-600 flex items-center justify-center">
        <div className="text-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Bem-vindo à nossa loja ✨
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/80 mb-8"
          >
            Produtos adultos com total discrição
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link
              href="/produtos"
              className="inline-block px-8 py-3 bg-white text-violet-700 rounded-full font-bold hover:bg-violet-50 transition-colors"
            >
              Explorar Produtos
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative h-[400px] md:h-[520px] overflow-hidden bg-zinc-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        {banners.map(
          (banner, i) =>
            i === current && (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0"
              >
                <Image
                  src={banner.imageUrl ?? '/placeholder.svg'}
                  alt={banner.title ?? ''}
                  fill
                  priority={i === 0}
                  className="object-cover"
                  sizes="100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 md:px-12">
                    <motion.div
                      initial={{ opacity: 0, x: -40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="max-w-xl"
                    >
                      <h2 className="text-3xl md:text-5xl font-bold text-white mb-3 leading-tight">
                        {banner.title ?? ''}
                      </h2>
                      {banner.subtitle && (
                        <p className="text-lg text-white/80 mb-8">{banner.subtitle}</p>
                      )}
                      {banner.linkUrl && (
                        <Link
                          href={banner.linkUrl}
                          className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-violet-700 rounded-full font-bold hover:bg-violet-50 transition-all hover:scale-105 shadow-lg"
                        >
                          Ver Produtos
                          <ChevronRight size={18} />
                        </Link>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
        )}
      </AnimatePresence>

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors flex items-center justify-center z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors flex items-center justify-center z-10"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'transition-all rounded-full',
                  i === current ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
