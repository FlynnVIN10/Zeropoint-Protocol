# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy production dependencies
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/src/scripts/entrypoint.sh ./src/scripts/entrypoint.sh

# Create necessary directories
RUN mkdir -p /app/logs && \
    chown -R nestjs:nodejs /app/logs

# Set proper permissions
RUN chmod +x ./src/scripts/entrypoint.sh && \
    chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/v1/health/live || exit 1

# Expose port
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "./src/scripts/entrypoint.sh"] 