'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.length >= 8,
      'Senha deve ter pelo menos 8 caracteres'
    ),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfileDataPage() {
  const { user, setUser } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data: ProfileFormData) => api.put('/auth/me', data),
    onSuccess: (res) => {
      setUser(res.data.data)
      toast.success('Dados atualizados com sucesso!')
    },
    onError: () => toast.error('Erro ao atualizar dados.'),
  })

  return (
    <div className="bg-background rounded-xl border shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-6">Meus Dados</h2>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 max-w-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" {...register('phone')} placeholder="(11) 99999-9999" />
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-sm font-medium mb-3">Alterar Senha</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input id="currentPassword" type="password" {...register('currentPassword')} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input id="newPassword" type="password" {...register('newPassword')} />
              {errors.newPassword && (
                <p className="text-xs text-destructive">{errors.newPassword.message}</p>
              )}
            </div>
          </div>
        </div>

        <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
          {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </form>
    </div>
  )
}
