import { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Saiba como coletamos, usamos e protegemos seus dados pessoais na Minha Sexy Shop.',
}

const sections = [
  {
    title: '1. Informações que Coletamos',
    content: `Coletamos as seguintes informações quando você utiliza nossa loja:

• **Dados de cadastro:** nome completo, endereço de e-mail, senha (criptografada), telefone opcional.
• **Dados de entrega:** endereço completo, CEP, cidade, estado e complemento.
• **Dados de pagamento:** não armazenamos dados de cartão. As transações são processadas por gateways certificados PCI-DSS.
• **Dados de navegação:** páginas visitadas, produtos visualizados, tempo de sessão e endereço IP (para segurança e personalização).
• **Cookies:** utilizamos cookies essenciais (autenticação, carrinho) e analíticos (uso agregado e anônimo).`,
  },
  {
    title: '2. Como Usamos suas Informações',
    content: `Suas informações são utilizadas exclusivamente para:

• Processar e entregar seus pedidos com segurança.
• Enviar confirmações de compra, atualizações de entrega e suporte pós-venda.
• Personalizar sua experiência de navegação e recomendações de produtos.
• Enviar comunicações de marketing (apenas com seu consentimento, com opção de descadastro a qualquer momento).
• Cumprir obrigações legais e prevenir fraudes.`,
  },
  {
    title: '3. Compartilhamento de Dados',
    content: `Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:

• **Transportadoras:** apenas nome, endereço e telefone para realizar a entrega.
• **Gateway de pagamento:** dados necessários para processar a transação de forma segura.
• **Autoridades competentes:** quando exigido por lei, ordem judicial ou investigação de fraude.

Todos os parceiros são contratualmente obrigados a manter sigilo e não usar seus dados para outras finalidades.`,
  },
  {
    title: '4. Segurança dos Dados',
    content: `Adotamos medidas técnicas e organizacionais para proteger suas informações:

• Criptografia SSL/TLS em todas as comunicações com o site.
• Senhas armazenadas com hash bcrypt (nunca em texto plano).
• Acesso restrito aos dados pessoais apenas a funcionários autorizados.
• Monitoramento contínuo contra acessos não autorizados e tentativas de fraude.`,
  },
  {
    title: '5. Seus Direitos (LGPD)',
    content: `De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:

• **Acesso:** solicitar uma cópia dos dados que temos sobre você.
• **Correção:** atualizar informações incorretas ou incompletas.
• **Exclusão:** solicitar a remoção dos seus dados, exceto quando necessários por lei.
• **Portabilidade:** receber seus dados em formato estruturado.
• **Revogação do consentimento:** cancelar o recebimento de comunicações de marketing a qualquer momento.

Para exercer seus direitos, entre em contato pelo e-mail: privacidade@minhasexyshop.com.br`,
  },
  {
    title: '6. Cookies',
    content: `Utilizamos os seguintes tipos de cookies:

• **Essenciais:** necessários para o funcionamento básico do site (autenticação, carrinho de compras). Não podem ser desativados.
• **Analíticos:** coletam dados anônimos sobre como você usa o site para melhorarmos a experiência. Podem ser recusados.
• **Marketing:** usados para personalizar anúncios (apenas com seu consentimento explícito).

Você pode gerenciar ou desativar cookies nas configurações do seu navegador.`,
  },
  {
    title: '7. Retenção de Dados',
    content: `Mantemos seus dados pelo tempo necessário para prestar os serviços contratados e cumprir obrigações legais:

• **Dados de conta ativa:** enquanto sua conta estiver ativa.
• **Dados de pedidos:** por até 5 anos, conforme exigência fiscal.
• **Dados de marketing:** até que você revogue o consentimento.

Após o prazo de retenção, os dados são anonimizados ou excluídos de forma segura.`,
  },
  {
    title: '8. Menores de Idade',
    content: `Nosso site é destinado exclusivamente a maiores de 18 anos. Não coletamos intencionalmente dados de menores de idade. Se identificarmos que dados de um menor foram coletados sem consentimento dos responsáveis, excluiremos essas informações imediatamente.`,
  },
  {
    title: '9. Alterações nesta Política',
    content: `Podemos atualizar esta Política de Privacidade periodicamente. Alterações significativas serão comunicadas por e-mail ou aviso no site com pelo menos 15 dias de antecedência. A data da última atualização está sempre indicada no topo desta página.`,
  },
  {
    title: '10. Contato',
    content: `Para dúvidas sobre esta política ou para exercer seus direitos de privacidade, entre em contato:

• **E-mail:** privacidade@minhasexyshop.com.br
• **Formulário:** acesse nossa página de Contato
• **Encarregado de Dados (DPO):** dpo@minhasexyshop.com.br`,
  },
]

export default function PoliticaPrivacidadePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-zinc-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-violet-900 via-violet-800 to-purple-900 text-white py-16">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h1 className="text-4xl font-bold mb-4">Política de Privacidade</h1>
            <p className="text-violet-200">
              Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Conteúdo */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            {/* Resumo */}
            <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 mb-10">
              <h2 className="font-bold text-violet-900 mb-2">Resumo</h2>
              <p className="text-violet-800 text-sm leading-relaxed">
                Levamos a sua privacidade muito a sério. Coletamos apenas os dados necessários para processar seus pedidos, nunca vendemos suas informações a terceiros, e você tem controle total sobre seus dados conforme a LGPD.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm divide-y divide-zinc-100">
              {sections.map(({ title, content }) => (
                <div key={title} className="p-6 md:p-8">
                  <h2 className="text-lg font-bold text-zinc-900 mb-4">{title}</h2>
                  <div className="space-y-2">
                    {content.split('\n').map((line, i) => {
                      if (!line.trim()) return null
                      // Linha com bullet
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
