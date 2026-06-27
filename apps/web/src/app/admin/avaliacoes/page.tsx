'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Check, X, Star, Search, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Pagination from '@/components/ui/Pagination'
import { toast } from 'react-hot-toast'
import type { Review } from '@/types'

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('ALL')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, search, filter],
    queryFn: async () => {
      const res = await api.get('/reviews/admin/reviews', {
        params: {
          page,
          limit: 15,
          search,
          isApproved: filter === 'ALL' ? undefined : filter === 'APPROVED',
        },
      })
      return res.data.data as { reviews: Review[]; total: number; pages: number }
    },
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, approve }: { id: string; approve: boolean }) =>
      approve
        ? api.patch(`/reviews/admin/reviews/${id}/approve`)
        : api.patch(`/reviews/admin/reviews/${id}/reject`),
    onSuccess: (_, { approve }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] })
      toast.success(approve ? 'Avaliação aprovada.' : 'Avaliação rejeitada.')
    },
    onError: () => toast.error('Erro ao atualizar avaliação.'),
  })

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
        />
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Avaliações</h1>

      <div className="bg-background rounded-xl border shadow-sm">
        <div className="p-4 border-b flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar avaliações..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={(v) => { setFilter(v); setPage(1) }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas</SelectItem>
              <SelectItem value="PENDING">Pendentes</SelectItem>
              <SelectItem value="APPROVED">Aprovadas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="p-4 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </div>
            ))
          ) : (data?.reviews?.length ?? 0) === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhuma avaliação encontrada.</p>
            </div>
          ) : (
            data?.reviews?.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-sm">{review.user?.name ?? 'Anônimo'}</p>
                      {renderStars(review.rating)}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${review.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.isApproved ? 'Aprovada' : 'Pendente'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {review.product?.name} • {formatDate(review.createdAt)}
                    </p>
                    {review.title && (
                      <p className="text-sm font-medium">{review.title}</p>
                    )}
                    {review.comment && (
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {review.comment}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!review.isApproved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                        onClick={() => approveMutation.mutate({ id: review.id, approve: true })}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {review.isApproved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => approveMutation.mutate({ id: review.id, approve: false })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {data && data.pages > 1 && (
          <div className="p-4 border-t">
            <Pagination page={page} totalPages={data.pages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  )
}
