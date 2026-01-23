FROM node:18-alpine

WORKDIR /app

# Install dependencies for sharp (image processing)
RUN apk add --no-cache python3 make g++ vips-dev

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads/original /app/uploads/watermarked /app/uploads/thumbnails

# Expose port
EXPOSE 3002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3002/api/health || exit 1

# Start server
CMD ["node", "index.js"]
