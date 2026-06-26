'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  CreditCard,
  Tag,
  Image as ImageIcon,
  Star,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  List,
  FolderOpen,
  Bell,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useSettings } from '@/hooks/useSettings'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface NavItem {
  label: string
  href?: string
  icon: React.ElementType
  badge?: number
  children?: Array<{ label: string; href: string; icon: React.ElementType }>
}

function usePendingOrdersCount() {
  return useQuery({
    queryKey: ['admin', 'pending-orders-count'],
    queryFn: async () => {
      const { data } = await api.get('/admin/orders?status=PENDING&limit=1')
      return (data.data?.total as number) ?? 0
    },
    refetchInterval: 60 * 1000,
  })
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { data: settings } = useSettings()
  const { data: pendingCount = 0 } = usePendingOrdersCount()
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Produtos',
      icon: Package,
      children: [
        { label: 'Todos os Produtos', href: '/admin/produtos', icon: List },
        { label: 'Novo Produto', href: '/admin/produtos/novo', icon: Plus },
        { label: 'Categorias', href: '/admin/categorias', icon: FolderOpen },
      ],
    },
    {
      label: 'Pedidos',
      href: '/admin/pedidos',
      icon: ShoppingBag,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { label: 'Clientes', href: '/admin/clientes', icon: Users },
    { label: 'Pagamentos', href: '/admin/pagamentos', icon: CreditCard },
    { label: 'Cupons', href: '/admin/cupons', icon: Tag },
    { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    { label: 'Avaliações', href: '/admin/avaliacoes', icon: Star },
    { label: 'Frete', href: '/admin/frete', icon: Truck },
    { label: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
    { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ]

  useEffect(() => {
    const currentSubmenu = navItems.find(
      (item) => item.children?.some((child) => pathname === child.href)
    )
    if (currentSubmenu) setOpenSubmenu(currentSubmenu.label)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const isActive = (href?: string) => href && pathname === href
  const isParentActive = (item: NavItem) =>
    item.children?.some((child) => pathname.startsWith(child.href))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800">
        <Link href="/admin" className="flex items-center gap-2">
          {settings?.logoUrl ? (
            <Image
              src={settings.logoUrl}
              alt={settings.storeName}
              width={100}
              height={32}
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          ) : (
            <span className="font-bold text-white text-base">
              {settings?.storeName ?? 'Admin Panel'}
            </span>
          )}
        </Link>
        <p className="text-xs text-zinc-500 mt-1 pl-0.5">Painel Administrativo</p>
      </div>

      {/* User */}
      <div className="px-3 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-hide">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                onClick={() => setMobileSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all group',
                  isActive(item.href)
                    ? 'gradient-primary text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                )}
              >
                <item.icon size={17} className="shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold min-w-[20px] text-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </Link>
            ) : (
              <div>
                <button
                  onClick={() =>
                    setOpenSubmenu(openSubmenu === item.label ? null : item.label)
                  }
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isParentActive(item)
                      ? 'text-white bg-zinc-800'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  )}
                >
                  <item.icon size={17} className="shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'transition-transform',
                      openSubmenu === item.label ? 'rotate-180' : ''
                    )}
                  />
                </button>
                <AnimatePresence>
                  {openSubmenu === item.label && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l border-zinc-800 pl-3">
                        {item.children?.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileSidebarOpen(false)}
                            className={cn(
                              'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-all',
                              pathname === child.href
                                ? 'text-violet-400 font-medium'
                                : 'text-zinc-500 hover:text-white'
                            )}
                          >
                            <child.icon size={14} />
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Actions */}
      <div className="p-3 border-t border-zinc-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <ChevronRight size={14} />
          Ver loja
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-zinc-950 border-r border-zinc-800 fixed top-0 left-0 h-screen z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-lg text-white shadow-lg"
      >
        <Menu size={20} />
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-50"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 bg-zinc-950 border-r border-zinc-800 z-50 shadow-2xl"
            >
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="absolute top-4 right-4 p-1 hover:bg-zinc-800 rounded-lg text-zinc-400"
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
