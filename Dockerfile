# Build stage
FROM node:24-alpine AS builder

# Install pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy configuration files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Remove development dependencies
RUN pnpm prune --prod

# Production stage
FROM node:24-alpine AS production

WORKDIR /app

# Install pnpm (just in case it's needed for any script, though node is used)
RUN npm install -g pnpm

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV JWT_EXPIRATION=1d
ENV NEW_RELIC_APP_NAME=tech-challenge-blog-aulas-backend

# Define Build Arguments for sensitive variables
ARG DATABASE_URL
ARG REDIS_HOST
ARG REDIS_PORT
ARG JWT_SECRET
ARG NEW_RELIC_LICENSE_KEY

# Set Environment Variables from Build Arguments
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_HOST=$REDIS_HOST
ENV REDIS_PORT=$REDIS_PORT
ENV JWT_SECRET=$JWT_SECRET
ENV NEW_RELIC_LICENSE_KEY=$NEW_RELIC_LICENSE_KEY

# Copy built application and production dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["pnpm", "run", "start:prod"]
