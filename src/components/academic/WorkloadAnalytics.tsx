import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, BarChart3, TrendingUp, Users, Clock, BookOpen, Download, Filter } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TeacherInfo, TeachingLoad, WorkloadSummary, AnalyticsData } from './types/teachingLoadTypes';

interface WorkloadAnalyticsProps {
  teachers: TeacherInfo[];
  teachingLoads: TeachingLoad[];
  workloadSummaries: WorkloadSummary[];
  academicYear: number;
}

const WorkloadAnalytics: React.FC<WorkloadAnalyticsProps> = ({
  teachers,
  teachingLoads,
  workloadSummaries,
  academicYear,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'utilization' | 'balance' | 'efficiency' | 'trends'>('utilization');
  const [timeRange, setTimeRange] = useState<'current' | 'semester' | 'year'>('current');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  useEffect(() => {
    generateAnalytics();
  }, [teachers, teachingLoads, workloadSummaries, timeRange, departmentFilter]);

  const generateAnalytics = async () => {
    try {
      const response = await fetch(`/api/teaching-loads/analytics?academic_year=${academicYear}&time_range=${timeRange}&department=${departmentFilter}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
      }
    } catch (error) {
      console.error('Analytics generation error:', error);
      // Generate local analytics as fallback
      generateLocalAnalytics();
    }
  };

  const generateLocalAnalytics = () => {
    const analytics: AnalyticsData = {
      overall_statistics: {
        total_teachers: teachers.length,
        total_loads: teachingLoads.length,
        average_utilization: workloadSummaries.reduce((sum, s) => sum + s.utilization_percentage, 0) / workloadSummaries.length || 0,
        optimal_teachers: workloadSummaries.filter(s => s.status === 'optimal').length,
        overloaded_teachers: workloadSummaries.filter(s => s.status === 'overloaded' || s.status === 'critical').length,
        underloaded_teachers: workloadSummaries.filter(s => s.status === 'underloaded').length,
      },
      utilization_distribution: [
        { range: '0-25%', count: workloadSummaries.filter(s => s.utilization_percentage < 25).length, percentage: 0 },
        { range: '25-50%', count: workloadSummaries.filter(s => s.utilization_percentage >= 25 && s.utilization_percentage < 50).length, percentage: 0 },
        { range: '50-75%', count: workloadSummaries.filter(s => s.utilization_percentage >= 50 && s.utilization_percentage < 75).length, percentage: 0 },
        { range: '75-90%', count: workloadSummaries.filter(s => s.utilization_percentage >= 75 && s.utilization_percentage < 90).length, percentage: 0 },
        { range: '90-100%', count: workloadSummaries.filter(s => s.utilization_percentage >= 90 && s.utilization_percentage <= 100).length, percentage: 0 },
        { range: '100%+', count: workloadSummaries.filter(s => s.utilization_percentage > 100).length, percentage: 0 },
      ],
      subject_distribution: [],
      workload_trends: [],
      teacher_performance: [],
    };

    // Calculate percentages
    analytics.utilization_distribution.forEach(item => {
      item.percentage = analytics.overall_statistics.total_teachers > 0 ? 
        (item.count / analytics.overall_statistics.total_teachers) * 100 : 0;
    });

    setAnalyticsData(analytics);
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/teaching-loads/analytics/export?academic_year=${academicYear}&format=excel`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `workload-analytics-${academicYear}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const departmentOptions = useMemo(() => {
    const departments = [...new Set(teachers.map(t => t.department).filter(Boolean))];
    return departments;
  }, [teachers]);

  const renderOverallStatistics = () => {
    if (!analyticsData) return null;

    const { overall_statistics } = analyticsData;

    return (
      <div className="statistics-grid">
        <Card className="stat-card">
          <div className="stat-header">
            <Users size={24} />
            <span className="stat-label">Ümumi Müəllimlər</span>
          </div>
          <div className="stat-value">{overall_statistics.total_teachers}</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <BookOpen size={24} />
            <span className="stat-label">Aktiv Təyinatlar</span>
          </div>
          <div className="stat-value">{overall_statistics.total_loads}</div>
        </Card>

        <Card className="stat-card">
          <div className="stat-header">
            <TrendingUp size={24} />
            <span className="stat-label">Orta İstifadə</span>
          </div>
          <div className="stat-value">{overall_statistics.average_utilization.toFixed(1)}%</div>
        </Card>

        <Card className="stat-card optimal">
          <div className="stat-header">
            <span className="stat-label">Optimal</span>
          </div>
          <div className="stat-value">{overall_statistics.optimal_teachers}</div>
          <div className="stat-percentage">
            {((overall_statistics.optimal_teachers / overall_statistics.total_teachers) * 100).toFixed(1)}%
          </div>
        </Card>

        <Card className="stat-card overloaded">
          <div className="stat-header">
            <span className="stat-label">Çox Yüklü</span>
          </div>
          <div className="stat-value">{overall_statistics.overloaded_teachers}</div>
          <div className="stat-percentage">
            {((overall_statistics.overloaded_teachers / overall_statistics.total_teachers) * 100).toFixed(1)}%
          </div>
        </Card>

        <Card className="stat-card underloaded">
          <div className="stat-header">
            <span className="stat-label">Az Yüklü</span>
          </div>
          <div className="stat-value">{overall_statistics.underloaded_teachers}</div>
          <div className="stat-percentage">
            {((overall_statistics.underloaded_teachers / overall_statistics.total_teachers) * 100).toFixed(1)}%
          </div>
        </Card>
      </div>
    );
  };

  const renderUtilizationChart = () => {
    if (!analyticsData) return null;

    const maxCount = Math.max(...analyticsData.utilization_distribution.map(item => item.count));

    return (
      <Card className="utilization-chart">
        <div className="chart-header">
          <h3>
            <BarChart3 size={20} />
            İstifadə Faizi Bölgüsü
          </h3>
        </div>

        <div className="chart-content">
          <div className="chart-bars">
            {analyticsData.utilization_distribution.map((item, index) => (
              <div key={index} className="chart-bar-group">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${(item.count / maxCount) * 100}%`,
                      backgroundColor: getUtilizationColor(item.range)
                    }}
                  />
                  <span className="bar-value">{item.count}</span>
                </div>
                <div className="bar-label">{item.range}</div>
                <div className="bar-percentage">{item.percentage.toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  const getUtilizationColor = (range: string) => {
    switch (range) {
      case '0-25%': return '#ff4444';
      case '25-50%': return '#ff8800';
      case '50-75%': return '#ffaa00';
      case '75-90%': return '#44ff44';
      case '90-100%': return '#00aa44';
      case '100%+': return '#ff4444';
      default: return '#888888';
    }
  };

  const renderWorkloadBalance = () => {
    const balanceData = workloadSummaries.map(summary => ({
      name: summary.teacher_name,
      balance_score: summary.workload_balance_score,
      utilization: summary.utilization_percentage,
      status: summary.status,
    })).sort((a, b) => b.balance_score - a.balance_score);

    return (
      <Card className="workload-balance">
        <div className="balance-header">
          <h3>
            <PieChart size={20} />
            İş Yükü Balansı
          </h3>
        </div>

        <div className="balance-list">
          {balanceData.slice(0, 10).map((item, index) => (
            <div key={index} className={`balance-item status-${item.status}`}>
              <div className="teacher-info">
                <span className="teacher-name">{item.name}</span>
                <span className="teacher-utilization">{item.utilization.toFixed(1)}%</span>
              </div>
              <div className="balance-score">
                <div className="score-bar">
                  <div 
                    className="score-fill"
                    style={{ width: `${item.balance_score}%` }}
                  />
                </div>
                <span className="score-value">{item.balance_score.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderTeacherEfficiency = () => {
    const efficiencyData = workloadSummaries.map(summary => {
      const efficiency = summary.preferred_subject_percentage || 0;
      return {
        name: summary.teacher_name,
        efficiency,
        subject_count: summary.subject_count,
        class_count: summary.class_count,
      };
    }).sort((a, b) => b.efficiency - a.efficiency);

    return (
      <Card className="teacher-efficiency">
        <div className="efficiency-header">
          <h3>
            <TrendingUp size={20} />
            Müəllim Səmərəliliği
          </h3>
        </div>

        <div className="efficiency-list">
          {efficiencyData.slice(0, 10).map((item, index) => (
            <div key={index} className="efficiency-item">
              <div className="teacher-info">
                <span className="teacher-name">{item.name}</span>
                <div className="teacher-stats">
                  <span>{item.subject_count} fənn</span>
                  <span>{item.class_count} sinif</span>
                </div>
              </div>
              <div className="efficiency-score">
                <div className="score-circle">
                  <svg width="40" height="40">
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#e0e0e0"
                      strokeWidth="3"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="#4caf50"
                      strokeWidth="3"
                      strokeDasharray={`${(item.efficiency / 100) * 100.48} 100.48`}
                      transform="rotate(-90 20 20)"
                    />
                  </svg>
                  <span className="score-text">{item.efficiency.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  const renderFilters = () => {
    return (
      <Card className="analytics-filters">
        <div className="filter-group">
          <label>Metrik:</label>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
          >
            <option value="utilization">İstifadə Analizi</option>
            <option value="balance">Balans Analizi</option>
            <option value="efficiency">Səmərəlilik Analizi</option>
            <option value="trends">Trend Analizi</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Vaxt aralığı:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="current">Cari dövrü</option>
            <option value="semester">Semestr</option>
            <option value="year">İl</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Şöbə:</label>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="all">Bütün şöbələr</option>
            {departmentOptions.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={exportAnalytics}
        >
          <Download size={16} />
          Export
        </Button>
      </Card>
    );
  };

  const renderAnalyticsContent = () => {
    switch (selectedMetric) {
      case 'utilization':
        return renderUtilizationChart();
      case 'balance':
        return renderWorkloadBalance();
      case 'efficiency':
        return renderTeacherEfficiency();
      case 'trends':
        return <div>Trend analizi hazırlanır...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="workload-analytics">
      {renderFilters()}
      {renderOverallStatistics()}
      {renderAnalyticsContent()}
    </div>
  );
};

export default WorkloadAnalytics;