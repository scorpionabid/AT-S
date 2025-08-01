import React from 'react';
import { User, UserStatusConfirmProps } from '../../types/users';

const UserStatusConfirm: React.FC<UserStatusConfirmProps> = ({ 
  user, 
  onConfirm, 
  onCancel, 
  loading = false 
}) => {
  const newStatus = !user.is_active;
  const actionText = newStatus ? 'aktivləşdirmək' : 'deaktivləşdirmək';
  const actionColor = newStatus ? 'success' : 'warning';

  return (
    <div className="modal-overlay">
      <div className="modal-content user-status-modal">
        <div className="modal-header">
          <h2>İstifadəçi Statusunu Dəyişdir</h2>
          <button onClick={onCancel} className="modal-close">×</button>
        </div>

        <div className="status-confirm-content">
          <div className={`status-icon ${actionColor}`}>
            {newStatus ? '✅' : '❌'}
          </div>
          
          <div className="confirm-message">
            <h3>Status dəyişikliyini təsdiq edin</h3>
            <p>
              <strong>{user.username}</strong> istifadəçisini {actionText} istəyirsiniz.
            </p>
            
            <div className="status-change-info">
              <div className="status-row">
                <span className="label">Cari status:</span>
                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                  {user.is_active ? '✅ Aktiv' : '❌ Deaktiv'}
                </span>
              </div>
              <div className="status-arrow">
                ⬇️
              </div>
              <div className="status-row">
                <span className="label">Yeni status:</span>
                <span className={`status-badge ${newStatus ? 'active' : 'inactive'}`}>
                  {newStatus ? '✅ Aktiv' : '❌ Deaktiv'}
                </span>
              </div>
            </div>

            <div className="user-info-box">
              <div className="user-detail">
                <span className="label">İstifadəçi:</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="user-detail">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
            </div>

            {!newStatus && (
              <div className="warning-text">
                <strong>Qeyd:</strong> Deaktiv edilmiş istifadəçilər sistemə daxil ola bilməzlər.
              </div>
            )}

            {newStatus && (
              <div className="success-text">
                <strong>Qeyd:</strong> Aktivləşdirilmiş istifadəçilər sistemə daxil ola bilərlər.
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary"
            disabled={loading}
          >
            Ləğv et
          </button>
          <button 
            type="button" 
            onClick={onConfirm} 
            className={`btn-${actionColor}`}
            disabled={loading}
          >
            {loading 
              ? (newStatus ? 'Aktivləşdirilir...' : 'Deaktivləşdirilir...') 
              : (newStatus ? 'Aktivləşdir' : 'Deaktivləşdir')
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserStatusConfirm;