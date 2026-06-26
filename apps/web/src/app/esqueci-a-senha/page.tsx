'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import api from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: { email: string }) => {
    setIsLoading(true)
    try {
      await api.post('/auth/forgot-password', data)
      setSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-2xl border shadow-sm p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-xl font-bold">E-mail enviado!</h2>
              <p className="text-muted-foreground text-sm">
                Verifique sua caixa de entrada e siga as instruções para
                redefinir a senha.
              </p>
              <Link href="/entrar">
                <Button variant="outline" className="w-full">
                  Voltar ao login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Esqueci a Senha</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Informe seu e-mail para receber o link de redefinição
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message as string}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Enviar Link
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Lembrou a senha?{' '}
                <Link href="/entrar" className="text-primary hover:underline">
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
