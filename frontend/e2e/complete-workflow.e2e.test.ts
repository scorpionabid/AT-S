import { test, expect } from '@playwright/test';

test.describe('ATİS Complete Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Set up basic auth state if needed
    await page.goto('http://localhost:3000');
  });

  test('should complete full user management workflow', async ({ page }) => {
    // Mock login process
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user: {
            id: 1,
            username: 'admin',
            role: { name: 'regionadmin' },
            permissions: ['manage_users', 'view_dashboard']
          }
        })
      });
    });

    // Mock users API
    await page.route('**/api/users**', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            users: [
              {
                id: 1,
                username: 'admin',
                email: 'admin@example.com',
                role: { display_name: 'Regional Administrator' },
                is_active: true
              },
              {
                id: 2,
                username: 'teacher',
                email: 'teacher@example.com',
                role: { display_name: 'Müəllim' },
                is_active: true
              }
            ],
            meta: { current_page: 1, last_page: 1, total: 2 }
          })
        });
      } else if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            user: {
              id: 3,
              username: 'newuser',
              email: 'newuser@example.com',
              role: { display_name: 'Müəllim' },
              is_active: true
            }
          })
        });
      }
    });

    // Step 1: Login
    await page.fill('[data-testid="login-username"]', 'admin');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-button"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Step 2: Navigate to Users page
    await page.click('text=İstifadəçilər');
    await expect(page).toHaveURL(/.*users/);
    await expect(page.locator('text=İstifadəçi İdarəetməsi')).toBeVisible();

    // Step 3: Verify existing users are displayed
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=teacher')).toBeVisible();

    // Step 4: Create new user
    await page.click('text=Yeni İstifadəçi');
    await expect(page.locator('[data-testid="create-user-modal"]')).toBeVisible();

    await page.fill('[data-testid="user-username"]', 'newuser');
    await page.fill('[data-testid="user-email"]', 'newuser@example.com');
    await page.selectOption('[data-testid="user-role"]', 'muellim');
    
    await page.click('[data-testid="save-user-button"]');

    // Step 5: Verify user was created
    await expect(page.locator('text=İstifadəçi uğurla yaradıldı')).toBeVisible();
    await expect(page.locator('text=newuser')).toBeVisible();

    // Step 6: Edit user
    await page.click('[data-testid="edit-user-2"]'); // Edit second user
    await expect(page.locator('[data-testid="edit-user-modal"]')).toBeVisible();

    await page.fill('[data-testid="user-username"]', 'updated_teacher');
    await page.click('[data-testid="save-user-button"]');

    // Verify user was updated
    await expect(page.locator('text=İstifadəçi uğurla yeniləndi')).toBeVisible();
    await expect(page.locator('text=updated_teacher')).toBeVisible();

    // Step 7: Filter users
    await page.fill('[data-testid="search-input"]', 'admin');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Should show only admin user
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=updated_teacher')).not.toBeVisible();

    // Clear search
    await page.fill('[data-testid="search-input"]', '');
    await page.press('[data-testid="search-input"]', 'Enter');

    // All users should be visible again
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=updated_teacher')).toBeVisible();
  });

  test('should handle survey creation workflow', async ({ page }) => {
    // Mock surveys API
    await page.route('**/api/surveys**', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            surveys: [
              {
                id: 1,
                title: 'Test Survey',
                description: 'Survey description',
                status: 'draft',
                response_count: 0,
                created_at: new Date().toISOString()
              }
            ],
            meta: { current_page: 1, last_page: 1, total: 1 }
          })
        });
      } else if (request.method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            survey: {
              id: 2,
              title: 'New Survey',
              description: 'New survey description',
              status: 'draft',
              response_count: 0
            }
          })
        });
      }
    });

    // Navigate to surveys page
    await page.goto('http://localhost:3000/surveys');
    await expect(page.locator('text=Sorğu İdarəetməsi')).toBeVisible();

    // Create new survey
    await page.click('text=Yeni Sorğu');
    await expect(page.locator('[data-testid="create-survey-modal"]')).toBeVisible();

    await page.fill('[data-testid="survey-title"]', 'New Survey');
    await page.fill('[data-testid="survey-description"]', 'New survey description');
    await page.selectOption('[data-testid="survey-type"]', 'form');

    await page.click('[data-testid="save-survey-button"]');

    // Verify survey was created
    await expect(page.locator('text=Sorğu uğurla yaradıldı')).toBeVisible();
    await expect(page.locator('text=New Survey')).toBeVisible();
  });

  test('should handle institution management', async ({ page }) => {
    // Mock institutions API
    await page.route('**/api/institutions**', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: 1,
                name: 'Təhsil Nazirliyi',
                level: 1,
                type: 'ministry',
                is_active: true,
                children_count: 5
              },
              {
                id: 2,
                name: 'Bakı Şəhər Təhsil İdarəsi',
                level: 2,
                type: 'region',
                is_active: true,
                children_count: 10,
                parent_id: 1
              }
            ],
            meta: { current_page: 1, last_page: 1, total: 2 }
          })
        });
      }
    });

    // Navigate to institutions page
    await page.goto('http://localhost:3000/institutions');
    await expect(page.locator('text=Təssisət İdarəetməsi')).toBeVisible();

    // Verify institutions are displayed
    await expect(page.locator('text=Təhsil Nazirliyi')).toBeVisible();
    await expect(page.locator('text=Bakı Şəhər Təhsil İdarəsi')).toBeVisible();

    // Test institution filtering
    await page.selectOption('[data-testid="level-filter"]', '1');
    await expect(page.locator('text=Təhsil Nazirliyi')).toBeVisible();

    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'Bakı');
    await page.press('[data-testid="search-input"]', 'Enter');
    await expect(page.locator('text=Bakı Şəhər Təhsil İdarəsi')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/users**', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Server error'
        })
      });
    });

    await page.goto('http://localhost:3000/users');

    // Should show error message
    await expect(page.locator('text=Xəta baş verdi')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();

    // Test error dismissal
    await page.click('[data-testid="dismiss-error"]');
    await expect(page.locator('text=Xəta baş verdi')).not.toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/users**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [],
          meta: { current_page: 1, last_page: 1, total: 0 }
        })
      });
    });

    await page.goto('http://localhost:3000/users');

    // Should show loading state
    await expect(page.locator('text=Yüklənir...')).toBeVisible();

    // Wait for loading to complete
    await expect(page.locator('text=Yüklənir...')).not.toBeVisible({ timeout: 2000 });
    await expect(page.locator('text=Heç bir istifadəçi tapılmadı')).toBeVisible();
  });

  test('should handle navigation and routing', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Test main navigation
    const navigationItems = [
      { text: 'Dashboard', url: /dashboard/ },
      { text: 'İstifadəçilər', url: /users/ },
      { text: 'Təssisətlər', url: /institutions/ },
      { text: 'Sorğular', url: /surveys/ },
      { text: 'Tapşırıqlar', url: /tasks/ },
    ];

    for (const item of navigationItems) {
      await page.click(`text=${item.text}`);
      await expect(page).toHaveURL(item.url);
      
      // Verify page loads correctly
      await expect(page.locator('body')).not.toHaveClass(/loading/);
    }
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');

    // Mobile menu should be visible
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
    
    // Desktop navigation should be hidden
    await expect(page.locator('[data-testid="desktop-navigation"]')).not.toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Navigation should adapt to tablet size
    await expect(page.locator('[data-testid="navigation"]')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Full desktop navigation should be visible
    await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-menu-button"]')).not.toBeVisible();
  });
});