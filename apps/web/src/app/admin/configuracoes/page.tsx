'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { Loader2, Settings, Store, Globe, Share2, Truck, Search } from 'lucide-react'
import type { SiteSettings } from '@/types'

// ── Schema alinhado EXATAMENTE com o backend (settings.service.ts updateSettingsSchema)
// Campos: storeName, storeDescription, storeEmail, storePhone, storeWhatsapp,
//         storeCNPJ, primaryColor, secondaryColor, socialLinks,
//         seoTitle, seoDescription, seoKeywords,
//         maintenanceMode, maintenanceMessage, freeShippingThreshold,
//         footerText, privacyPolicy, termsOfService
// Campos do DB que NÃO estão no updateSettingsSchema (ignorados no PUT):
//   allowGuestCheckout, metaTitle, metaDescription, logoUrl, faviconUrl
const settingsSchema = z.object({
  storeName:             z.string().min(1, 'Nome da loja é obrigatório'),
  storeDescription:      z.string().max(500).optional().nullable(),
  storeEmail:            z.string().email('E-mail inválido').optional().nullable().or(z.literal('')),
  storePhone:            z.string().optional().nullable(),
  storeWhatsapp:         z.string().optional().nullable(),
  storeCNPJ:             z.string().optional().nullable(),
  primaryColor:          z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
  secondaryColor:        z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
  freeShippingThreshold: z.coerce.number().min(0).optional().nullable(),
  maintenanceMode:       z.boolean().optional(),
  maintenanceMessage:    z.string().optional().nullable(),
  seoTitle:              z.string().max(70).optional().nullable(),
  seoDescription:        z.string().max(160).optional().nullable(),
  seoKeywords:           z.string().optional().nullable(),
  footerText:            z.string().optional().nullable(),
  // Redes sociais — enviadas como socialLinks: { instagram, facebook, twitter, youtube }
  instagram:             z.string().optional().nullable(),
  facebook:              z.string().optional().nullable(),
  twitter:               z.string().optional().nullable(),
  youtube:               z.string().optional().nullable(),
})

type SettingsFormData = z.infer<typeof settingsSchema>

// Converte o objeto SiteSettings da API para os valores iniciais do formulário
function toFormValues(s: SiteSettings): SettingsFormData {
  const social = (s.socialLinks ?? {}) as Record<string, string>
  return {
    storeName:             s.storeName             ?? '',
    storeDescription:      s.storeDescription      ?? '',
    storeEmail:            s.storeEmail             ?? '',
    storePhone:            s.storePhone             ?? '',
    storeWhatsapp:         s.storeWhatsapp          ?? '',
    storeCNPJ:             s.storeCNPJ              ?? '',
    primaryColor:          s.primaryColor           ?? '#7c3aed',
    secondaryColor:        s.secondaryColor         ?? '#db2777',
    freeShippingThreshold: s.freeShippingThreshold  ?? null,
    maintenanceMode:       s.maintenanceMode        ?? false,
    maintenanceMessage:    s.maintenanceMessage     ?? '',
    seoTitle:              s.seoTitle               ?? '',
    seoDescription:        s.seoDescription         ?? '',
    seoKeywords:           s.seoKeywords            ?? '',
    footerText:            s.footerText             ?? '',
    instagram:             social.instagram         ?? '',
    facebook:              social.facebook          ?? '',
    twitter:               social.twitter           ?? '',
    youtube:               social.youtube           ?? '',
  }
}

// Converte os valores do formulário para o payload aceito pelo backend
function toPayload(data: SettingsFormData) {
  const { instagram, facebook, twitter, youtube, storeEmail, ...rest } = data
  return {
    ...rest,
    // Email vazio string → null (backend aceita null mas não string vazia para z.string().email())
    storeEmail: storeEmail?.trim() || null,
    socialLinks: {
      ...(instagram?.trim() ? { instagram: instagram.trim() } : {}),
      ...(facebook?.trim()  ? { facebook:  facebook.trim()  } : {}),
      ...(twitter?.trim()   ? { twitter:   twitter.trim()   } : {}),
      ...(youtube?.trim()   ? { youtube:   youtube.trim()   } : {}),
    },
    // Garante que campos opcionais vazios viram null (não string vazia)
    storeDescription:   rest.storeDescription?.trim()   || null,
    storePhone:         rest.storePhone?.trim()         || null,
    storeWhatsapp:      rest.storeWhatsapp?.trim()      || null,
    storeCNPJ:          rest.storeCNPJ?.trim()          || null,
    maintenanceMessage: rest.maintenanceMessage?.trim() || null,
    seoTitle:           rest.seoTitle?.trim()           || null,
    seoDescription:     rest.seoDescription?.trim()     || null,
    seoKeywords:        rest.seoKeywords?.trim()        || null,
    footerText:         rest.footerText?.trim()         || null,
  }
}

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()

  // ── Busca configurações (rota admin — dados completos)
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const res = await api.get('/settings/admin')
      return res.data.data.settings as SiteSettings
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    // Valores padrão para evitar campos "uncontrolled"
    defaultValues: {
      storeName:             '',
      storeDescription:      '',
      storeEmail:            '',
      storePhone:            '',
      storeWhatsapp:         '',
      storeCNPJ:             '',
      primaryColor:          '#7c3aed',
      secondaryColor:        '#db2777',
      freeShippingThreshold: null,
      maintenanceMode:       false,
      maintenanceMessage:    '',
      seoTitle:              '',
      seoDescription:        '',
      seoKeywords:           '',
      footerText:            '',
      instagram:             '',
      facebook:              '',
      twitter:               '',
      youtube:               '',
    },
  })

  // Popula o formulário quando os dados chegam da API — SEM reset() condicional
  // useEffect garante que o formulário é preenchido de uma vez, evitando "pulos"
  useEffect(() => {
    if (settings) {
      reset(toFormValues(settings), { keepDirty: false })
    }
  }, [settings, reset])

  // ── Mutation de salvar
  const mutation = useMutation({
    mutationFn: (data: SettingsFormData) =>
      api.put('/settings/admin', toPayload(data)),
    onSuccess: (res) => {
      const saved = res.data.data.settings as SiteSettings
      // Atualiza ambos os caches (admin e público)
      queryClient.setQueryData(['admin-settings'], saved)
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      // Reseta o formulário com os dados salvos (isDirty volta a false)
      reset(toFormValues(saved), { keepDirty: false })
      toast.success('Configurações salvas com sucesso!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message
      toast.error(msg || 'Erro ao salvar configurações.')
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Configurações da Loja</h1>
        </div>
        {isDirty && (
          <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
            Alterações não salvas
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">

        {/* ── Informações da Loja ─────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Store className="h-4 w-4 text-muted-foreground" />
            Informações da Loja
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome — único campo obrigatório */}
            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="storeName">
                Nome da Loja <span className="text-destructive">*</span>
              </Label>
              <Input id="storeName" {...register('storeName')} placeholder="Minha Sexy Shop" />
              {errors.storeName && (
                <p className="text-xs text-destructive">{errors.storeName.message}</p>
              )}
            </div>

            <div className="sm:col-span-2 space-y-1">
              <Label htmlFor="storeDescription">Descrição da Loja</Label>
              <Textarea
                id="storeDescription"
                {...register('storeDescription')}
                rows={3}
                placeholder="Breve descrição exibida no rodapé e nas redes sociais..."
              />
              {errors.storeDescription && (
                <p className="text-xs text-destructive">{errors.storeDescription.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="storeEmail">E-mail de Contato</Label>
              <Input
                id="storeEmail"
                type="email"
                {...register('storeEmail')}
                placeholder="contato@sualojaexemplo.com.br"
              />
              {errors.storeEmail && (
                <p className="text-xs text-destructive">{errors.storeEmail.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="storePhone">Telefone</Label>
              <Input
                id="storePhone"
                {...register('storePhone')}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="storeWhatsapp">WhatsApp</Label>
              <Input
                id="storeWhatsapp"
                {...register('storeWhatsapp')}
                placeholder="5511999999999 (com DDI)"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="storeCNPJ">CNPJ</Label>
              <Input
                id="storeCNPJ"
                {...register('storeCNPJ')}
                placeholder="00.000.000/0001-00"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="footerText">Texto do Rodapé</Label>
              <Input
                id="footerText"
                {...register('footerText')}
                placeholder="© 2024 Minha Sexy Shop. Todos os direitos reservados."
              />
            </div>
          </div>
        </section>

        {/* ── Cores da Loja ───────────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Cores da Loja
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="primaryColor"
                  {...register('primaryColor')}
                  className="h-10 w-14 rounded cursor-pointer border border-zinc-200 p-0.5"
                />
                <Input
                  value={watch('primaryColor') ?? '#7c3aed'}
                  onChange={(e) => setValue('primaryColor', e.target.value, { shouldDirty: true })}
                  placeholder="#7c3aed"
                  className="flex-1 font-mono text-sm"
                />
              </div>
              {errors.primaryColor && (
                <p className="text-xs text-destructive">{errors.primaryColor.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="secondaryColor"
                  {...register('secondaryColor')}
                  className="h-10 w-14 rounded cursor-pointer border border-zinc-200 p-0.5"
                />
                <Input
                  value={watch('secondaryColor') ?? '#db2777'}
                  onChange={(e) => setValue('secondaryColor', e.target.value, { shouldDirty: true })}
                  placeholder="#db2777"
                  className="flex-1 font-mono text-sm"
                />
              </div>
              {errors.secondaryColor && (
                <p className="text-xs text-destructive">{errors.secondaryColor.message}</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Redes Sociais ───────────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Share2 className="h-4 w-4 text-muted-foreground" />
            Redes Sociais
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                {...register('instagram')}
                placeholder="https://instagram.com/suapagina"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                {...register('facebook')}
                placeholder="https://facebook.com/suapagina"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="twitter">X / Twitter</Label>
              <Input
                id="twitter"
                {...register('twitter')}
                placeholder="https://x.com/suapagina"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                {...register('youtube')}
                placeholder="https://youtube.com/@seucanal"
              />
            </div>
          </div>
        </section>

        {/* ── Frete & Loja ───────────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Truck className="h-4 w-4 text-muted-foreground" />
            Frete &amp; Operação
          </h2>

          <div className="space-y-1">
            <Label htmlFor="freeShippingThreshold">
              Valor Mínimo para Frete Grátis (R$)
            </Label>
            <Input
              id="freeShippingThreshold"
              type="number"
              step="0.01"
              min="0"
              {...register('freeShippingThreshold')}
              placeholder="200.00"
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para desativar o frete grátis.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Modo Manutenção</p>
              <p className="text-xs text-muted-foreground text-destructive">
                ⚠️ Desabilita o acesso público à loja
              </p>
            </div>
            <Switch
              checked={watch('maintenanceMode') ?? false}
              onCheckedChange={(v) => setValue('maintenanceMode', v, { shouldDirty: true })}
            />
          </div>

          {watch('maintenanceMode') && (
            <div className="space-y-1">
              <Label htmlFor="maintenanceMessage">Mensagem de Manutenção</Label>
              <Textarea
                id="maintenanceMessage"
                {...register('maintenanceMessage')}
                rows={2}
                placeholder="Estamos em manutenção. Voltamos em breve!"
              />
            </div>
          )}
        </section>

        {/* ── SEO ─────────────────────────────────────────────────────────── */}
        <section className="bg-background rounded-xl border shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            SEO
          </h2>

          <div className="space-y-1">
            <Label htmlFor="seoTitle">
              Meta Title{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (máx. 70 caracteres)
              </span>
            </Label>
            <Input
              id="seoTitle"
              {...register('seoTitle')}
              placeholder="Minha Sexy Shop — Produtos Adultos com Discrição"
              maxLength={70}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(watch('seoTitle') ?? '').length}/70
            </p>
            {errors.seoTitle && (
              <p className="text-xs text-destructive">{errors.seoTitle.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="seoDescription">
              Meta Description{' '}
              <span className="text-xs text-muted-foreground font-normal">
                (máx. 160 caracteres)
              </span>
            </Label>
            <Textarea
              id="seoDescription"
              {...register('seoDescription')}
              rows={3}
              placeholder="Sua loja de produtos adultos com discrição e qualidade. Entrega discreta para todo o Brasil."
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground text-right">
              {(watch('seoDescription') ?? '').length}/160
            </p>
            {errors.seoDescription && (
              <p className="text-xs text-destructive">{errors.seoDescription.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label htmlFor="seoKeywords">Palavras-chave</Label>
            <Input
              id="seoKeywords"
              {...register('seoKeywords')}
              placeholder="sex shop, vibradores, produtos adultos, entrega discreta"
            />
            <p className="text-xs text-muted-foreground">Separadas por vírgula.</p>
          </div>
        </section>

        {/* ── Botão Salvar ─────────────────────────────────────────────────── */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={!isDirty || mutation.isPending}
            onClick={() => settings && reset(toFormValues(settings), { keepDirty: false })}
          >
            Descartar Alterações
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Configurações
          </Button>
        </div>
      </form>
    </div>
  )
}
