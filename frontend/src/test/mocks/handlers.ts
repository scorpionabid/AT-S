import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/login`, () => {
    return HttpResponse.json({
      token: 'mock-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role_id: 1,
        institution_id: 1,
        is_active: true,
        roles: [{ name: 'müəllim' }]
      }
    })
  }),

  http.post(`${API_BASE_URL}/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  }),

  http.get(`${API_BASE_URL}/me`, () => {
    return HttpResponse.json({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role_id: 1,
      institution_id: 1,
      is_active: true,
      roles: [{ name: 'müəllim' }]
    })
  }),

  // Users endpoints - handle query parameters
  http.get(`${API_BASE_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    return HttpResponse.json({
      users: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role: {
            id: 1,
            name: 'regionadmin',
            display_name: 'Regional Administrator',
            level: 2
          },
          role_display_name: 'Regional Administrator',
          is_active: true,
          last_login_at: '2025-01-15T10:30:00Z',
          institution: {
            id: 1,
            name: 'Test School'
          },
          created_at: '2024-12-01T00:00:00Z'
        },
        {
          id: 2,
          username: 'teacher',
          email: 'teacher@example.com',
          role: {
            id: 2,
            name: 'müəllim',
            display_name: 'Müəllim',
            level: 6
          },
          role_display_name: 'Müəllim',
          is_active: true,
          last_login_at: '2025-01-14T14:20:00Z',
          institution: {
            id: 1,
            name: 'Test School'
          },
          created_at: '2024-12-15T00:00:00Z'
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
  }),

  http.post(`${API_BASE_URL}/users`, () => {
    return HttpResponse.json({
      id: 3,
      username: 'newuser',
      email: 'newuser@example.com',
      role_id: 2,
      institution_id: 1,
      is_active: true,
      roles: [{ name: 'müəllim' }]
    }, { status: 201 })
  }),

  // Institutions endpoints
  http.get(`${API_BASE_URL}/institutions`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'Test School',
          institution_code: 'TST001',
          type: 'school',
          level: 4,
          is_active: true,
          contact_info: {
            phone: '1234567890',
            email: 'school@test.com',
            address: 'Test Address'
          }
        }
      ],
      meta: {
        current_page: 1,
        per_page: 10,
        total: 1,
        last_page: 1
      }
    })
  }),

  http.post(`${API_BASE_URL}/institutions`, () => {
    return HttpResponse.json({
      id: 2,
      name: 'New Institution',
      institution_code: 'NEW001',
      type: 'school',
      level: 4,
      is_active: true,
      contact_info: {
        phone: '0987654321',
        email: 'new@test.com',
        address: 'New Address'
      }
    }, { status: 201 })
  }),

  // Roles endpoints
  http.get(`${API_BASE_URL}/roles`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'regionadmin',
        display_name: 'Regional Administrator',
        description: 'Regional education management',
        level: 2
      },
      {
        id: 2,
        name: 'müəllim',
        display_name: 'Müəllim',
        description: 'Teacher',
        level: 6
      }
    ])
  }),

  // Surveys endpoints
  http.get(`${API_BASE_URL}/surveys`, () => {
    return HttpResponse.json({
      data: [
        {
          id: 1,
          title: 'Test Survey',
          description: 'Test survey description',
          status: 'draft',
          survey_type: 'form',
          creator_id: 1,
          is_anonymous: false,
          allow_multiple_responses: false,
          start_date: '2025-01-01',
          end_date: '2025-12-31',
          response_count: 0
        }
      ],
      meta: {
        current_page: 1,
        per_page: 10,
        total: 1,
        last_page: 1
      }
    })
  }),

  // Missing endpoints that tests are looking for
  http.get(`${API_BASE_URL}/users/institutions/available`, () => {
    return HttpResponse.json([
      {
        id: 1,
        name: 'Test School',
        institution_code: 'TST001',
        type: 'school'
      }
    ])
  }),

  // OPTIONS requests (CORS preflight)
  http.options(`${API_BASE_URL}/users`, () => {
    return new HttpResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }),

  http.options(`${API_BASE_URL}/users/institutions/available`, () => {
    return new HttpResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }),

  // Generic fallback for unhandled OPTIONS requests
  http.options('*', () => {
    return new HttpResponse(null, { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    })
  }),
]