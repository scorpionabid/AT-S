import React from 'react';

interface PerformanceCardProps {
  title: string;
  score: number;
  maxScore?: number;
  description?: string;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
}

const PerformanceCard: React.FC<PerformanceCardProps> = ({
  title,
  score,
  maxScore = 100,
  description,
  color = 'blue',
  size = 'medium',
  showProgress = true
}) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
  };

  const scoreColor = color === 'blue' ? getScoreColor(percentage) : color;

  return (
    <div className={`performance-card performance-card--${size} performance-card--${scoreColor}`}>
      <div className="performance-header">
        <h4 className="performance-title">{title}</h4>
        <div className="performance-score">
          <span className="score-value">{score}</span>
          {maxScore !== 100 && <span className="score-max">/{maxScore}</span>}
        </div>
      </div>
      
      {showProgress && (
        <div className="performance-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="progress-percentage">{percentage.toFixed(1)}%</span>
        </div>
      )}
      
      {description && (
        <p className="performance-description">{description}</p>
      )}
    </div>
  );
};

export default PerformanceCard;