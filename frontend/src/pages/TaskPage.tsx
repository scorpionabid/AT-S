import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import TaskDashboardUnified from '../components/task/TaskDashboardUnified';

const TaskPage: React.FC = () => {
  return (
    <DashboardLayout>
      <TaskDashboardUnified />
    </DashboardLayout>
  );
};

export default TaskPage;