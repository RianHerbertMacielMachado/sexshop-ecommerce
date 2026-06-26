import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Minha Sexy Shop'

export const metadata: Metadata = {
  title: {
    default: storeName,
    template: `%s | ${storeName}`,
  },
  description: 'Sua loja de produtos adultos com discrição e qualidade. Entrega discreta garantida.',
  keywords: ['sex shop', 'produtos adultos', 'vibradores', 'lingerie', 'acessórios eróticos'],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: storeName,
  },
  other: {
    'theme-color': '#7c3aed',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
