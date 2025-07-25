import React from 'react';

interface UtilizationDonutChartProps {
  data: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
}

const UtilizationDonutChart: React.FC<UtilizationDonutChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.count, 0);
  const radius = 80;
  const strokeWidth = 25;
  const center = 100;
  const circumference = 2 * Math.PI * radius;

  // Color scheme for different ranges
  const colors = [
    '#ef4444', // 0-25% - Red (critical)
    '#f97316', // 25-50% - Orange (low)
    '#eab308', // 50-75% - Yellow (moderate)
    '#22c55e', // 75-90% - Green (optimal)
    '#3b82f6', // 90-100% - Blue (high)
    '#8b5cf6', // 100%+ - Purple (overload)
  ];

  let accumulatedPercentage = 0;

  return (
    <div className="donut-chart-container">
      <svg width="200" height="200" className="donut-chart">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        
        {/* Data segments */}
        {data.map((item, index) => {
          if (item.count === 0) return null;
          
          const percentage = total > 0 ? (item.count / total) * 100 : 0;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
          
          const segment = (
            <circle
              key={index}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={colors[index] || '#94a3b8'}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="chart-segment"
              style={{
                transformOrigin: `${center}px ${center}px`,
                transform: 'rotate(-90deg)',
                transition: 'all 0.3s ease'
              }}
            />
          );
          
          accumulatedPercentage += percentage;
          return segment;
        })}
        
        {/* Center text */}
        <text
          x={center}
          y={center - 5}
          textAnchor="middle"
          className="donut-center-number"
          fontSize="24"
          fontWeight="bold"
          fill="#1e293b"
        >
          {total}
        </text>
        <text
          x={center}
          y={center + 15}
          textAnchor="middle"
          className="donut-center-label"
          fontSize="12"
          fill="#64748b"
        >
          Müəllimlər
        </text>
      </svg>
      
      {/* Legend */}
      <div className="donut-legend">
        {data.map((item, index) => (
          item.count > 0 && (
            <div key={index} className="legend-item">
              <div 
                className="legend-color"
                style={{ backgroundColor: colors[index] || '#94a3b8' }}
              />
              <span className="legend-label">{item.range}</span>
              <span className="legend-value">{item.count}</span>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default UtilizationDonutChart;