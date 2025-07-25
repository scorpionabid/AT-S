import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../contexts/AuthContext';
import SurveysList from '../SurveysList';
import { surveyService } from '../../../services/surveyService';

// Mock API responses
const mockSurveys = {
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
};

const mockCreateResponse = {
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
};

// Mock user data
const mockUser = {
  id: 1,
  username: 'admin',
  email: 'admin@test.com',
  roles: ['regionadmin'],
  permissions: ['manage_surveys', 'view_surveys', 'create_surveys', 'edit_surveys', 'delete_surveys']
};

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SurveysList Component', () => {
  let mockGetSurveys: any;
  let mockCreateSurvey: any;
  let mockUpdateSurvey: any;
  let mockDeleteSurvey: any;
  let mockPublishSurvey: any;
  let mockUnpublishSurvey: any;

  beforeEach(() => {
    // Mock API functions
    mockGetSurveys = vi.spyOn(surveyService, 'getSurveys')
      .mockResolvedValue(mockSurveys);
    
    mockCreateSurvey = vi.spyOn(surveyService, 'createSurvey')
      .mockResolvedValue(mockCreateResponse);
    
    mockUpdateSurvey = vi.spyOn(surveyService, 'updateSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu uğurla yeniləndi',
        data: { ...mockSurveys.data[0], title: 'Yenilənmiş Başlıq' }
      });
    
    mockDeleteSurvey = vi.spyOn(surveyService, 'deleteSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu uğurla silindi'
      });

    mockPublishSurvey = vi.spyOn(surveyService, 'publishSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu dərc edildi'
      });

    mockUnpublishSurvey = vi.spyOn(surveyService, 'unpublishSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu geri götürüldü'
      });

    // Mock localStorage for auth
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'auth_token') return 'mock-token';
          if (key === 'user_data') return JSON.stringify(mockUser);
          return null;
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    expect(screen.getByText(/yüklənir/i)).toBeInTheDocument();
  });

  it('renders surveys list after loading', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    expect(screen.getByText('Şagird Məmnunluq Araşdırması')).toBeInTheDocument();
    expect(screen.getByText('Valideyn Rəy Sorğusu')).toBeInTheDocument();
  });

  it('displays survey details correctly', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check descriptions
    expect(screen.getByText('Müəllimlər üçün aylıq qiymətləndirmə formu')).toBeInTheDocument();
    expect(screen.getByText('Şagirdlərin məktəb xidmətlərindən məmnunluq səviyyəsi')).toBeInTheDocument();

    // Check response counts
    expect(screen.getByText('156/200 cavab')).toBeInTheDocument();
    expect(screen.getByText('0/500 cavab')).toBeInTheDocument();
    expect(screen.getByText('89/100 cavab')).toBeInTheDocument();

    // Check sections and questions counts
    expect(screen.getByText('4 bölmə, 25 sual')).toBeInTheDocument();
    expect(screen.getByText('6 bölmə, 35 sual')).toBeInTheDocument();
    expect(screen.getByText('3 bölmə, 18 sual')).toBeInTheDocument();
  });

  it('shows survey status badges correctly', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check status badges
    expect(screen.getByText('Aktiv')).toBeInTheDocument();
    expect(screen.getByText('Qaralama')).toBeInTheDocument();
    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
  });

  it('shows create survey button for authorized users', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/yeni sorğu/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /yeni sorğu/i });
    expect(createButton).toBeInTheDocument();
  });

  it('opens create modal when create button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/yeni sorğu/i)).toBeInTheDocument();
    });

    const createButton = screen.getByRole('button', { name: /yeni sorğu/i });
    await user.click(createButton);

    expect(screen.getByText(/sorğu əlavə et/i)).toBeInTheDocument();
  });

  it('handles search functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/sorğu axtar/i);
    await user.type(searchInput, 'Müəllim');

    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Müəllim'
        })
      );
    });
  });

  it('handles status filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const statusFilter = screen.getByRole('combobox', { name: /status/i });
    await user.selectOptions(statusFilter, 'active');

    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active'
        })
      );
    });
  });

  it('handles date range filter', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const startDateInput = screen.getByLabelText(/başlanğıc tarix/i);
    const endDateInput = screen.getByLabelText(/bitmə tarix/i);

    await user.type(startDateInput, '2024-01-01');
    await user.type(endDateInput, '2024-01-31');

    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: '2024-01-01',
          end_date: '2024-01-31'
        })
      );
    });
  });

  it('shows action buttons for each survey', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check for edit buttons
    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i });
    expect(editButtons).toHaveLength(3);

    // Check for delete buttons
    const deleteButtons = screen.getAllByRole('button', { name: /sil/i });
    expect(deleteButtons).toHaveLength(3);

    // Check for view responses buttons
    const responseButtons = screen.getAllByRole('button', { name: /cavablar/i });
    expect(responseButtons).toHaveLength(3);
  });

  it('shows publish/unpublish buttons based on survey status', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Published surveys should have unpublish button
    expect(screen.getByRole('button', { name: /geri götür/i })).toBeInTheDocument();

    // Draft surveys should have publish button
    expect(screen.getByRole('button', { name: /dərc et/i })).toBeInTheDocument();
  });

  it('opens edit modal when edit button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i });
    await user.click(editButtons[0]);

    expect(screen.getByText(/sorğu redaktə et/i)).toBeInTheDocument();
  });

  it('shows confirmation dialog when delete button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /sil/i });
    await user.click(deleteButtons[0]);

    expect(screen.getByText(/silmək istədiyinizdən əminsiniz/i)).toBeInTheDocument();
  });

  it('handles survey publishing', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Şagird Məmnunluq Araşdırması')).toBeInTheDocument();
    });

    const publishButton = screen.getByRole('button', { name: /dərc et/i });
    await user.click(publishButton);

    await waitFor(() => {
      expect(mockPublishSurvey).toHaveBeenCalledWith(2);
    });
  });

  it('handles survey unpublishing', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const unpublishButton = screen.getByRole('button', { name: /geri götür/i });
    await user.click(unpublishButton);

    await waitFor(() => {
      expect(mockUnpublishSurvey).toHaveBeenCalledWith(1);
    });
  });

  it('shows progress bars for response counts', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check progress indicators
    const progressBars = screen.getAllByRole('progressbar');
    expect(progressBars).toHaveLength(3);

    // Check progress percentages
    expect(screen.getByText('78%')).toBeInTheDocument(); // 156/200
    expect(screen.getByText('0%')).toBeInTheDocument(); // 0/500
    expect(screen.getByText('89%')).toBeInTheDocument(); // 89/100
  });

  it('handles pagination', async () => {
    // Mock paginated response
    const paginatedMock = {
      ...mockSurveys,
      meta: {
        current_page: 1,
        last_page: 3,
        per_page: 15,
        total: 45
      }
    };

    mockGetSurveys.mockResolvedValue(paginatedMock);

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check pagination info
    expect(screen.getByText(/45 nəticədən 1-3/i)).toBeInTheDocument();

    // Check pagination controls
    expect(screen.getByRole('button', { name: /növbəti/i })).toBeInTheDocument();
  });

  it('handles error state', async () => {
    mockGetSurveys.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/xəta baş verdi/i)).toBeInTheDocument();
    });

    // Check retry button
    expect(screen.getByRole('button', { name: /yenidən cəhd et/i })).toBeInTheDocument();
  });

  it('shows empty state when no surveys found', async () => {
    mockGetSurveys.mockResolvedValue({
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
      }
    });

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/sorğu tapılmadı/i)).toBeInTheDocument();
    });
  });

  it('handles refresh functionality', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /yenilə/i });
    await user.click(refreshButton);

    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledTimes(2);
    });
  });

  it('shows survey analytics link', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check for analytics buttons
    const analyticsButtons = screen.getAllByRole('button', { name: /analitika/i });
    expect(analyticsButtons).toHaveLength(2); // Only for published surveys
  });

  it('handles bulk operations on surveys', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Select multiple surveys
    const checkboxes = screen.getAllByRole('checkbox');
    await user.click(checkboxes[1]); // First survey
    await user.click(checkboxes[2]); // Second survey

    // Check if bulk action buttons appear
    expect(screen.getByText(/seçilmiş/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toplu əməliyyat/i })).toBeInTheDocument();
  });

  it('shows survey creator information', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check creator names
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Survey Admin')).toBeInTheDocument();
  });

  it('shows survey date ranges correctly', async () => {
    render(
      <TestWrapper>
        <SurveysList />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument();
    });

    // Check date ranges
    expect(screen.getByText('01.01.2024 - 31.01.2024')).toBeInTheDocument();
    expect(screen.getByText('01.02.2024 - 28.02.2024')).toBeInTheDocument();
    expect(screen.getByText('01.12.2023 - 31.12.2023')).toBeInTheDocument();
  });
});