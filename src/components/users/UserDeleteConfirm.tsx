import React from 'react';
import DeleteConfirmationModal, { DeleteType } from '../ui/DeleteConfirmationModal';

interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
}

interface UserDeleteConfirmProps {
  user: User;
  onConfirm: (deleteType: DeleteType) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  canHardDelete?: boolean;
}

const UserDeleteConfirm: React.FC<UserDeleteConfirmProps> = ({ 
  user, 
  onConfirm, 
  onCancel, 
  loading = false,
  canHardDelete = true
}) => {
  const userName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.username;

  const deleteItem = {
    id: user.id,
    name: userName,
    email: user.email,
    type: user.is_active ? 'Aktiv İstifadəçi' : 'Deaktiv İstifadəçi',
    additional_info: {
      username: user.username,
      is_active: user.is_active
    }
  };

  return (
    <DeleteConfirmationModal
      isOpen={true}
      onClose={onCancel}
      onConfirm={onConfirm}
      item={deleteItem}
      itemType="user"
      title="İstifadəçini Sil"
      loading={loading}
      canHardDelete={canHardDelete}
      showBothOptions={true}
    />
  );
};

export default UserDeleteConfirm;