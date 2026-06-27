# ============================================================
# Dockerfile para a API
# Build context: raiz do monorepo (/)
# Dockerfile Path configurado no Railway: apps/api/Dockerfile
# ============================================================

# ============================================================
# Stage 1: Builder
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY apps/api/package*.json ./apps/api/

RUN npm ci --workspace=apps/api --include-workspace-root

COPY prisma ./prisma/
RUN npx prisma generate

COPY apps/api ./apps/api/

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

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

RUN npm ci --omit=dev && npm cache clean --force

RUN npx prisma generate

RUN chown -R nodeapp:nodejs /app

USER nodeapp

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

CMD ["node", "dist/server.js"]
