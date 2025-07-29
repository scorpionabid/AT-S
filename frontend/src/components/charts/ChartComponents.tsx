/**
 * ATİS Chart Components
 * Professional data visualization components with performance optimization
 */

import React, { memo, useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiBarChart, FiPieChart } from 'react-icons/fi';

// Chart data interfaces
export interface LineChartData {
  name: string;
  value: number;
  color?: string;
}

export interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

// Simple Line Chart
export interface LineChartProps {
  data: LineChartData[];
  height?: number;
  showGrid?: boolean;
  showValues?: boolean;
  className?: string;
}

export const LineChart: React.FC<LineChartProps> = memo(({
  data,
  height = 200,
  showGrid = true,
  showValues = false,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getY = (value: number) => {
    const normalized = range > 0 ? (value - minValue) / range : 0.5;
    return height - (normalized * (height - 40)) - 20;
  };

  const getX = (index: number) => {
    const width = 400; // Fixed width for simplicity
    return (index / (data.length - 1)) * (width - 60) + 30;
  };

  // Create path string for the line
  const pathData = data.map((item, index) => {
    const x = getX(index);
    const y = getY(item.value);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <div className={`relative ${className}`}>
      <svg width="400" height={height} className="overflow-visible">
        {/* Grid lines */}
        {showGrid && (
          <g className="opacity-30">
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = height - (ratio * (height - 40)) - 20;
              return (
                <line
                  key={ratio}
                  x1="30"
                  y1={y}
                  x2="370"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              );
            })}
          </g>
        )}

        {/* Line path */}
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          className="drop-shadow-sm"
        />

        {/* Data points */}
        {data.map((item, index) => {
          const x = getX(index);
          const y = getY(item.value);
          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                className="drop-shadow-sm"
              />
              {showValues && (
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.value}
                </text>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((item, index) => {
          const x = getX(index);
          return (
            <text
              key={index}
              x={x}
              y={height - 5}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {item.name}
            </text>
          );
        })}
      </svg>
    </div>
  );
});

// Simple Bar Chart
export interface BarChartProps {
  data: BarChartData[];
  height?: number;
  showValues?: boolean;
  horizontal?: boolean;
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  showValues = true,
  horizontal = false,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = horizontal ? 300 / data.length : 30;
  const barSpacing = horizontal ? height / data.length : 40;

  return (
    <div className={`relative ${className}`}>
      <svg width="400" height={height} className="overflow-visible">
        {data.map((item, index) => {
          const barLength = (item.value / maxValue) * (horizontal ? 300 : height - 40);
          
          if (horizontal) {
            const y = index * barSpacing + 10;
            return (
              <g key={index}>
                <rect
                  x="80"
                  y={y}
                  width={barLength}
                  height={barWidth}
                  fill={item.color || '#3b82f6'}
                  className="rounded-r-sm"
                />
                <text
                  x="70"
                  y={y + barWidth / 2 + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-600"
                >
                  {item.name}
                </text>
                {showValues && (
                  <text
                    x={90 + barLength}
                    y={y + barWidth / 2 + 4}
                    className="text-xs fill-gray-700"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          } else {
            const x = index * barSpacing + 50;
            const y = height - barLength - 20;
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barLength}
                  fill={item.color || '#3b82f6'}
                  className="rounded-t-sm"
                />
                <text
                  x={x + barWidth / 2}
                  y={height - 5}
                  textAnchor="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.name}
                </text>
                {showValues && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    className="text-xs fill-gray-700"
                  >
                    {item.value}
                  </text>
                )}
              </g>
            );
          }
        })}
      </svg>
    </div>
  );
};

// Simple Pie Chart
export interface PieChartProps {
  data: PieChartData[];
  size?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = memo(({
  data,
  size = 200,
  showLabels = true,
  showLegend = true,
  className = ''
}) => {
  const radius = size / 2 - 20;
  const centerX = size / 2;
  const centerY = size / 2;

  let currentAngle = 0;
  const slices = data.map(item => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    
    currentAngle += sliceAngle;

    // Calculate path for slice
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);
    
    const largeArcFlag = sliceAngle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // Calculate label position
    const labelAngle = (startAngle + sliceAngle / 2) * Math.PI / 180;
    const labelRadius = radius * 0.7;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    return {
      ...item,
      pathData,
      labelX,
      labelY
    };
  });

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {slices.map((slice, index) => (
          <g key={index}>
            <path
              d={slice.pathData}
              fill={slice.color}
              className="stroke-white stroke-2 hover:opacity-80 transition-opacity cursor-pointer"
            />
            {showLabels && slice.percentage > 5 && (
              <text
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                className="text-xs fill-white font-medium"
              >
                {slice.percentage.toFixed(1)}%
              </text>
            )}
          </g>
        ))}
      </svg>
      
      {showLegend && (
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700">{item.name}</span>
              <span className="text-gray-500">({item.percentage.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

// Stats Card with trend
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = memo(({
  title,
  value,
  change,
  changeLabel,
  icon,
  color = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700'
  };

  const iconColorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500',
    red: 'text-red-500',
    purple: 'text-purple-500'
  };

  return (
    <div className={`atis-card p-6 border-l-4 ${colorClasses[color]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
          
          {change !== undefined && (
            <div className="flex items-center gap-1">
              {change > 0 ? (
                <FiTrendingUp className="w-4 h-4 text-green-500" />
              ) : change < 0 ? (
                <FiTrendingDown className="w-4 h-4 text-red-500" />
              ) : null}
              <span className={`text-sm font-medium ${
                change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center ${iconColorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

// Chart Container with header
export interface ChartContainerProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  subtitle,
  actions,
  children,
  className = ''
}) => {
  return (
    <div className={`atis-card p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      <div className="min-h-[200px] flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

// Mock Chart placeholder for external libraries
export interface MockChartProps {
  type: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  title: string;
  height?: number;
  className?: string;
}

export const MockChart: React.FC<MockChartProps> = ({
  type,
  title,
  height = 200,
  className = ''
}) => {
  const icons = {
    line: FiTrendingUp,
    bar: FiBarChart,
    pie: FiPieChart,
    area: FiTrendingUp,
    scatter: FiBarChart
  };
  
  const Icon = icons[type];

  return (
    <div 
      className={`flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
      style={{ height }}
    >
      <Icon className="w-12 h-12 text-gray-400 mb-2" />
      <p className="text-gray-600 font-medium">{title}</p>
      <p className="text-sm text-gray-500 mt-1">
        Chart.js/Recharts komponenti əlavə ediləcək
      </p>
    </div>
  );
};

export default {
  LineChart,
  BarChart,
  PieChart,
  StatsCard,
  ChartContainer,
  MockChart
};