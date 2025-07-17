# E2E Test Documentation

This directory contains end-to-end tests for the ATİS (Azerbaijan Education Management System) frontend application using Playwright.

## Test Structure

```
e2e/
├── auth.e2e.test.ts              # Authentication flow tests
├── user-management.e2e.test.ts   # User management tests
├── helpers/
│   ├── auth.helper.ts            # Authentication test helpers
│   └── api.helper.ts             # API mocking helpers
└── README.md                     # This file
```

## Test Coverage

### Authentication Tests (`auth.e2e.test.ts`)
- ✅ Login form display and validation
- ✅ Successful login workflow
- ✅ Login failure handling
- ✅ Rate limiting
- ✅ Loading states
- ✅ Logout workflow
- ✅ Mobile responsiveness
- ✅ Keyboard navigation

### User Management Tests (`user-management.e2e.test.ts`)
- ✅ Users list display
- ✅ Search functionality
- ✅ Create user modal
- ✅ User creation workflow
- ✅ Form validation
- ✅ User editing
- ✅ User deletion with confirmation
- ✅ Pagination
- ✅ Error handling
- ✅ Mobile responsiveness

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests with UI
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e -- auth.e2e.test.ts

# Run tests in debug mode
npm run test:e2e:debug
```

### Test Configuration

Tests are configured in `playwright.config.ts`:
- **Base URL**: http://localhost:3000
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Chrome Mobile, Safari Mobile
- **Retries**: 2 on CI, 0 locally
- **Timeout**: 30 seconds per test
- **Screenshots**: On failure only
- **Videos**: On failure only

## Test Helpers

### AuthHelper (`helpers/auth.helper.ts`)
Provides authentication-related utilities:
- `mockSuccessfulAuth()` - Mock successful login
- `mockFailedAuth()` - Mock login failure
- `mockRateLimit()` - Mock rate limiting
- `login()` - Perform login
- `logout()` - Perform logout
- `isLoggedIn()` - Check login status
- `mockSessionExpiry()` - Mock session expiry

### ApiHelper (`helpers/api.helper.ts`)
Provides API mocking utilities:
- `mockApiResponses()` - Mock multiple API endpoints
- `mockPaginatedResponse()` - Mock paginated data
- `mockErrorResponse()` - Mock error responses
- `mockValidationErrors()` - Mock validation errors
- `mockCrudOperations()` - Mock CRUD operations
- `mockSearchResults()` - Mock search functionality
- `mockFileUpload()` - Mock file uploads
- `mockSlowResponse()` - Mock slow responses
- `mockNetworkFailure()` - Mock network failures

## Writing New Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { AuthHelper } from './helpers/auth.helper';
import { ApiHelper } from './helpers/api.helper';

test.describe('Feature Name E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const apiHelper = new ApiHelper(page);
    
    // Setup mocks
    await authHelper.mockSuccessfulAuth();
    await apiHelper.mockApiResponses({
      '**/api/endpoint': { data: [] }
    });
    
    // Login and navigate
    await authHelper.login('testuser', 'password123');
    await page.goto('/feature-page');
  });

  test('should test feature functionality', async ({ page }) => {
    // Test implementation
    await expect(page.locator('h1')).toContainText('Feature Title');
  });
});
```

### Best Practices

1. **Use Page Object Model**: Create reusable page objects for complex interactions
2. **Mock API Responses**: Always mock API responses for consistent testing
3. **Test User Journeys**: Focus on complete user workflows
4. **Handle Loading States**: Test loading and error states
5. **Test Responsive Design**: Include mobile viewport tests
6. **Use Meaningful Assertions**: Assert on user-visible elements
7. **Clean Up**: Reset state between tests

### Common Patterns

#### Testing Forms
```typescript
test('should handle form submission', async ({ page }) => {
  // Fill form
  await page.locator('input[name="field"]').fill('value');
  
  // Submit
  await page.locator('button[type="submit"]').click();
  
  // Assert success
  await expect(page.locator('text=Success message')).toBeVisible();
});
```

#### Testing Modals
```typescript
test('should open and close modal', async ({ page }) => {
  // Open modal
  await page.locator('button', { hasText: 'Open Modal' }).click();
  
  // Assert modal is visible
  await expect(page.locator('text=Modal Title')).toBeVisible();
  
  // Close modal
  await page.locator('button', { hasText: '×' }).click();
  
  // Assert modal is closed
  await expect(page.locator('text=Modal Title')).not.toBeVisible();
});
```

#### Testing Navigation
```typescript
test('should navigate between pages', async ({ page }) => {
  // Click navigation link
  await page.locator('a[href="/target-page"]').click();
  
  // Wait for navigation
  await page.waitForURL('**/target-page');
  
  // Assert page content
  await expect(page.locator('h1')).toContainText('Target Page');
});
```

## Debugging Tests

### Using Playwright Inspector
```bash
npm run test:e2e:debug -- --grep "test name"
```

### Using Browser DevTools
```bash
npm run test:e2e:headed -- --debug
```

### Screenshots and Videos
Failed tests automatically capture:
- Screenshots in `test-results/`
- Videos in `test-results/`
- Traces in `test-results/`

## CI/CD Integration

Tests are configured for CI environments:
- Retry failed tests twice
- Run in parallel with limited workers
- Generate HTML reports
- Store artifacts on failure

## Performance Considerations

- Tests run in parallel by default
- Use `test.serial()` for sequential tests
- Mock API responses to avoid network delays
- Use `page.waitForLoadState()` when needed
- Avoid hard-coded timeouts

## Troubleshooting

### Common Issues

1. **Test Timeouts**: Increase timeout or improve selectors
2. **Flaky Tests**: Add proper wait conditions
3. **Mock Issues**: Ensure API routes match exactly
4. **Navigation Problems**: Use `waitForURL()` or `waitForLoadState()`

### Debug Commands

```bash
# Run single test in debug mode
npx playwright test auth.e2e.test.ts --debug

# Generate test report
npx playwright show-report

# Update snapshots
npx playwright test --update-snapshots
```

## Future Enhancements

- [ ] Add visual regression testing
- [ ] Implement performance testing
- [ ] Add accessibility testing
- [ ] Create test data factories
- [ ] Add API contract testing
- [ ] Implement cross-browser testing matrix