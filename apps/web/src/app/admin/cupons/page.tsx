'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Plus, Pencil, Trash2, Tag, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import CouponFormModal from '@/components/admin/coupons/CouponFormModal'
import type { Coupon } from '@/types'

export default function AdminCouponsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const queryClient = useQueryClient()

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons/admin')
      return res.data.data?.coupons as Coupon[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/coupons/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
      toast.success('Cupom removido.')
    },
    onError: () => toast.error('Erro ao remover cupom.'),
  })

  const openEdit = (coupon: Coupon) => { setEditingCoupon(coupon); setIsModalOpen(true) }
  const openNew = () => { setEditingCoupon(null); setIsModalOpen(true) }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Código copiado!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cupons</h1>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Novo Cupom
        </Button>
      </div>

      <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Código</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Tipo</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Valor</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Usos</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Validade</th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(7)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            ) : (
              coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date()
                const isMaxed = coupon.maxUses && coupon.usedCount >= coupon.maxUses
                const statusOk = coupon.isActive && !isExpired && !isMaxed

                return (
                  <tr key={coupon.id} className="border-b hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono font-bold">{coupon.code}</code>
                        <button
                          onClick={() => copyCode(coupon.code)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {coupon.type === 'PERCENTAGE' ? 'Percentual' :
                        coupon.type === 'FIXED' ? 'Fixo' : 'Frete Grátis'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {coupon.type === 'PERCENTAGE'
                        ? `${coupon.value}%`
                        : coupon.type === 'FIXED'
                        ? formatCurrency(coupon.value)
                        : '–'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {coupon.usedCount}
                      {coupon.maxUses ? ` / ${coupon.maxUses}` : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Sem expiração'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {statusOk ? 'Ativo' : isExpired ? 'Expirado' : isMaxed ? 'Esgotado' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(coupon)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => { if (confirm('Remover cupom?')) deleteMutation.mutate(coupon.id) }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        coupon={editingCoupon}
      />
    </div>
  )
}
