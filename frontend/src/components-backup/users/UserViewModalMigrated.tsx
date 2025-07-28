/**
 * User View Modal - Migrated to BaseModal
 * Köhnə 230+ sətirlik komponent → 100 sətir
 */

import React from 'react';
import { StyleSystem, styles } from '../../utils/StyleSystem';
import BaseModal from '../base/BaseModal';

interface User {
  id: number;
  username: string;
  email: string;
  role: {
    id: number | null;
    name: string | null;
    display_name: string | null;
    level: number | null;
  } | null;
  role_display_name: string | null;
  is_active: boolean;
  last_login_at: string | null;
  institution: {
    id: number | null;
    name: string | null;
  };
  created_at: string;
  profile?: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    contact_phone?: string;
  } | null;
}

interface UserViewModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStatusToggle: () => void;
}

const UserViewModal: React.FC<UserViewModalProps> = ({ 
  user, isOpen, onClose, onEdit, onDelete, onStatusToggle 
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
    
    const roleNames: { [key: string]: string } = {
      'superadmin': 'Super Administrator',
      'regionadmin': 'Regional Administrator',
      'schooladmin': 'School Administrator',
      'müəllim': 'Müəllim',
      'regionoperator': 'Regional Operator'
    };
    
    return role.display_name || roleNames[role.name] || role.name;
  };

  const getFullName = () => {
    if (user.profile?.first_name || user.profile?.last_name) {
      return `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim();
    }
    return user.username;
  };

  const getAccountType = (level: number | null) => {
    const accountTypes: { [key: number]: string } = {
      1: 'Sistem Administratoru',
      2: 'Regional İdarə',
      3: 'Regional Operator',
      4: 'Sektor İdarəsi',
      5: 'Məktəb İdarəsi',
      6: 'Təhsil İşçisi'
    };
    return level ? accountTypes[level] || 'Təyin edilməyib' : 'Təyin edilməyib';
  };

  // Detail item component
  const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div style={styles.flex('row', 'start', '4')}>
      <span style={{
        ...styles.text('sm', 'medium', StyleSystem.tokens.colors.gray[600]),
        minWidth: '120px'
      }}>
        {label}:
      </span>
      <span style={styles.text('sm', 'normal')}>
        {value}
      </span>
    </div>
  );

  // Section component
  const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div style={{
      ...styles.mb('6'),
      ...styles.p('4'),
      ...StyleSystem.card('default', '4'),
      ...StyleSystem.border(),
      borderRadius: StyleSystem.tokens.borderRadius.lg
    }}>
      <h4 style={{
        ...styles.text('base', 'semibold'),
        ...styles.mb('4'),
        ...styles.flex('row', 'center', '2')
      }}>
        <span>{icon}</span>
        {title}
      </h4>
      <div style={styles.space('3')}>
        {children}
      </div>
    </div>
  );

  // Profile header component
  const ProfileHeader = () => (
    <div style={{
      ...styles.flex('row', 'center', '4'),
      ...styles.p('6'),
      backgroundColor: StyleSystem.tokens.colors.gray[50],
      borderRadius: StyleSystem.tokens.borderRadius.lg
    }}>
      {/* Avatar */}
      <div style={{
        ...styles.center(),
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: StyleSystem.tokens.colors.primary[500],
        color: 'white',
        fontSize: '2rem',
        fontWeight: 'bold'
      }}>
        {user.username.charAt(0).toUpperCase()}
      </div>
      
      {/* Basic Info */}
      <div style={styles.flex('column', 'start', '1')}>
        <h3 style={styles.text('xl', 'bold')}>
          {getFullName()}
        </h3>
        <p style={styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600])}>
          @{user.username}
        </p>
        <span style={StyleSystem.badge(user.is_active ? 'success' : 'danger')}>
          {user.is_active ? '✅ Aktiv' : '❌ Deaktiv'}
        </span>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="👤 İstifadəçi Məlumatları"
      size="lg"
      variant="default"
      primaryAction={{
        label: '✏️ Redaktə Et',
        onClick: onEdit,
        variant: 'primary'
      }}
      secondaryAction={{
        label: 'Bağla',
        onClick: onClose,
        variant: 'secondary'
      }}
    >
      <div style={styles.space('6')}>
        {/* Profile Header */}
        <ProfileHeader />

        {/* Contact Information */}
        <Section title="Əlaqə Məlumatları" icon="📞">
          <DetailItem label="Email" value={user.email} />
          <DetailItem label="Telefon" value={user.profile?.contact_phone || 'Təyin edilməyib'} />
          <DetailItem label="Ad" value={user.profile?.first_name || 'Təyin edilməyib'} />
          <DetailItem label="Soyad" value={user.profile?.last_name || 'Təyin edilməyib'} />
        </Section>

        {/* Role and Institution */}
        <Section title="Rol və Təşkilat" icon="🏢">
          <DetailItem 
            label="Rol" 
            value={
              <span style={StyleSystem.badge('primary')}>
                {getRoleDisplayName(user.role)}
              </span>
            } 
          />
          <DetailItem label="Rol səviyyəsi" value={user.role?.level || 'N/A'} />
          <DetailItem label="Təşkilat" value={user.institution?.name || 'Təyin edilməyib'} />
          <DetailItem label="Təşkilat ID" value={user.institution?.id || 'N/A'} />
        </Section>

        {/* Activity Information */}
        <Section title="Aktivlik Məlumatları" icon="📊">
          <DetailItem label="Qeydiyyat tarixi" value={formatDate(user.created_at)} />
          <DetailItem label="Son giriş" value={formatDate(user.last_login_at)} />
          <DetailItem label="İstifadəçi ID" value={`#${user.id}`} />
          <DetailItem 
            label="Status" 
            value={
              <span style={{
                ...styles.text('sm', 'medium'),
                color: user.is_active ? StyleSystem.tokens.colors.success[600] : StyleSystem.tokens.colors.danger[600]
              }}>
                {user.is_active ? 'Aktiv və girişə açıq' : 'Deaktiv və girişə bağlı'}
              </span>
            } 
          />
        </Section>

        {/* System Information */}
        <Section title="Sistem Məlumatları" icon="⚙️">
          <DetailItem label="Rol kodu" value={user.role?.name || 'N/A'} />
          <DetailItem label="Hesab növü" value={getAccountType(user.role?.level)} />
          <DetailItem 
            label="Email təsdiqi" 
            value={
              <span style={{ color: StyleSystem.tokens.colors.success[600] }}>
                ✅ Təsdiqlənib
              </span>
            } 
          />
          <DetailItem 
            label="Məlumat tamlığı" 
            value={
              user.profile?.first_name && user.profile?.last_name && user.email ? (
                <span style={{ color: StyleSystem.tokens.colors.success[600] }}>
                  ✅ Tam
                </span>
              ) : (
                <span style={{ color: StyleSystem.tokens.colors.warning[600] }}>
                  ⚠️ Natamam
                </span>
              )
            } 
          />
        </Section>

        {/* Action Buttons */}
        <div style={{
          ...styles.flex('row', 'center', '3'),
          ...styles.p('4'),
          backgroundColor: StyleSystem.tokens.colors.gray[50],
          borderRadius: StyleSystem.tokens.borderRadius.lg
        }}>
          <button 
            onClick={onStatusToggle} 
            style={StyleSystem.button(user.is_active ? 'warning' : 'success', 'sm')}
          >
            {user.is_active ? '❌ Deaktiv Et' : '✅ Aktiv Et'}
          </button>
          
          <button 
            onClick={onDelete} 
            style={StyleSystem.button('danger', 'sm')}
          >
            🗑️ Sil
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

export default UserViewModal;