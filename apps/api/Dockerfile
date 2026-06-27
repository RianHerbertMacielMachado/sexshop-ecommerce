# ============================================================
# Dockerfile para a API (contexto: raiz do monorepo)
# Build com: docker build -f apps/api/Dockerfile .
# ============================================================

# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia arquivos de dependências do monorepo
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.json ./

# Copia package.json de cada workspace
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

# Instala todas as dependências
RUN npm ci --workspace=apps/api --workspace=packages/shared --include-workspace-root

# Copia o schema Prisma
COPY prisma ./prisma/

# Gera o Prisma Client
RUN npx prisma generate

# Copia o código fonte
COPY apps/api ./apps/api/
COPY packages/shared ./packages/shared/

# Compila a API
RUN cd apps/api && npx tsc --project tsconfig.json

# ============================================================
# Stage 2: Runner
# ============================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeapp

# Copia apenas o necessário para produção
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

# Instala apenas dependências de produção
RUN npm ci --omit=dev && npm cache clean --force

# Gera o Prisma Client novamente no ambiente de produção
RUN npx prisma generate

# Ajusta permissões
RUN chown -R nodeapp:nodejs /app

USER nodeapp

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
