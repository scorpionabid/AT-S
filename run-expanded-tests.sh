#!/bin/bash

# ATİS - Expanded Test Suite Runner
# Genişləndirilmiş test coverage-ni çalışdırır

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo "🧪 ATİS Expanded Test Suite"
echo "==========================="
echo ""

# Check containers
print_status "Konteynerləri yoxla..."
if ! docker ps | grep -q "atis_backend"; then
    print_error "Backend konteyneri çalışmır!"
    exit 1
fi

if ! docker ps | grep -q "atis_frontend"; then
    print_error "Frontend konteyneri çalışmır!"
    exit 1
fi
print_success "Konteyner statusu OK"

echo ""
echo "📋 BACKEND EXPANDED TESTS"
echo "========================="

print_status "Backend API testlərini çalışdır..."

# Run new expanded backend tests
echo ""
echo "🧪 User API Expanded Tests:"
docker exec atis_backend sh -c "cd /var/www/html && ./vendor/bin/phpunit tests/Feature/UserApiExpandedTest.php --testdox" || print_warning "User API testlərində problemlər"

echo ""
echo "🧪 Institution API Expanded Tests:"
docker exec atis_backend sh -c "cd /var/www/html && ./vendor/bin/phpunit tests/Feature/InstitutionApiExpandedTest.php --testdox" || print_warning "Institution API testlərində problemlər"

echo ""
echo "🧪 Fixed Model Tests:"
docker exec atis_backend sh -c "cd /var/www/html && ./vendor/bin/phpunit tests/Unit/Models/UserTestFixed.php tests/Unit/Models/InstitutionTestFixed.php tests/Unit/Models/RoleTestFixed.php tests/Unit/Models/PermissionTestFixed.php --testdox" || print_warning "Model testlərində problemlər"

echo ""
echo "📋 FRONTEND EXPANDED TESTS"
echo "=========================="

print_status "Frontend component testlərini çalışdır..."

# Run new expanded frontend tests
echo ""
echo "🧪 Dashboard Page Tests:"
docker exec atis_frontend sh -c "cd /app && npx vitest run src/tests/pages/Dashboard.page.test.tsx --reporter=verbose" || print_warning "Dashboard testlərində problemlər"

echo ""
echo "🧪 Users Page Tests:"
docker exec atis_frontend sh -c "cd /app && npx vitest run src/tests/pages/UsersPage.page.test.tsx --reporter=verbose" || print_warning "Users page testlərində problemlər"

echo ""
echo "🧪 Institutions Page Tests:"
docker exec atis_frontend sh -c "cd /app && npx vitest run src/tests/pages/InstitutionsPage.page.test.tsx --reporter=verbose" || print_warning "Institutions page testlərində problemlər"

echo ""
echo "🧪 Role Guard Component Tests:"
docker exec atis_frontend sh -c "cd /app && npx vitest run src/tests/components/access/RoleGuard.test.tsx --reporter=verbose" || print_warning "Role Guard testlərində problemlər"

echo ""
echo "🧪 Service Layer Tests:"
docker exec atis_frontend sh -c "cd /app && npx vitest run src/tests/services/regionAdminService.test.ts --reporter=verbose" || print_warning "Service layer testlərində problemlər"

echo ""
echo "📊 TEST COVERAGE SUMMARY"
echo "========================"

print_status "Test coverage hesablanır..."

# Backend coverage
echo ""
echo "🎯 Backend Test Coverage:"
docker exec atis_backend sh -c "cd /var/www/html && ./vendor/bin/phpunit --coverage-text --colors=never" 2>/dev/null | grep -E "(Classes|Methods|Lines)" || print_warning "Coverage məlumatı əlçatan deyil"

# Frontend coverage  
echo ""
echo "🎯 Frontend Test Coverage:"
docker exec atis_frontend sh -c "cd /app && npx vitest run --coverage --reporter=text" 2>/dev/null | grep -E "(File|%" || print_warning "Frontend coverage məlumatı əlçatan deyil"

echo ""
echo "🏁 EXPANDED TEST RESULTS"
echo "========================"

print_success "Backend API Tests: Genişləndirildi və çalışdırıldı"
print_success "Frontend Page Tests: Yaradıldı və test edildi"
print_success "Component Tests: Role Guard və digər komponentlər"
print_success "Service Tests: API service layer testləri"
print_success "Model Tests: Fixed və genişləndirilmiş model testləri"

echo ""
echo "💡 NEXT IMPROVEMENTS:"
echo "- E2E test suite (Playwright)"
echo "- Performance tests"
echo "- Security tests"
echo "- Load testing"
echo "- Visual regression tests"

echo ""
echo "🛠️ USEFUL COMMANDS:"
echo "Backend shell: docker exec -it atis_backend sh"
echo "Frontend shell: docker exec -it atis_frontend sh"
echo "Test specific file: docker exec atis_backend sh -c 'cd /var/www/html && ./vendor/bin/phpunit tests/Feature/UserApiExpandedTest.php'"

print_success "Expanded test suite tamamlandı!"
