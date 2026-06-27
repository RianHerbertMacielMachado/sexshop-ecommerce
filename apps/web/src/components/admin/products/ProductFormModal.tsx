'use client'

import { useEffect, useState } from 'react'
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
import ImageUploader from '@/components/admin/products/ImageUploader'

const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
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
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
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
  const [images, setImages] = useState<string[]>([])

  const { data: categories = [] } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data.data.categories as Category[]
    },
    enabled: isOpen,
  })

  // Busca o produto completo para garantir todos os campos (slug, shortDescription, metaTitle etc.)
  const { data: fullProduct } = useQuery({
    queryKey: ['product-full', product?.id],
    queryFn: async () => {
      const res = await api.get(`/products/admin/${product!.id}`)
      return res.data.data.product as Product
    },
    enabled: isOpen && isEditing && !!product?.id,
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({ resolver: zodResolver(productSchema) })

  // Popula o formulário quando o produto completo estiver disponível (modo edição)
  useEffect(() => {
    if (isOpen && isEditing && fullProduct) {
      reset({
        name: fullProduct.name,
        slug: fullProduct.slug ?? '',
        description: fullProduct.description ?? '',
        shortDescription: fullProduct.shortDescription ?? '',
        price: fullProduct.price,
        compareAtPrice: fullProduct.compareAtPrice ?? undefined,
        sku: fullProduct.sku,
        stock: fullProduct.stock,
        categoryId: fullProduct.categoryId,
        isActive: fullProduct.isActive,
        isFeatured: fullProduct.isFeatured ?? false,
        isDiscreet: fullProduct.isDiscreet ?? false,
        weight: fullProduct.weight ?? undefined,
        tags: fullProduct.tags?.join(', ') ?? '',
        metaTitle: fullProduct.metaTitle ?? '',
        metaDescription: fullProduct.metaDescription ?? '',
      })
      setImages(fullProduct.images ?? [])
    }
  }, [isOpen, isEditing, fullProduct, reset])

  // Inicializa o formulário ao abrir em modo criação
  useEffect(() => {
    if (isOpen && !isEditing) {
      reset({ isActive: true, isFeatured: false, isDiscreet: false, stock: 0, price: 0 })
      setImages([])
    }
  }, [isOpen, isEditing, reset])

  const mutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        images,
        tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        compareAtPrice: data.compareAtPrice || undefined,
        weight: data.weight || undefined,
        slug: data.slug || undefined,
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

  // Em modo edição, aguarda o produto completo carregar antes de renderizar o form
  if (isEditing && !fullProduct) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-background rounded-2xl border shadow-xl p-8 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando produto...</p>
        </div>
      </div>
    )
  }

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
              <Label htmlFor="description">Descrição Curta</Label>
              <Textarea id="description" {...register('shortDescription')} rows={2} placeholder="Resumo exibido na listagem..." />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="fullDescription">Descrição Completa</Label>
              <Textarea id="fullDescription" {...register('description')} rows={4} placeholder="Descrição detalhada do produto..." />
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

          {/* SEO */}
          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="metaTitle">Meta Title (SEO)</Label>
            <Input id="metaTitle" {...register('metaTitle')} placeholder="Título para SEO (padrão: nome do produto)" />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
            <Textarea id="metaDescription" {...register('metaDescription')} rows={2} placeholder="Descrição nos resultados de busca (máx. 160 caracteres)" />
          </div>

          {/* Imagens */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Imagens</label>
            <ImageUploader images={images} onChange={setImages} maxImages={10} />
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
