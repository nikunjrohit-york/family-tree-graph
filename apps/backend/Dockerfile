FROM node:18-alpine AS builder

WORKDIR /app

# Enable automatic Turbo pruning (optional, but good for caching)
# For simplicity, we'll copy the lockfile and install dependencies.
# In a strict production setup, use 'turbo prune'.

COPY package.json package-lock.json turbo.json ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

# Install all dependencies (including dev for building)
RUN npm ci

# Copy source code
COPY . .

# Build the backend
RUN npx turbo run build --filter=@family-tree/backend...

# --- Runner Stage ---
FROM node:18-alpine AS runner
WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package.json .
COPY --from=builder /app/package-lock.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/package.json
# Copy shared package if it's a runtime dependency (it is)
COPY --from=builder /app/packages/shared ./packages/shared

# Set working directory to backend
WORKDIR /app/apps/backend

# Expose port (default NestJS port)
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
