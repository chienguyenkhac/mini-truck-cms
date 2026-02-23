#!/bin/bash

set -e

# ==============================
# SINOTRUK DEPLOY - FINAL STABLE
# ==============================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warn()    { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

DB_CONTAINER="sinotruk-db"

# ==========================================
# 1. CHECK REQUIRED FILES
# ==========================================

if [ ! -f "docker-compose.yml" ]; then
    error "docker-compose.yml not found"
    exit 1
fi

# ==========================================
# 2. CREATE .env IF NOT EXISTS
# ==========================================

if [ ! -f ".env" ]; then
    if [ ! -f ".env.example" ]; then
        error ".env.example not found"
        exit 1
    fi

    info "Creating .env from .env.example"
    cp .env.example .env
fi

# ==========================================
# 3. EXPORT ENV FOR DOCKER COMPOSE
# ==========================================

set -a
source .env
set +a

if [ -z "$DB_PASSWORD" ]; then
    error "DB_PASSWORD is empty in .env"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    warn "DOMAIN not set → fallback to your-domain.com"
    DOMAIN="your-domain.com"
fi

# ==========================================
# 4. CREATE server/.env IF NEEDED
# ==========================================

if [ -d "server" ]; then
    if [ ! -f "server/.env" ]; then
        if [ -f "server/.env.example" ]; then
            info "Creating server/.env"
            cp server/.env.example server/.env
        else
            warn "server/.env.example not found → creating empty server/.env"
            touch server/.env
        fi
    fi
fi

# ==========================================
# 5. BUILD & START DOCKER
# ==========================================

info "Building containers..."
docker compose build --no-cache

info "Starting services..."
docker compose up -d

success "Services started"

# ==========================================
# 6. WAIT FOR DATABASE
# ==========================================

info "Checking database readiness..."

for i in {1..20}; do
    if docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" >/dev/null 2>&1; then
        success "Database is ready"
        break
    fi
    sleep 2
done

if ! docker exec "$DB_CONTAINER" pg_isready -U "$DB_USER" >/dev/null 2>&1; then
    error "Database failed to start"
    exit 1
fi

# ==========================================
# 7. AUTO IMPORT DATABASE IF EMPTY
# ==========================================

TABLE_COUNT=$(docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -t -c \
"SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" \
2>/dev/null | tr -d ' ')

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" = "0" ]; then
    warn "Database empty → importing init.sql"

    if [ -f "server/init.sql" ]; then
        docker cp server/init.sql "$DB_CONTAINER":/tmp/init.sql
        docker exec "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -f /tmp/init.sql
        docker exec "$DB_CONTAINER" rm -f /tmp/init.sql
        success "Database imported successfully"
    else
        warn "server/init.sql not found → skipping import"
    fi
else
    success "Database already contains data ($TABLE_COUNT tables)"
fi

# ==========================================
# 8. DONE
# ==========================================

echo ""
success "Deployment completed successfully!"
echo ""
echo "Application URLs:"
echo "Website: https://$DOMAIN"
echo "Admin:   https://$DOMAIN/secret"
echo "API:     https://$DOMAIN/api"
echo ""

docker compose ps