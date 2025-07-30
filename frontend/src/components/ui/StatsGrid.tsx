import React from 'react';

export interface StatCard {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  change?: string;
  href?: string;
}

interface StatsGridProps {
  stats: StatCard[];
  loading?: boolean;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, loading = false }) => {
  if (loading) {
    return (
      <div className="stats-container">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-neutral-100 text-neutral-400">
                ⏳
              </div>
            </div>
            <div className="stats-card-value">...</div>
            <div className="stats-card-title">Yüklənir...</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-container">
      {stats.map((stat, index) => {
        const CardComponent = stat.href ? 'a' : 'div';
        const cardProps = stat.href ? { href: stat.href } : {};

        return (
          <CardComponent
            key={index}
            className={`stats-card ${stat.href ? 'cursor-pointer hover:shadow-lg' : ''}`}
            {...cardProps}
          >
            <div className="stats-card-header">
              {stat.icon && (
                <div className={`
                  stats-card-icon
                  ${stat.color === 'blue' && 'bg-primary-100 text-primary-600'}
                  ${stat.color === 'green' && 'bg-success-100 text-success-600'}
                  ${stat.color === 'purple' && 'bg-purple-100 text-purple-600'}
                  ${stat.color === 'orange' && 'bg-warning-100 text-warning-600'}
                  ${stat.color === 'red' && 'bg-error-100 text-error-600'}
                  ${!stat.color && 'bg-neutral-100 text-neutral-600'}
                `}>
                  {stat.icon}
                </div>
              )}
              {stat.change && (
                <span className={`badge-${
                  stat.color === 'green' ? 'success' : 
                  stat.color === 'orange' ? 'warning' : 
                  stat.color === 'red' ? 'error' : 'info'
                }`}>
                  {stat.change}
                </span>
              )}
            </div>
            <div className="stats-card-value">{stat.value}</div>
            <div className="stats-card-title">{stat.title}</div>
          </CardComponent>
        );
      })}
    </div>
  );
};

export default StatsGrid;