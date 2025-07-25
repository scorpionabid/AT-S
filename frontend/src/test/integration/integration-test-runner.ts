/**
 * Integration Test Runner
 * 
 * This file provides utilities for running integration tests
 * that test the full workflow between API and Frontend components.
 */

import { vi } from 'vitest'

/**
 * Setup utilities for integration tests
 */
export const integrationTestSetup = {
  /**
   * Mock localStorage for authentication
   */
  mockAuthLocalStorage: (userData = {}) => {
    const defaultUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      roles: ['müəllim'],
      permissions: ['dashboard.view']
    }

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'auth_token') return 'mock-token'
          if (key === 'user_data') return JSON.stringify({ ...defaultUser, ...userData })
          return null
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })
  },

  /**
   * Mock window.location for navigation tests
   */
  mockWindowLocation: () => {
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn()
      },
      writable: true
    })
  },

  /**
   * Mock console methods to prevent noise in tests
   */
  mockConsole: () => {
    global.console = {
      ...console,
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
  },

  /**
   * Reset all mocks between tests
   */
  resetMocks: () => {
    vi.clearAllMocks()
  }
}

/**
 * Test data factories for consistent test data
 */
export const testDataFactories = {
  /**
   * Create mock user data
   */
  createUser: (overrides = {}) => ({
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: {
      id: 1,
      name: 'müəllim',
      display_name: 'Müəllim',
      level: 6
    },
    institution: {
      id: 1,
      name: 'Test School'
    },
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  /**
   * Create mock survey data
   */
  createSurvey: (overrides = {}) => ({
    id: 1,
    title: 'Test Survey',
    description: 'Test survey description',
    status: 'draft',
    is_published: false,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    response_count: 0,
    target_count: 100,
    sections_count: 1,
    questions_count: 5,
    creator: {
      id: 1,
      username: 'admin',
      first_name: 'Admin',
      last_name: 'User'
    },
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  /**
   * Create mock institution data
   */
  createInstitution: (overrides = {}) => ({
    id: 1,
    name: 'Test Institution',
    institution_code: 'TST001',
    type: 'school',
    level: 4,
    is_active: true,
    parent_id: null,
    children_count: 0,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  /**
   * Create mock role data
   */
  createRole: (overrides = {}) => ({
    id: 1,
    name: 'müəllim',
    display_name: 'Müəllim',
    description: 'Teacher role',
    level: 6,
    is_active: true,
    permissions_count: 10,
    users_count: 5,
    created_at: '2024-01-01T00:00:00Z',
    ...overrides
  }),

  /**
   * Create paginated API response
   */
  createPaginatedResponse: (data: any[], overrides = {}) => ({
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: data.length,
      from: 1,
      to: data.length,
      ...overrides
    }
  })
}

/**
 * Common API response mocks
 */
export const apiResponseMocks = {
  /**
   * Success response
   */
  success: (data: any, message = 'Əməliyyat uğurla tamamlandı') => ({
    success: true,
    message,
    data
  }),

  /**
   * Error response
   */
  error: (message = 'Xəta baş verdi', status = 400) => ({
    success: false,
    message,
    errors: {},
    status
  }),

  /**
   * Validation error response
   */
  validationError: (errors: Record<string, string[]>) => ({
    success: false,
    message: 'Validation failed',
    errors,
    status: 422
  }),

  /**
   * Not found response
   */
  notFound: (message = 'Məlumat tapılmadı') => ({
    success: false,
    message,
    status: 404
  }),

  /**
   * Unauthorized response
   */
  unauthorized: (message = 'Giriş icazəsi yoxdur') => ({
    success: false,
    message,
    status: 401
  }),

  /**
   * Forbidden response
   */
  forbidden: (message = 'Bu əməliyyat üçün icazəniz yoxdur') => ({
    success: false,
    message,
    status: 403
  })
}

/**
 * Wait for specific conditions in tests
 */
export const waitForCondition = {
  /**
   * Wait for element to appear
   */
  elementToAppear: async (getElement: () => Element | null, timeout = 5000) => {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      const element = getElement()
      if (element) return element
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    throw new Error(`Element did not appear within ${timeout}ms`)
  },

  /**
   * Wait for API call to complete
   */
  apiCall: async (mockFn: any, timeout = 5000) => {
    const startTime = Date.now()
    
    while (Date.now() - startTime < timeout) {
      if (mockFn.mock.calls.length > 0) return
      await new Promise(resolve => setTimeout(resolve, 50))
    }
    
    throw new Error(`API call did not complete within ${timeout}ms`)
  }
}

/**
 * Test scenarios for common workflows
 */
export const testScenarios = {
  /**
   * Test CRUD operations
   */
  testCRUD: {
    /**
     * Test create operation
     */
    create: async (
      renderComponent: () => void,
      openCreateForm: () => Promise<void>,
      fillForm: (data: any) => Promise<void>,
      submitForm: () => Promise<void>,
      verifyApiCall: (mockFn: any, expectedData: any) => void,
      verifyRefresh: (mockFn: any) => void
    ) => {
      renderComponent()
      await openCreateForm()
      await fillForm({})
      await submitForm()
      verifyApiCall(vi.fn(), {})
      verifyRefresh(vi.fn())
    },

    /**
     * Test read operation
     */
    read: async (
      renderComponent: () => void,
      verifyDataLoaded: () => void,
      verifyApiCall: (mockFn: any) => void
    ) => {
      renderComponent()
      verifyApiCall(vi.fn())
      verifyDataLoaded()
    },

    /**
     * Test update operation
     */
    update: async (
      renderComponent: () => void,
      openEditForm: () => Promise<void>,
      updateForm: (data: any) => Promise<void>,
      submitForm: () => Promise<void>,
      verifyApiCall: (mockFn: any, expectedData: any) => void,
      verifyRefresh: (mockFn: any) => void
    ) => {
      renderComponent()
      await openEditForm()
      await updateForm({})
      await submitForm()
      verifyApiCall(vi.fn(), {})
      verifyRefresh(vi.fn())
    },

    /**
     * Test delete operation
     */
    delete: async (
      renderComponent: () => void,
      openDeleteConfirmation: () => Promise<void>,
      confirmDelete: () => Promise<void>,
      verifyApiCall: (mockFn: any, expectedId: number) => void,
      verifyRefresh: (mockFn: any) => void
    ) => {
      renderComponent()
      await openDeleteConfirmation()
      await confirmDelete()
      verifyApiCall(vi.fn(), 1)
      verifyRefresh(vi.fn())
    }
  }
}

export default {
  integrationTestSetup,
  testDataFactories,
  apiResponseMocks,
  waitForCondition,
  testScenarios
}