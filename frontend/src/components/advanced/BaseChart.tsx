/**
 * ATİS Base Chart Component
 * Universal chart system with StyleSystem integration
 */

import React, { useEffect, useRef } from 'react';
import { StyleSystem, styles } from '../../utils/StyleSystem';

// Chart data interfaces
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: any;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area';
}

export interface ChartConfig {
  title?: string;
  subtitle?: string;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter';
  data: ChartSeries[];
  
  // Styling
  colors?: string[];
  theme?: 'light' | 'dark';
  
  // Layout
  width?: number;
  height?: number;
  responsive?: boolean;
  
  // Axes
  xAxis?: {
    title?: string;
    showGrid?: boolean;
    showLabels?: boolean;
  };
  yAxis?: {
    title?: string;
    showGrid?: boolean;
    showLabels?: boolean;
    min?: number;
    max?: number;
  };
  
  // Features
  showLegend?: boolean;
  showTooltip?: boolean;
  showValues?: boolean;
  animation?: boolean;
  
  // Interactions
  onClick?: (dataPoint: ChartDataPoint, series: ChartSeries) => void;
  onHover?: (dataPoint: ChartDataPoint, series: ChartSeries) => void;
}

interface BaseChartProps {
  config: ChartConfig;
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  error?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  config,
  className = '',
  style = {},
  loading = false,
  error
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Default colors from StyleSystem
  const defaultColors = [
    StyleSystem.tokens.colors.primary[500],
    StyleSystem.tokens.colors.success[500],
    StyleSystem.tokens.colors.warning[500],
    StyleSystem.tokens.colors.danger[500],
    StyleSystem.tokens.colors.info[500],
    StyleSystem.tokens.colors.gray[500]
  ];

  // Chart rendering logic
  useEffect(() => {
    if (!canvasRef.current || loading || error) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Render based on chart type
    switch (config.type) {
      case 'bar':
        renderBarChart(ctx, config, rect, defaultColors);
        break;
      case 'line':
        renderLineChart(ctx, config, rect, defaultColors);
        break;
      case 'pie':
        renderPieChart(ctx, config, rect, defaultColors);
        break;
      case 'doughnut':
        renderDoughnutChart(ctx, config, rect, defaultColors);
        break;
      default:
        renderBarChart(ctx, config, rect, defaultColors);
    }
  }, [config, loading, error, defaultColors]);

  // Handle resize
  useEffect(() => {
    if (!config.responsive) return;

    const handleResize = () => {
      // Trigger re-render on resize
      if (canvasRef.current) {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [config.responsive]);

  // Chart container style
  const containerStyle: React.CSSProperties = {
    ...styles.flex('column', 'start', '4'),
    width: config.width || '100%',
    height: config.height || '400px',
    ...StyleSystem.card(),
    ...style
  };

  // Loading state
  if (loading) {
    return (
      <div style={containerStyle} className={className}>
        <div style={styles.center()}>
          <div style={styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600])}>
            Chart yüklənir...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div style={containerStyle} className={className}>
        <div style={styles.center()}>
          <div style={styles.text('base', 'normal', StyleSystem.tokens.colors.danger[600])}>
            Chart xətası: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {/* Chart Title */}
      {config.title && (
        <div style={styles.text('lg', 'semibold')}>
          {config.title}
        </div>
      )}
      
      {/* Chart Subtitle */}
      {config.subtitle && (
        <div style={styles.text('sm', 'normal', StyleSystem.tokens.colors.gray[600])}>
          {config.subtitle}
        </div>
      )}

      {/* Chart Canvas */}
      <div style={{ flex: 1, position: 'relative', width: '100%' }}>
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            cursor: config.onClick ? 'pointer' : 'default'
          }}
          onClick={(e) => {
            if (config.onClick) {
              // Handle click events
              const rect = canvasRef.current?.getBoundingClientRect();
              if (rect) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                // Calculate which data point was clicked
                // This would need more sophisticated hit detection
              }
            }
          }}
        />
      </div>

      {/* Legend */}
      {config.showLegend && (
        <div style={styles.flex('row', 'center', '4')}>
          {config.data.map((series, index) => (
            <div key={series.name} style={styles.flex('row', 'center', '2')}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  backgroundColor: series.color || (config.colors && config.colors[index]) || defaultColors[index % defaultColors.length],
                  borderRadius: '2px'
                }}
              />
              <span style={styles.text('sm')}>{series.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Chart rendering functions
function renderBarChart(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  rect: DOMRect,
  defaultColors: string[]
) {
  const padding = 40;
  const chartWidth = rect.width - padding * 2;
  const chartHeight = rect.height - padding * 2;

  if (config.data.length === 0 || config.data[0].data.length === 0) return;

  const data = config.data[0].data;
  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = chartWidth / data.length * 0.8;
  const barSpacing = chartWidth / data.length * 0.2;

  // Draw axes
  if (config.xAxis?.showGrid !== false) {
    ctx.strokeStyle = StyleSystem.tokens.colors.gray[200];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
  }

  if (config.yAxis?.showGrid !== false) {
    ctx.strokeStyle = StyleSystem.tokens.colors.gray[200];
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();
  }

  // Draw bars
  data.forEach((dataPoint, index) => {
    const barHeight = (dataPoint.value / maxValue) * chartHeight;
    const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
    const y = padding + chartHeight - barHeight;

    ctx.fillStyle = dataPoint.color || defaultColors[index % defaultColors.length];
    ctx.fillRect(x, y, barWidth, barHeight);

    // Draw labels
    if (config.xAxis?.showLabels !== false) {
      ctx.fillStyle = StyleSystem.tokens.colors.gray[700];
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(dataPoint.label, x + barWidth / 2, padding + chartHeight + 20);
    }

    // Draw values
    if (config.showValues) {
      ctx.fillStyle = StyleSystem.tokens.colors.gray[700];
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(dataPoint.value.toString(), x + barWidth / 2, y - 5);
    }
  });
}

function renderLineChart(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  rect: DOMRect,
  defaultColors: string[]
) {
  const padding = 40;
  const chartWidth = rect.width - padding * 2;
  const chartHeight = rect.height - padding * 2;

  if (config.data.length === 0 || config.data[0].data.length === 0) return;

  const data = config.data[0].data;
  const maxValue = Math.max(...data.map(d => d.value));
  const pointSpacing = chartWidth / (data.length - 1);

  // Draw grid
  if (config.xAxis?.showGrid !== false || config.yAxis?.showGrid !== false) {
    ctx.strokeStyle = StyleSystem.tokens.colors.gray[100];
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i < data.length; i++) {
      const x = padding + pointSpacing * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
    }
  }

  // Draw line
  ctx.strokeStyle = config.data[0].color || defaultColors[0];
  ctx.lineWidth = 2;
  ctx.beginPath();

  data.forEach((dataPoint, index) => {
    const x = padding + pointSpacing * index;
    const y = padding + chartHeight - (dataPoint.value / maxValue) * chartHeight;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.stroke();

  // Draw points
  data.forEach((dataPoint, index) => {
    const x = padding + pointSpacing * index;
    const y = padding + chartHeight - (dataPoint.value / maxValue) * chartHeight;

    ctx.fillStyle = config.data[0].color || defaultColors[0];
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Draw labels
    if (config.xAxis?.showLabels !== false) {
      ctx.fillStyle = StyleSystem.tokens.colors.gray[700];
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(dataPoint.label, x, padding + chartHeight + 20);
    }
  });
}

function renderPieChart(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  rect: DOMRect,
  defaultColors: string[]
) {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const radius = Math.min(centerX, centerY) - 40;

  if (config.data.length === 0 || config.data[0].data.length === 0) return;

  const data = config.data[0].data;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let currentAngle = -Math.PI / 2; // Start from top

  data.forEach((dataPoint, index) => {
    const sliceAngle = (dataPoint.value / total) * Math.PI * 2;
    
    ctx.fillStyle = dataPoint.color || defaultColors[index % defaultColors.length];
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();

    // Draw slice borders
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });
}

function renderDoughnutChart(
  ctx: CanvasRenderingContext2D,
  config: ChartConfig,
  rect: DOMRect,
  defaultColors: string[]
) {
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const outerRadius = Math.min(centerX, centerY) - 40;
  const innerRadius = outerRadius * 0.6;

  if (config.data.length === 0 || config.data[0].data.length === 0) return;

  const data = config.data[0].data;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  
  let currentAngle = -Math.PI / 2;

  data.forEach((dataPoint, index) => {
    const sliceAngle = (dataPoint.value / total) * Math.PI * 2;
    
    ctx.fillStyle = dataPoint.color || defaultColors[index % defaultColors.length];
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, currentAngle, currentAngle + sliceAngle);
    ctx.arc(centerX, centerY, innerRadius, currentAngle + sliceAngle, currentAngle, true);
    ctx.closePath();
    ctx.fill();

    // Draw slice borders
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    currentAngle += sliceAngle;
  });

  // Draw center text (total value)
  ctx.fillStyle = StyleSystem.tokens.colors.gray[700];
  ctx.font = 'bold 24px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(total.toString(), centerX, centerY);
}

export default BaseChart;