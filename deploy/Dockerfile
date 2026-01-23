# Build stage for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Copy frontend files
COPY package*.json ./
RUN npm ci

COPY . .

# Build main frontend
RUN npm run build

# Build admin UI
WORKDIR /app/admin_ui
COPY admin_ui/package*.json ./
RUN npm ci
COPY admin_ui/. .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install dependencies for server
COPY deploy/server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --only=production

# Copy server code
COPY deploy/server/index.js ./

# Copy built frontend
WORKDIR /app
COPY --from=frontend-builder /app/dist ./dist
COPY --from=frontend-builder /app/admin_ui/dist ./dist/secret

# Create upload directories
RUN mkdir -p /app/uploads/original /app/uploads/watermarked

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

WORKDIR /app/server
CMD ["node", "index.js"]
