import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://127.0.0.1:8001/api'

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

  // Users endpoints
  http.get(`${API_BASE_URL}/users`, () => {
    return HttpResponse.json({
      users: [
        {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          role_id: 1,
          institution_id: 1,
          is_active: true,
          roles: [{ name: 'regionadmin' }]
        },
        {
          id: 2,
          username: 'teacher',
          email: 'teacher@example.com',
          role_id: 2,
          institution_id: 1,
          is_active: true,
          roles: [{ name: 'müəllim' }]
        }
      ],
      meta: {
        current_page: 1,
        per_page: 10,
        total: 2,
        last_page: 1
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
]