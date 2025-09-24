# ================= Builder =================
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma/
COPY . .

RUN npx prisma generate
RUN npm run build

# ================= Runner =================
FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

RUN mkdir -p /app/database
COPY --from=builder /app/prisma/dev.db /app/database/production.db

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && next start -p ${PORT-3000} -H 0.0.0.0"]
