import { test, expect } from '@playwright/test';

test.describe('User Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            roles: ['regionadmin'],
            permissions: ['manage_users', 'create_users', 'view_users']
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
          username: 'admin',
          email: 'admin@example.com',
          roles: ['regionadmin'],
          permissions: ['manage_users', 'create_users', 'view_users']
        })
      });
    });

    // Mock users list endpoint
    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              role: {
                id: 1,
                name: 'regionadmin',
                display_name: 'Regional Administrator'
              },
              institution: {
                id: 1,
                name: 'Test School'
              },
              is_active: true,
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              username: 'teacher',
              email: 'teacher@example.com',
              first_name: 'Teacher',
              last_name: 'User',
              role: {
                id: 2,
                name: 'müəllim',
                display_name: 'Müəllim'
              },
              institution: {
                id: 1,
                name: 'Test School'
              },
              is_active: true,
              created_at: '2024-01-02T00:00:00Z'
            }
          ],
          meta: {
            current_page: 1,
            per_page: 10,
            total: 2,
            last_page: 1,
            from: 1,
            to: 2
          }
        })
      });
    });

    // Mock roles endpoint
    await page.route('**/api/roles', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'regionadmin',
              display_name: 'Regional Administrator'
            },
            {
              id: 2,
              name: 'müəllim',
              display_name: 'Müəllim'
            }
          ]
        })
      });
    });

    // Mock institutions endpoint
    await page.route('**/api/institutions', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 1,
              name: 'Test School',
              type: 'school'
            }
          ]
        })
      });
    });

    // Login first
    await page.goto('/');
    await page.locator('input[name="login"]').fill('admin');
    await page.locator('input[name="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    
    // Navigate to users page
    await page.waitForURL('**/dashboard');
    await page.locator('a[href="/users"]').click();
    await page.waitForURL('**/users');
  });

  test('should display users list correctly', async ({ page }) => {
    // Wait for users list to load
    await expect(page.locator('h1')).toContainText('İstifadəçi İdarəetməsi');
    
    // Check if users are displayed
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=teacher')).toBeVisible();
    
    // Check user details
    await expect(page.locator('text=admin@example.com')).toBeVisible();
    await expect(page.locator('text=teacher@example.com')).toBeVisible();
    await expect(page.locator('text=Regional Administrator')).toBeVisible();
    await expect(page.locator('text=Müəllim')).toBeVisible();
  });

  test('should handle user search functionality', async ({ page }) => {
    // Mock search response
    await page.route('**/api/users?*search=admin*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              role: {
                id: 1,
                name: 'regionadmin',
                display_name: 'Regional Administrator'
              },
              institution: {
                id: 1,
                name: 'Test School'
              },
              is_active: true,
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          meta: {
            current_page: 1,
            per_page: 10,
            total: 1,
            last_page: 1,
            from: 1,
            to: 1
          }
        })
      });
    });

    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Use search functionality
    await page.locator('input[placeholder*="İstifadəçi axtar"]').fill('admin');
    await page.keyboard.press('Enter');

    // Wait for search results
    await expect(page.locator('text=admin')).toBeVisible();
    await expect(page.locator('text=teacher')).not.toBeVisible();
  });

  test('should open and close create user modal', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Click create button
    await page.locator('button', { hasText: 'Yeni İstifadəçi' }).click();

    // Check if modal opens
    await expect(page.locator('text=İstifadəçi Əlavə Et')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Close modal
    await page.locator('button', { hasText: '×' }).click();

    // Check if modal closes
    await expect(page.locator('text=İstifadəçi Əlavə Et')).not.toBeVisible();
  });

  test('should create new user successfully', async ({ page }) => {
    // Mock user creation
    await page.route('**/api/users', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 3,
            username: 'newuser',
            email: 'newuser@example.com',
            first_name: 'New',
            last_name: 'User',
            role: {
              id: 2,
              name: 'müəllim',
              display_name: 'Müəllim'
            },
            institution: {
              id: 1,
              name: 'Test School'
            },
            is_active: true,
            created_at: '2024-01-03T00:00:00Z'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Open create modal
    await page.locator('button', { hasText: 'Yeni İstifadəçi' }).click();
    await expect(page.locator('text=İstifadəçi Əlavə Et')).toBeVisible();

    // Fill form
    await page.locator('input[name="username"]').fill('newuser');
    await page.locator('input[name="email"]').fill('newuser@example.com');
    await page.locator('input[name="first_name"]').fill('New');
    await page.locator('input[name="last_name"]').fill('User');
    await page.locator('input[name="password"]').fill('password123');
    
    // Select role and institution
    await page.locator('select[name="role_id"]').selectOption('2');
    await page.locator('select[name="institution_id"]').selectOption('1');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for modal to close and success message
    await expect(page.locator('text=İstifadəçi Əlavə Et')).not.toBeVisible();
    await expect(page.locator('text=İstifadəçi uğurla yaradıldı')).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Open create modal
    await page.locator('button', { hasText: 'Yeni İstifadəçi' }).click();
    await expect(page.locator('text=İstifadəçi Əlavə Et')).toBeVisible();

    // Try to submit empty form
    await page.locator('button[type="submit"]').click();

    // Check for validation errors
    await expect(page.locator('text=İstifadəçi adı tələb olunur')).toBeVisible();
    await expect(page.locator('text=E-poçt tələb olunur')).toBeVisible();
    await expect(page.locator('text=Şifrə tələb olunur')).toBeVisible();
  });

  test('should handle user editing', async ({ page }) => {
    // Mock user update
    await page.route('**/api/users/1', async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            first_name: 'Updated',
            last_name: 'Admin',
            role: {
              id: 1,
              name: 'regionadmin',
              display_name: 'Regional Administrator'
            },
            institution: {
              id: 1,
              name: 'Test School'
            },
            is_active: true,
            created_at: '2024-01-01T00:00:00Z'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Click edit button for first user
    await page.locator('button', { hasText: 'Düzəliş' }).first().click();

    // Wait for edit modal
    await expect(page.locator('text=İstifadəçi Redaktə Et')).toBeVisible();

    // Update first name
    await page.locator('input[name="first_name"]').fill('Updated');

    // Submit form
    await page.locator('button[type="submit"]').click();

    // Wait for modal to close and success message
    await expect(page.locator('text=İstifadəçi Redaktə Et')).not.toBeVisible();
    await expect(page.locator('text=İstifadəçi uğurla yeniləndi')).toBeVisible();
  });

  test('should handle user deletion with confirmation', async ({ page }) => {
    // Mock user deletion
    await page.route('**/api/users/2', async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: 'İstifadəçi uğurla silindi'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Click delete button for second user
    await page.locator('button', { hasText: 'Sil' }).nth(1).click();

    // Wait for confirmation dialog
    await expect(page.locator('text=Silmək istədiyinizdən əminsiniz?')).toBeVisible();

    // Confirm deletion
    await page.locator('button', { hasText: 'Bəli' }).click();

    // Wait for success message
    await expect(page.locator('text=İstifadəçi uğurla silindi')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Mock paginated response
    await page.route('**/api/users?*page=2*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            {
              id: 3,
              username: 'user3',
              email: 'user3@example.com',
              first_name: 'User',
              last_name: 'Three',
              role: {
                id: 2,
                name: 'müəllim',
                display_name: 'Müəllim'
              },
              institution: {
                id: 1,
                name: 'Test School'
              },
              is_active: true,
              created_at: '2024-01-03T00:00:00Z'
            }
          ],
          meta: {
            current_page: 2,
            per_page: 2,
            total: 3,
            last_page: 2,
            from: 3,
            to: 3
          }
        })
      });
    });

    // Mock first page with pagination
    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            {
              id: 1,
              username: 'admin',
              email: 'admin@example.com',
              first_name: 'Admin',
              last_name: 'User',
              role: {
                id: 1,
                name: 'regionadmin',
                display_name: 'Regional Administrator'
              },
              institution: {
                id: 1,
                name: 'Test School'
              },
              is_active: true,
              created_at: '2024-01-01T00:00:00Z'
            },
            {
              id: 2,
              username: 'teacher',
              email: 'teacher@example.com',
              first_name: 'Teacher',
              last_name: 'User',
              role: {
                id: 2,
                name: 'müəllim',
                display_name: 'Müəllim'
              },
              institution: {
                id: 1,
                name: 'Test School'
              },
              is_active: true,
              created_at: '2024-01-02T00:00:00Z'
            }
          ],
          meta: {
            current_page: 1,
            per_page: 2,
            total: 3,
            last_page: 2,
            from: 1,
            to: 2
          }
        })
      });
    });

    // Reload page to get paginated data
    await page.reload();

    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Check pagination info
    await expect(page.locator('text=3 nəticədən 1-2')).toBeVisible();

    // Click next page
    await page.locator('button', { hasText: 'Növbəti' }).click();

    // Wait for second page
    await expect(page.locator('text=user3')).toBeVisible();
    await expect(page.locator('text=3 nəticədən 3-3')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock error response
    await page.route('**/api/users', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Server xətası'
        })
      });
    });

    // Reload page to trigger error
    await page.reload();

    // Wait for error message
    await expect(page.locator('text=Xəta baş verdi')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Yenidən Cəhd Et' })).toBeVisible();
  });

  test('should maintain responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for page to load
    await expect(page.locator('text=admin')).toBeVisible();

    // Check if elements are still accessible on mobile
    await expect(page.locator('button', { hasText: 'Yeni İstifadəçi' })).toBeVisible();
    await expect(page.locator('input[placeholder*="İstifadəçi axtar"]')).toBeVisible();

    // Test mobile navigation
    await page.locator('button', { hasText: 'Yeni İstifadəçi' }).click();
    await expect(page.locator('text=İstifadəçi Əlavə Et')).toBeVisible();
  });
});