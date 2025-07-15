#!/bin/bash

# ATİS - Universal Start Script
# Supports both Docker and Local modes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}🔄 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is available
check_docker() {
    if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
        if docker info >/dev/null 2>&1; then
            return 0
        fi
    fi
    return 1
}

# Docker mode
start_docker() {
    print_status "Docker rejimində başladır..."
    
    # Stop existing containers
    print_status "Mövcud konteynerləri dayandır..."
    docker-compose -f docker-compose.local.yml down 2>/dev/null || true
    
    # Remove orphaned containers
    docker container prune -f 2>/dev/null || true
    
    # Build and start
    print_status "Konteynerləri qur və başlat..."
    docker-compose -f docker-compose.local.yml up --build -d
    
    # Wait for services
    print_status "Servislər hazır olmasını gözlə..."
    sleep 15
    
    # Check status
    docker-compose -f docker-compose.local.yml ps
    
    print_success "Docker rejimi hazır!"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000/api"
    echo "   Nginx Proxy: http://localhost"
    echo ""
    echo "🔑 Login məlumatları:"
    echo "   superadmin / admin123"
    echo "   admin / admin123"
}

# Local mode
start_local() {
    print_status "Lokal rejimində başladır..."
    
    # Kill existing processes
    print_status "Mövcud prosesləri dayandır..."
    lsof -ti:3000,5173,8000,8001 2>/dev/null | xargs -r kill -9 2>/dev/null || true
    pkill -f "php artisan serve" 2>/dev/null || true
    pkill -f "npm run dev" 2>/dev/null || true
    
    # Setup backend environment
    print_status "Backend mühitini hazırla..."
    cp backend/.env.example backend/.env 2>/dev/null || true
    
    cat > backend/.env << 'EOF'
APP_NAME="ATİS - Azərbaycan Təhsil İdarəetmə Sistemi"
APP_ENV=local
APP_KEY=base64:8dQ8Gu3WqV8Vn9K7Mj2Nz5P6Q7R8S9T0U1V2W3X4Y5Z=
APP_DEBUG=true
APP_TIMEZONE=Asia/Baku
APP_URL=http://localhost:8000

APP_LOCALE=az
APP_FALLBACK_LOCALE=en

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite
DB_DATABASE=/Users/home/Desktop/ATİS/backend/database/database.sqlite

SESSION_DRIVER=file
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=localhost

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync

CACHE_STORE=file

MAIL_MAILER=log

SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000,localhost:5173,127.0.0.1:5173
SESSION_DOMAIN=localhost

CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173"
CORS_ALLOWED_HEADERS="Origin,Content-Type,Accept,Authorization,X-Requested-With"
CORS_ALLOWED_METHODS="GET,POST,PUT,DELETE,OPTIONS"
CORS_ALLOW_CREDENTIALS=true
EOF
    
    # Setup frontend environment
    print_status "Frontend mühitini hazırla..."
    cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:8000
VITE_APP_URL=http://localhost:3000
VITE_APP_NAME=ATİS
VITE_API_BASE_URL=http://localhost:8000/api
EOF
    
    # Check dependencies
    print_status "Dependency-ləri yoxla..."
    cd backend
    if [ ! -d vendor ]; then
        print_status "Composer paketlərini qur..."
        composer install --no-dev --optimize-autoloader
    fi
    
    # Clear cache
    php artisan config:clear 2>/dev/null || true
    php artisan cache:clear 2>/dev/null || true
    
    # Start backend
    print_status "Backend serveri başlat (port 8000)..."
    php artisan serve --host=127.0.0.1 --port=8000 > ../backend.log 2>&1 &
    BACKEND_PID=$!
    cd ..
    
    # Save backend PID
    echo "$BACKEND_PID" > .backend.pid
    
    # Wait for backend
    sleep 3
    
    # Check frontend dependencies
    cd frontend
    if [ ! -d node_modules ]; then
        print_status "NPM paketlərini qur..."
        npm install
    else
        print_status "Frontend dependency-lərini yoxla..."
        # Check if critical packages exist
        if [ ! -f node_modules/vite/package.json ] || [ ! -f node_modules/sass/package.json ]; then
            print_status "Kritik paketlər eksik - yenidən qur..."
            npm install
        fi
    fi
    
    # Start frontend
    print_status "Frontend serveri başlat (port 3000)..."
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    cd ..
    
    # Save frontend PID
    echo "$FRONTEND_PID" > .frontend.pid
    
    # Wait for services
    print_status "Servislər başlamasını gözlə..."
    sleep 10
    
    # Check services with multiple attempts
    print_status "Backend API-ni yoxla..."
    backend_ready=false
    for i in {1..5}; do
        if curl -s http://127.0.0.1:8000/api/test >/dev/null 2>&1; then
            print_success "Backend hazır: http://localhost:8000"
            backend_ready=true
            break
        fi
        sleep 2
    done
    
    if [ "$backend_ready" = false ]; then
        print_warning "Backend problemi var - log yoxla: tail -f backend.log"
    fi
    
    print_status "Frontend-i yoxla..."
    frontend_ready=false
    for i in {1..5}; do
        if curl -s -m 5 http://127.0.0.1:3000 >/dev/null 2>&1; then
            print_success "Frontend hazır: http://localhost:3000"
            frontend_ready=true
            break
        fi
        sleep 3
    done
    
    if [ "$frontend_ready" = false ]; then
        print_warning "Frontend problemi var - log yoxla: tail -f frontend.log"
        print_status "Vite dependency-lərini yenidən qur..."
        cd frontend
        npm install --force 2>/dev/null || true
        cd ..
    fi
    
    print_success "Lokal rejim hazır!"
    echo ""
    echo "🌐 URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:8000/api"
    echo ""
    echo "🔑 Login məlumatları:"
    echo "   superadmin / admin123"
    echo "   admin / admin123"
    echo ""
    echo "📋 Process IDs:"
    echo "   Backend PID: $BACKEND_PID"
    echo "   Frontend PID: $FRONTEND_PID"
}

# Main logic
main() {
    echo "🚀 ATİS Sistemini başladır..."
    echo ""
    
    # Check mode preference
    MODE=""
    if [ "$1" = "docker" ] || [ "$1" = "-d" ]; then
        MODE="docker"
    elif [ "$1" = "local" ] || [ "$1" = "-l" ]; then
        MODE="local"
    fi
    
    # Auto-detect if no mode specified
    if [ -z "$MODE" ]; then
        if check_docker; then
            print_status "Docker mövcuddur, Docker rejimində başladır..."
            MODE="docker"
        else
            print_status "Docker mövcud deyil, lokal rejimində başladır..."
            MODE="local"
        fi
    fi
    
    # Start based on mode
    case $MODE in
        "docker")
            if check_docker; then
                start_docker
            else
                print_error "Docker mövcud deyil və ya işləmir!"
                print_status "Lokal rejimə keçid..."
                start_local
            fi
            ;;
        "local")
            start_local
            ;;
        *)
            print_error "Naməlum rejim: $MODE"
            exit 1
            ;;
    esac
    
    echo ""
    echo "🛠️ Faydalı komandalar:"
    echo "   Logları izlə: tail -f backend.log frontend.log"
    echo "   Dayandır: ./stop.sh"
    echo "   Docker logları: docker-compose -f docker-compose.local.yml logs -f"
    echo ""
    echo "💡 Sistem hazırdır! Brauzerinizi açın və test edin."
}

# Show help
show_help() {
    echo "ATİS Start Script"
    echo ""
    echo "Usage:"
    echo "  ./start.sh                 # Auto-detect mode"
    echo "  ./start.sh docker          # Force Docker mode"
    echo "  ./start.sh local           # Force local mode"
    echo "  ./start.sh -d              # Docker mode (short)"
    echo "  ./start.sh -l              # Local mode (short)"
    echo "  ./start.sh -h              # Show this help"
    echo ""
}

# Handle arguments
case "$1" in
    "-h"|"--help"|"help")
        show_help
        ;;
    *)
        main "$@"
        ;;
esac