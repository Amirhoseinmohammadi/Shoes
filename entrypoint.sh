#!/bin/sh
# entrypoint.sh

# این اسکریپت وظیفه دارد تا قبل از اجرای برنامه اصلی،
# دیتابیس را آماده‌سازی کند.

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding the database..."
npm run seed

echo "Starting the application..."
exec "$@"