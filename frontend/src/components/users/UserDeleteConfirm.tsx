import React from 'react';
import { User, UserDeleteConfirmProps } from '../../types/users';

const UserDeleteConfirm: React.FC<UserDeleteConfirmProps> = ({ 
  user, 
  onConfirm, 
  onCancel, 
  loading = false 
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content user-delete-modal">
        <div className="modal-header">
          <h2>İstifadəçini Sil</h2>
          <button onClick={onCancel} className="modal-close">×</button>
        </div>

        <div className="delete-confirm-content">
          <div className="warning-icon">
            ⚠️
          </div>
          
          <div className="confirm-message">
            <h3>Bu əməliyyatı təsdiq edirsizmi?</h3>
            <p>
              <strong>{user.username}</strong> ({user.email}) istifadəçisini silmək istəyirsiniz.
              Bu əməliyyat geriyə dönməzdir və istifadəçi sistemə daxil ola bilməyəcək.
            </p>
            
            <div className="user-info-box">
              <div className="user-detail">
                <span className="label">İstifadəçi adı:</span>
                <span className="value">{user.username}</span>
              </div>
              <div className="user-detail">
                <span className="label">Email:</span>
                <span className="value">{user.email}</span>
              </div>
              <div className="user-detail">
                <span className="label">Cari status:</span>
                <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                  {user.is_active ? 'Aktiv' : 'Deaktiv'}
                </span>
              </div>
            </div>

            <div className="warning-text">
              <strong>Diqqət:</strong> Bu əməliyyat istifadəçini tamamilə deaktiv edəcək və 
              sistem giriş imkanlarını məhdudlaşdıracaq.
            </div>
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
            className="btn-danger"
            disabled={loading}
          >
            {loading ? 'Silinir...' : 'Bəli, Sil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDeleteConfirm;