'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'
import AdminSidebar from '@/components/layout/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, user, _hasHydrated } = useAuthStore()

  useEffect(() => {
    // Só redireciona DEPOIS que o Zustand terminou de ler o localStorage.
    // Sem esse guard, o F5 lê isAuthenticated=false (valor inicial)
    // e redireciona antes de a rehidratação restaurar o token salvo.
    if (!_hasHydrated) return

    if (!isAuthenticated) {
      router.replace('/entrar?redirect=/admin')
      return
    }
    if (user?.role !== 'ADMIN') {
      router.replace('/')
    }
  }, [_hasHydrated, isAuthenticated, user, router])

  // Enquanto o store não rehidratou, mostra spinner (milissegundos).
  // Depois da rehidratação, só mostra spinner se de facto não tiver acesso.
  if (!_hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
