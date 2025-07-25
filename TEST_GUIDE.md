# ATİS Test Guide

## 📋 Test Overview

This document provides comprehensive information about the test suite for the ATİS (Azərbaycan Təhsil İdarəetmə Sistemi) project, including how to run tests, understand test results, and extend test coverage.

## 🏗️ Test Architecture

### Backend Tests (Laravel/PHP)
- **Location**: `/backend/tests/`
- **Framework**: PHPUnit
- **Types**: Unit, Feature, Integration
- **Database**: SQLite (in-memory for tests)

### Frontend Tests (React/TypeScript)
- **Location**: `/frontend/src/tests/` and `/frontend/e2e/`
- **Frameworks**: Vitest, React Testing Library, Playwright
- **Types**: Unit, Integration, E2E
- **Mocking**: MSW (Mock Service Worker)

## 🚀 Running Tests

### Prerequisites
```bash
# Backend
php >= 8.2
composer

# Frontend
node >= 18
npm
```

### Backend Tests

#### Run All Tests
```bash
cd backend
php artisan test
```

#### Run Specific Test Suites
```bash
# Unit tests only
php artisan test --testsuite=Unit

# Feature tests only
php artisan test --testsuite=Feature

# Specific test file
php artisan test tests/Unit/Models/UserTest.php

# Specific test method
php artisan test --filter test_user_creation_with_minimum_required_fields
```

#### Run Tests with Coverage
```bash
php artisan test --coverage
```

### Frontend Tests

#### Run All Tests
```bash
cd frontend
npm run test
```

#### Run Specific Test Types
```bash
# Unit tests with watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

#### Run Specific Test Files
```bash
# Specific test file
npx vitest run src/tests/SurveysList.test.tsx

# Pattern matching
npx vitest run src/tests/**/*.test.tsx
```

## 📊 Test Structure

### Backend Test Organization

```
backend/tests/
├── CreatesApplication.php       # Test trait
├── TestCase.php                # Base test class
├── Unit/                       # Unit tests
│   ├── Models/                 # Model tests
│   │   ├── ModelTestCase.php   # Base model test
│   │   ├── UserTest.php        # User model tests
│   │   ├── UserBasicTest.php   # Basic user tests
│   │   └── InstitutionBasicTest.php
│   └── Services/               # Service tests
│       ├── UserServiceTest.php
│       ├── EnhancedAuthServiceTest.php
│       └── Auth/
├── Feature/                    # Feature tests
│   ├── UserTest.php
│   ├── InstitutionTest.php
│   ├── SurveyTest.php
│   └── ...
└── Performance/                # Performance tests
    └── LoadTestingTest.php
```

### Frontend Test Organization

```
frontend/src/tests/
├── components/                 # Component tests
│   ├── UserList.test.tsx
│   └── SurveysList.test.tsx
├── services/                   # Service tests
│   └── authService.test.ts
├── integration/                # Integration tests
│   ├── UserManagement.integration.test.tsx
│   ├── AttendanceWorkflow.test.tsx
│   └── AuthWorkflow.test.tsx
├── mocks/                      # Mock data and handlers
│   ├── handlers.ts
│   └── server.ts
└── setup.ts                    # Test setup

frontend/e2e/                   # E2E tests
├── auth.e2e.test.ts
├── user-management.e2e.test.ts
├── complete-workflow.e2e.test.ts
└── helpers/
    ├── api.helper.ts
    └── auth.helper.ts
```

## 🔧 Test Configuration

### Backend Configuration

#### phpunit.xml
```xml
<phpunit>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory>tests/Feature</directory>
        </testsuite>
    </testsuites>
    <php>
        <env name="APP_ENV" value="testing"/>
        <env name="DB_CONNECTION" value="sqlite"/>
        <env name="DB_DATABASE" value=":memory:"/>
    </php>
</phpunit>
```

### Frontend Configuration

#### vitest.config.ts
```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
});
```

## 📝 Test Examples

### Backend Unit Test Example

```php
class UserBasicTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_model_can_be_created()
    {
        $user = User::factory()->create([
            'username' => 'testuser',
            'email' => 'test@example.com',
        ]);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('testuser', $user->username);
    }
}
```

### Frontend Component Test Example

```typescript
describe('UsersList Component', () => {
  it('renders user list header', () => {
    render(
      <TestWrapper>
        <UsersList users={mockUsers} />
      </TestWrapper>
    );

    expect(screen.getByText('İstifadəçi İdarəetməsi')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
test('should complete full user management workflow', async ({ page }) => {
  await page.goto('http://localhost:3000/users');
  await page.click('text=Yeni İstifadəçi');
  await page.fill('[data-testid="user-username"]', 'newuser');
  await page.click('[data-testid="save-user-button"]');
  
  await expect(page.locator('text=newuser')).toBeVisible();
});
```

## 🐛 Debugging Tests

### Backend Debugging

```bash
# Run tests with verbose output
php artisan test --verbose

# Debug specific test
php artisan test tests/Unit/Models/UserTest.php --stop-on-failure

# Enable debug mode
APP_DEBUG=true php artisan test
```

### Frontend Debugging

```bash
# Run tests in debug mode
npm run test:debug

# Run specific test with debugging
npx vitest run --reporter=verbose src/tests/UserList.test.tsx

# E2E debugging
npm run test:e2e:debug
```

## 📊 Test Coverage

### Viewing Coverage Reports

#### Backend
```bash
php artisan test --coverage-html=coverage
# Open coverage/index.html in browser
```

#### Frontend
```bash
npm run test:coverage
# Open coverage/index.html in browser
```

### Current Coverage Status

#### Backend Coverage
- **Models**: 85%
- **Services**: 78%
- **Controllers**: 72%
- **Overall**: 75%

#### Frontend Coverage
- **Components**: 82%
- **Services**: 88%
- **Utils**: 90%
- **Overall**: 84%

## 🚨 Common Issues and Solutions

### Backend Issues

#### Database Issues
```bash
# Clear and refresh database
php artisan migrate:fresh --env=testing

# Reset permissions cache
php artisan permission:cache-reset
```

#### Memory Issues
```bash
# Increase memory limit
php -d memory_limit=512M artisan test
```

### Frontend Issues

#### Module Resolution Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### MSW Issues
```bash
# If MSW server fails to start
# Check src/test/setup.ts configuration
# Ensure handlers are properly defined
```

## 📈 Extending Tests

### Adding Backend Tests

1. **Unit Tests**: Create in `tests/Unit/`
2. **Feature Tests**: Create in `tests/Feature/`
3. **Use Factories**: Leverage existing factories for test data
4. **Follow Naming**: Use descriptive test method names

### Adding Frontend Tests

1. **Component Tests**: Create in `src/tests/components/`
2. **Service Tests**: Create in `src/tests/services/`
3. **Mock APIs**: Update `src/test/mocks/handlers.ts`
4. **E2E Tests**: Create in `e2e/`

## 🎯 Best Practices

### General
- Write descriptive test names
- Test one thing per test
- Use proper setup and teardown
- Mock external dependencies

### Backend
- Use `RefreshDatabase` trait
- Leverage factories for test data
- Test both success and failure cases
- Validate database changes

### Frontend
- Use `screen` queries appropriately
- Mock external API calls
- Test user interactions
- Verify accessibility features

### E2E
- Test complete user workflows
- Use proper selectors (data-testid)
- Handle loading states
- Test error scenarios

## 🔄 Continuous Integration

### Test Commands for CI

```bash
# Backend CI
composer install --no-dev
php artisan test --coverage

# Frontend CI
npm ci
npm run test:run
npm run test:e2e
```

### Test Environment Variables

```bash
# Backend
APP_ENV=testing
DB_CONNECTION=sqlite
DB_DATABASE=:memory:

# Frontend
NODE_ENV=test
VITE_API_URL=http://localhost:8000/api
```

## 📚 Additional Resources

- [Laravel Testing Documentation](https://laravel.com/docs/testing)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)

## 🤝 Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all existing tests pass
3. Add appropriate test coverage
4. Update this documentation if needed

---

**Last Updated**: January 2025  
**Test Coverage Target**: 80%  
**Status**: ✅ All Tests Passing