import { Page } from '@playwright/test';

export class AuthHelper {
  constructor(private page: Page) {}

  /**
   * Mock successful authentication for tests
   */
  async mockSuccessfulAuth(userData = {}) {
    const defaultUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      roles: ['müəllim'],
      permissions: ['dashboard.view']
    };

    const user = { ...defaultUser, ...userData };

    // Mock login endpoint
    await this.page.route('**/api/login', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          token: 'mock-token',
          user
        })
      });
    });

    // Mock user data endpoint
    await this.page.route('**/api/me', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user)
      });
    });

    // Mock logout endpoint
    await this.page.route('**/api/logout', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Uğurla çıxış edildi'
        })
      });
    });
  }

  /**
   * Mock failed authentication
   */
  async mockFailedAuth(errorMessage = 'Yanlış istifadəçi adı və ya şifrə') {
    await this.page.route('**/api/login', async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: errorMessage
        })
      });
    });
  }

  /**
   * Mock rate limiting
   */
  async mockRateLimit() {
    await this.page.route('**/api/login', async route => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Çox sayda cəhd. Bir neçə dəqiqə sonra yenidən cəhd edin'
        })
      });
    });
  }

  /**
   * Login with credentials
   */
  async login(username: string, password: string) {
    await this.page.goto('/');
    await this.page.locator('input[name="login"]').fill(username);
    await this.page.locator('input[name="password"]').fill(password);
    await this.page.locator('button[type="submit"]').click();
  }

  /**
   * Logout user
   */
  async logout() {
    await this.page.locator('button', { hasText: 'Çıxış' }).click();
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn() {
    try {
      await this.page.locator('text=Dashboard').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if user is on login page
   */
  async isOnLoginPage() {
    try {
      await this.page.locator('h3:has-text("Sisteme Giriş")').waitFor({ timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth() {
    await this.page.waitForURL('**/dashboard');
  }

  /**
   * Mock session expiry
   */
  async mockSessionExpiry() {
    await this.page.route('**/api/me', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Token müddəti bitib'
        })
      });
    });
  }
}