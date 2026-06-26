'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Package, Heart, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'next/navigation'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navLinks: Array<{ href: string; label: string }>
}

export default function MobileMenu({ isOpen, onClose, navLinks }: MobileMenuProps) {
  const { user, isAuthenticated, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    onClose()
    router.push('/')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-white z-50 shadow-2xl flex flex-col lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100">
              <span className="text-lg font-bold text-gradient">Menu</span>
              <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* User info */}
            {isAuthenticated && user ? (
              <div className="p-4 bg-gradient-to-r from-violet-50 to-pink-50 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-zinc-900 text-sm">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-zinc-100">
                <Link
                  href="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl gradient-primary text-white font-medium text-sm"
                >
                  <User size={16} /> Entrar na Conta
                </Link>
                <Link
                  href="/cadastro"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-zinc-200 text-zinc-700 font-medium text-sm mt-2"
                >
                  Criar Conta
                </Link>
              </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
                Loja
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors text-zinc-700 font-medium text-sm"
                >
                  {link.label}
                  <ChevronRight size={16} className="text-zinc-400" />
                </Link>
              ))}

              {isAuthenticated && (
                <>
                  <div className="my-3 border-t border-zinc-100" />
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-2 mb-2">
                    Minha Conta
                  </p>
                  <Link href="/minha-conta" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors text-zinc-700 text-sm">
                    <User size={16} /> Dados Pessoais
                  </Link>
                  <Link href="/minha-conta/pedidos" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors text-zinc-700 text-sm">
                    <Package size={16} /> Meus Pedidos
                  </Link>
                  <Link href="/minha-conta/lista-de-desejos" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-violet-50 hover:text-violet-700 transition-colors text-zinc-700 text-sm">
                    <Heart size={16} /> Lista de Desejos
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link href="/admin" onClick={onClose} className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-violet-50 text-violet-700 font-medium text-sm">
                      <LayoutDashboard size={16} /> Painel Admin
                    </Link>
                  )}
                </>
              )}
            </nav>

            {/* Footer */}
            {isAuthenticated && (
              <div className="p-4 border-t border-zinc-100">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} /> Sair da Conta
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
