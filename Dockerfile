FROM node:18-alpine AS builder
WORKDIR /app

# 1. کپی package.json و prisma قبل از npm install
COPY package*.json ./
COPY prisma ./prisma

# 2. نصب وابستگی‌ها و generate prisma
RUN npm install
RUN npx prisma generate

# 3. کپی باقی سورس و build next.js
COPY . .
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

CMD ["sh", "-c", "npx prisma migrate deploy --schema=./prisma/schema.prisma && npx next start -p $PORT -H 0.0.0.0"]
