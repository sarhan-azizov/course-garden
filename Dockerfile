# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

COPY scripts/prod-docker-entrypoint.sh /
RUN chmod +x /prod-docker-entrypoint.sh

COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Expose only the main application port
EXPOSE 3000

# Set Node.js to production mode
ENV NODE_ENV production

ENTRYPOINT ["/prod-docker-entrypoint.sh"]