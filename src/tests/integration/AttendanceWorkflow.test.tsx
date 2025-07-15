import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import AttendanceList from '../../components/attendance/AttendanceList';
import AttendanceForm from '../../components/attendance/AttendanceForm';
import AttendanceStats from '../../components/attendance/AttendanceStats';
import * as attendanceService from '../../services/attendanceService';

// Mock API responses
const mockApiResponses = {
  attendanceList: {
    success: true,
    data: [
      {
        id: 1,
        class: { id: 1, name: '9A', grade_level: 9, section: 'A' },
        subject: { id: 1, name: 'Riyaziyyat', short_name: 'RIY' },
        teacher: { id: 1, first_name: 'Müəllim', last_name: 'Adı' },
        attendance_date: '2024-01-15',
        period_number: 1,
        students_present: 23,
        total_students_registered: 25,
        approval_status: 'approved',
        lesson_status: 'completed'
      },
      {
        id: 2,
        class: { id: 1, name: '9A', grade_level: 9, section: 'A' },
        subject: { id: 2, name: 'Fizika', short_name: 'FİZ' },
        teacher: { id: 2, first_name: 'Fizika', last_name: 'Müəllimi' },
        attendance_date: '2024-01-15',
        period_number: 2,
        students_present: 24,
        total_students_registered: 25,
        approval_status: 'pending',
        lesson_status: 'completed'
      }
    ],
    pagination: {
      current_page: 1,
      total_pages: 1,
      per_page: 15,
      total: 2
    }
  },
  createAttendanceSuccess: {
    success: true,
    message: 'Davamiyyət qeydi uğurla yaradıldı',
    data: {
      id: 3,
      class_id: 1,
      subject_id: 1,
      attendance_date: '2024-01-16',
      period_number: 1,
      students_present: 22,
      total_students_registered: 25,
      approval_status: 'pending',
      lesson_status: 'completed'
    }
  },
  approveAttendanceSuccess: {
    success: true,
    message: 'Davamiyyət qeydi təsdiqləndi',
    data: {
      id: 2,
      approval_status: 'approved',
      approved_by: 3,
      approved_at: '2024-01-16T10:30:00Z'
    }
  },
  attendanceStats: {
    success: true,
    data: {
      total_lessons: 45,
      total_students_registered: 1125,
      total_students_present: 1012,
      avg_attendance_rate: 89.96,
      lessons_by_status: {
        completed: 42,
        cancelled: 2,
        partial: 1,
        substituted: 0
      },
      approval_status: {
        pending: 5,
        approved: 38,
        rejected: 1,
        needs_review: 1
      },
      daily_breakdown: [
        {
          date: '2024-01-15',
          lessons: 6,
          total_registered: 150,
          total_present: 138,
          attendance_rate: 92.0
        }
      ]
    },
    period: {
      start_date: '2024-01-01',
      end_date: '2024-01-31'
    }
  }
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

describe('Attendance Management Workflow Integration Tests', () => {
  let mockGetAttendanceList: any;
  let mockCreateAttendance: any;
  let mockUpdateAttendance: any;
  let mockApproveAttendance: any;
  let mockGetAttendanceStats: any;
  let mockGetClasses: any;
  let mockGetSubjects: any;

  beforeEach(() => {
    // Mock API functions
    mockGetAttendanceList = vi.spyOn(attendanceService, 'getAttendanceList');
    mockCreateAttendance = vi.spyOn(attendanceService, 'createAttendance');
    mockUpdateAttendance = vi.spyOn(attendanceService, 'updateAttendance');
    mockApproveAttendance = vi.spyOn(attendanceService, 'approveAttendance');
    mockGetAttendanceStats = vi.spyOn(attendanceService, 'getAttendanceStats');

    // Mock class and subject data
    mockGetClasses = vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: '9A', grade_level: 9, section: 'A', current_enrollment: 25 }
      ]
    });

    mockGetSubjects = vi.fn().mockResolvedValue({
      success: true,
      data: [
        { id: 1, name: 'Riyaziyyat', short_name: 'RIY', code: 'MATH' },
        { id: 2, name: 'Fizika', short_name: 'FİZ', code: 'PHYS' }
      ]
    });

    // Set up authenticated user (teacher)
    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('user_data', JSON.stringify({
      id: 1,
      username: 'teacher1',
      first_name: 'Müəllim',
      last_name: 'Adı',
      roles: ['müəllim'],
      institution: { id: 1, name: 'Test School' }
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('Attendance List Display', () => {
    it('should display attendance records with correct information', async () => {
      mockGetAttendanceList.mockResolvedValue(mockApiResponses.attendanceList);

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('9A')).toBeInTheDocument();
        expect(screen.getByText('Riyaziyyat')).toBeInTheDocument();
        expect(screen.getByText('Fizika')).toBeInTheDocument();
      });

      // Check attendance numbers
      expect(screen.getByText('23/25')).toBeInTheDocument(); // Math class
      expect(screen.getByText('24/25')).toBeInTheDocument(); // Physics class

      // Check approval status
      expect(screen.getByText('Təsdiqlənmiş')).toBeInTheDocument();
      expect(screen.getByText('Gözləmədə')).toBeInTheDocument();
    });

    it('should filter attendance records by class', async () => {
      mockGetAttendanceList.mockResolvedValue(mockApiResponses.attendanceList);

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('9A')).toBeInTheDocument();
      });

      // Apply class filter
      const classFilter = screen.getByLabelText(/sinif/i);
      fireEvent.change(classFilter, { target: { value: '1' } });

      // Verify API called with filter
      await waitFor(() => {
        expect(mockGetAttendanceList).toHaveBeenCalledWith(
          expect.objectContaining({ class_id: '1' })
        );
      });
    });

    it('should filter attendance records by approval status', async () => {
      mockGetAttendanceList.mockResolvedValue(mockApiResponses.attendanceList);

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('9A')).toBeInTheDocument();
      });

      // Apply approval status filter
      const statusFilter = screen.getByLabelText(/təsdiq statusu/i);
      fireEvent.change(statusFilter, { target: { value: 'pending' } });

      // Verify API called with filter
      await waitFor(() => {
        expect(mockGetAttendanceList).toHaveBeenCalledWith(
          expect.objectContaining({ approval_status: 'pending' })
        );
      });
    });
  });

  describe('Attendance Creation', () => {
    it('should create new attendance record successfully', async () => {
      mockCreateAttendance.mockResolvedValue(mockApiResponses.createAttendanceSuccess);

      render(
        <TestWrapper>
          <AttendanceForm classes={mockGetClasses} subjects={mockGetSubjects} />
        </TestWrapper>
      );

      // Fill form fields
      const classSelect = screen.getByLabelText(/sinif/i);
      const subjectSelect = screen.getByLabelText(/fənn/i);
      const dateInput = screen.getByLabelText(/tarix/i);
      const periodInput = screen.getByLabelText(/dərs saatı/i);
      const presentInput = screen.getByLabelText(/iştirak edən/i);
      const totalInput = screen.getByLabelText(/ümumi say/i);

      fireEvent.change(classSelect, { target: { value: '1' } });
      fireEvent.change(subjectSelect, { target: { value: '1' } });
      fireEvent.change(dateInput, { target: { value: '2024-01-16' } });
      fireEvent.change(periodInput, { target: { value: '1' } });
      fireEvent.change(presentInput, { target: { value: '22' } });
      fireEvent.change(totalInput, { target: { value: '25' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /yadda saxla/i });
      fireEvent.click(submitButton);

      // Verify API call
      await waitFor(() => {
        expect(mockCreateAttendance).toHaveBeenCalledWith(
          expect.objectContaining({
            class_id: '1',
            subject_id: '1',
            attendance_date: '2024-01-16',
            period_number: '1',
            students_present: '22',
            total_students_registered: '25'
          })
        );
      });

      // Check success message
      expect(screen.getByText(/davamiyyət qeydi uğurla yaradıldı/i)).toBeInTheDocument();
    });

    it('should validate form fields before submission', async () => {
      render(
        <TestWrapper>
          <AttendanceForm classes={mockGetClasses} subjects={mockGetSubjects} />
        </TestWrapper>
      );

      // Try to submit empty form
      const submitButton = screen.getByRole('button', { name: /yadda saxla/i });
      fireEvent.click(submitButton);

      // Check validation errors
      await waitFor(() => {
        expect(screen.getByText(/sinif seçilməlidir/i)).toBeInTheDocument();
        expect(screen.getByText(/fənn seçilməlidir/i)).toBeInTheDocument();
        expect(screen.getByText(/tarix daxil edilməlidir/i)).toBeInTheDocument();
      });

      // Verify API not called
      expect(mockCreateAttendance).not.toHaveBeenCalled();
    });

    it('should validate attendance numbers logic', async () => {
      render(
        <TestWrapper>
          <AttendanceForm classes={mockGetClasses} subjects={mockGetSubjects} />
        </TestWrapper>
      );

      // Fill with invalid numbers (present > total)
      const presentInput = screen.getByLabelText(/iştirak edən/i);
      const totalInput = screen.getByLabelText(/ümumi say/i);

      fireEvent.change(totalInput, { target: { value: '20' } });
      fireEvent.change(presentInput, { target: { value: '25' } });

      const submitButton = screen.getByRole('button', { name: /yadda saxla/i });
      fireEvent.click(submitButton);

      // Check validation error
      await waitFor(() => {
        expect(screen.getByText(/iştirak edən şagird sayı ümumi saydan çox ola bilməz/i)).toBeInTheDocument();
      });
    });
  });

  describe('Attendance Approval Workflow', () => {
    it('should approve attendance record successfully', async () => {
      mockGetAttendanceList.mockResolvedValue(mockApiResponses.attendanceList);
      mockApproveAttendance.mockResolvedValue(mockApiResponses.approveAttendanceSuccess);

      // Set up admin user
      localStorage.setItem('user_data', JSON.stringify({
        id: 3,
        username: 'admin1',
        first_name: 'Admin',
        last_name: 'User',
        roles: ['schooladmin'],
        institution: { id: 1, name: 'Test School' }
      }));

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Gözləmədə')).toBeInTheDocument();
      });

      // Find and click approve button for pending record
      const pendingRow = screen.getByText('Gözləmədə').closest('tr');
      const approveButton = within(pendingRow!).getByRole('button', { name: /təsdiqlə/i });
      fireEvent.click(approveButton);

      // Confirm approval in modal
      const confirmButton = await screen.findByRole('button', { name: /təsdiqlə/i });
      fireEvent.click(confirmButton);

      // Verify API call
      await waitFor(() => {
        expect(mockApproveAttendance).toHaveBeenCalledWith(
          2,
          expect.objectContaining({
            approval_status: 'approved'
          })
        );
      });

      // Check success message
      expect(screen.getByText(/davamiyyət qeydi təsdiqləndi/i)).toBeInTheDocument();
    });

    it('should reject attendance record with comments', async () => {
      mockGetAttendanceList.mockResolvedValue(mockApiResponses.attendanceList);
      mockApproveAttendance.mockResolvedValue({
        success: true,
        message: 'Davamiyyət qeydi rədd edildi'
      });

      // Set up admin user
      localStorage.setItem('user_data', JSON.stringify({
        id: 3,
        username: 'admin1',
        roles: ['schooladmin']
      }));

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('Gözləmədə')).toBeInTheDocument();
      });

      // Find and click reject button
      const pendingRow = screen.getByText('Gözləmədə').closest('tr');
      const rejectButton = within(pendingRow!).getByRole('button', { name: /rədd et/i });
      fireEvent.click(rejectButton);

      // Add rejection comments
      const commentsInput = await screen.findByLabelText(/şərh/i);
      fireEvent.change(commentsInput, { target: { value: 'Yanlış məlumatlar' } });

      // Confirm rejection
      const confirmButton = screen.getByRole('button', { name: /rədd et/i });
      fireEvent.click(confirmButton);

      // Verify API call with comments
      await waitFor(() => {
        expect(mockApproveAttendance).toHaveBeenCalledWith(
          2,
          expect.objectContaining({
            approval_status: 'rejected',
            comments: 'Yanlış məlumatlar'
          })
        );
      });
    });
  });

  describe('Attendance Statistics', () => {
    it('should display attendance statistics correctly', async () => {
      mockGetAttendanceStats.mockResolvedValue(mockApiResponses.attendanceStats);

      render(
        <TestWrapper>
          <AttendanceStats />
        </TestWrapper>
      );

      // Wait for stats to load
      await waitFor(() => {
        expect(screen.getByText('45')).toBeInTheDocument(); // total lessons
        expect(screen.getByText('89.96%')).toBeInTheDocument(); // attendance rate
      });

      // Check breakdown stats
      expect(screen.getByText('42')).toBeInTheDocument(); // completed lessons
      expect(screen.getByText('38')).toBeInTheDocument(); // approved records
      expect(screen.getByText('5')).toBeInTheDocument(); // pending records
    });

    it('should filter statistics by date range', async () => {
      mockGetAttendanceStats.mockResolvedValue(mockApiResponses.attendanceStats);

      render(
        <TestWrapper>
          <AttendanceStats />
        </TestWrapper>
      );

      // Change date range
      const startDateInput = screen.getByLabelText(/başlanğıc tarix/i);
      const endDateInput = screen.getByLabelText(/son tarix/i);

      fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

      // Apply filter
      const applyButton = screen.getByRole('button', { name: /tətbiq et/i });
      fireEvent.click(applyButton);

      // Verify API called with date range
      await waitFor(() => {
        expect(mockGetAttendanceStats).toHaveBeenCalledWith(
          expect.objectContaining({
            start_date: '2024-01-01',
            end_date: '2024-01-31'
          })
        );
      });
    });
  });

  describe('Bulk Operations', () => {
    it('should perform bulk approval of attendance records', async () => {
      mockGetAttendanceList.mockResolvedValue(mockApiResponses.attendanceList);
      const mockBulkApprove = vi.fn().mockResolvedValue({
        success: true,
        message: 'Seçilmiş qeydlər təsdiqləndi',
        processed_count: 2
      });

      // Set up admin user
      localStorage.setItem('user_data', JSON.stringify({
        id: 3,
        roles: ['schooladmin']
      }));

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByText('9A')).toBeInTheDocument();
      });

      // Select multiple records
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // Select first record
      fireEvent.click(checkboxes[2]); // Select second record

      // Perform bulk approval
      const bulkApproveButton = screen.getByRole('button', { name: /seçilmişləri təsdiqlə/i });
      fireEvent.click(bulkApproveButton);

      // Confirm action
      const confirmButton = await screen.findByRole('button', { name: /təsdiqlə/i });
      fireEvent.click(confirmButton);

      // Check success message
      await waitFor(() => {
        expect(screen.getByText(/seçilmiş qeydlər təsdiqləndi/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      mockGetAttendanceList.mockRejectedValue(new Error('Network Error'));

      render(
        <TestWrapper>
          <AttendanceList />
        </TestWrapper>
      );

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/məlumatlar yüklənərkən xəta baş verdi/i)).toBeInTheDocument();
      });
    });

    it('should handle form submission errors', async () => {
      mockCreateAttendance.mockRejectedValue({
        response: {
          status: 422,
          data: {
            success: false,
            message: 'Validation failed',
            errors: {
              students_present: ['İştirak edən şagird sayı ümumi saydan çox ola bilməz']
            }
          }
        }
      });

      render(
        <TestWrapper>
          <AttendanceForm classes={mockGetClasses} subjects={mockGetSubjects} />
        </TestWrapper>
      );

      // Fill and submit form with invalid data
      const presentInput = screen.getByLabelText(/iştirak edən/i);
      fireEvent.change(presentInput, { target: { value: '30' } });

      const submitButton = screen.getByRole('button', { name: /yadda saxla/i });
      fireEvent.click(submitButton);

      // Check error message
      await waitFor(() => {
        expect(screen.getByText(/iştirak edən şagird sayı ümumi saydan çox ola bilməz/i)).toBeInTheDocument();
      });
    });
  });
});