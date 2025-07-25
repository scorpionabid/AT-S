import React from 'react';
import { BookOpen } from 'lucide-react';

interface SubjectDistributionChartProps {
  data: Array<{
    subject_name: string;
    teacher_count: number;
    total_hours: number;
    average_hours_per_teacher: number;
  }>;
}

const SubjectDistributionChart: React.FC<SubjectDistributionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="subject-chart-empty">
        <BookOpen size={32} />
        <p>Fənn bölgüsü məlumatları mövcud deyil</p>
      </div>
    );
  }

  const maxHours = Math.max(...data.map(d => d.total_hours));
  const colors = [
    '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];

  return (
    <div className="subject-distribution-chart">
      <div className="subject-bars">
        {data.map((item, index) => {
          const barHeight = maxHours > 0 ? (item.total_hours / maxHours) * 100 : 0;
          const color = colors[index % colors.length];
          
          return (
            <div key={index} className="subject-bar-container">
              <div className="subject-bar">
                <div 
                  className="bar-fill"
                  style={{ 
                    height: `${barHeight}%`,
                    backgroundColor: color,
                    transition: 'height 0.6s ease'
                  }}
                />
                <div className="bar-value">{item.total_hours}s</div>
              </div>
              
              <div className="subject-info">
                <div className="subject-name" title={item.subject_name}>
                  {item.subject_name.length > 8 
                    ? item.subject_name.substring(0, 8) + '...'
                    : item.subject_name
                  }
                </div>
                <div className="subject-stats">
                  <span className="teacher-count">{item.teacher_count} müəllim</span>
                  <span className="avg-hours">{item.average_hours_per_teacher.toFixed(1)}s/m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary statistics */}
      <div className="subject-summary">
        <div className="summary-item">
          <span className="summary-label">Ümumi fənnlər:</span>
          <span className="summary-value">{data.length}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Ümumi saatlar:</span>
          <span className="summary-value">{data.reduce((sum, item) => sum + item.total_hours, 0)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Orta yük:</span>
          <span className="summary-value">
            {data.length > 0 
              ? (data.reduce((sum, item) => sum + item.average_hours_per_teacher, 0) / data.length).toFixed(1)
              : 0
            }s
          </span>
        </div>
      </div>
    </div>
  );
};

export default SubjectDistributionChart;