import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Termos de Uso',
  description: 'Leia os termos e condições de uso da Minha Sexy Shop antes de utilizar nossos serviços.',
}

const sections = [
  {
    title: '1. Aceitação dos Termos',
    content: `Ao acessar e utilizar o site da Minha Sexy Shop, você declara ter lido, compreendido e concordado com estes Termos de Uso. Caso não concorde com qualquer parte destes termos, pedimos que não utilize nosso site.

Estes termos se aplicam a todos os visitantes, usuários e demais pessoas que acessem ou utilizem nosso serviço.`,
  },
  {
    title: '2. Restrição de Idade',
    content: `Este site contém conteúdo adulto e é destinado exclusivamente a pessoas com 18 anos ou mais de idade. Ao acessar este site, você declara que:

• Tem 18 anos ou mais.
• É legalmente capaz de celebrar contratos vinculantes.
• Não está em um local onde o acesso a este tipo de conteúdo seja proibido.

Reservamo-nos o direito de solicitar comprovação de idade a qualquer momento e de encerrar contas de usuários que forneçam informações falsas.`,
  },
  {
    title: '3. Cadastro e Conta de Usuário',
    content: `Para realizar compras em nosso site, você precisará criar uma conta. Você é responsável por:

• Fornecer informações verdadeiras, precisas e completas no cadastro.
• Manter a confidencialidade de sua senha e de sua conta.
• Todas as atividades realizadas com suas credenciais.
• Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.

Reservamo-nos o direito de encerrar contas que violem estes termos, contenham informações falsas ou estejam inativas por mais de 2 anos.`,
  },
  {
    title: '4. Produtos e Disponibilidade',
    content: `• Os preços dos produtos estão sujeitos a alterações sem aviso prévio.
• A disponibilidade dos produtos pode variar. Nos casos de indisponibilidade após a compra, entraremos em contato para oferecer alternativas ou reembolso integral.
• As imagens dos produtos são meramente ilustrativas. Podem existir pequenas variações de cor em relação ao produto real.
• Nos reservamos o direito de limitar quantidades de compra por cliente ou pedido.`,
  },
  {
    title: '5. Preços e Pagamentos',
    content: `• Todos os preços são expressos em Reais (R$) e incluem os impostos aplicáveis.
• Aceitamos PIX, cartões de crédito (Visa, Mastercard, Elo) e boleto bancário.
• O pedido só é confirmado após a aprovação do pagamento pelo gateway.
• Em caso de erro de precificação, entraremos em contato antes de processar o pedido.
• Parcelamentos no cartão de crédito estão sujeitos à política do seu banco emissor.`,
  },
  {
    title: '6. Entrega e Frete',
    content: `• Os prazos de entrega são estimados e podem variar conforme a localidade, volume de pedidos e condições das transportadoras.
• O frete é calculado no momento da compra com base no CEP de destino e no peso/dimensões dos produtos.
• Oferecemos frete grátis para pedidos acima de R$ 200,00 destinados às regiões Sul e Sudeste.
• Não nos responsabilizamos por atrasos causados por eventos fora do nosso controle (greves, desastres naturais, etc.).
• Em caso de extravio, abriremos uma ocorrência junto à transportadora e comunicaremos o cliente em até 48 horas úteis.`,
  },
  {
    title: '7. Política de Devolução e Troca',
    content: `De acordo com o Código de Defesa do Consumidor (Lei nº 8.078/90), você tem direito a:

• **Arrependimento:** cancelar a compra em até 7 dias corridos após o recebimento, sem necessidade de justificativa, desde que o produto esteja lacrado.
• **Troca por defeito:** produtos com defeito de fabricação podem ser trocados em até 30 dias corridos (produtos não duráveis) ou 90 dias (produtos duráveis).

**Condições para devolução:**
• Produto na embalagem original, lacrado e sem sinais de uso.
• Acompanhado da nota fiscal.
• Contato prévio com nosso suporte para abertura do processo.

O frete de devolução é por nossa conta em caso de defeito; em caso de arrependimento, o custo é do cliente.`,
  },
  {
    title: '8. Propriedade Intelectual',
    content: `Todo o conteúdo deste site — incluindo textos, imagens, logos, ícones, vídeos, design e código-fonte — é de propriedade da Minha Sexy Shop ou de seus fornecedores de conteúdo e está protegido por leis de direitos autorais.

É proibido reproduzir, distribuir, modificar ou criar obras derivadas sem autorização prévia e por escrito.`,
  },
  {
    title: '9. Limitação de Responsabilidade',
    content: `A Minha Sexy Shop não se responsabiliza por:

• Danos indiretos, incidentais ou consequentes decorrentes do uso ou incapacidade de usar nossos serviços.
• Conteúdo de sites de terceiros acessados por links em nosso site.
• Interrupções temporárias do serviço por manutenção ou falhas técnicas.
• Danos causados por vírus ou outros elementos maliciosos transmitidos por terceiros.`,
  },
  {
    title: '10. Alterações nos Termos',
    content: `Podemos modificar estes Termos de Uso a qualquer momento. As alterações entram em vigor assim que publicadas no site. O uso continuado do site após a publicação das alterações constitui aceitação dos novos termos.

Recomendamos que você revise estes termos periodicamente.`,
  },
  {
    title: '11. Lei Aplicável e Foro',
    content: `Estes termos são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer controvérsias, fica eleito o foro da comarca de São Paulo/SP, com exclusão de qualquer outro, por mais privilegiado que seja.`,
  },
  {
    title: '12. Contato',
    content: `Para dúvidas sobre estes Termos de Uso, entre em contato:

• **E-mail:** juridico@minhasexyshop.com.br
• **Formulário:** acesse nossa página de Contato`,
  },
]

export default function TermosDeUsoPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-4xl font-bold mb-4">Termos de Uso</h1>
            <p className="text-violet-200">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Aviso +18 */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 flex gap-3">
              <span className="text-2xl shrink-0">🔞</span>
              <div>
                <p className="font-bold text-amber-900 mb-1">Conteúdo Adulto — +18</p>
                <p className="text-sm text-amber-800">
                  Este site é destinado exclusivamente a maiores de 18 anos. Ao continuar navegando, você confirma que tem 18 anos ou mais e que é legalmente capaz de adquirir os produtos oferecidos.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm divide-y divide-zinc-100">
              {sections.map(({ title, content }) => (
                <div key={title} className="p-6 md:p-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-4">{title}</h2>
                  <div className="space-y-2">
                    {content.split('\n').map((line, i) => {
                      if (!line.trim()) return null
                      if (line.startsWith('•')) {
                        const parts = line.replace('• ', '').split('**')
                        return (
                          <div key={i} className="flex gap-2">
                            <span className="text-violet-500 shrink-0 mt-0.5">•</span>
                            <p className="text-sm text-zinc-600 leading-relaxed">
                              {parts.map((part, j) =>
                                j % 2 === 1
                                  ? <strong key={j} className="text-zinc-800">{part}</strong>
                                  : part
                              )}
                            </p>
                          </div>
                        )
                      }
                      return <p key={i} className="text-sm text-zinc-600 leading-relaxed">{line}</p>
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
