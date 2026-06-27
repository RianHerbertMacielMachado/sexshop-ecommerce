# ============================================================
# Dockerfile para o Web (contexto: raiz do monorepo)
# Build com: docker build -f apps/web/Dockerfile .
# ============================================================

# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copia arquivos de dependências do monorepo
COPY package*.json ./
COPY turbo.json ./

# Copia package.json de cada workspace
COPY apps/web/package*.json ./apps/web/

# Instala todas as dependências
RUN npm ci --workspace=apps/web --include-workspace-root

# ============================================================
# Stage 2: Builder
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copia todo o código
COPY . .

# Variáveis de build (injetadas pelo Railway em build time)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MP_PUBLIC_KEY
ARG NEXT_PUBLIC_STORE_NAME

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MP_PUBLIC_KEY=$NEXT_PUBLIC_MP_PUBLIC_KEY
ENV NEXT_PUBLIC_STORE_NAME=$NEXT_PUBLIC_STORE_NAME
ENV NEXT_TELEMETRY_DISABLED=1

RUN cd apps/web && npm run build

# ============================================================
# Stage 3: Runner
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copia arquivos estáticos públicos
COPY --from=builder /app/apps/web/public ./public

# Copia o build standalone do Next.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/', (r) => { process.exit(r.statusCode < 500 ? 0 : 1) })"

CMD ["node", "server.js"]
