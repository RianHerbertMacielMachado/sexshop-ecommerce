import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Shield, Heart, Package, Truck, Star, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre Nós',
  description: 'Conheça a nossa história, missão e valores. Somos uma loja especializada em produtos adultos com total discrição, segurança e qualidade.',
}

const values = [
  {
    icon: Shield,
    title: 'Privacidade Total',
    description: 'Todos os pedidos são enviados em embalagens neutras, sem qualquer identificação do conteúdo. Sua discrição é nossa prioridade.',
  },
  {
    icon: Heart,
    title: 'Qualidade Garantida',
    description: 'Trabalhamos apenas com produtos de marcas reconhecidas, com materiais seguros e certificados para o seu bem-estar.',
  },
  {
    icon: Package,
    title: 'Entrega Discreta',
    description: 'Embalagem neutra em todas as entregas. A nota fiscal não descreve o conteúdo do produto — apenas "produto de uso pessoal".',
  },
  {
    icon: Truck,
    title: 'Frete Grátis',
    description: 'Oferecemos frete grátis para compras acima de R$ 200 para as regiões Sul e Sudeste do Brasil.',
  },
  {
    icon: Star,
    title: 'Atendimento Especializado',
    description: 'Nossa equipe está preparada para te ajudar com total respeito e sem julgamentos. Fale conosco pelo chat ou e-mail.',
  },
  {
    icon: Users,
    title: 'Comunidade',
    description: 'Acreditamos na educação sexual e no prazer saudável. Por isso, oferecemos conteúdo informativo junto com nossos produtos.',
  },
]

const stats = [
  { value: '10.000+', label: 'Clientes satisfeitos' },
  { value: '500+', label: 'Produtos disponíveis' },
  { value: '4.8★', label: 'Avaliação média' },
  { value: '99%', label: 'Entregas no prazo' },
]

export default function SobrePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white py-20">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Sobre a Minha Sexy Shop
            </h1>
            <p className="text-lg md:text-xl text-violet-200 leading-relaxed max-w-2xl mx-auto">
              Somos uma loja especializada em produtos para o prazer adulto, com foco em discrição, qualidade e respeito pela intimidade de cada cliente.
            </p>
          </div>
        </section>

        {/* História */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-6">Nossa História</h2>
                <p className="text-zinc-600 leading-relaxed mb-4">
                  Nascemos da vontade de criar um espaço seguro, discreto e acolhedor para que adultos possam explorar sua sexualidade com liberdade e sem julgamentos.
                </p>
                <p className="text-zinc-600 leading-relaxed mb-4">
                  Entendemos que a sexualidade é uma parte importante da saúde e do bem-estar humano. Por isso, oferecemos uma curadoria cuidadosa de produtos, sempre priorizando segurança, qualidade e prazer.
                </p>
                <p className="text-zinc-600 leading-relaxed">
                  Com entrega discreta e atendimento respeitoso, queremos que cada experiência de compra seja tão prazerosa quanto o produto que você vai receber.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="bg-violet-50 rounded-2xl p-6 text-center border border-violet-100"
                  >
                    <p className="text-3xl font-bold text-violet-700 mb-1">{stat.value}</p>
                    <p className="text-sm text-zinc-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-16 bg-zinc-50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-zinc-900 text-center mb-4">
              Nossos Valores
            </h2>
            <p className="text-zinc-500 text-center mb-12 max-w-xl mx-auto">
              Tudo o que fazemos é orientado por esses princípios fundamentais.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {values.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white rounded-2xl p-6 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-violet-600" />
                  </div>
                  <h3 className="font-semibold text-zinc-900 mb-2">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Missão */}
        <section className="py-16 bg-violet-700 text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-3xl font-bold mb-6">Nossa Missão</h2>
            <p className="text-lg text-violet-100 leading-relaxed">
              Proporcionar prazer, bem-estar e autoconhecimento por meio de produtos de qualidade, em um ambiente seguro, discreto e livre de preconceitos. Acreditamos que a sexualidade saudável contribui para uma vida mais plena e feliz.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
