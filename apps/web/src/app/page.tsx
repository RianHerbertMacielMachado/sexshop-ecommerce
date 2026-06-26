import { Suspense } from 'react'
import { Metadata } from 'next'
import HeroBanner from '@/components/home/HeroBanner'
import CategoriesGrid from '@/components/home/CategoriesGrid'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import MiddleBanner from '@/components/home/MiddleBanner'
import NewArrivals from '@/components/home/NewArrivals'
import PromoSection from '@/components/home/PromoSection'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import BottomBanner from '@/components/home/BottomBanner'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import LoadingSpinner from '@/components/common/LoadingSpinner'

export const metadata: Metadata = {
  title: 'Início',
  description: 'Sua loja de produtos adultos com discrição e qualidade. Os melhores vibradores, acessórios e fantasias com entrega discreta.',
}

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Suspense fallback={<div className="h-96 bg-zinc-100 animate-pulse" />}>
          <HeroBanner />
        </Suspense>
        <Suspense fallback={<div className="h-48 bg-white" />}>
          <CategoriesGrid />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-zinc-50 animate-pulse" />}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={null}>
          <MiddleBanner />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
          <NewArrivals />
        </Suspense>
        <PromoSection />
        <Suspense fallback={null}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={null}>
          <BottomBanner />
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
