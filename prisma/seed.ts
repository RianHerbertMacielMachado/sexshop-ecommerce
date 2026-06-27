import { PrismaClient, UserRole, PaymentMethodType, BannerPosition } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  console.log('🌱 Iniciando seed do banco de dados...')

  // ============================================================
  // 1. USUÁRIO ADMIN PADRÃO
  // ============================================================
  const adminPassword = await bcrypt.hash('Admin@123456', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@sualoja.com.br' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@sualoja.com.br',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
      emailVerified: true,
    },
  })

  console.log(`✅ Admin criado: ${admin.email}`)

  // ============================================================
  // 2. SITE SETTINGS INICIAIS
  // ============================================================
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      storeName: 'Minha Sexy Shop',
      storeDescription: 'Sua loja de produtos adultos com discrição e qualidade',
      storeEmail: 'contato@sualoja.com.br',
      primaryColor: '#7c3aed',
      secondaryColor: '#db2777',
      socialLinks: {
        instagram: '',
        facebook: '',
        twitter: '',
        tiktok: '',
        youtube: '',
      },
      footerText: '© 2024 Minha Sexy Shop. Todos os direitos reservados. +18',
    },
  })

  console.log(`✅ Settings criadas: ${settings.storeName}`)

  // ============================================================
  // 3. CATEGORIAS PADRÃO
  // ============================================================
  const categoriesData = [
    {
      name: 'Vibradores',
      slug: 'vibradores',
      description: 'Vibradores de todos os tipos para seu prazer',
      order: 1,
    },
    {
      name: 'Acessórios',
      slug: 'acessorios',
      description: 'Acessórios eróticos variados',
      order: 2,
    },
    {
      name: 'Fantasias',
      slug: 'fantasias',
      description: 'Fantasias sensuais para momentos especiais',
      order: 3,
    },
    {
      name: 'Lubrificantes',
      slug: 'lubrificantes',
      description: 'Lubrificantes de alta qualidade',
      order: 4,
    },
    {
      name: 'Jogos Eróticos',
      slug: 'jogos-eroticos',
      description: 'Jogos para animar seus momentos a dois',
      order: 5,
    },
    {
      name: 'Masculino',
      slug: 'masculino',
      description: 'Produtos especiais para ele',
      order: 6,
    },
    {
      name: 'Feminino',
      slug: 'feminino',
      description: 'Produtos especiais para ela',
      order: 7,
    },
    {
      name: 'Casais',
      slug: 'casais',
      description: 'Produtos para casais explorarem juntos',
      order: 8,
    },
  ]

  for (const categoryData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: {
        ...categoryData,
        isActive: true,
      },
    })
    console.log(`✅ Categoria criada: ${category.name}`)
  }

  // ============================================================
  // 4. ZONAS DE FRETE
  // ============================================================
  const existingZones = await prisma.shippingZone.count()

  if (existingZones === 0) {
    await prisma.shippingZone.createMany({
      data: [
        {
          name: 'Sul e Sudeste',
          states: ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC', 'RS'],
          price: 15.9,
          freeAbove: 200.0,
          estimatedDays: '5-7 dias úteis',
          deliveryDays: 7,
          isActive: true,
        },
        {
          name: 'Centro-Oeste e Norte e Nordeste',
          states: [
            'GO',
            'MT',
            'MS',
            'DF',
            'AM',
            'PA',
            'AC',
            'RR',
            'AP',
            'RO',
            'TO',
            'BA',
            'SE',
            'AL',
            'PE',
            'PB',
            'RN',
            'CE',
            'PI',
            'MA',
          ],
          price: 24.9,
          freeAbove: 300.0,
          estimatedDays: '8-12 dias úteis',
          deliveryDays: 12,
          isActive: true,
        },
      ],
    })
    console.log('✅ Zonas de frete criadas')
  }

  // ============================================================
  // 5. MÉTODOS DE PAGAMENTO
  // ============================================================
  const existingMethods = await prisma.paymentMethod.count()

  if (existingMethods === 0) {
    await prisma.paymentMethod.createMany({
      data: [
        {
          name: 'Cartão de Crédito / Débito',
          type: PaymentMethodType.STRIPE_CARD,
          isActive: false,
          config: {},
          instructions: 'Pagamento seguro via Stripe. Aceitamos Visa, Mastercard e Elo.',
          icon: 'credit-card',
          order: 1,
        },
        {
          name: 'PIX',
          type: PaymentMethodType.PIX,
          isActive: false,
          config: {},
          instructions: 'Pagamento instantâneo via PIX. QR Code gerado automaticamente.',
          icon: 'qr-code',
          order: 2,
        },
      ],
    })
    console.log('✅ Métodos de pagamento criados')
  }

  // ============================================================
  // 6. BANNERS PLACEHOLDER
  // ============================================================
  const existingBanners = await prisma.banner.count()

  if (existingBanners === 0) {
    await prisma.banner.createMany({
      data: [
        {
          title: 'Bem-vindo à Minha Sexy Shop',
          subtitle: 'Os melhores produtos adultos com total discrição',
          imageUrl: 'https://placehold.co/1920x600/7c3aed/ffffff?text=Banner+Principal',
          mobileImageUrl: 'https://placehold.co/768x400/7c3aed/ffffff?text=Banner+Mobile',
          linkUrl: '/produtos',
          position: BannerPosition.HOME_HERO,
          isActive: true,
          order: 1,
        },
        {
          title: 'Novidades da Semana',
          subtitle: 'Confira os produtos que acabaram de chegar',
          imageUrl: 'https://placehold.co/1920x600/db2777/ffffff?text=Banner+Novidades',
          mobileImageUrl: 'https://placehold.co/768x400/db2777/ffffff?text=Banner+Mobile',
          linkUrl: '/produtos?sort=newest',
          position: BannerPosition.HOME_HERO,
          isActive: true,
          order: 2,
        },
        {
          title: 'Frete Grátis acima de R$ 200',
          subtitle: 'Para regiões Sul e Sudeste',
          imageUrl: 'https://placehold.co/1920x300/1e1b4b/ffffff?text=Banner+Frete+Gratis',
          linkUrl: '/produtos',
          position: BannerPosition.HOME_MIDDLE,
          isActive: true,
          order: 1,
        },
      ],
    })
    console.log('✅ Banners placeholder criados')
  }

  // ============================================================
  // 7. CUPOM DE EXEMPLO
  // ============================================================
  const existingCoupon = await prisma.coupon.findUnique({
    where: { code: 'BEMVINDO10' },
  })

  if (!existingCoupon) {
    await prisma.coupon.create({
      data: {
        code: 'BEMVINDO10',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 50,
        maxUses: 100,
        isActive: true,
      },
    })
    console.log('✅ Cupom de boas-vindas criado: BEMVINDO10')
  }

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Admin email: admin@sualoja.com.br')
  console.log('🔐 Admin senha: Admin@123456')
  console.log('🎫 Cupom de teste: BEMVINDO10 (10% de desconto)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
