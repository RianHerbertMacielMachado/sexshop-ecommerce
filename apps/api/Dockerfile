# ============================================================
# Dockerfile para a API
# Railway Root Directory: / (raiz do monorepo)
# ============================================================

# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copia arquivos de dependências do monorepo
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/api/package*.json ./apps/api/

# Instala todas as dependências
RUN npm ci --workspace=apps/api --include-workspace-root

# Copia o schema Prisma e gera o client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o código fonte da API
COPY apps/api ./apps/api/

# Compila a API
RUN cd apps/api && npx tsc --project tsconfig.json

# ============================================================
# Stage 2: Runner
# ============================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodeapp

# Copia apenas o necessário para produção
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

# Instala apenas dependências de produção
RUN npm ci --omit=dev && npm cache clean --force

# Gera o Prisma Client no ambiente de produção
RUN npx prisma generate

RUN chown -R nodeapp:nodejs /app

USER nodeapp

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
