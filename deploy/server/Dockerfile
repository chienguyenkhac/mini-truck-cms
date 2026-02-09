FROM node:18-alpine

WORKDIR /app

# Install dependencies for native modules (bcrypt, sharp) and health check
RUN apk add --no-cache python3 make g++ vips-dev libc6-compat wget

# Copy package files
COPY package*.json ./

# Install dependencies (this will build native modules for Alpine)
RUN npm ci --only=production

# Copy application code (node_modules will be excluded by .dockerignore)
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads/original /app/uploads/watermarked /app/uploads/thumbnails

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start server
CMD ["node", "index.js"]
