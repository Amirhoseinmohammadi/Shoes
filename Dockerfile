# مرحله build
FROM node:18-alpine AS builder

WORKDIR /app

# متغیر محیطی رو برای build بده
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npm run build

# مرحله runtime
FROM node:18-alpine AS runner

WORKDIR /app

COPY --from=builder /app ./

ENV DATABASE_URL=$DATABASE_URL

EXPOSE 3000

CMD ["npm", "start"]
