import React from 'react';
import RegionAdminUsersList from '../users/RegionAdminUsersList';

const UsersTab: React.FC = () => {
  return (
    <div className="users-tab">
      <RegionAdminUsersList />
    </div>
  );
};

export default UsersTab;