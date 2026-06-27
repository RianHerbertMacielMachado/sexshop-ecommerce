# SexShop E-commerce

Plataforma de e-commerce completa para sex shop, construída com Node.js (Express + Prisma) no backend e Next.js no frontend, arquitetura monorepo com Turborepo.

---

## Estrutura do Projeto

```
sexshop-ecommerce/
├── apps/
│   ├── api/          # Backend Node.js + Express + Prisma
│   └── web/          # Frontend Next.js 14 (App Router)
├── packages/
│   └── shared/       # Tipos e utilitários compartilhados
├── prisma/
│   ├── schema.prisma # Schema do banco de dados
│   ├── seed.ts       # Dados iniciais
│   └── migrations/   # Histórico de migrações
├── apps/api/Dockerfile   # Dockerfile da API (build a partir da raiz)
├── apps/web/Dockerfile   # Dockerfile do Web (build a partir da raiz)
└── railway.toml          # Configuração Railway
```

---

## Deploy no Railway

### Pré-requisitos
- Conta no [Railway](https://railway.app)
- Repositório no GitHub

### Passo a Passo

#### 1. Crie um projeto no Railway
Acesse [railway.app](https://railway.app) → "New Project" → "Deploy from GitHub repo"

#### 2. Adicione o banco de dados PostgreSQL
No projeto → "+ New" → "Database" → "Add PostgreSQL"

O Railway cria automaticamente a variável `DATABASE_URL`.

#### 3. Serviço API (Backend)

Crie um novo serviço:
- Source: seu repositório GitHub
- **Root Directory**: `/` (raiz do monorepo)
- **Dockerfile Path**: `apps/api/Dockerfile`

**Variáveis de ambiente obrigatórias:**

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Conexão PostgreSQL (auto do Railway) | `postgresql://...` |
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta da API | `3001` |
| `FRONTEND_URL` | URL do serviço Web | `https://web.railway.app` |
| `JWT_SECRET` | Chave JWT (min 32 chars) | `sua_chave_super_secreta_de_32_...` |
| `JWT_REFRESH_SECRET` | Chave Refresh JWT (min 32 chars) | `outra_chave_secreta_refresh_...` |
| `ENCRYPTION_KEY` | Chave de criptografia (exatamente 32 chars) | `12345678901234567890123456789012` |

**Variáveis opcionais (serviços externos):**

| Variável | Descrição |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Upload de imagens |
| `CLOUDINARY_API_KEY` | |
| `CLOUDINARY_API_SECRET` | |
| `SMTP_HOST` | Envio de emails |
| `SMTP_USER` | |
| `SMTP_PASS` | |
| `EMAIL_FROM` | |
| `STRIPE_SECRET_KEY` | Pagamento Stripe |
| `STRIPE_PUBLISHABLE_KEY` | |
| `STRIPE_WEBHOOK_SECRET` | |
| `MP_ACCESS_TOKEN` | Pagamento MercadoPago |
| `MP_PUBLIC_KEY` | |

**Release Command (no painel Railway do serviço API):**
```
npx prisma migrate deploy
```

Isso garante que as migrações são aplicadas automaticamente a cada deploy.

#### 4. Serviço Web (Frontend)

Crie outro serviço:
- Source: mesmo repositório GitHub
- **Root Directory**: `/` (raiz do monorepo)
- **Dockerfile Path**: `apps/web/Dockerfile`

**Variáveis de ambiente:**

| Variável | Descrição | Exemplo |
|---|---|---|
| `NODE_ENV` | Ambiente | `production` |
| `PORT` | Porta do Web | `3000` |
| `NEXT_PUBLIC_API_URL` | URL pública do serviço API | `https://api.railway.app` |
| `NEXT_PUBLIC_STORE_NAME` | Nome da loja | `Minha Sexy Shop` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe (opcional) | |
| `NEXT_PUBLIC_MP_PUBLIC_KEY` | Chave pública MP (opcional) | |

---

## Desenvolvimento Local

### Requisitos
- Node.js >= 20
- npm >= 10
- PostgreSQL local ou Docker

### Setup

```bash
# 1. Clone o repositório
git clone https://github.com/RianHerbertMacielMachado/sexshop-ecommerce
cd sexshop-ecommerce

# 2. Instale as dependências
npm install

# 3. Configure variáveis de ambiente da API
cp .env.example.api apps/api/.env
# Edite apps/api/.env com seus valores

# 4. Configure variáveis do Web
cp .env.example.web apps/web/.env.local
# Edite apps/web/.env.local com seus valores

# 5. Aplique as migrações do banco
npx prisma migrate dev

# 6. Execute o seed (dados iniciais)
npm run db:seed

# 7. Inicie o desenvolvimento
npm run dev
```

### Credenciais do Admin (após seed)
- **Email**: admin@sualoja.com.br
- **Senha**: Admin@123456
- **Cupom de teste**: BEMVINDO10 (10% de desconto)

---

## Features

### Backend (API)
- ✅ Autenticação JWT com refresh token
- ✅ Gestão de produtos com variantes
- ✅ Categorias hierárquicas
- ✅ Pedidos com rastreamento
- ✅ Cupons de desconto
- ✅ Múltiplas zonas de frete
- ✅ Integração Stripe e MercadoPago
- ✅ Upload de imagens (Cloudinary)
- ✅ Envio de emails (SMTP)
- ✅ Avaliações de produtos
- ✅ Lista de desejos
- ✅ Painel administrativo
- ✅ Relatórios de vendas
- ✅ Rate limiting e segurança

### Frontend (Web)
- ✅ Catálogo de produtos com filtros
- ✅ Página de produto com galeria
- ✅ Carrinho de compras (Zustand)
- ✅ Checkout completo
- ✅ Área do cliente (pedidos, endereços, lista de desejos)
- ✅ Painel administrativo completo
- ✅ Banners dinâmicos
- ✅ Responsivo (mobile-first)

---

## Tech Stack

| Camada | Tecnologia |
|---|---|
| Backend | Node.js 20, Express, TypeScript |
| ORM | Prisma 5 |
| Banco de Dados | PostgreSQL |
| Frontend | Next.js 14 (App Router) |
| Estilização | Tailwind CSS |
| Estado | Zustand |
| Queries | TanStack Query |
| Pagamentos | Stripe, MercadoPago |
| Imagens | Cloudinary |
| Email | Nodemailer (SMTP) |
| Deploy | Railway (Docker) |
| Monorepo | Turborepo |

---

## Geração de Chaves Seguras

```bash
# JWT_SECRET e JWT_REFRESH_SECRET (64 chars hex = 128 chars)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# ENCRYPTION_KEY (exatamente 32 chars)
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```
