import React from 'react';
import { User, UserViewModalProps } from '../../types/users';
import { roleServiceDynamic } from '../../services/roleServiceDynamic';

const UserViewModal: React.FC<UserViewModalProps> = ({ 
  user, onClose, onEdit, onDelete, onStatusToggle 
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Heç vaxt';
    return new Date(dateString).toLocaleDateString('az-AZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role: User['role']) => {
    if (!role || !role.name) return 'Təyin edilməyib';
    
    // Use dynamic role service for consistent display names
    return role.display_name || roleServiceDynamic.getRoleDisplayName(role.name) || role.name;
  };

  const getFullName = () => {
    if (user.profile?.first_name || user.profile?.last_name) {
      return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
    }
    return user.username;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content user-view-modal">
        <div className="modal-header">
          <h2>👤 İstifadəçi Məlumatları</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <div className="user-view-content">
          {/* User Avatar və Basic Info */}
          <div className="user-profile-section">
            <div className="user-avatar-large">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-basic-info">
              <h3>{getFullName()}</h3>
              <p className="username">@{user.username}</p>
              <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                {user.is_active ? '✅ Aktiv' : '❌ Deaktiv'}
              </span>
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <div className="user-details-tabs">
            {/* Contact Info */}
            <div className="detail-section">
              <h4>📞 Əlaqə Məlumatları</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{user.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Telefon:</span>
                  <span className="value">{user.profile?.contact_phone || 'Təyin edilməyib'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ad:</span>
                  <span className="value">{user.profile?.first_name || 'Təyin edilməyib'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Soyad:</span>
                  <span className="value">{user.profile?.last_name || 'Təyin edilməyib'}</span>
                </div>
              </div>
            </div>

            {/* Role və Institution Info */}
            <div className="detail-section">
              <h4>🏢 Rol və Təşkilat</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Rol:</span>
                  <span className="value">
                    <span className={`role-badge ${user.role?.name || 'no-role'}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Rol səviyyəsi:</span>
                  <span className="value">{user.role?.level || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Təşkilat:</span>
                  <span className="value">{user.institution?.name || 'Təyin edilməyib'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Təşkilat ID:</span>
                  <span className="value">{user.institution?.id || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Activity Info */}
            <div className="detail-section">
              <h4>📊 Aktivlik Məlumatları</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Qeydiyyat tarixi:</span>
                  <span className="value">{formatDate(user.created_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Son giriş:</span>
                  <span className="value">{formatDate(user.last_login_at)}</span>
                </div>
                <div className="detail-item">
                  <span className="label">İstifadəçi ID:</span>
                  <span className="value">#{user.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Cari status:</span>
                  <span className="value">
                    <span className={`status-indicator ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Aktiv və girişə açıq' : 'Deaktiv və girişə bağlı'}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="detail-section">
              <h4>⚙️ Sistem Məlumatları</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Rol kodu:</span>
                  <span className="value">{user.role?.name || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Hesab növü:</span>
                  <span className="value">
                    {user.role?.level === 1 && 'Sistem Administratoru'}
                    {user.role?.level === 2 && 'Regional İdarə'}
                    {user.role?.level === 3 && 'Regional Operator'}
                    {user.role?.level === 4 && 'Sektor İdarəsi'}
                    {user.role?.level === 5 && 'Məktəb İdarəsi'}
                    {user.role?.level === 6 && 'Təhsil İşçisi'}
                    {!user.role?.level && 'Təyin edilməyib'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Email təsdiqi:</span>
                  <span className="value">✅ Təsdiqlənib</span>
                </div>
                <div className="detail-item">
                  <span className="label">Məlumat tamlığı:</span>
                  <span className="value">
                    {user.profile?.first_name && user.profile?.last_name && user.email ? 
                      '✅ Tam' : '⚠️ Natamam'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="action-buttons">
            <button onClick={onEdit} className="btn-primary">
              ✏️ Redaktə Et
            </button>
            <button 
              onClick={onStatusToggle} 
              className={`btn-warning ${user.is_active ? 'deactivate' : 'activate'}`}
            >
              {user.is_active ? '❌ Deaktiv Et' : '✅ Aktiv Et'}
            </button>
            <button onClick={onDelete} className="btn-danger">
              🗑️ Sil
            </button>
            <button onClick={onClose} className="btn-secondary">
              Bağla
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;