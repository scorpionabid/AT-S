import React from 'react';

interface WorkloadTrendChartProps {
  data: Array<{
    date: string;
    average_utilization: number;
    optimal_count: number;
    overloaded_count: number;
  }>;
}

const WorkloadTrendChart: React.FC<WorkloadTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="trend-chart-empty">
        <p>Trend məlumatları mövcud deyil</p>
      </div>
    );
  }

  const maxUtilization = Math.max(...data.map(d => d.average_utilization), 100);
  const maxCount = Math.max(...data.map(d => Math.max(d.optimal_count, d.overloaded_count)), 10);
  
  const chartWidth = 400;
  const chartHeight = 200;
  const padding = 40;
  const innerWidth = chartWidth - padding * 2;
  const innerHeight = chartHeight - padding * 2;

  // Calculate points for utilization line
  const utilizationPoints = data.map((point, index) => {
    const x = padding + (index / (data.length - 1)) * innerWidth;
    const y = padding + (1 - point.average_utilization / maxUtilization) * innerHeight;
    return `${x},${y}`;
  }).join(' ');

  // Calculate bars for teacher counts
  const barWidth = innerWidth / data.length * 0.6;

  return (
    <div className="trend-chart-container">
      <svg width={chartWidth} height={chartHeight} className="trend-chart">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(value => {
          const y = padding + (1 - value / maxUtilization) * innerHeight;
          return (
            <g key={value}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
              >
                {value}%
              </text>
            </g>
          );
        })}

        {/* Utilization trend line */}
        <polyline
          points={utilizationPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * innerWidth;
          const y = padding + (1 - point.average_utilization / maxUtilization) * innerHeight;
          const barX = x - barWidth / 2;
          
          return (
            <g key={index}>
              {/* Utilization point */}
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth="2"
                className="trend-point"
              />
              
              {/* Optimal teachers bar */}
              <rect
                x={barX}
                y={chartHeight - padding - (point.optimal_count / maxCount) * (innerHeight / 2)}
                width={barWidth / 2 - 2}
                height={(point.optimal_count / maxCount) * (innerHeight / 2)}
                fill="#22c55e"
                opacity="0.7"
                className="trend-bar"
              />
              
              {/* Overloaded teachers bar */}
              <rect
                x={barX + barWidth / 2}
                y={chartHeight - padding - (point.overloaded_count / maxCount) * (innerHeight / 2)}
                width={barWidth / 2 - 2}
                height={(point.overloaded_count / maxCount) * (innerHeight / 2)}
                fill="#ef4444"
                opacity="0.7"
                className="trend-bar"
              />

              {/* Month label */}
              <text
                x={x}
                y={chartHeight - padding + 15}
                textAnchor="middle"
                fontSize="10"
                fill="#64748b"
              >
                {new Date(point.date).toLocaleDateString('az', { month: 'short' })}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={padding}
          y1={chartHeight - padding}
          x2={chartWidth - padding}
          y2={chartHeight - padding}
          stroke="#94a3b8"
          strokeWidth="1"
        />

        {/* Y-axis */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight - padding}
          stroke="#94a3b8"
          strokeWidth="1"
        />
      </svg>

      {/* Legend */}
      <div className="trend-legend">
        <div className="legend-item">
          <div className="legend-line" style={{ backgroundColor: '#3b82f6' }} />
          <span>Orta İstifadə</span>
        </div>
        <div className="legend-item">
          <div className="legend-bar" style={{ backgroundColor: '#22c55e' }} />
          <span>Optimal</span>
        </div>
        <div className="legend-item">
          <div className="legend-bar" style={{ backgroundColor: '#ef4444' }} />
          <span>Yüklənmiş</span>
        </div>
      </div>
    </div>
  );
};

export default WorkloadTrendChart;