import React from 'react';
import UsersList from '../../users/UsersList';

const UsersTab: React.FC = () => {
  return (
    <div className="users-tab">
      <UsersList />
    </div>
  );
};

export default UsersTab;