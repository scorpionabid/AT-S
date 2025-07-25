import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface PerformanceChartProps {
  data: DataPoint[];
  title?: string;
  type?: 'bar' | 'line' | 'progress';
  height?: number;
  showValues?: boolean;
  maxValue?: number;
  className?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  title,
  type = 'bar',
  height = 200,
  showValues = true,
  maxValue,
  className = ''
}) => {
  const chartMaxValue = maxValue || Math.max(...data.map(d => d.value));
  
  const getBarHeight = (value: number): number => {
    return (value / chartMaxValue) * 100;
  };

  const getColor = (index: number, customColor?: string): string => {
    if (customColor) return customColor;
    
    const colors = [
      '#3498db', '#2ecc71', '#f39c12', 
      '#e74c3c', '#9b59b6', '#1abc9c'
    ];
    return colors[index % colors.length];
  };

  const renderBarChart = () => (
    <div className="chart-bars" style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="chart-bar-container">
          <div className="chart-bar-wrapper">
            <div
              className="chart-bar"
              style={{
                height: `${getBarHeight(item.value)}%`,
                backgroundColor: getColor(index, item.color)
              }}
            />
            {showValues && (
              <div className="chart-value">{item.value}</div>
            )}
          </div>
          <div className="chart-label">{item.label}</div>
        </div>
      ))}
    </div>
  );

  const renderProgressChart = () => (
    <div className="chart-progress">
      {data.map((item, index) => (
        <div key={index} className="progress-item">
          <div className="progress-header">
            <span className="progress-label">{item.label}</span>
            {showValues && (
              <span className="progress-value">{item.value}%</span>
            )}
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${item.value}%`,
                backgroundColor: getColor(index, item.color)
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderLineChart = () => (
    <div className="chart-line" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 400 200">
        <polyline
          fill="none"
          stroke="#3498db"
          strokeWidth="2"
          points={data.map((item, index) => {
            const x = (index / (data.length - 1)) * 380 + 10;
            const y = 190 - (item.value / chartMaxValue) * 180;
            return `${x},${y}`;
          }).join(' ')}
        />
        {data.map((item, index) => {
          const x = (index / (data.length - 1)) * 380 + 10;
          const y = 190 - (item.value / chartMaxValue) * 180;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="4"
              fill={getColor(index, item.color)}
            />
          );
        })}
      </svg>
      <div className="chart-labels">
        {data.map((item, index) => (
          <span key={index} className="chart-label">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`performance-chart ${className}`}>
      {title && <h3 className="chart-title">{title}</h3>}
      
      <div className="chart-content">
        {type === 'bar' && renderBarChart()}
        {type === 'progress' && renderProgressChart()}
        {type === 'line' && renderLineChart()}
      </div>
    </div>
  );
};

export default PerformanceChart;