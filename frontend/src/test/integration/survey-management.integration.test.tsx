import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import SurveysList from '../../components/surveys/SurveysList'
import SurveyCreateForm from '../../components/surveys/SurveyCreateForm'
import { surveyService } from '../../services/surveyService'

// Integration test wrapper
const IntegrationTestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('Survey Management Integration Tests', () => {
  let mockGetSurveys: any
  let mockCreateSurvey: any
  let mockUpdateSurvey: any
  let mockDeleteSurvey: any
  let mockPublishSurvey: any
  let mockUnpublishSurvey: any

  const mockSurveys = [
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
    }
  ]

  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'auth_token') return 'mock-token'
          if (key === 'user_data') return JSON.stringify({
            id: 1,
            username: 'admin',
            roles: ['regionadmin'],
            permissions: ['manage_surveys', 'create_surveys', 'view_surveys']
          })
          return null
        }),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn()
      },
      writable: true
    })

    // Mock API services
    mockGetSurveys = vi.spyOn(surveyService, 'getSurveys')
      .mockResolvedValue({
        data: mockSurveys,
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 2
        }
      })

    mockCreateSurvey = vi.spyOn(surveyService, 'createSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu uğurla yaradıldı',
        data: {
          id: 3,
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
      })

    mockUpdateSurvey = vi.spyOn(surveyService, 'updateSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu uğurla yeniləndi',
        data: { ...mockSurveys[0], title: 'Yenilənmiş Başlıq' }
      })

    mockDeleteSurvey = vi.spyOn(surveyService, 'deleteSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu uğurla silindi'
      })

    mockPublishSurvey = vi.spyOn(surveyService, 'publishSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu dərc edildi'
      })

    mockUnpublishSurvey = vi.spyOn(surveyService, 'unpublishSurvey')
      .mockResolvedValue({
        success: true,
        message: 'Sorğu geri götürüldü'
      })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should load and display surveys list on component mount', async () => {
    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Step 1: Verify loading state
    expect(screen.getByText(/yüklənir/i)).toBeInTheDocument()

    // Step 2: Wait for API call to complete
    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalled()
    })

    // Step 3: Verify surveys are displayed
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
      expect(screen.getByText('Şagird Məmnunluq Araşdırması')).toBeInTheDocument()
    })

    // Step 4: Verify survey details are shown
    expect(screen.getByText('Müəllimlər üçün aylıq qiymətləndirmə formu')).toBeInTheDocument()
    expect(screen.getByText('156/200 cavab')).toBeInTheDocument()
    expect(screen.getByText('4 bölmə, 25 sual')).toBeInTheDocument()
  })

  it('should create new survey through modal form', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Open create form
    const createButton = screen.getByRole('button', { name: /yeni sorğu/i })
    await user.click(createButton)

    // Step 2: Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText(/sorğu əlavə et/i)).toBeInTheDocument()
    })

    // Step 3: Fill basic survey information
    const titleInput = screen.getByLabelText(/başlıq/i)
    const descriptionInput = screen.getByLabelText(/təsvir/i)
    const startDateInput = screen.getByLabelText(/başlanğıc tarix/i)
    const endDateInput = screen.getByLabelText(/bitmə tarix/i)

    await user.type(titleInput, 'Yeni Test Sorğusu')
    await user.type(descriptionInput, 'Bu test sorğusudur')
    await user.type(startDateInput, '2024-03-01')
    await user.type(endDateInput, '2024-03-31')

    // Step 4: Submit form
    const submitButton = screen.getByRole('button', { name: /yadda saxla/i })
    await user.click(submitButton)

    // Step 5: Verify API call was made
    await waitFor(() => {
      expect(mockCreateSurvey).toHaveBeenCalledWith({
        title: 'Yeni Test Sorğusu',
        description: 'Bu test sorğusudur',
        start_date: '2024-03-01',
        end_date: '2024-03-31'
      })
    })

    // Step 6: Verify surveys list is refreshed
    expect(mockGetSurveys).toHaveBeenCalledTimes(2) // Initial load + refresh after create
  })

  it('should handle survey publishing workflow', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Şagird Məmnunluq Araşdırması')).toBeInTheDocument()
    })

    // Step 1: Find and click publish button for draft survey
    const publishButton = screen.getByRole('button', { name: /dərc et/i })
    await user.click(publishButton)

    // Step 2: Verify API call was made
    await waitFor(() => {
      expect(mockPublishSurvey).toHaveBeenCalledWith(2)
    })

    // Step 3: Verify surveys list is refreshed
    expect(mockGetSurveys).toHaveBeenCalledTimes(2) // Initial load + refresh after publish
  })

  it('should handle survey unpublishing workflow', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Find and click unpublish button for active survey
    const unpublishButton = screen.getByRole('button', { name: /geri götür/i })
    await user.click(unpublishButton)

    // Step 2: Verify API call was made
    await waitFor(() => {
      expect(mockUnpublishSurvey).toHaveBeenCalledWith(1)
    })

    // Step 3: Verify surveys list is refreshed
    expect(mockGetSurveys).toHaveBeenCalledTimes(2) // Initial load + refresh after unpublish
  })

  it('should handle survey filtering by status', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Find and use status filter
    const statusFilter = screen.getByRole('combobox', { name: /status/i })
    await user.selectOptions(statusFilter, 'active')

    // Step 2: Verify API call with filter
    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active'
        })
      )
    })
  })

  it('should handle survey search functionality', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Find and use search input
    const searchInput = screen.getByPlaceholderText(/sorğu axtar/i)
    await user.type(searchInput, 'Müəllim')

    // Step 2: Verify API call with search parameter
    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Müəllim'
        })
      )
    })
  })

  it('should handle survey deletion with confirmation', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Click delete button for first survey
    const deleteButtons = screen.getAllByRole('button', { name: /sil/i })
    await user.click(deleteButtons[0])

    // Step 2: Verify confirmation dialog appears
    await waitFor(() => {
      expect(screen.getByText(/silmək istədiyinizdən əminsiniz/i)).toBeInTheDocument()
    })

    // Step 3: Confirm deletion
    const confirmButton = screen.getByRole('button', { name: /bəli/i })
    await user.click(confirmButton)

    // Step 4: Verify API call was made
    await waitFor(() => {
      expect(mockDeleteSurvey).toHaveBeenCalledWith(1)
    })

    // Step 5: Verify surveys list is refreshed
    expect(mockGetSurveys).toHaveBeenCalledTimes(2) // Initial load + refresh after delete
  })

  it('should display survey progress indicators correctly', async () => {
    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Verify progress bars are displayed
    const progressBars = screen.getAllByRole('progressbar')
    expect(progressBars).toHaveLength(2)

    // Step 2: Verify progress percentages
    expect(screen.getByText('78%')).toBeInTheDocument() // 156/200
    expect(screen.getByText('0%')).toBeInTheDocument() // 0/500
  })

  it('should handle survey editing workflow', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Click edit button for first survey
    const editButtons = screen.getAllByRole('button', { name: /düzəliş/i })
    await user.click(editButtons[0])

    // Step 2: Wait for edit modal to open
    await waitFor(() => {
      expect(screen.getByText(/sorğu redaktə et/i)).toBeInTheDocument()
    })

    // Step 3: Update survey information
    const titleInput = screen.getByDisplayValue('Müəllim Qiymətləndirmə Sorğusu')
    await user.clear(titleInput)
    await user.type(titleInput, 'Yenilənmiş Sorğu Başlığı')

    // Step 4: Submit form
    const submitButton = screen.getByRole('button', { name: /yadda saxla/i })
    await user.click(submitButton)

    // Step 5: Verify API call was made
    await waitFor(() => {
      expect(mockUpdateSurvey).toHaveBeenCalledWith(1, {
        title: 'Yenilənmiş Sorğu Başlığı'
      })
    })

    // Step 6: Verify surveys list is refreshed
    expect(mockGetSurveys).toHaveBeenCalledTimes(2) // Initial load + refresh after update
  })

  it('should handle date range filtering', async () => {
    const user = userEvent.setup()

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Müəllim Qiymətləndirmə Sorğusu')).toBeInTheDocument()
    })

    // Step 1: Find and use date range filters
    const startDateFilter = screen.getByLabelText(/başlanğıc tarix/i)
    const endDateFilter = screen.getByLabelText(/bitmə tarix/i)

    await user.type(startDateFilter, '2024-01-01')
    await user.type(endDateFilter, '2024-01-31')

    // Step 2: Verify API call with date filters
    await waitFor(() => {
      expect(mockGetSurveys).toHaveBeenCalledWith(
        expect.objectContaining({
          start_date: '2024-01-01',
          end_date: '2024-01-31'
        })
      )
    })
  })

  it('should handle API errors gracefully', async () => {
    // Mock API error
    mockGetSurveys.mockRejectedValue(new Error('Network error'))

    render(
      <IntegrationTestWrapper>
        <SurveysList />
      </IntegrationTestWrapper>
    )

    // Step 1: Verify error state is shown
    await waitFor(() => {
      expect(screen.getByText(/xəta baş verdi/i)).toBeInTheDocument()
    })

    // Step 2: Verify retry button is available
    expect(screen.getByRole('button', { name: /yenidən cəhd et/i })).toBeInTheDocument()
  })
})