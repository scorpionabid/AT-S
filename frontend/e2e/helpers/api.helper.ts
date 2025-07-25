import { Page } from '@playwright/test';

export class ApiHelper {
  constructor(private page: Page) {}

  /**
   * Mock API responses for testing
   */
  async mockApiResponses(routes: Record<string, any>) {
    for (const [pattern, response] of Object.entries(routes)) {
      await this.page.route(pattern, async route => {
        await route.fulfill({
          status: response.status || 200,
          contentType: 'application/json',
          body: JSON.stringify(response.body || response)
        });
      });
    }
  }

  /**
   * Mock paginated API response
   */
  async mockPaginatedResponse(pattern: string, data: any[], meta = {}) {
    await this.page.route(pattern, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data,
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: data.length,
            from: 1,
            to: data.length,
            ...meta
          }
        })
      });
    });
  }

  /**
   * Mock error response
   */
  async mockErrorResponse(pattern: string, status = 500, message = 'Server xətası') {
    await this.page.route(pattern, async route => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({
          message,
          success: false
        })
      });
    });
  }

  /**
   * Mock validation errors
   */
  async mockValidationErrors(pattern: string, errors: Record<string, string[]>) {
    await this.page.route(pattern, async route => {
      await route.fulfill({
        status: 422,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Validation failed',
          errors,
          success: false
        })
      });
    });
  }

  /**
   * Mock successful CRUD operations
   */
  async mockCrudOperations(basePattern: string, resource: string, sampleData: any) {
    // GET list
    await this.page.route(`**/${basePattern}`, async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [sampleData],
            meta: {
              current_page: 1,
              last_page: 1,
              per_page: 15,
              total: 1
            }
          })
        });
      }
    });

    // POST create
    await this.page.route(`**/${basePattern}`, async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            ...sampleData,
            id: Date.now() // Mock new ID
          })
        });
      }
    });

    // PUT update
    await this.page.route(`**/${basePattern}/*`, async route => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...sampleData,
            updated_at: new Date().toISOString()
          })
        });
      }
    });

    // DELETE
    await this.page.route(`**/${basePattern}/*`, async route => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            message: `${resource} uğurla silindi`
          })
        });
      }
    });
  }

  /**
   * Mock search functionality
   */
  async mockSearchResults(pattern: string, searchTerm: string, results: any[]) {
    await this.page.route(`**/${pattern}?*search=${searchTerm}*`, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: results,
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: results.length
          }
        })
      });
    });
  }

  /**
   * Mock file upload
   */
  async mockFileUpload(pattern: string, uploadResponse: any) {
    await this.page.route(pattern, async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Fayl uğurla yükləndi',
          data: uploadResponse
        })
      });
    });
  }

  /**
   * Mock slow API response for loading states
   */
  async mockSlowResponse(pattern: string, delay = 2000, response: any = {}) {
    await this.page.route(pattern, async route => {
      await new Promise(resolve => setTimeout(resolve, delay));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  /**
   * Clear all route mocks
   */
  async clearMocks() {
    await this.page.unrouteAll();
  }

  /**
   * Mock network failure
   */
  async mockNetworkFailure(pattern: string) {
    await this.page.route(pattern, async route => {
      await route.abort('failed');
    });
  }
}