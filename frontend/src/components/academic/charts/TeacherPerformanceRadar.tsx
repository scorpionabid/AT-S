import React from 'react';

interface TeacherPerformanceRadarProps {
  data: Array<{
    teacher_id: number;
    teacher_name: string;
    efficiency_score: number;
    student_satisfaction: number;
    workload_stability: number;
  }>;
  selectedTeacherId?: number;
  onTeacherSelect?: (teacherId: number) => void;
}

const TeacherPerformanceRadar: React.FC<TeacherPerformanceRadarProps> = ({ 
  data, 
  selectedTeacherId,
  onTeacherSelect 
}) => {
  const activeTeachers = data.filter(t => t.efficiency_score > 0);
  
  if (activeTeachers.length === 0) {
    return (
      <div className="radar-chart-empty">
        <p>Performans məlumatları mövcud deyil</p>
      </div>
    );
  }

  const selectedTeacher = activeTeachers.find(t => t.teacher_id === selectedTeacherId) || activeTeachers[0];
  
  const radarData = [
    { 
      label: 'Səmərəlilik', 
      value: selectedTeacher.efficiency_score,
      max: 100,
      color: '#3b82f6'
    },
    { 
      label: 'Şagird Məmnuniyyəti', 
      value: selectedTeacher.student_satisfaction * 20, // Convert 5-point scale to 100
      max: 100,
      color: '#22c55e'
    },
    { 
      label: 'İş Yükü Sabitliyi', 
      value: selectedTeacher.workload_stability,
      max: 100,
      color: '#f59e0b'
    }
  ];

  const center = 100;
  const maxRadius = 80;
  const levels = 5;

  // Generate radar chart paths
  const generateRadarPath = (values: number[]) => {
    const angles = values.map((_, index) => (index * 2 * Math.PI) / values.length - Math.PI / 2);
    const points = values.map((value, index) => {
      const radius = (value / 100) * maxRadius;
      const x = center + radius * Math.cos(angles[index]);
      const y = center + radius * Math.sin(angles[index]);
      return `${x},${y}`;
    });
    return `M${points.join('L')}Z`;
  };

  const radarPath = generateRadarPath(radarData.map(d => d.value));
  const radarAngles = radarData.map((_, index) => (index * 2 * Math.PI) / radarData.length - Math.PI / 2);

  return (
    <div className="radar-chart-container">
      <div className="radar-header">
        <h4>Müəllim Performansı</h4>
        <select 
          value={selectedTeacher.teacher_id} 
          onChange={(e) => onTeacherSelect?.(parseInt(e.target.value))}
          className="teacher-selector"
        >
          {activeTeachers.map(teacher => (
            <option key={teacher.teacher_id} value={teacher.teacher_id}>
              {teacher.teacher_name}
            </option>
          ))}
        </select>
      </div>

      <svg width="200" height="200" className="radar-chart">
        {/* Background grid circles */}
        {Array.from({ length: levels }, (_, i) => {
          const radius = ((i + 1) / levels) * maxRadius;
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Radar axes */}
        {radarAngles.map((angle, index) => {
          const x2 = center + maxRadius * Math.cos(angle);
          const y2 = center + maxRadius * Math.sin(angle);
          
          return (
            <g key={index}>
              <line
                x1={center}
                y1={center}
                x2={x2}
                y2={y2}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              
              {/* Axis labels */}
              <text
                x={center + (maxRadius + 15) * Math.cos(angle)}
                y={center + (maxRadius + 15) * Math.sin(angle) + 4}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
                className="radar-label"
              >
                {radarData[index].label}
              </text>
            </g>
          );
        })}

        {/* Radar data area */}
        <path
          d={radarPath}
          fill="rgba(59, 130, 246, 0.2)"
          stroke="#3b82f6"
          strokeWidth="2"
          className="radar-area"
        />

        {/* Data points */}
        {radarData.map((item, index) => {
          const angle = radarAngles[index];
          const radius = (item.value / 100) * maxRadius;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={item.color}
              stroke="#ffffff"
              strokeWidth="2"
              className="radar-point"
            />
          );
        })}
      </svg>

      {/* Performance metrics */}
      <div className="radar-metrics">
        {radarData.map((metric, index) => (
          <div key={index} className="metric-item">
            <div 
              className="metric-color"
              style={{ backgroundColor: metric.color }}
            />
            <div className="metric-info">
              <span className="metric-label">{metric.label}</span>
              <span className="metric-value">
                {metric.label === 'Şagird Məmnuniyyəti' 
                  ? `${(metric.value / 20).toFixed(1)}/5`
                  : `${metric.value.toFixed(1)}%`
                }
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Overall score */}
      <div className="overall-score">
        <div className="score-label">Ümumi Bal</div>
        <div className="score-value">
          {(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length).toFixed(1)}
        </div>
      </div>
    </div>
  );
};

export default TeacherPerformanceRadar;