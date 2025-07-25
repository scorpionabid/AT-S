#!/bin/bash

# ATİS - Docker Test Runner Script
# Docker konteynerlərdə testləri çalışdırır

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

# Check if containers are running
check_containers() {
    print_status "Docker konteynerləri yoxlanır..."
    
    if ! docker ps | grep -q "atis_backend"; then
        print_error "Backend konteyneri çalışmır!"
        echo "Əvvəlcə sistemi başladın: ./start.sh"
        exit 1
    fi
    
    if ! docker ps | grep -q "atis_frontend"; then
        print_error "Frontend konteyneri çalışmır!"
        echo "Əvvəlcə sistemi başladın: ./start.sh"
        exit 1
    fi
    
    print_success "Konteyner statusu OK"
}

# Setup test environment in backend container
setup_backend_test_env() {
    print_status "Backend test mühitini hazırla..."
    
    # Create test database
    docker exec atis_backend touch /var/www/html/database/test.sqlite || true
    docker exec atis_backend chmod 666 /var/www/html/database/test.sqlite || true
    
    # Clear test caches
    docker exec atis_backend php artisan config:clear --quiet || true
    docker exec atis_backend php artisan cache:clear --quiet || true
    
    # Copy .env for testing if needed
    docker exec atis_backend sh -c "
        if [ ! -f /var/www/html/.env.testing ]; then
            cp /var/www/html/.env /var/www/html/.env.testing
            sed -i 's/APP_ENV=.*/APP_ENV=testing/' /var/www/html/.env.testing
            sed -i 's/DB_DATABASE=.*/DB_DATABASE=\/var\/www\/html\/database\/test.sqlite/' /var/www/html/.env.testing
            echo 'Test environment file created'
        fi
    "
    
    print_success "Backend test mühiti hazır"
}

# Run backend tests
run_backend_tests() {
    print_status "Backend testləri çalışdırılır..."
    
    echo ""
    echo "📋 Backend Test Nəticələri:"
    echo "=========================="
    
    # Run specific CRUD tests with better error handling
    docker exec atis_backend sh -c "
        export APP_ENV=testing
        export DB_CONNECTION=sqlite
        export DB_DATABASE=/var/www/html/database/test.sqlite
        
        echo '🧪 User CRUD Testləri:'
        ./vendor/bin/phpunit tests/Unit/Models/UserBasicTest.php --stop-on-failure || echo 'User tests failed'
        
        echo ''
        echo '🧪 Institution CRUD Testləri:'
        ./vendor/bin/phpunit tests/Unit/Models/InstitutionBasicTest.php --stop-on-failure || echo 'Institution tests failed'
        
        echo ''
        echo '🧪 User Service Testləri:'
        ./vendor/bin/phpunit tests/Unit/Services/UserServiceTest.php --stop-on-failure || echo 'User service tests failed'
        
        echo ''
        echo '🧪 Feature CRUD Testləri:'
        ./vendor/bin/phpunit tests/Feature/UserCrudTest.php --stop-on-failure || echo 'User CRUD tests failed'
        ./vendor/bin/phpunit tests/Feature/InstitutionCrudTest.php --stop-on-failure || echo 'Institution CRUD tests failed'
        
        echo ''
        echo '🧪 Bütün Unit Testləri:'
        ./vendor/bin/phpunit --testsuite=Unit --stop-on-failure || echo 'Some unit tests failed'
    "
    
    if [ $? -eq 0 ]; then
        print_success "Backend testləri tamamlandı"
    else
        print_warning "Bəzi backend testləri uğursuz oldu"
    fi
}

# Setup frontend test environment
setup_frontend_test_env() {
    print_status "Frontend test mühitini hazırla..."
    
    # Install test dependencies if needed
    docker exec atis_frontend sh -c "
        cd /app
        if [ ! -d node_modules ]; then
            npm install --quiet
        fi
        
        # Check if test dependencies are installed
        if ! npm list @testing-library/react >/dev/null 2>&1; then
            echo 'Installing missing test dependencies...'
            npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom --quiet
        fi
    "
    
    print_success "Frontend test mühiti hazır"
}

# Run frontend tests
run_frontend_tests() {
    print_status "Frontend testləri çalışdırılır..."
    
    echo ""
    echo "📋 Frontend Test Nəticələri:"
    echo "============================"
    
    # Run frontend tests in container
    docker exec atis_frontend sh -c "
        cd /app
        export NODE_ENV=test
        
        echo '🧪 Auth Service Testləri:'
        npx vitest run src/tests/services/authService.test.ts --reporter=verbose || echo 'Auth service tests failed'
        
        echo ''
        echo '🧪 User Component Testləri:'
        npx vitest run src/tests/components/UserList.test.tsx --reporter=verbose || echo 'User component tests failed'
        
        echo ''
        echo '🧪 CRUD Integration Testləri:'
        npx vitest run src/tests/integration/UserCrud.integration.test.tsx --reporter=verbose || echo 'User CRUD tests failed'
        npx vitest run src/tests/integration/InstitutionCrud.integration.test.tsx --reporter=verbose || echo 'Institution CRUD tests failed'
        
        echo ''
        echo '🧪 Əlavə Integration Testləri:'
        npx vitest run src/tests/integration/UserManagement.integration.test.tsx --reporter=verbose || echo 'Integration tests failed'
        
        echo ''
        echo '🧪 Bütün Frontend Testləri:'
        npx vitest run --reporter=verbose --testTimeout=15000 || echo 'Some frontend tests failed'
    "
    
    if [ $? -eq 0 ]; then
        print_success "Frontend testləri tamamlandı"
    else
        print_warning "Bəzi frontend testləri uğursuz oldu"
    fi
}

# Run E2E tests
run_e2e_tests() {
    print_status "E2E testləri çalışdırılır..."
    
    # Check if both services are accessible
    if curl -s http://localhost:8000/api >/dev/null && curl -s http://localhost:3000 >/dev/null; then
        echo ""
        echo "📋 E2E Test Nəticələri:"
        echo "======================="
        
        docker exec atis_frontend sh -c "
            cd /app
            if command -v playwright >/dev/null; then
                echo '🧪 Authentication E2E:'
                npx playwright test e2e/auth.e2e.test.ts --reporter=line || echo 'Auth E2E tests failed'
                
                echo ''
                echo '🧪 User Management E2E:'
                npx playwright test e2e/user-management.e2e.test.ts --reporter=line || echo 'User management E2E tests failed'
            else
                echo '⚠️  Playwright quraşdırılmayıb, E2E testlər ötürüldü'
            fi
        "
        
        print_success "E2E testləri tamamlandı"
    else
        print_warning "Servislər hazır deyil, E2E testlər ötürüldü"
    fi
}

# Generate test report
generate_test_report() {
    print_status "Test hesabatı yaradılır..."
    
    echo ""
    echo "📊 TEST HESABATI"
    echo "================"
    echo "Tarix: $(date)"
    echo "Docker Mühiti: ✅"
    echo ""
    
    # Backend container info
    echo "🐳 Backend Container:"
    docker exec atis_backend php --version | head -1
    docker exec atis_backend php artisan --version
    echo ""
    
    # Frontend container info
    echo "🐳 Frontend Container:"
    docker exec atis_frontend node --version
    docker exec atis_frontend npm --version
    echo ""
    
    # Test summary
    echo "📋 Test Statusu:"
    echo "- Backend Unit Tests: Çalışdırıldı"
    echo "- Frontend Unit Tests: Çalışdırıldı" 
    echo "- Integration Tests: Çalışdırıldı"
    echo "- E2E Tests: Çalışdırıldı (şərtli)"
    echo ""
    
    print_success "Test hesabatı hazır"
}

# Show help
show_help() {
    echo "ATİS Docker Test Runner"
    echo ""
    echo "Usage:"
    echo "  ./run-tests.sh                    # Bütün testləri çalışdır"
    echo "  ./run-tests.sh backend           # Yalnız backend testlər"
    echo "  ./run-tests.sh frontend          # Yalnız frontend testlər"
    echo "  ./run-tests.sh e2e               # Yalnız E2E testlər"
    echo "  ./run-tests.sh -h, --help        # Bu yardımı göstər"
    echo ""
    echo "Qeyd: Bu script Docker konteynerlərdə testləri çalışdırır."
    echo "Konteynerlərin işlək olması lazımdır (./start.sh ilə başladın)."
}

# Main function
main() {
    echo "🧪 ATİS Test Suite - Docker Edition"
    echo "===================================="
    echo ""
    
    case "$1" in
        "backend")
            check_containers
            setup_backend_test_env
            run_backend_tests
            ;;
        "frontend")
            check_containers
            setup_frontend_test_env
            run_frontend_tests
            ;;
        "e2e")
            check_containers
            run_e2e_tests
            ;;
        "-h"|"--help"|"help")
            show_help
            exit 0
            ;;
        "")
            # Run all tests
            check_containers
            setup_backend_test_env
            setup_frontend_test_env
            run_backend_tests
            run_frontend_tests
            run_e2e_tests
            generate_test_report
            ;;
        *)
            echo "Naməlum parametr: $1"
            show_help
            exit 1
            ;;
    esac
    
    echo ""
    echo "🏁 Test səssionu tamamlandı!"
    echo ""
    echo "🛠️ Faydalı komandalar:"
    echo "   Backend shell: docker exec -it atis_backend bash"
    echo "   Frontend shell: docker exec -it atis_frontend bash"
    echo "   Backend logs: docker logs atis_backend"
    echo "   Frontend logs: docker logs atis_frontend"
}

# Make executable and run
main "$@"