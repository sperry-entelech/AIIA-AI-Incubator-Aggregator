# =============================================================================
# CommunityOS Backend Dockerfile
# Multi-stage build for optimized production image
# =============================================================================

# Development stage
FROM node:20-alpine AS development
LABEL stage=development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["npm", "run", "dev"]

# =============================================================================
# Production build stage
# =============================================================================
FROM node:20-alpine AS builder
LABEL stage=builder

WORKDIR /app

# Install system dependencies for building
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including devDependencies for building)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies and install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine AS production
LABEL stage=production

# Set environment
ENV NODE_ENV=production
ENV PORT=8000

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p /app/uploads && chown -R nodejs:nodejs /app/uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Use tini as PID 1 to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]

# =============================================================================
# Discord Bot stage (separate service)
# =============================================================================
FROM node:20-alpine AS bot
LABEL stage=bot

ENV NODE_ENV=production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    curl \
    tini \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nodejs

# Health check for bot
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "console.log('Bot health check')" || exit 1

# Use tini as PID 1
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/discord/bot.js"]