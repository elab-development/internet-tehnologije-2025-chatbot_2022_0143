# --- deps ---
FROM node:20-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci


# --- build ---
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY --from=deps /app/node_modules ./node_modules
COPY . .

#  DUMMY DATABASE_URL (samo za prisma generate)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/dummy"

#  GENERIŠE TIPOVE (ne konektuje se na bazu)
RUN npx prisma generate

#  tek sad Next build
RUN npm run build

# --- runner ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache libc6-compat

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 3000

# U runtime-u postoji DATABASE_URL (Render) ili je setovan u docker-compose (CI)
CMD sh -c "npx prisma generate && npx prisma migrate deploy && node prisma/seed.js && npm run start -- -p ${PORT:-3000}"

