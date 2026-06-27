'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { X, Loader2, Upload } from 'lucide-react'
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
import type { Banner } from '@/types'

const BANNER_POSITIONS = [
  'HOME_HERO',
  'HOME_MIDDLE',
  'HOME_BOTTOM',
  'CATEGORY_TOP',
  'SIDEBAR',
] as const

type BannerPositionType = (typeof BANNER_POSITIONS)[number]

const bannerSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  linkUrl: z.string().optional(),
  linkText: z.string().optional(),
  position: z.enum(BANNER_POSITIONS),
  isActive: z.boolean().optional(),
  order: z.coerce.number().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
})

type BannerFormData = z.infer<typeof bannerSchema>

const POSITION_LABELS: Record<BannerPositionType, string> = {
  HOME_HERO: 'Hero Principal',
  HOME_MIDDLE: 'Meio da Home',
  HOME_BOTTOM: 'Rodapé da Home',
  CATEGORY_TOP: 'Topo de Categoria',
  SIDEBAR: 'Sidebar',
}

interface Props {
  isOpen: boolean
  onClose: () => void
  banner?: Banner | null
}

export default function BannerFormModal({ isOpen, onClose, banner }: Props) {
  const queryClient = useQueryClient()
  const isEditing = !!banner
  const fileRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        title: banner?.title ?? '',
        subtitle: banner?.subtitle ?? '',
        linkUrl: banner?.linkUrl ?? '',
        linkText: banner?.linkText ?? '',
        position: (banner?.position as BannerPositionType) ?? 'HOME_HERO',
        isActive: banner?.isActive ?? true,
        order: banner?.order ?? 0,
        startsAt: banner?.startsAt
          ? new Date(banner.startsAt).toISOString().slice(0, 16)
          : '',
        endsAt: banner?.endsAt
          ? new Date(banner.endsAt).toISOString().slice(0, 16)
          : '',
      })
    }
  }, [isOpen, banner, reset])

  const mutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      const formData = new FormData()
      Object.entries(data).forEach(([k, v]) => {
        if (v !== undefined && v !== '') formData.append(k, String(v))
      })
      if (fileRef.current?.files?.[0]) {
        formData.append('image', fileRef.current.files[0])
      }
      return isEditing
        ? api.put(`/banners/admin/${banner!.id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        : api.post('/banners/admin', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
      toast.success(isEditing ? 'Banner atualizado!' : 'Banner criado!')
      onClose()
    },
    onError: () => toast.error('Erro ao salvar banner.'),
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
      <div className="bg-background rounded-2xl border shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {isEditing ? 'Editar Banner' : 'Novo Banner'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit((data) => mutation.mutate(data))}
          className="p-6 space-y-4"
        >
          {/* Image upload */}
          <div className="space-y-1">
            <Label>Imagem do Banner</Label>
            <div
              className="border-2 border-dashed border-muted rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique para enviar imagem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP (recomendado: 1920×600)
              </p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="title">Título</Label>
              <Input id="title" {...register('title')} />
            </div>

            <div className="col-span-2 space-y-1">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Input id="subtitle" {...register('subtitle')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="linkUrl">URL do Link</Label>
              <Input
                id="linkUrl"
                {...register('linkUrl')}
                placeholder="/produtos/categoria"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="linkText">Texto do Botão</Label>
              <Input
                id="linkText"
                {...register('linkText')}
                placeholder="Ver Produtos"
              />
            </div>
          </div>

          {/* Position */}
          <div className="space-y-1">
            <Label>Posição *</Label>
            <Select
              value={watch('position') || 'HOME_HERO'}
              onValueChange={(v) =>
                setValue('position', v as BannerPositionType)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BANNER_POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {POSITION_LABELS[pos]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-xs text-destructive">
                {errors.position.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="startsAt">Início</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                {...register('startsAt')}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="endsAt">Fim</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                {...register('endsAt')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="order">Ordem</Label>
              <Input id="order" type="number" {...register('order')} />
            </div>
            <div className="flex items-center justify-between pt-6">
              <Label>Ativo</Label>
              <Switch
                checked={watch('isActive') ?? true}
                onCheckedChange={(v) => setValue('isActive', v)}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
