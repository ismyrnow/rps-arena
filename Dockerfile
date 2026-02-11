# --- Stage 1: Install dependencies and build ---
FROM oven/bun:1-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY tsconfig.json build-app.ts ./
COPY src/ ./src/
COPY public/ ./public/

RUN bun run build


# --- Stage 2: Production ---
FROM oven/bun:1-alpine

WORKDIR /app

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled server
COPY --from=builder /app/dist ./dist

# Copy files needed at runtime:
# - package.json for bun run
COPY package.json ./

EXPOSE 3000

CMD ["bun", "run", "start"]
