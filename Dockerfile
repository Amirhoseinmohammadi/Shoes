# Dockerfile بهینه شده برای Railway

# --- مرحله Build ---
FROM node:18-alpine AS builder
WORKDIR /app

# فقط فایل‌های لازم برای نصب وابستگی‌ها را کپی کن
COPY package*.json ./
COPY prisma ./prisma/

# وابستگی‌ها را نصب کن
RUN npm install

# بقیه فایل‌های پروژه را کپی کن
COPY . .

# Prisma Generate را در مرحله Build اجرا کن
RUN npx prisma generate

# برنامه را build کن
RUN npm run build


# --- مرحله Runtime ---
FROM node:18-alpine AS runner
WORKDIR /app

# فایل‌های build شده و node_modules را از مرحله قبل کپی کن
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public

# دستور شروع
CMD ["npm", "start"]