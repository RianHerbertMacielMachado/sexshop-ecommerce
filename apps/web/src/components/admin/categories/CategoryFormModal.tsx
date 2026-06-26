'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Category } from '@/types'

const categorySchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  description: z.string().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  order: z.coerce.number().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface Props {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  categories: (Category & { children?: Category[] })[]
}

function flattenCategories(
  cats: (Category & { children?: Category[] })[],
  level = 0
): { id: string; name: string; level: number }[] {
  return cats.flatMap((c) => [
    { id: c.id, name: c.name, level },
    ...flattenCategories(c.children ?? [], level + 1),
  ])
}

export default function CategoryFormModal({ isOpen, onClose, category, categories }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!category
  const flatCats = flattenCategories(categories).filter((c) => c.id !== category?.id)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        parentId: category?.parentId ?? undefined,
        isActive: category?.isActive ?? true,
        order: category?.order ?? 0,
      })
    }
  }, [isOpen, category, reset])

  const mutation = useMutation({
    mutationFn: (data: CategoryFormData) =>
      isEditing
        ? api.put(`/categories/${category!.id}`, data)
        : api.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
      toast.success(isEditing ? 'Categoria atualizada!' : 'Categoria criada!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar categoria.'),
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" {...register('description')} />
          </div>

          <div className="space-y-1">
            <Label>Categoria Pai</Label>
            <Select
              value={watch('parentId') || 'none'}
              onValueChange={(v) => setValue('parentId', v === 'none' ? undefined : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhuma (raiz)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhuma (categoria raiz)</SelectItem>
                {flatCats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {'  '.repeat(c.level)}{c.level > 0 ? '└ ' : ''}{c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="order">Ordem de exibição</Label>
            <Input id="order" type="number" {...register('order')} />
          </div>

          <div className="flex items-center justify-between">
            <Label>Ativa</Label>
            <Switch
              checked={watch('isActive') ?? true}
              onCheckedChange={(v) => setValue('isActive', v)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
