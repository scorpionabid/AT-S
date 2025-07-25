import { http, HttpResponse } from 'msw'

const API_BASE_URL = 'http://localhost:8000/api'

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

  // Institutions endpoints - handle query parameters
  http.get(`${API_BASE_URL}/institutions`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const level = url.searchParams.get('level');
    const type = url.searchParams.get('type');
    const isActive = url.searchParams.get('is_active');
    
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'Təhsil Nazirliyi',
          level: 1,
          type: 'ministry',
          is_active: true,
          parent_id: null,
          children_count: 5,
          created_at: '2024-01-01T00:00:00.000000Z'
        },
        {
          id: 2,
          name: 'Bakı Şəhər Təhsil İdarəsi',
          level: 2,
          type: 'region',
          is_active: true,
          parent_id: 1,
          children_count: 10,
          created_at: '2024-01-02T00:00:00.000000Z'
        },
        {
          id: 3,
          name: 'Test Məktəbi',
          level: 4,
          type: 'school',
          is_active: true,
          parent_id: 2,
          children_count: 0,
          created_at: '2024-01-03T00:00:00.000000Z'
        }
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 3
      }
    })
  }),

  http.post(`${API_BASE_URL}/institutions`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Təssisət uğurla yaradıldı',
      data: {
        id: 4,
        name: 'Yeni Məktəb',
        level: 4,
        type: 'school',
        is_active: true,
        parent_id: 2,
        children_count: 0,
        created_at: '2024-01-04T00:00:00.000000Z'
      }
    }, { status: 201 })
  }),

  http.put(`${API_BASE_URL}/institutions/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Təssisət uğurla yeniləndi'
    })
  }),

  http.delete(`${API_BASE_URL}/institutions/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Təssisət uğurla silindi'
    })
  }),

  // Roles endpoints - handle query parameters
  http.get(`${API_BASE_URL}/roles`, ({ request }) => {
    const url = new URL(request.url);
    const guard = url.searchParams.get('guard');
    const search = url.searchParams.get('search');
    const level = url.searchParams.get('level');
    
    return HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'superadmin',
          display_name: 'Super Administrator',
          description: 'Sistem üzrə tam səlahiyyət',
          level: 1,
          is_active: true,
          permissions_count: 48,
          users_count: 2,
          created_at: '2024-01-01T00:00:00.000000Z'
        },
        {
          id: 2,
          name: 'regionadmin',
          display_name: 'Regional Administrator',
          description: 'Regional səviyyədə idarəetmə',
          level: 2,
          is_active: true,
          permissions_count: 25,
          users_count: 8,
          created_at: '2024-01-02T00:00:00.000000Z'
        },
        {
          id: 3,
          name: 'müəllim',
          display_name: 'Müəllim',
          description: 'Təhsil prosesi idarəetməsi',
          level: 5,
          is_active: true,
          permissions_count: 12,
          users_count: 156,
          created_at: '2024-01-03T00:00:00.000000Z'
        }
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 3
      }
    })
  }),

  // Role permissions endpoint
  http.get(`${API_BASE_URL}/roles/permissions`, () => {
    return HttpResponse.json({
      data: [
        { id: 1, name: 'view_dashboard', display_name: 'Dashboard Görüntülə', category: 'dashboard' },
        { id: 2, name: 'manage_users', display_name: 'İstifadəçi İdarəetməsi', category: 'users' },
        { id: 3, name: 'view_reports', display_name: 'Hesabatları Görüntülə', category: 'reports' },
        { id: 4, name: 'manage_institutions', display_name: 'Təssisət İdarəetməsi', category: 'institutions' }
      ]
    })
  }),

  // Role CRUD operations
  http.post(`${API_BASE_URL}/roles`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Rol uğurla yaradıldı',
      data: {
        id: 4,
        name: 'yeni_rol',
        display_name: 'Yeni Rol',
        description: 'Test rolu',
        level: 6,
        is_active: true,
        permissions_count: 0,
        users_count: 0,
        created_at: '2024-01-04T00:00:00.000000Z'
      }
    }, { status: 201 })
  }),

  http.put(`${API_BASE_URL}/roles/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Rol uğurla yeniləndi',
      data: {
        id: 1,
        name: 'superadmin',
        display_name: 'Yenilənmiş Ad',
        description: 'Sistem üzrə tam səlahiyyət',
        level: 1,
        is_active: true,
        permissions_count: 48,
        users_count: 2
      }
    })
  }),

  http.delete(`${API_BASE_URL}/roles/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Rol uğurla silindi'
    })
  }),

  // Surveys endpoints - handle query parameters
  http.get(`${API_BASE_URL}/surveys`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    
    return HttpResponse.json({
      data: [
        {
          id: 1,
          title: 'Müəllim Qiymətləndirmə Sorğusu',
          description: 'Müəllimlər üçün aylıq qiymətləndirmə formu',
          status: 'active',
          is_published: true,
          start_date: '2024-01-01',
          end_date: '2024-01-31',
          response_count: 156,
          target_count: 200,
          creator: {
            id: 1,
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User'
          },
          sections_count: 4,
          questions_count: 25,
          created_at: '2024-01-01T00:00:00.000000Z',
          updated_at: '2024-01-05T10:30:00.000000Z'
        },
        {
          id: 2,
          title: 'Şagird Məmnunluq Araşdırması',
          description: 'Şagirdlərin məktəb xidmətlərindən məmnunluq səviyyəsi',
          status: 'draft',
          is_published: false,
          start_date: '2024-02-01',
          end_date: '2024-02-28',
          response_count: 0,
          target_count: 500,
          creator: {
            id: 2,
            username: 'survey_admin',
            first_name: 'Survey',
            last_name: 'Admin'
          },
          sections_count: 6,
          questions_count: 35,
          created_at: '2024-01-15T00:00:00.000000Z',
          updated_at: '2024-01-16T14:20:00.000000Z'
        },
        {
          id: 3,
          title: 'Valideyn Rəy Sorğusu',
          description: 'Valideynlərin məktəb fəaliyyətinə dair rəy və təklifləri',
          status: 'completed',
          is_published: true,
          start_date: '2023-12-01',
          end_date: '2023-12-31',
          response_count: 89,
          target_count: 100,
          creator: {
            id: 1,
            username: 'admin',
            first_name: 'Admin',
            last_name: 'User'
          },
          sections_count: 3,
          questions_count: 18,
          created_at: '2023-11-25T00:00:00.000000Z',
          updated_at: '2024-01-02T09:15:00.000000Z'
        }
      ],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 3
      }
    })
  }),

  // Survey CRUD operations
  http.post(`${API_BASE_URL}/surveys`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sorğu uğurla yaradıldı',
      data: {
        id: 4,
        title: 'Yeni Sorğu',
        description: 'Test sorğusu',
        status: 'draft',
        is_published: false,
        sections_count: 0,
        questions_count: 0,
        response_count: 0,
        target_count: 0,
        created_at: '2024-01-20T00:00:00.000000Z'
      }
    }, { status: 201 })
  }),

  http.put(`${API_BASE_URL}/surveys/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sorğu uğurla yeniləndi'
    })
  }),

  http.delete(`${API_BASE_URL}/surveys/:id`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sorğu uğurla silindi'
    })
  }),

  http.post(`${API_BASE_URL}/surveys/:id/publish`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sorğu dərc edildi'
    })
  }),

  http.post(`${API_BASE_URL}/surveys/:id/unpublish`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Sorğu geri götürüldü'
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