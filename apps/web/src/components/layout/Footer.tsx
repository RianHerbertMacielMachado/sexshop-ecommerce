'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Lock,
  Package,
  RefreshCw,
  Shield,
} from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

export default function Footer() {
  const { data: settings } = useSettings()

  const social = settings?.socialLinks ?? {}

  const productLinks = [
    { href: '/produtos', label: 'Todos os Produtos' },
    { href: '/produtos?featured=true', label: 'Destaques' },
    { href: '/produtos?sort=newest', label: 'Novidades' },
    { href: '/categorias', label: 'Categorias' },
    { href: '/rastrear-pedido', label: 'Rastrear Pedido' },
  ]

  const infoLinks = [
    { href: '/sobre', label: 'Sobre Nós' },
    { href: '/contato', label: 'Contato' },
    { href: '/politica-de-privacidade', label: 'Política de Privacidade' },
    { href: '/termos-de-uso', label: 'Termos de Uso' },
  ]

  const features = [
    { icon: Lock, label: 'Compra Segura', desc: 'SSL 256-bit' },
    { icon: Package, label: 'Entrega Discreta', desc: 'Embalagem neutra' },
    { icon: RefreshCw, label: 'Troca Fácil', desc: '30 dias' },
    { icon: Shield, label: 'Privacidade Total', desc: 'Dados protegidos' },
  ]

  return (
    <footer className="bg-zinc-950 text-zinc-300">
      {/* Features bar */}
      <div className="border-b border-zinc-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{label}</p>
                  <p className="text-xs text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={settings.storeName}
                width={120}
                height={40}
                className="h-8 w-auto mb-4 brightness-0 invert"
              />
            ) : (
              <p className="text-xl font-bold text-white mb-4">
                {settings?.storeName ?? '✨ SexyShop'}
              </p>
            )}
            <p className="text-sm text-zinc-400 leading-relaxed mb-4">
              {settings?.storeDescription ?? 'Sua loja de produtos adultos com discrição e qualidade.'}
            </p>
            {settings?.storeEmail && (
              <a href={`mailto:${settings.storeEmail}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-400 transition-colors mb-1">
                <Mail size={14} />
                {settings.storeEmail}
              </a>
            )}
            {settings?.storePhone && (
              <a href={`tel:${settings.storePhone}`} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-violet-400 transition-colors">
                <Phone size={14} />
                {settings.storePhone}
              </a>
            )}
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Produtos
            </h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informações
            </h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-violet-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social + Payment */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Redes Sociais
            </h3>
            <div className="flex gap-3 mb-6">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-violet-600 transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-violet-600 transition-colors">
                  <Facebook size={16} />
                </a>
              )}
              {social.twitter && (
                <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-violet-600 transition-colors">
                  <Twitter size={16} />
                </a>
              )}
              {social.youtube && (
                <a href={social.youtube} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-violet-600 transition-colors">
                  <Youtube size={16} />
                </a>
              )}
            </div>

            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
              Pagamentos
            </h3>
            <div className="flex flex-wrap gap-2">
              {['Visa', 'Master', 'PIX', 'Elo'].map((brand) => (
                <span key={brand} className="px-2.5 py-1 bg-zinc-800 rounded text-xs font-medium text-zinc-300">
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-zinc-500 text-center sm:text-left">
            {settings?.footerText ??
              `© ${new Date().getFullYear()} ${settings?.storeName ?? 'Minha Sexy Shop'}. Todos os direitos reservados.`}
          </p>
          <p className="text-xs text-zinc-600">
            🔞 Conteúdo adulto — Maiores de 18 anos
          </p>
        </div>
      </div>
    </footer>
  )
}
