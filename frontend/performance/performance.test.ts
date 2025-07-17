import { test, expect } from '@playwright/test';
import lighthouse from 'lighthouse';
import { chromium } from 'playwright';

test.describe('Performance Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for performance tests
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

    // Mock data endpoints with realistic response times
    await page.route('**/api/dashboard/stats', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Simulate 100ms delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 1500,
          totalInstitutions: 250,
          totalSurveys: 45,
          activeSurveys: 12,
          systemStatus: 'healthy'
        })
      });
    });

    await page.route('**/api/users', async route => {
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate 200ms delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            username: `user${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: { name: 'müəllim', display_name: 'Müəllim' }
          })),
          meta: { total: 10, current_page: 1, per_page: 10 }
        })
      });
    });
  });

  test('should meet performance benchmarks for login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Measure performance metrics
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Assert load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check critical elements are visible quickly
    await expect(page.locator('h3')).toContainText('Sisteme Giriş');
    await expect(page.locator('input[name="login"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    
    // Measure Time to Interactive (TTI)
    const ttiStartTime = Date.now();
    await page.locator('input[name="login"]').fill('test');
    const ttiTime = Date.now() - ttiStartTime;
    
    // Assert TTI is under 100ms
    expect(ttiTime).toBeLessThan(100);
  });

  test('should perform well on dashboard page', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Navigate to dashboard
    await page.waitForURL('**/dashboard');
    
    // Measure dashboard load performance
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Assert dashboard loads quickly
    expect(loadTime).toBeLessThan(2000);
    
    // Check critical dashboard elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle large data sets efficiently', async ({ page }) => {
    // Mock large dataset
    await page.route('**/api/users', async route => {
      const users = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: { name: 'müəllim', display_name: 'Müəllim' }
      }));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: users.slice(0, 50), // Paginated
          meta: { total: 1000, current_page: 1, per_page: 50 }
        })
      });
    });

    // Login and navigate to users page
    await page.goto('/');
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');
    
    // Navigate to users page
    await page.locator('a[href="/users"]').click();
    
    // Measure render performance with large dataset
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const renderTime = Date.now() - startTime;
    
    // Assert rendering is still fast with large dataset
    expect(renderTime).toBeLessThan(1000);
    
    // Check pagination works efficiently
    await expect(page.locator('text=1000 nəticədən')).toBeVisible();
  });

  test('should handle concurrent API calls efficiently', async ({ page }) => {
    // Mock multiple concurrent endpoints
    const endpoints = [
      { path: '**/api/dashboard/stats', delay: 100 },
      { path: '**/api/users', delay: 150 },
      { path: '**/api/institutions', delay: 120 },
      { path: '**/api/surveys', delay: 180 },
      { path: '**/api/roles', delay: 90 }
    ];

    for (const endpoint of endpoints) {
      await page.route(endpoint.path, async route => {
        await new Promise(resolve => setTimeout(resolve, endpoint.delay));
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], meta: {} })
        });
      });
    }

    // Login
    await page.goto('/');
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Measure concurrent load performance
    const startTime = Date.now();
    await page.waitForURL('**/dashboard');
    await page.waitForLoadState('networkidle');
    const totalTime = Date.now() - startTime;
    
    // Should not take longer than the slowest individual call + some overhead
    expect(totalTime).toBeLessThan(500); // All calls should be concurrent
  });

  test('should maintain performance under memory pressure', async ({ page }) => {
    // Create memory-intensive scenario
    await page.route('**/api/users', async route => {
      // Generate large response
      const users = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        profile: {
          // Large profile data
          description: 'A'.repeat(1000),
          settings: Object.fromEntries(
            Array.from({ length: 50 }, (_, j) => [`setting${j}`, `value${j}`])
          )
        }
      }));
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ users, meta: { total: 100 } })
      });
    });

    // Login and navigate to users
    await page.goto('/');
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');
    await page.locator('a[href="/users"]').click();
    
    // Measure memory usage performance
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should still perform reasonably under memory pressure
    expect(loadTime).toBeLessThan(2000);
    
    // Check that UI remains responsive
    await page.locator('input[placeholder*="İstifadəçi axtar"]').fill('user1');
    await expect(page.locator('input[placeholder*="İstifadəçi axtar"]')).toHaveValue('user1');
  });

  test('should handle network latency gracefully', async ({ page }) => {
    // Mock slow network conditions
    await page.route('**/api/**', async route => {
      // Simulate 2-second network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [], meta: {} })
      });
    });

    // Test that loading states are shown
    await page.goto('/');
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Check loading state is visible
    await expect(page.locator('text=Giriş edilir...')).toBeVisible();
    
    // Wait for completion
    await page.waitForURL('**/dashboard', { timeout: 5000 });
    
    // Check that user experience is maintained despite slow network
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should optimize bundle size and loading', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Check for code splitting - initial bundle should be small
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          size: response.headers()['content-length'],
          type: response.url().includes('.js') ? 'javascript' : 'css'
        });
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Check that initial bundle is not too large
    const totalJSSize = responses
      .filter(r => r.type === 'javascript')
      .reduce((sum, r) => sum + (parseInt(r.size) || 0), 0);
    
    // Initial JS bundle should be under 500KB
    expect(totalJSSize).toBeLessThan(500 * 1024);
    
    // Check that CSS is optimized
    const totalCSSSize = responses
      .filter(r => r.type === 'css')
      .reduce((sum, r) => sum + (parseInt(r.size) || 0), 0);
    
    // CSS should be under 100KB
    expect(totalCSSSize).toBeLessThan(100 * 1024);
  });

  test('should maintain performance on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to app
    await page.goto('/');
    
    // Measure mobile performance
    const startTime = Date.now();
    await page.waitForLoadState('networkidle');
    const mobileLoadTime = Date.now() - startTime;
    
    // Mobile should load within 4 seconds
    expect(mobileLoadTime).toBeLessThan(4000);
    
    // Check touch interactions are responsive
    await page.locator('input[name="login"]').tap();
    await page.locator('input[name="login"]').fill('testuser');
    
    // Verify mobile UI is performant
    await expect(page.locator('input[name="login"]')).toHaveValue('testuser');
  });

  test('should handle form interactions efficiently', async ({ page }) => {
    // Navigate to login
    await page.goto('/');
    
    // Measure form interaction performance
    const interactions = [];
    
    // Test typing performance
    const typingStart = Date.now();
    await page.locator('input[name="login"]').fill('testuser@example.com');
    interactions.push({
      action: 'typing',
      duration: Date.now() - typingStart
    });
    
    // Test focus/blur performance
    const focusStart = Date.now();
    await page.locator('input[name="password"]').focus();
    interactions.push({
      action: 'focus',
      duration: Date.now() - focusStart
    });
    
    // Test validation performance
    const validationStart = Date.now();
    await page.locator('input[name="password"]').fill('123');
    await page.locator('button[type="submit"]').click();
    await page.waitForSelector('text=Şifrə ən azı 8 simvoldan ibarət olmalıdır');
    interactions.push({
      action: 'validation',
      duration: Date.now() - validationStart
    });
    
    // All interactions should be under 200ms
    for (const interaction of interactions) {
      expect(interaction.duration).toBeLessThan(200);
    }
  });

  test('should efficiently handle state updates', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.locator('input[name="login"]').fill('testuser');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/dashboard');
    
    // Navigate to users page
    await page.locator('a[href="/users"]').click();
    await page.waitForLoadState('networkidle');
    
    // Test search state updates
    const searchStart = Date.now();
    await page.locator('input[placeholder*="İstifadəçi axtar"]').fill('test');
    
    // Should update search state quickly
    const searchDuration = Date.now() - searchStart;
    expect(searchDuration).toBeLessThan(100);
    
    // Test filter state updates
    const filterStart = Date.now();
    await page.locator('select[name="role"]').selectOption('müəllim');
    
    const filterDuration = Date.now() - filterStart;
    expect(filterDuration).toBeLessThan(100);
  });
});