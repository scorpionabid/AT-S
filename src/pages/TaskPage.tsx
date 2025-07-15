import React from 'react';
import { DashboardLayout } from '../components/layout/Dashboard';
import TaskDashboard from '../components/task/TaskDashboard';

const TaskPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="page-container">
        <h1>Tapşırıq İdarəetməsi</h1>
        <p>Hierarchik tapşırıqları təyin edin və izləyin</p>
        <TaskDashboard />
      </div>
    </DashboardLayout>
  );
};

export default TaskPage;