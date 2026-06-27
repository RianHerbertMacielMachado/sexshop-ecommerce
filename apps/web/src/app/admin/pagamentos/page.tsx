'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  CreditCard,
  Smartphone,
  Search,
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  QrCode,
  Receipt,
  Wrench,
  X,
  GripVertical,
  History,
  Settings,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import Pagination from '@/components/ui/Pagination'
import { toast } from 'react-hot-toast'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Payment {
  id: string
  orderId: string
  orderNumber: string
  method: 'STRIPE' | 'PIX'
  amount: number
  status: string
  createdAt: string
  customerName: string
  customerEmail: string
}

interface PaymentMethod {
  id: string
  name: string
  type: 'STRIPE_CARD' | 'PIX' | 'BOLETO' | 'MANUAL'
  instructions: string | null
  icon: string | null
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ── Schema do formulário ───────────────────────────────────────────────────────

const methodSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  type: z.enum(['STRIPE_CARD', 'PIX', 'BOLETO', 'MANUAL'], {
    errorMap: () => ({ message: 'Selecione um tipo' }),
  }),
  instructions: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
  order: z.coerce.number().int().min(0).optional(),
})

type MethodFormData = z.infer<typeof methodSchema>

// ── Helpers visuais ────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  STRIPE_CARD: 'Cartão (Stripe)',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  MANUAL: 'Manual',
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  STRIPE_CARD: CreditCard,
  PIX: QrCode,
  BOLETO: Receipt,
  MANUAL: Wrench,
}

const TYPE_COLORS: Record<string, string> = {
  STRIPE_CARD: 'bg-blue-100 text-blue-700',
  PIX: 'bg-green-100 text-green-700',
  BOLETO: 'bg-yellow-100 text-yellow-700',
  MANUAL: 'bg-zinc-100 text-zinc-700',
}

// ── Modal de criação/edição ────────────────────────────────────────────────────

interface MethodModalProps {
  method: PaymentMethod | null
  onClose: () => void
}

function MethodModal({ method, onClose }: MethodModalProps) {
  const queryClient = useQueryClient()
  const isEditing = !!method

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MethodFormData>({
    resolver: zodResolver(methodSchema),
    defaultValues: {
      name: method?.name ?? '',
      type: method?.type ?? 'STRIPE_CARD',
      instructions: method?.instructions ?? '',
      icon: method?.icon ?? '',
      isActive: method?.isActive ?? true,
      order: method?.order ?? 0,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (data: MethodFormData) => {
      const payload = {
        ...data,
        instructions: data.instructions || null,
        icon: data.icon || null,
      }
      return isEditing
        ? api.put(`/payments/admin/methods/${method!.id}`, payload)
        : api.post('/payments/admin/methods', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
      toast.success(isEditing ? 'Método atualizado!' : 'Método criado!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar método.'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-4">
          {/* Nome */}
          <div className="space-y-1">
            <Label htmlFor="name">Nome <span className="text-destructive">*</span></Label>
            <Input id="name" {...register('name')} placeholder="Ex: Cartão de Crédito" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          {/* Tipo */}
          <div className="space-y-1">
            <Label>Tipo <span className="text-destructive">*</span></Label>
            <Select
              value={watch('type')}
              onValueChange={(v) => setValue('type', v as MethodFormData['type'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([value, label]) => {
                  const Icon = TYPE_ICONS[value]
                  return (
                    <SelectItem key={value} value={value}>
                      <span className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </span>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
          </div>

          {/* Instruções */}
          <div className="space-y-1">
            <Label htmlFor="instructions">
              Instruções{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (exibido ao cliente no checkout)
              </span>
            </Label>
            <Textarea
              id="instructions"
              {...register('instructions')}
              rows={3}
              placeholder="Ex: Parcelamento em até 12x sem juros. Aprovação em segundos."
            />
            {errors.instructions && (
              <p className="text-xs text-destructive">{errors.instructions.message}</p>
            )}
          </div>

          {/* Ordem + Ativo */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="order">
                Ordem{' '}
                <span className="text-xs text-muted-foreground font-normal">(menor = primeiro)</span>
              </Label>
              <Input
                id="order"
                type="number"
                min={0}
                step={1}
                {...register('order')}
                placeholder="0"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Ativo</p>
                  <p className="text-xs text-muted-foreground">Visível no checkout</p>
                </div>
                <Switch
                  checked={watch('isActive') ?? true}
                  onCheckedChange={(v) => setValue('isActive', v)}
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
              {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Método'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Aba: Métodos de Pagamento ──────────────────────────────────────────────────

function PaymentMethodsTab() {
  const queryClient = useQueryClient()
  const [modalMethod, setModalMethod] = useState<PaymentMethod | null | undefined>(undefined)
  // undefined = fechado, null = novo, PaymentMethod = editar

  const { data: methods = [], isLoading } = useQuery<PaymentMethod[]>({
    queryKey: ['admin-payment-methods'],
    queryFn: async () => {
      const res = await api.get('/payments/admin/methods')
      return res.data.data.methods
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/payments/admin/methods/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
      toast.success('Status atualizado.')
    },
    onError: () => toast.error('Erro ao alterar status.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/payments/admin/methods/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payment-methods'] })
      toast.success('Método removido.')
    },
    onError: () => toast.error('Erro ao remover método.'),
  })

  const confirmDelete = (method: PaymentMethod) => {
    if (confirm(`Remover o método "${method.name}"? Esta ação não pode ser desfeita.`)) {
      deleteMutation.mutate(method.id)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Configure os métodos disponíveis no checkout da loja.
        </p>
        <Button onClick={() => setModalMethod(null)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Novo Método
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center py-16 bg-background rounded-xl border">
          <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
          <p className="font-medium text-muted-foreground">Nenhum método cadastrado.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Clique em "Novo Método" para adicionar PIX, Cartão, Boleto, etc.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {methods.map((method) => {
            const Icon = TYPE_ICONS[method.type] ?? CreditCard
            const colorClass = TYPE_COLORS[method.type] ?? 'bg-zinc-100 text-zinc-700'
            return (
              <div
                key={method.id}
                className={`bg-background rounded-xl border shadow-sm p-5 transition-opacity ${
                  method.isActive ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Ícone do tipo */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{method.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorClass}`}>
                        {TYPE_LABELS[method.type]}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          method.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {method.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    {method.instructions && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {method.instructions}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Ordem: {method.order}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle ativo */}
                    <button
                      onClick={() => toggleMutation.mutate(method.id)}
                      disabled={toggleMutation.isPending}
                      title={method.isActive ? 'Desativar' : 'Ativar'}
                      className={`p-2 rounded-lg transition-colors ${
                        method.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-zinc-400 hover:bg-zinc-100'
                      }`}
                    >
                      {method.isActive ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>

                    {/* Editar */}
                    <button
                      onClick={() => setModalMethod(method)}
                      title="Editar"
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {/* Excluir */}
                    <button
                      onClick={() => confirmDelete(method)}
                      disabled={deleteMutation.isPending}
                      title="Excluir"
                      className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modalMethod !== undefined && (
        <MethodModal method={modalMethod} onClose={() => setModalMethod(undefined)} />
      )}
    </>
  )
}

// ── Aba: Histórico de Pagamentos ───────────────────────────────────────────────

function PaymentHistoryTab() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, search],
    queryFn: async () => {
      const res = await api.get('/admin/payments', {
        params: { page, limit: 15, search },
      })
      return res.data.data as { payments: Payment[]; total: number; pages: number }
    },
  })

  const statusColor = (s: string) =>
    ({ PAID: 'bg-green-100 text-green-700', PENDING: 'bg-yellow-100 text-yellow-700', FAILED: 'bg-red-100 text-red-700', REFUNDED: 'bg-blue-100 text-blue-700' }[s] ?? 'bg-muted text-muted-foreground')

  const statusLabel = (s: string) =>
    ({ PAID: 'Pago', PENDING: 'Pendente', FAILED: 'Falhou', REFUNDED: 'Reembolsado' }[s] ?? s)

  return (
    <div className="bg-background rounded-xl border shadow-sm">
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por pedido ou cliente..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/30">
              {['Pedido', 'Cliente', 'Método', 'Valor', 'Data', 'Status'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (data?.payments?.length ?? 0) === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum pagamento encontrado.
                </td>
              </tr>
            ) : (
              data?.payments?.map((payment) => (
                <tr key={payment.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium">#{payment.orderNumber}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{payment.customerName}</p>
                    <p className="text-xs text-muted-foreground">{payment.customerEmail}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {payment.method === 'STRIPE' ? (
                        <><CreditCard className="h-4 w-4 text-blue-500" /><span className="text-sm">Cartão</span></>
                      ) : (
                        <><Smartphone className="h-4 w-4 text-green-500" /><span className="text-sm">PIX</span></>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(payment.amount)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(payment.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(payment.status)}`}>
                      {statusLabel(payment.status)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.pages > 1 && (
        <div className="p-4 border-t">
          <Pagination page={page} totalPages={data.pages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}

// ── Página principal ───────────────────────────────────────────────────────────

type Tab = 'methods' | 'history'

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('methods')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Pagamentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie os métodos de pagamento e consulte o histórico de transações.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('methods')}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
            activeTab === 'methods'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Settings className="h-4 w-4" />
          Métodos de Pagamento
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors ${
            activeTab === 'history'
              ? 'bg-background shadow-sm text-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <History className="h-4 w-4" />
          Histórico de Transações
        </button>
      </div>

      {/* Conteúdo */}
      {activeTab === 'methods' ? <PaymentMethodsTab /> : <PaymentHistoryTab />}
    </div>
  )
}
