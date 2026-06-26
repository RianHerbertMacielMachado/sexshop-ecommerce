'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, ChevronRight } from 'lucide-react'
import type { User as UserType } from '@/types'

const schema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  user: UserType | null
  isAuthenticated: boolean
  defaultValues: Record<string, unknown>
  onComplete: (data: FormData) => void
}

export default function CheckoutIdentification({ user, isAuthenticated, defaultValues, onComplete }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? (defaultValues.name as string) ?? '',
      email: user?.email ?? (defaultValues.email as string) ?? '',
      phone: user?.phone ?? '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onComplete)} className="bg-white rounded-2xl border border-zinc-100 p-6">
      <h2 className="font-bold text-zinc-900 mb-6 flex items-center gap-2">
        <User size={18} className="text-violet-600" /> Identificação
      </h2>

      {isAuthenticated && user ? (
        <div className="p-4 bg-violet-50 rounded-xl mb-6">
          <p className="font-semibold text-violet-900">{user.name}</p>
          <p className="text-sm text-violet-700">{user.email}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Nome completo *</label>
            <input {...register('name')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="Seu nome completo" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">E-mail *</label>
            <input {...register('email')} type="email" className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="seu@email.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Telefone</label>
            <input {...register('phone')} className="w-full px-4 py-3 border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-violet-500 text-sm" placeholder="(11) 99999-9999" />
          </div>
        </div>
      )}

      <button type="submit" className="flex items-center justify-center gap-2 w-full mt-6 py-3.5 gradient-primary text-white rounded-xl font-semibold">
        Continuar <ChevronRight size={18} />
      </button>
    </form>
  )
}
