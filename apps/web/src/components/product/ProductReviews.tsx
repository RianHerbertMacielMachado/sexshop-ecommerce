'use client'

import { useState } from 'react'
import { Star, MessageSquare } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { formatDate, cn } from '@/lib/utils'
import type { Review } from '@/types'
import toast from 'react-hot-toast'

interface Props {
  productId: string
  productName: string
}

export default function ProductReviews({ productId, productName }: Props) {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [page, setPage] = useState(1)

  const { data } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: async () => {
      const { data } = await api.get(`/products/${productId}/reviews?page=${page}&limit=5`)
      return data.data as { reviews: Review[]; total: number; totalPages: number }
    },
  })

  const { mutate: submitReview, isPending } = useMutation({
    mutationFn: async () => {
      await api.post(`/products/${productId}/reviews`, { rating, comment })
    },
    onSuccess: () => {
      toast.success('Avaliação enviada para moderação!')
      setComment('')
      setRating(5)
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
    },
  })

  const reviews = data?.reviews ?? []

  return (
    <div className="space-y-8">
      {/* Review Form */}
      {isAuthenticated && (
        <div className="bg-zinc-50 rounded-2xl p-6">
          <h3 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <MessageSquare size={18} className="text-violet-600" />
            Escrever Avaliação
          </h3>
          <div className="mb-4">
            <p className="text-sm text-zinc-600 mb-2">Sua nota:</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(s)}
                >
                  <Star
                    size={28}
                    className={cn(
                      'transition-colors',
                      s <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-zinc-300 fill-zinc-300'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte sua experiência com o produto..."
            rows={4}
            className="w-full px-4 py-3 border border-zinc-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
          <button
            onClick={() => submitReview()}
            disabled={isPending || !comment.trim()}
            className="mt-3 px-6 py-2.5 gradient-primary text-white rounded-xl font-medium text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {isPending ? 'Enviando...' : 'Enviar Avaliação'}
          </button>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-zinc-400">
          <Star size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Nenhuma avaliação ainda</p>
          <p className="text-sm mt-1">Seja o primeiro a avaliar este produto!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-zinc-100 rounded-xl p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">
                    {review.user?.name ?? review.guestName ?? 'Cliente'}
                  </p>
                  <p className="text-xs text-zinc-400">{formatDate(review.createdAt)}</p>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-200 fill-zinc-200'} />
                  ))}
                </div>
              </div>
              {review.comment && <p className="text-sm text-zinc-700 leading-relaxed">{review.comment}</p>}
              {review.adminReply && (
                <div className="mt-3 p-3 bg-violet-50 rounded-lg border-l-2 border-violet-400">
                  <p className="text-xs font-semibold text-violet-700 mb-1">Resposta da Loja:</p>
                  <p className="text-xs text-violet-800">{review.adminReply}</p>
                </div>
              )}
            </div>
          ))}

          {(data?.totalPages ?? 1) > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              {Array.from({ length: data?.totalPages ?? 1 }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn('w-8 h-8 rounded-lg text-sm font-medium transition-all', p === page ? 'gradient-primary text-white' : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50')}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
