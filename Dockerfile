# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/scripts/entrypoint.sh ./src/scripts/entrypoint.sh
RUN npm ci --only=production
RUN chmod +x ./src/scripts/entrypoint.sh
ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["sh", "./src/scripts/entrypoint.sh"] 