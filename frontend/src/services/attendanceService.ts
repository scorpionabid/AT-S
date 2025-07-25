import { BaseService } from './base/BaseService';

export interface AttendanceRecord {
  id: number;
  class_id: number;
  student_id: number;
  date: string;
  morning_status: 'present' | 'absent' | 'late' | 'excused';
  afternoon_status: 'present' | 'absent' | 'late' | 'excused';
  created_at: string;
  updated_at: string;
}

export interface AttendanceStats {
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  excused_count: number;
  attendance_percentage: number;
}

export interface AttendanceListResponse {
  data: AttendanceRecord[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: AttendanceStats;
}

class AttendanceService extends BaseService {
  private baseUrl = '/api/attendance';

  /**
   * Get attendance records for a specific class and date
   */
  async getAttendanceList(
    classId: number, 
    date: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<AttendanceListResponse> {
    const params = new URLSearchParams({
      class_id: classId.toString(),
      date,
      page: page.toString(),
      per_page: perPage.toString()
    });

    return this.get(`${this.baseUrl}?${params}`);
  }

  /**
   * Update attendance record
   */
  async updateAttendance(
    id: number,
    data: Partial<AttendanceRecord>
  ): Promise<AttendanceRecord> {
    return this.put(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Create new attendance record
   */
  async createAttendance(
    data: Omit<AttendanceRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<AttendanceRecord> {
    return this.post(this.baseUrl, data);
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(id: number): Promise<void> {
    return this.delete(`${this.baseUrl}/${id}`);
  }

  /**
   * Get attendance statistics for a class
   */
  async getAttendanceStats(
    classId: number,
    startDate: string,
    endDate: string
  ): Promise<AttendanceStats> {
    const params = new URLSearchParams({
      class_id: classId.toString(),
      start_date: startDate,
      end_date: endDate
    });

    return this.get(`${this.baseUrl}/stats?${params}`);
  }

  /**
   * Bulk update attendance records
   */
  async bulkUpdateAttendance(
    records: Array<{
      id: number;
      morning_status?: string;
      afternoon_status?: string;
    }>
  ): Promise<AttendanceRecord[]> {
    return this.post(`${this.baseUrl}/bulk-update`, { records });
  }

  /**
   * Approve attendance record
   */
  async approveAttendance(id: number, comment?: string): Promise<AttendanceRecord> {
    return this.post(`${this.baseUrl}/${id}/approve`, { comment });
  }

  /**
   * Reject attendance record
   */
  async rejectAttendance(id: number, comment: string): Promise<AttendanceRecord> {
    return this.post(`${this.baseUrl}/${id}/reject`, { comment });
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;