'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Mail, Phone, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const contactInfo = [
  {
    icon: Mail,
    title: 'E-mail',
    value: 'contato@minhasexyshop.com.br',
    description: 'Respondemos em até 24 horas úteis',
    href: 'mailto:contato@minhasexyshop.com.br',
  },
  {
    icon: Phone,
    title: 'WhatsApp',
    value: '(11) 99999-9999',
    description: 'Atendimento de segunda a sexta',
    href: 'https://wa.me/5511999999999',
  },
  {
    icon: Clock,
    title: 'Horário de Atendimento',
    value: 'Seg – Sex: 9h às 18h',
    description: 'Fuso horário de Brasília',
    href: null,
  },
]

const faqs = [
  {
    q: 'A embalagem realmente é discreta?',
    a: 'Sim. Todos os pedidos são enviados em caixas neutras, sem qualquer logo ou identificação da loja. A nota fiscal descreve apenas "produto de uso pessoal".',
  },
  {
    q: 'Como rastrear meu pedido?',
    a: 'Após o envio você receberá um e-mail com o código de rastreamento. Você também pode acessar a página "Rastrear Pedido" no footer ou em "Minha Conta".',
  },
  {
    q: 'Qual o prazo de entrega?',
    a: 'Para as regiões Sul e Sudeste, o prazo é de 3 a 7 dias úteis. Para as demais regiões, de 7 a 14 dias úteis após a confirmação do pagamento.',
  },
  {
    q: 'Posso trocar ou devolver um produto?',
    a: 'Sim, aceitamos trocas e devoluções em até 30 dias corridos após o recebimento, desde que o produto esteja lacrado e na embalagem original.',
  },
  {
    q: 'Quais formas de pagamento são aceitas?',
    a: 'Aceitamos PIX (aprovação imediata), cartões de crédito Visa, Mastercard e Elo (em até 12x), e boleto bancário (aprovação em 1-2 dias úteis).',
  },
]

export default function ContatoPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }
    setLoading(true)
    // Simulação — integrar com backend/e-mail quando disponível
    await new Promise((r) => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
    toast.success('Mensagem enviada com sucesso!')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-4xl font-bold mb-4">Fale Conosco</h1>
            <p className="text-violet-200 text-lg">
              Estamos aqui para ajudar. Entre em contato com total discrição e segurança.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid lg:grid-cols-2 gap-12">

              {/* Formulário */}
              <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-8">
                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-violet-600" />
                  Enviar Mensagem
                </h2>

                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-semibold text-zinc-900 mb-2">Mensagem Enviada!</h3>
                    <p className="text-zinc-500">
                      Recebemos seu contato e responderemos em até 24 horas úteis.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                      className="mt-6 text-sm text-violet-600 hover:text-violet-700 underline"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                          Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Seu nome"
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="seu@email.com"
                          className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">Assunto</label>
                      <input
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        placeholder="Sobre o que você quer falar?"
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1">
                        Mensagem <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Descreva sua dúvida ou mensagem..."
                        className="w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {loading ? 'Enviando...' : 'Enviar Mensagem'}
                    </button>
                  </form>
                )}
              </div>

              {/* Info + FAQ */}
              <div className="space-y-6">
                {/* Canais de contato */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-zinc-900 mb-4">Canais de Atendimento</h2>
                  <div className="space-y-4">
                    {contactInfo.map(({ icon: Icon, title, value, description, href }) => (
                      <div key={title} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wide">{title}</p>
                          {href ? (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-zinc-800 hover:text-violet-600 transition-colors">
                              {value}
                            </a>
                          ) : (
                            <p className="text-sm font-semibold text-zinc-800">{value}</p>
                          )}
                          <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQ */}
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-zinc-900 mb-4">Perguntas Frequentes</h2>
                  <div className="space-y-4">
                    {faqs.map(({ q, a }) => (
                      <div key={q} className="border-b border-zinc-100 pb-4 last:border-0 last:pb-0">
                        <p className="text-sm font-semibold text-zinc-800 mb-1">{q}</p>
                        <p className="text-sm text-zinc-500 leading-relaxed">{a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
