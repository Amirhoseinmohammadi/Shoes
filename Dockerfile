# Dockerfile بهینه شده برای Railway

# --- مرحله Build ---
FROM node:18-alpine AS builder
WORKDIR /app

# فقط فایل‌های لازم برای نصب وابستگی‌ها را کپی کن
COPY package*.json ./
COPY prisma ./prisma

# وابستگی‌ها را نصب کن
RUN npm install

# بقیه فایل‌های پروژه را کپی کن
COPY . .

# برنامه را build کن
RUN npm run build


# --- مرحله Runtime ---
FROM node:18-alpine AS runner
WORKDIR /app

# فایل‌های build شده را از مرحله قبل کپی کن
COPY --from=builder /app ./

# اسکریپت entrypoint را کپی و قابل اجرا کن
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

# دستور پیش‌فرض برای اجرا (این دستور توسط entrypoint.sh اجرا خواهد شد)
CMD ["npm", "start"]

# اسکریپت entrypoint را به عنوان دستور شروع اجرا کن
ENTRYPOINT ["/app/entrypoint.sh"]