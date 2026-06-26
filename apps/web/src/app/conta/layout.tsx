'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/authStore'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import {
  Package,
  MapPin,
  User,
  Heart,
  LogOut,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const accountNavItems = [
  { href: '/conta/pedidos', label: 'Meus Pedidos', icon: Package },
  { href: '/conta/enderecos', label: 'Endereços', icon: MapPin },
  { href: '/conta/dados', label: 'Meus Dados', icon: User },
  { href: '/conta/lista-desejos', label: 'Lista de Desejos', icon: Heart },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/entrar?redirect=${pathname}`)
    }
  }, [isAuthenticated, router, pathname])

  if (!isAuthenticated) return null

  const handleLogout = async () => {
    await logout()
    router.replace('/')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-background rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-primary/5">
                  <p className="font-semibold text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
                <nav className="p-2">
                  {accountNavItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                          isActive
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1">{item.label}</span>
                        {!isActive && (
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Link>
                    )
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors mt-1"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair da Conta
                  </button>
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
