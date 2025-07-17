import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
  });

  test('should display login form elements', async ({ page }) => {
    // Wait for login form to be visible
    await expect(page.locator('h3')).toContainText('Sisteme Giriş');
    
    // Check if form elements are present
    await expect(page.locator('input[name="login"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check if form labels are correct
    await expect(page.locator('label')).toContainText('İstifadəçi adı və ya e-poçt');
    await expect(page.locator('label')).toContainText('Şifrə');
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Check for validation errors
    await expect(page.locator('text=İstifadəçi adı tələb olunur')).toBeVisible();
    await expect(page.locator('text=Şifrə tələb olunur')).toBeVisible();
  });

  test('should show validation error for short password', async ({ page }) => {
    // Fill form with short password
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('123');
    
    // Submit form
    await page.locator('button[type="submit"]').click();
    
    // Check for password length validation
    await expect(page.locator('text=Şifrə ən azı 8 simvoldan ibarət olmalıdır')).toBeVisible();
  });

  test('should handle successful login flow', async ({ page }) => {
    // Mock successful login response
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            roles: ['müəllim']
          }
        })
      });
    });

    // Mock user data endpoint
    await page.route('**/api/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          roles: ['müəllim']
        })
      });
    });

    // Fill and submit login form
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');
    
    // Verify user is logged in
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle login failure', async ({ page }) => {
    // Mock failed login response
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Yanlış istifadəçi adı və ya şifrə'
        })
      });
    });

    // Fill and submit login form
    await page.locator('input[name="login"]').fill('wronguser');
    await page.locator('input[name="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    // Check for error message
    await expect(page.locator('text=Yanlış istifadəçi adı və ya şifrə')).toBeVisible();
    
    // Verify user stays on login page
    await expect(page.locator('h3')).toContainText('Sisteme Giriş');
  });

  test('should handle rate limiting', async ({ page }) => {
    // Mock rate limit response
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin'
        })
      });
    });

    // Fill and submit login form
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Check for rate limit message
    await expect(page.locator('text=Çox sayda cəhd')).toBeVisible();
    
    // Verify submit button is disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should show loading state during login', async ({ page }) => {
    // Mock slow login response
    await page.route('**/api/login', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        })
      });
    });

    // Fill and submit login form
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Check for loading state
    await expect(page.locator('text=Giriş edilir...')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('should handle logout workflow', async ({ page }) => {
    // First login
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
          }
        })
      });
    });

    await page.route('**/api/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        })
      });
    });

    // Mock logout endpoint
    await page.route('**/api/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Uğurla çıxış edildi'
        })
      });
    });

    // Login
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    // Wait for dashboard
    await page.waitForURL('**/dashboard');

    // Find and click logout button
    await page.locator('button', { hasText: 'Çıxış' }).click();

    // Wait for redirect back to login
    await page.waitForURL('/');
    
    // Verify user is logged out
    await expect(page.locator('h3')).toContainText('Sisteme Giriş');
  });

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if form is still usable on mobile
    await expect(page.locator('input[name="login"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Test form interaction on mobile
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    
    // Verify form fields are properly filled
    await expect(page.locator('input[name="login"]')).toHaveValue('testuser');
    await expect(page.locator('input[name="password"]')).toHaveValue('password123');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="login"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="password"]')).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('button[type="submit"]')).toBeFocused();

    // Test form submission with Enter key
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('input[name="password"]').press('Enter');

    // Should trigger form validation
    await expect(page.locator('text=İstifadəçi adı tələb olunur')).not.toBeVisible();
  });
});