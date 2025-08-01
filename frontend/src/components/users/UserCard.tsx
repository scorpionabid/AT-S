import React from 'react';
import { User } from '../../types/users';

interface UserCardProps {
  user: User;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onStatusToggle: (user: User) => void;
}

const UserCard: React.FC<UserCardProps> = ({
  user,
  onView,
  onEdit,
  onDelete,
  onStatusToggle
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Heç vaxt';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role: User['role']) => {
    if (!role) return 'Təyin edilməyib';
    
    if (typeof role === 'string') return role;
    if (typeof role === 'object' && role.display_name) return role.display_name;
    if (typeof role === 'object' && role.name) return role.name;
    
    return 'Təyin edilməyib';
  };

  const getRoleClass = (role: User['role']) => {
    if (!role) return 'no-role';
    
    const roleName = typeof role === 'string' ? role : role.name;
    return roleName || 'no-role';
  };

  return (
    <div className="user-card">
      {/* Card Header */}
      <div className="user-card-header">
        <div className="user-card-avatar">
          {user.profile?.first_name?.charAt(0) || user.username?.charAt(0) || 'U'}
        </div>
        <div className="user-card-info">
          <div className="user-card-name">
            {(user.profile?.first_name && user.profile?.last_name) 
              ? `${user.profile.first_name} ${user.profile.last_name}` 
              : (user.username || 'İstifadəçi')}
          </div>
          <div className="user-card-username">@{user.username}</div>
        </div>
        <div className="user-card-status">
          <button
            onClick={() => onStatusToggle(user)}
            className={`status-toggle ${user.is_active ? 'active' : 'inactive'}`}
          >
            {user.is_active ? '✅' : '❌'}
          </button>
        </div>
      </div>

      {/* Card Body */}
      <div className="user-card-body">
        <div className="user-card-field">
          <span className="user-card-label">📧 Email:</span>
          <span className="user-card-value">{user.email}</span>
        </div>
        
        <div className="user-card-field">
          <span className="user-card-label">👥 Rol:</span>
          <span className={`role-badge ${getRoleClass(user.role)}`}>
            {getRoleDisplayName(user.role)}
          </span>
        </div>
        
        <div className="user-card-field">
          <span className="user-card-label">🏢 Təşkilat:</span>
          <span className="user-card-value">
            {user.institution?.name || 'Təyin edilməyib'}
          </span>
        </div>
        
        <div className="user-card-field">
          <span className="user-card-label">🔄 Son giriş:</span>
          <span className="user-card-value">{formatDate(user.last_login_at)}</span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="user-card-footer">
        <button 
          className="action-button view" 
          title="Məlumatları gör"
          onClick={() => onView(user)}
        >
          👁️
        </button>
        <button 
          className="action-button edit" 
          title="Redaktə et"
          onClick={() => onEdit(user)}
        >
          ✏️
        </button>
        <button 
          className="action-button delete" 
          title="Sil"
          onClick={() => onDelete(user)}
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default UserCard;