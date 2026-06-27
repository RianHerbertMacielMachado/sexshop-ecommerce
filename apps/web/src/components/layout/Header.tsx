'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart,
  Heart,
  User,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
} from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useSettings } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'
import CartDrawer from '@/components/layout/CartDrawer'
import MobileMenu from './MobileMenu'

export default function Header() {
  const router = useRouter()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const { toggleCart, getItemCount } = useCartStore()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { data: settings } = useSettings()

  const itemCount = getItemCount()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/produtos?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  const navLinks = [
    { href: '/produtos', label: 'Produtos' },
    { href: '/categorias', label: 'Categorias' },
    { href: '/produtos?featured=true', label: 'Destaques' },
    { href: '/produtos?sort=newest', label: 'Novidades' },
  ]

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md'
            : 'bg-white shadow-sm'
        )}
      >
        {/* Top bar */}
        <div className="gradient-primary text-white text-center py-1.5 text-xs font-medium">
          🔒 Compra 100% Discreta | Embalagem Neutra | Frete Grátis acima de R$ 200
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              {settings?.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={settings.storeName}
                  width={120}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-gradient">
                  {settings?.storeName ?? process.env.NEXT_PUBLIC_STORE_NAME ?? '✨ SexyShop'}
                </span>
              )}
            </Link>

            {/* Nav Desktop */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-zinc-600 hover:text-violet-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-violet-600"
                aria-label="Buscar"
              >
                <Search size={20} />
              </button>

              {/* Wishlist */}
              <Link
                href="/minha-conta/lista-de-desejos"
                className="p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-violet-600 hidden sm:flex"
                aria-label="Lista de desejos"
              >
                <Heart size={20} />
              </Link>

              {/* Cart */}
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-violet-600"
                aria-label="Carrinho"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-primary text-white text-xs font-bold flex items-center justify-center"
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </motion.span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative hidden sm:block">
                {isAuthenticated ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-1.5 p-2 rounded-full hover:bg-zinc-100 transition-colors text-zinc-600 hover:text-violet-600"
                  >
                    <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <ChevronDown size={14} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <User size={16} />
                    <span>Entrar</span>
                  </Link>
                )}

                <AnimatePresence>
                  {userMenuOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{user?.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/minha-conta" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <User size={16} /> Minha Conta
                        </Link>
                        <Link href="/minha-conta/pedidos" className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 hover:bg-violet-50 hover:text-violet-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <Package size={16} /> Meus Pedidos
                        </Link>
                        {user?.role === 'ADMIN' && (
                          <>
                            <div className="my-1 border-t border-zinc-100" />
                            <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-violet-700 hover:bg-violet-50 transition-colors font-medium" onClick={() => setUserMenuOpen(false)}>
                              <LayoutDashboard size={16} /> Painel Admin
                            </Link>
                          </>
                        )}
                        <div className="my-1 border-t border-zinc-100" />
                        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut size={16} /> Sair
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-full hover:bg-zinc-100 transition-colors"
                aria-label="Menu"
              >
                <Menu size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center pt-20 px-4"
              onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
            >
              <motion.form
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                onSubmit={handleSearch}
                className="w-full max-w-2xl"
              >
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={22} />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar produtos..."
                    className="w-full pl-12 pr-16 py-5 text-lg outline-none text-zinc-900 placeholder:text-zinc-400"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full"
                  >
                    <X size={20} className="text-zinc-400" />
                  </button>
                </div>
                <p className="text-white/60 text-sm text-center mt-3">
                  Pressione Enter para buscar ou Esc para fechar
                </p>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer */}
      <div className="h-[calc(40px+64px)]" />

      <CartDrawer />
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navLinks={navLinks}
      />
    </>
  )
}
