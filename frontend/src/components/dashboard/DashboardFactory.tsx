/**
 * ATİS Dashboard Factory
 * Configuration-driven dashboard generation
 * Eliminates role-specific dashboard duplication
 */

import React from 'react';
import { BaseDashboard, DashboardConfig } from './BaseDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useThemedStyles } from '../../utils/theme/ThemedStyleSystem';

// Dashboard types enum
export enum DashboardType {
  SUPER_ADMIN = 'super_admin',
  REGION_ADMIN = 'region_admin',
  SCHOOL_ADMIN = 'school_admin',
  TEACHER = 'teacher',
  ASSESSMENT = 'assessment',
  APPROVAL = 'approval',
  TASK = 'task'
}

// Widget configuration interface
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stat' | 'chart' | 'list' | 'table' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  dataKey?: string;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
  permissions?: string[];
  roles?: string[];
}

// Dashboard layout configuration
export interface DashboardLayoutConfig {
  type: DashboardType;
  title: string;
  subtitle?: string;
  widgets: DashboardWidget[];
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
  dataService: () => Promise<any>;
}

// Pre-configured dashboard layouts
export const dashboardConfigs: Record<DashboardType, DashboardLayoutConfig> = {
  [DashboardType.SUPER_ADMIN]: {
    type: DashboardType.SUPER_ADMIN,
    title: 'Super Admin Dashboard',
    subtitle: 'System overview and administration',
    refreshInterval: 30000,
    enableAutoRefresh: true,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        systemStats: {
          totalUsers: 1247,
          activeUsers: 892,
          totalInstitutions: 43,
          systemHealth: 'good'
        },
        recentActivities: [],
        systemAlerts: []
      };
    },
    widgets: [
      {
        id: 'system-stats',
        title: 'System Statistics',
        type: 'stat',
        size: 'full',
        dataKey: 'systemStats'
      },
      {
        id: 'recent-activities',
        title: 'Recent Activities',
        type: 'list',
        size: 'medium',
        dataKey: 'recentActivities'
      },
      {
        id: 'system-alerts',
        title: 'System Alerts',
        type: 'list',
        size: 'medium',
        dataKey: 'systemAlerts'
      }
    ]
  },

  [DashboardType.REGION_ADMIN]: {
    type: DashboardType.REGION_ADMIN,
    title: 'Region Admin Dashboard',
    subtitle: 'Regional overview and management',
    refreshInterval: 60000,
    enableAutoRefresh: true,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        regionStats: {
          institutionsInRegion: 15,
          activeUsers: 245,
          pendingApprovals: 8
        },
        institutionsList: [],
        recentSurveys: []
      };
    },
    widgets: [
      {
        id: 'region-stats',
        title: 'Region Statistics',
        type: 'stat',
        size: 'full',
        dataKey: 'regionStats'
      },
      {
        id: 'institutions-list',
        title: 'Institutions',
        type: 'table',
        size: 'large',
        dataKey: 'institutionsList'
      },
      {
        id: 'recent-surveys',
        title: 'Recent Surveys',
        type: 'list',
        size: 'medium',
        dataKey: 'recentSurveys'
      }
    ]
  },

  [DashboardType.SCHOOL_ADMIN]: {
    type: DashboardType.SCHOOL_ADMIN,
    title: 'School Admin Dashboard',
    subtitle: 'School management and overview',
    refreshInterval: 120000,
    enableAutoRefresh: true,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        schoolStats: {
          totalStudents: 450,
          totalTeachers: 35,
          activeClasses: 18,
          attendance: '92%'
        },
        recentActivities: [],
        upcomingEvents: []
      };
    },
    widgets: [
      {
        id: 'school-stats',
        title: 'School Statistics',
        type: 'stat',
        size: 'full',
        dataKey: 'schoolStats'
      },
      {
        id: 'recent-activities',
        title: 'Recent Activities',
        type: 'list',
        size: 'medium',
        dataKey: 'recentActivities'
      },
      {
        id: 'upcoming-events',
        title: 'Upcoming Events',
        type: 'list',
        size: 'medium',
        dataKey: 'upcomingEvents'
      }
    ]
  },

  [DashboardType.TEACHER]: {
    type: DashboardType.TEACHER,
    title: 'Teacher Dashboard',
    subtitle: 'Classes and teaching overview',
    refreshInterval: 300000,
    enableAutoRefresh: false,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        teacherStats: {
          myClasses: 5,
          totalStudents: 125,
          pendingGrades: 12,
          upcomingLessons: 3
        },
        myClasses: [],
        recentGrades: []
      };
    },
    widgets: [
      {
        id: 'teacher-stats',
        title: 'My Teaching Overview',
        type: 'stat',
        size: 'full',
        dataKey: 'teacherStats'
      },
      {
        id: 'my-classes',
        title: 'My Classes',
        type: 'table',
        size: 'large',
        dataKey: 'myClasses'
      },
      {
        id: 'recent-grades',
        title: 'Recent Grades',
        type: 'list',
        size: 'medium',
        dataKey: 'recentGrades'
      }
    ]
  },

  [DashboardType.ASSESSMENT]: {
    type: DashboardType.ASSESSMENT,
    title: 'Assessment Dashboard',
    subtitle: 'Assessment results and analytics',
    refreshInterval: 180000,
    enableAutoRefresh: true,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        assessmentStats: {
          totalAssessments: 45,
          completedAssessments: 38,
          avgScore: 87.5,
          pendingReviews: 7
        },
        recentResults: [],
        performanceTrends: []
      };
    },
    widgets: [
      {
        id: 'assessment-stats',
        title: 'Assessment Overview',
        type: 'stat',
        size: 'full',
        dataKey: 'assessmentStats'
      },
      {
        id: 'recent-results',
        title: 'Recent Results',
        type: 'table',
        size: 'large',
        dataKey: 'recentResults'
      },
      {
        id: 'performance-trends',
        title: 'Performance Trends',
        type: 'chart',
        size: 'medium',
        dataKey: 'performanceTrends'
      }
    ]
  },

  [DashboardType.APPROVAL]: {
    type: DashboardType.APPROVAL,
    title: 'Approval Dashboard',
    subtitle: 'Pending approvals and workflow',
    refreshInterval: 60000,
    enableAutoRefresh: true,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        approvalStats: {
          pendingApprovals: 12,
          approvedToday: 8,
          rejectedToday: 2,
          avgProcessingTime: '2.5 hours'
        },
        pendingItems: [],
        recentActions: []
      };
    },
    widgets: [
      {
        id: 'approval-stats',
        title: 'Approval Overview',
        type: 'stat',
        size: 'full',
        dataKey: 'approvalStats'
      },
      {
        id: 'pending-items',
        title: 'Pending Approvals',
        type: 'table',
        size: 'large',
        dataKey: 'pendingItems'
      },
      {
        id: 'recent-actions',
        title: 'Recent Actions',
        type: 'list',
        size: 'medium',
        dataKey: 'recentActions'
      }
    ]
  },

  [DashboardType.TASK]: {
    type: DashboardType.TASK,
    title: 'Task Dashboard',
    subtitle: 'Task management and tracking',
    refreshInterval: 120000,
    enableAutoRefresh: true,
    dataService: async () => {
      // TODO: Replace with real API call
      return {
        taskStats: {
          totalTasks: 45,
          completedTasks: 32,
          inProgressTasks: 8,
          overdueTasks: 5
        },
        myTasks: [],
        recentCompletions: []
      };
    },
    widgets: [
      {
        id: 'task-stats',
        title: 'Task Overview',
        type: 'stat',
        size: 'full',
        dataKey: 'taskStats'
      },
      {
        id: 'my-tasks',
        title: 'My Tasks',
        type: 'table',
        size: 'large',
        dataKey: 'myTasks'
      },
      {
        id: 'recent-completions',
        title: 'Recent Completions',
        type: 'list',
        size: 'medium',
        dataKey: 'recentCompletions'
      }
    ]
  }
};

// Dashboard Factory Component
export interface DashboardFactoryProps {
  type: DashboardType;
  customConfig?: Partial<DashboardLayoutConfig>;
  className?: string;
  style?: React.CSSProperties;
}

export const DashboardFactory: React.FC<DashboardFactoryProps> = ({
  type,
  customConfig = {},
  className = '',
  style = {}
}) => {
  const { user } = useAuth();
  const styles = useThemedStyles();

  // Get base config and merge with custom config
  const baseConfig = dashboardConfigs[type];
  const config: DashboardLayoutConfig = {
    ...baseConfig,
    ...customConfig,
    widgets: customConfig.widgets || baseConfig.widgets
  };

  // Filter widgets based on user permissions
  const filteredWidgets = config.widgets.filter(widget => {
    if (widget.permissions && user) {
      // TODO: Implement permission checking
      return true;
    }
    if (widget.roles && user) {
      // TODO: Implement role checking
      return true;
    }
    return true;
  });

  // Create dashboard configuration for BaseDashboard
  const dashboardConfig: DashboardConfig = {
    title: config.title,
    subtitle: config.subtitle,
    fetchData: config.dataService,
    refreshInterval: config.refreshInterval,
    enableAutoRefresh: config.enableAutoRefresh
  };

  // Render widget based on type
  const renderWidget = (widget: DashboardWidget, data: any) => {
    const widgetData = widget.dataKey ? data[widget.dataKey] : data;

    const widgetStyle = {
      ...styles.card(),
      marginBottom: styles.theme.spacing[4],
      ...(widget.size === 'small' && { flex: '0 0 25%' }),
      ...(widget.size === 'medium' && { flex: '0 0 50%' }),
      ...(widget.size === 'large' && { flex: '0 0 75%' }),
      ...(widget.size === 'full' && { flex: '0 0 100%' })
    };

    return (
      <div key={widget.id} style={widgetStyle}>
        <h3 style={styles.text('lg', 'semibold')}>{widget.title}</h3>
        
        {widget.type === 'stat' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: styles.theme.spacing[4],
            marginTop: styles.theme.spacing[4]
          }}>
            {widgetData && Object.entries(widgetData).map(([key, value]) => (
              <div key={key} style={styles.card('outlined')}>
                <div style={styles.text('sm', 'normal', 'secondary')}>
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
                <div style={styles.text('xl', 'bold')}>
                  {String(value)}
                </div>
              </div>
            ))}
          </div>
        )}

        {widget.type === 'list' && (
          <div style={{ marginTop: styles.theme.spacing[4] }}>
            {Array.isArray(widgetData) && widgetData.length > 0 ? (
              widgetData.map((item, index) => (
                <div key={index} style={{
                  padding: styles.theme.spacing[3],
                  borderBottom: `1px solid ${styles.theme.colors.border.muted}`,
                  ':last-child': { border: 'none' }
                }}>
                  {JSON.stringify(item)}
                </div>
              ))
            ) : (
              <div style={styles.text('base', 'normal', 'tertiary')}>
                No items available
              </div>
            )}
          </div>
        )}

        {widget.type === 'table' && (
          <div style={{ marginTop: styles.theme.spacing[4] }}>
            <div style={styles.text('base', 'normal', 'tertiary')}>
              Table view - TODO: Implement table component
            </div>
          </div>
        )}

        {widget.type === 'chart' && (
          <div style={{ marginTop: styles.theme.spacing[4] }}>
            <div style={styles.text('base', 'normal', 'tertiary')}>
              Chart view - TODO: Implement chart component
            </div>
          </div>
        )}

        {widget.type === 'custom' && widget.component && (
          <div style={{ marginTop: styles.theme.spacing[4] }}>
            <widget.component data={widgetData} {...(widget.props || {})} />
          </div>
        )}
      </div>
    );
  };

  return (
    <BaseDashboard config={dashboardConfig} className={className} style={style}>
      {({ data }) => (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: styles.theme.spacing[4]
        }}>
          {filteredWidgets.map(widget => renderWidget(widget, data))}
        </div>
      )}
    </BaseDashboard>
  );
};

// Helper function to create dashboard from type
export const createDashboard = (type: DashboardType, customConfig?: Partial<DashboardLayoutConfig>) => {
  return (props: Omit<DashboardFactoryProps, 'type'>) => (
    <DashboardFactory type={type} customConfig={customConfig} {...props} />
  );
};

export default DashboardFactory;