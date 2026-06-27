'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

export default function TestimonialsSection() {
  const [current, setCurrent] = useState(0)

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: async () => {
      const { data } = await api.get('/reviews/featured?limit=10')
      return data.data.reviews as Array<{
        id: string
        rating: number
        comment: string | null
        guestName: string | null
        createdAt: string
        user: { name: string } | null
        product: { name: string } | null
      }>
    },
  })

  const displayReviews = reviews.filter((r) => r.comment)
  if (!displayReviews.length) return null

  const next = () => setCurrent((c) => (c + 1) % displayReviews.length)
  const prev = () => setCurrent((c) => (c - 1 + displayReviews.length) % displayReviews.length)

  return (
    <section className="py-14 bg-zinc-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900">💬 O que dizem nossos clientes</h2>
        </motion.div>

        <div className="relative max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            {displayReviews.map(
              (review, i) =>
                i === current && (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-2xl p-8 shadow-sm border border-zinc-100 text-center"
                  >
                    <div className="flex justify-center gap-1 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={20}
                          className={star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'}
                        />
                      ))}
                    </div>
                    <p className="text-zinc-700 text-lg italic mb-6">"{review.comment}"</p>
                    <div>
                      <p className="font-semibold text-zinc-900">
                        {review.user?.name ?? review.guestName ?? 'Cliente'}
                      </p>
                      {review.product && (
                        <p className="text-sm text-zinc-400 mt-1">Sobre: {review.product.name}</p>
                      )}
                      <p className="text-xs text-zinc-400 mt-1">{formatDate(review.createdAt)}</p>
                    </div>
                  </motion.div>
                )
            )}
          </AnimatePresence>

          {displayReviews.length > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <button onClick={prev} className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                {displayReviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-violet-600 w-4' : 'bg-zinc-300'}`}
                  />
                ))}
              </div>
              <button onClick={next} className="p-2 rounded-full border border-zinc-200 hover:bg-zinc-100 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
