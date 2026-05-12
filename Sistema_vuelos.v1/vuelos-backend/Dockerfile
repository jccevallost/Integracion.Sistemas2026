# ── Etapa 1: Dependencias de producción ─────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# ── Etapa 2: Build TypeScript ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ════════════════════════════════════════════════════════════════
#  Imágenes de cada microservicio (misma base, distinto CMD)
# ════════════════════════════════════════════════════════════════

FROM node:20-alpine AS auth-service
WORKDIR /app
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "--import=./dist/shared/telemetry/tracer.js", "dist/services/auth-service.js"]

FROM node:20-alpine AS catalog-service
WORKDIR /app
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
ENV NODE_ENV=production
EXPOSE 3002
CMD ["node", "--import=./dist/shared/telemetry/tracer.js", "dist/services/catalog-service.js"]

FROM node:20-alpine AS flights-service
WORKDIR /app
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
ENV NODE_ENV=production
EXPOSE 3003
EXPOSE 50051
CMD ["node", "--import=./dist/shared/telemetry/tracer.js", "dist/services/flights-service.js"]

FROM node:20-alpine AS booking-service
WORKDIR /app
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
ENV NODE_ENV=production
EXPOSE 3004
CMD ["node", "--import=./dist/shared/telemetry/tracer.js", "dist/services/booking-service.js"]

FROM node:20-alpine AS payments-service
WORKDIR /app
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
ENV NODE_ENV=production
EXPOSE 3005
CMD ["node", "--import=./dist/shared/telemetry/tracer.js", "dist/services/payments-service.js"]

FROM node:20-alpine AS admin-service
WORKDIR /app
COPY --from=deps    /app/node_modules ./node_modules
COPY --from=deps    /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
ENV NODE_ENV=production
EXPOSE 3006
CMD ["node", "--import=./dist/shared/telemetry/tracer.js", "dist/services/admin-service.js"]
