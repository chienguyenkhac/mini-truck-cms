#!/bin/bash

set -e

# ==============================
# SINOTRUK DEPLOY - FINAL STABLE
# ==============================
#
# Usage: 
#   ./deploy.sh              - Full deployment
#   ./deploy.sh pgadmin-info - Show pgAdmin connection info
#   ./deploy.sh pgadmin-logs - Show pgAdmin logs
#   ./deploy.sh pgadmin-restart - Restart pgAdmin container
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
PGADMIN_CONTAINER="sinotruk-pgadmin"

# ==========================================
# HELPER FUNCTIONS FOR PGADMIN
# ==========================================

show_pgadmin_info() {
    # Load environment variables
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi

    SERVER_HOST_DISPLAY="${SERVER_HOST:-<SERVER_IP_OR_DOMAIN>}"
    PGADMIN_PORT_DISPLAY="${PGADMIN_PORT:-5050}"

    echo ""
    echo "🗄️  pgAdmin Database Management"
    echo "=================================="
    echo ""
    echo "🌐 URL:       http://${SERVER_HOST_DISPLAY}:${PGADMIN_PORT_DISPLAY}"
    echo "📧 Email:     ${PGADMIN_EMAIL:-admin@sinotruk.com}"
    echo "🔐 Password:  ********"
    echo ""
    echo "📊 Database Connection Settings:"
    echo "   Host:      sinotruk-db (Docker internal network)"
    echo "   Port:      5432"
    echo "   Database:  ${DB_NAME:-postgres}"
    echo "   Username:  ${DB_USER:-postgres}"
    echo "   Password:  ********"
    echo ""
    echo "💡 Notes:"
    echo "   • pgAdmin must be in same Docker network as database"
    echo "   • If accessing from outside Docker, use VPS IP instead of container name"
    echo ""
}

show_pgadmin_logs() {
    if docker ps --format '{{.Names}}' | grep -wq "$PGADMIN_CONTAINER"; then
        echo "Showing pgAdmin logs (Ctrl+C to exit)..."
        docker logs "$PGADMIN_CONTAINER" --tail=50 -f
    else
        echo "pgAdmin container is not running."
        exit 1
    fi
}

restart_pgadmin() {
    if docker ps -a --format '{{.Names}}' | grep -wq "$PGADMIN_CONTAINER"; then
        echo "Restarting pgAdmin container..."
        docker restart "$PGADMIN_CONTAINER"
        echo "pgAdmin restarted successfully"
        show_pgadmin_info
    else
        echo "pgAdmin container not found. Deploy first."
        exit 1
    fi
}

# ==========================================
# HANDLE COMMAND LINE ARGUMENTS
# ==========================================

case "${1:-deploy}" in
    "pgadmin-info")
        show_pgadmin_info
        exit 0
        ;;
    "pgadmin-logs")
        show_pgadmin_logs
        exit 0
        ;;
    "pgadmin-restart")
        restart_pgadmin
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Sinotruk Deploy Script"
        echo ""
        echo "Usage:"
        echo "  ./deploy.sh                 - Full deployment"
        echo "  ./deploy.sh pgadmin-info    - Show pgAdmin connection info"
        echo "  ./deploy.sh pgadmin-logs    - Show pgAdmin logs"
        echo "  ./deploy.sh pgadmin-restart - Restart pgAdmin container"
        echo "  ./deploy.sh help            - Show this help"
        echo ""
        exit 0
        ;;
    "deploy"|"")
        # Continue with normal deployment
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use './deploy.sh help' for available commands"
        exit 1
        ;;
esac

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
# 8. WAIT FOR PGADMIN & SETUP
# ==========================================

info "Checking pgAdmin readiness..."

for i in {1..15}; do
    if docker exec "$PGADMIN_CONTAINER" wget --quiet --tries=1 --spider http://localhost:80 >/dev/null 2>&1; then
        success "pgAdmin is ready"
        break
    fi
    sleep 2
done

# Create pgAdmin server configuration for auto-connection
if docker ps | grep -q "$PGADMIN_CONTAINER"; then
    info "Setting up pgAdmin server configuration..."
    
    # Create servers.json for auto-connection
    cat > /tmp/servers.json << EOF
{
    "Servers": {
        "1": {
            "Name": "Sinotruk Database",
            "Group": "Servers",
            "Host": "db",
            "Port": 5432,
            "MaintenanceDB": "${DB_NAME:-postgres}",
            "Username": "${DB_USER:-postgres}",
            "SSLMode": "prefer",
            "PassFile": "/pgpass"
        }
    }
}
EOF

    # Create pgpass file for automatic password
    echo "db:5432:${DB_NAME:-postgres}:${DB_USER:-postgres}:${DB_PASSWORD}" > /tmp/pgpass
    
    # Copy configuration files to pgAdmin container
    docker cp /tmp/servers.json "$PGADMIN_CONTAINER":/pgadmin4/servers.json 2>/dev/null || warn "Could not copy servers.json"
    docker cp /tmp/pgpass "$PGADMIN_CONTAINER":/pgpass 2>/dev/null || warn "Could not copy pgpass"
    
    # Set proper permissions
    docker exec "$PGADMIN_CONTAINER" chown pgadmin:pgadmin /pgadmin4/servers.json 2>/dev/null || true
    docker exec "$PGADMIN_CONTAINER" chown pgadmin:pgadmin /pgpass 2>/dev/null || true
    docker exec "$PGADMIN_CONTAINER" chmod 600 /pgpass 2>/dev/null || true
    
    # Clean up temp files
    rm -f /tmp/servers.json /tmp/pgpass
    
    success "pgAdmin configuration completed"
fi

# ==========================================
# 9. DONE
# ==========================================

echo ""
success "Deployment completed successfully!"
echo ""
echo "🌐 Application URLs:"
echo "   Website: https://$DOMAIN"
echo "   Admin:   https://$DOMAIN/secret"
echo "   API:     https://$DOMAIN/api"
echo ""
echo "🗄️  Database Management:"
echo "   pgAdmin: http://localhost:${PGADMIN_PORT:-5050}"
echo "   Email:    ${PGADMIN_EMAIL:-admin@sinotruk.com}"
echo "   Password: ${PGADMIN_PASSWORD:-admin123}"
echo ""
echo "📊 Database Connection Info (for pgAdmin):"
echo "   Host:     db (inside Docker) or localhost (outside Docker)"
echo "   Port:     5432"
echo "   Database: ${DB_NAME:-postgres}"
echo "   Username: ${DB_USER:-postgres}"
echo "   Password: ${DB_PASSWORD}"
echo ""
echo "💡 pgAdmin Tips:"
echo "   • Server 'Sinotruk Database' should be auto-configured"
echo "   • If connection fails, use 'localhost' as host instead of 'db'"
echo "   • Restart pgAdmin: docker compose restart pgadmin"
echo ""

docker compose ps