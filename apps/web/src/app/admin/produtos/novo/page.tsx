'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import {
  ArrowLeft,
  Loader2,
  Plus,
  X,
  ImageIcon,
  Package,
  Tag,
  BarChart2,
  Settings2,
} from 'lucide-react'
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
import type { Category } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório (mín. 2 caracteres)'),
  slug: z.string().optional(),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.coerce.number().positive('Preço deve ser maior que zero'),
  compareAtPrice: z.coerce.number().optional(),
  sku: z.string().min(1, 'SKU obrigatório'),
  stock: z.coerce.number().int().min(0, 'Estoque não pode ser negativo'),
  weight: z.coerce.number().optional(),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isDiscreet: z.boolean().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

// ── Component ──────────────────────────────────────────────────────────────────
export default function AdminNewProductPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Image URLs state (managed separately — not part of react-hook-form)
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [showSeo, setShowSeo] = useState(false)

  // Fetch categories for the select
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: async () => {
      const res = await api.get('/categories')
      return res.data.data.categories as Category[]
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      isFeatured: false,
      isDiscreet: false,
      stock: 0,
      price: 0,
    },
  })

  // ── Mutations ──────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => {
      const payload = {
        ...data,
        images,
        tags: data.tags
          ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        compareAtPrice: data.compareAtPrice || undefined,
        weight: data.weight || undefined,
        slug: data.slug || undefined,
      }
      return api.post('/products', payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      toast.success('Produto criado com sucesso!')
      router.push('/admin/produtos')
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Erro ao criar produto.')
    },
  })

  // ── Image helpers ──────────────────────────────────────────────────────────
  const addImage = () => {
    const url = imageInput.trim()
    if (!url) return
    if (images.includes(url)) {
      toast.error('URL já adicionada.')
      return
    }
    setImages((prev) => [...prev, url])
    setImageInput('')
  }

  const removeImage = (url: string) => {
    setImages((prev) => prev.filter((u) => u !== url))
  }

  const handleImageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addImage()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/produtos')}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Produto</h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados abaixo para cadastrar um novo produto.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
        className="space-y-6"
      >
        {/* ── Informações Gerais ─────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            Informações Gerais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="name">
                Nome <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register('name')} placeholder="Ex: Vibrador Premium Ponto G" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Slug */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="slug">
                Slug{' '}
                <span className="text-xs text-muted-foreground font-normal">
                  (gerado automaticamente se vazio)
                </span>
              </Label>
              <Input
                id="slug"
                {...register('slug')}
                placeholder="vibrador-premium-ponto-g"
              />
            </div>

            {/* Descrição curta */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="shortDescription">Descrição Curta</Label>
              <Textarea
                id="shortDescription"
                {...register('shortDescription')}
                rows={2}
                placeholder="Resumo exibido na listagem de produtos..."
              />
            </div>

            {/* Descrição completa */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="description">Descrição Completa</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={5}
                placeholder="Descrição detalhada do produto, características, materiais, modo de uso..."
              />
            </div>
          </div>
        </section>

        {/* ── Preço & Estoque ────────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
            Preço &amp; Estoque
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preço */}
            <div className="space-y-1">
              <Label htmlFor="price">
                Preço (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price')}
                placeholder="0,00"
              />
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Preço comparativo */}
            <div className="space-y-1">
              <Label htmlFor="compareAtPrice">
                Preço Comparativo (R$){' '}
                <span className="text-xs text-muted-foreground font-normal">
                  (opcional — aparece riscado)
                </span>
              </Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                min="0"
                {...register('compareAtPrice')}
                placeholder="0,00"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1">
              <Label htmlFor="sku">
                SKU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sku"
                {...register('sku')}
                placeholder="Ex: VIB-001"
              />
              {errors.sku && (
                <p className="text-xs text-destructive">{errors.sku.message}</p>
              )}
            </div>

            {/* Estoque */}
            <div className="space-y-1">
              <Label htmlFor="stock">
                Estoque <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                min="0"
                step="1"
                {...register('stock')}
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-xs text-destructive">{errors.stock.message}</p>
              )}
            </div>

            {/* Peso */}
            <div className="space-y-1">
              <Label htmlFor="weight">
                Peso (kg){' '}
                <span className="text-xs text-muted-foreground font-normal">
                  (usado no cálculo de frete)
                </span>
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.001"
                min="0"
                {...register('weight')}
                placeholder="0.500"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-1">
              <Label>
                Categoria <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch('categoryId') || ''}
                onValueChange={(v) => setValue('categoryId', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar categoria..." />
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
          </div>
        </section>

        {/* ── Imagens ────────────────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
            Imagens
          </h2>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyDown={handleImageKeyDown}
                placeholder="Cole a URL da imagem e pressione Enter ou clique em Adicionar"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addImage} className="shrink-0">
                <Plus className="h-4 w-4 mr-1" />
                Adicionar
              </Button>
            </div>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((url, idx) => (
                  <div
                    key={url}
                    className="relative group aspect-square rounded-lg overflow-hidden border bg-muted"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Imagem ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = '/placeholder.svg'
                      }}
                    />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded font-medium">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(url)}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhuma imagem adicionada.</p>
                <p className="text-xs mt-1">A primeira imagem será usada como capa do produto.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Tags & Configurações ───────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            Tags &amp; Configurações
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tags */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                {...register('tags')}
                placeholder="vibradores, discreto, ponto-g (separadas por vírgula)"
              />
              <p className="text-xs text-muted-foreground">
                Separe as tags por vírgula. Usadas para busca e filtragem.
              </p>
            </div>

            {/* Switches */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Ativo</p>
                <p className="text-xs text-muted-foreground">Visível na loja</p>
              </div>
              <Switch
                checked={watch('isActive') ?? true}
                onCheckedChange={(v) => setValue('isActive', v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Destaque</p>
                <p className="text-xs text-muted-foreground">Exibir na seção de destaques</p>
              </div>
              <Switch
                checked={watch('isFeatured') ?? false}
                onCheckedChange={(v) => setValue('isFeatured', v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">Embalagem Discreta</p>
                <p className="text-xs text-muted-foreground">Enviado sem identificação do conteúdo</p>
              </div>
              <Switch
                checked={watch('isDiscreet') ?? false}
                onCheckedChange={(v) => setValue('isDiscreet', v)}
              />
            </div>
          </div>
        </section>

        {/* ── SEO (colapsável) ───────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm">
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            className="w-full flex items-center justify-between p-6 text-left"
          >
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              SEO (opcional)
            </h2>
            <span className="text-xs text-muted-foreground">
              {showSeo ? 'Ocultar' : 'Expandir'}
            </span>
          </button>

          {showSeo && (
            <div className="px-6 pb-6 space-y-4 border-t pt-4">
              <div className="space-y-1">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...register('metaTitle')}
                  placeholder="Título para SEO (padrão: nome do produto)"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...register('metaDescription')}
                  rows={3}
                  placeholder="Descrição exibida nos resultados de busca (máx. 160 caracteres)"
                />
              </div>
            </div>
          )}
        </section>

        {/* ── Ações ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            className="sm:flex-1"
            onClick={() => router.push('/admin/produtos')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="sm:flex-1"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando produto...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Criar Produto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
