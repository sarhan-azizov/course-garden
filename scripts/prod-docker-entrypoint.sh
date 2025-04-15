#!/bin/sh
set -e

echo "Building..."
npm run build

echo "Running migrations..."
# npm run migration:run

echo "Starting application..."
exec npm run start:prod