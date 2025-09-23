#!/bin/sh
# entrypoint.sh

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding the database..."
npm run seed

echo "Starting the application..."
exec "$@"