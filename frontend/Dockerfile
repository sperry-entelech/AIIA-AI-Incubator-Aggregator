# =============================================================================
# CommunityOS Frontend Dockerfile
# Multi-stage build for optimized production image
# =============================================================================

# Development stage
FROM node:20-alpine AS development
LABEL stage=development

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat curl

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

CMD ["npm", "run", "dev"]

# =============================================================================
# Dependencies stage
# =============================================================================
FROM node:20-alpine AS deps
LABEL stage=deps

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# =============================================================================
# Builder stage
# =============================================================================
FROM node:20-alpine AS builder
LABEL stage=builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# =============================================================================
# Production stage
# =============================================================================
FROM node:20-alpine AS production
LABEL stage=production

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

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
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Use tini as PID 1 to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]

# =============================================================================
# Static export stage (for CDN deployment)
# =============================================================================
FROM nginx:alpine AS static
LABEL stage=static

# Copy built static files
COPY --from=builder /app/out /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user for nginx
RUN adduser -D -s /bin/sh nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80 || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]