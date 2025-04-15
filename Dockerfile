# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.17.0

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

FROM base AS dev

# Copy entrypoint script and package files in one layer
COPY scripts/dev-docker-entrypoint.sh /
RUN chmod +x /dev-docker-entrypoint.sh

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci -f --include=dev

COPY . .

EXPOSE ${API_PORT} ${API_DEBUG_PORT}

ENTRYPOINT ["/dev-docker-entrypoint.sh"]

# Production stage
FROM base AS prod

COPY scripts/prod-docker-entrypoint.sh /
RUN chmod +x /prod-docker-entrypoint.sh

COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci -f --omit=dev

# Copy application files
COPY . .

# Expose only the main application port
EXPOSE ${API_PORT}

# Set Node.js to production mode
ENV NODE_ENV ${NODE_ENV}

ENTRYPOINT ["/prod-docker-entrypoint.sh"]