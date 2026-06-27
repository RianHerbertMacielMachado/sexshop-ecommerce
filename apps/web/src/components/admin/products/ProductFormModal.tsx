'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Product, Category } from '@/types'

const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Preço deve ser positivo'),
  compareAtPrice: z.coerce.number().optional(),
  sku: z.string().min(1, 'SKU obrigatório'),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().cuid('Selecione uma categoria'),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isDiscreet: z.boolean().optional(),
  weight: z.coerce.number().optional(),
  tags: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  product?: Product | null
}

export default function ProductFormModal({ isOpen, onClose, product }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!product

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data.data.categories as Category[]
    },
    enabled: isOpen,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })

  useEffect(() => {
    if (isOpen) {
      if (product) {
        reset({
          name: product.name,
          description: product.description ?? '',
          price: product.price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          sku: product.sku,
          stock: product.stock,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured ?? false,
          isDiscreet: product.isDiscreet ?? false,
          weight: product.weight ?? undefined,
          tags: product.tags?.join(', ') ?? '',
        })
      } else {
        reset({ isActive: true, isFeatured: false, isDiscreet: false, stock: 0, price: 0 })
      }
    }
  }, [isOpen, product, reset])

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      }
      return isEditing
        ? api.put(`/products/${product!.id}`, payload)
        : api.post('/products', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success(isEditing ? 'Produto atualizado!' : 'Produto criado!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar produto.'),
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="price">Preço *</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="compareAtPrice">Preço Comparativo</Label>
              <Input id="compareAtPrice" type="number" step="0.01" {...register('compareAtPrice')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register('sku')} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="stock">Estoque *</Label>
              <Input id="stock" type="number" {...register('stock')} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Categoria *</Label>
              <Select
                value={watch('categoryId') || ''}
                onValueChange={(v) => setValue('categoryId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input id="weight" type="number" step="0.001" {...register('weight')} />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input id="tags" {...register('tags')} placeholder="vibradores, brinquedos, adulto" />
            </div>

            <div className="flex items-center justify-between">
              <Label>Ativo</Label>
              <Switch
                checked={watch('isActive') ?? true}
                onCheckedChange={(v) => setValue('isActive', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Destaque</Label>
              <Switch
                checked={watch('isFeatured') ?? false}
                onCheckedChange={(v) => setValue('isFeatured', v)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Embalagem Discreta</Label>
              <Switch
                checked={watch('isDiscreet') ?? false}
                onCheckedChange={(v) => setValue('isDiscreet', v)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
