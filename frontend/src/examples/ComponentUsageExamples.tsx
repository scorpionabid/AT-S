/**
 * ATİS Component Usage Examples
 * Yaratdığım yeni komponentlərin istifadə nümunələri
 */

import React from 'react';
import { StyleSystem, styles } from '../utils/StyleSystem';
import { HookFactory } from '../hooks/HookFactory';
import BaseModal, { useModal, ConfirmationModal } from '../components/base/BaseModal';
import BaseListComponent from '../components/base/BaseListComponent';
import BaseForm, { FormWrapper } from '../components/base/BaseForm';
import { GenericCrudService } from '../services/base/GenericCrudService';

// ====================
// 1. StyleSystem Usage Examples
// ====================

export const StyleSystemExamples = () => {
  return (
    <div style={styles.p('6')}>
      <h2 style={styles.text('2xl', 'bold')}>StyleSystem Examples</h2>
      
      {/* Button Examples */}
      <div style={{ ...styles.flex('row', 'center', '4'), ...styles.my('4') }}>
        <button style={StyleSystem.button('primary')}>
          Primary Button
        </button>
        <button style={StyleSystem.button('secondary', 'lg')}>
          Large Secondary
        </button>
        <button style={StyleSystem.button('danger', 'sm')}>
          Small Danger
        </button>
      </div>

      {/* Card Examples */}
      <div style={{ ...styles.grid(), ...styles.mb('6') }}>
        <div style={StyleSystem.card()}>
          <h3 style={styles.text('lg', 'semibold')}>Default Card</h3>
          <p style={styles.text('base')}>StyleSystem ilə yaradılmış card</p>
        </div>
        
        <div style={StyleSystem.card('elevated', '8')}>
          <h3 style={styles.text('lg', 'semibold')}>Elevated Card</h3>
          <p style={styles.text('base')}>Böyük padding ilə</p>
        </div>
      </div>

      {/* Input Examples */}
      <div style={styles.mb('4')}>
        <input 
          placeholder="Normal input"
          style={StyleSystem.input()} 
        />
      </div>
      
      <div style={styles.mb('4')}>
        <input 
          placeholder="Error input"
          style={StyleSystem.input(true)} 
        />
      </div>

      {/* Badge Examples */}
      <div style={styles.flex('row', 'center', '2')}>
        <span style={StyleSystem.badge('primary')}>Primary</span>
        <span style={StyleSystem.badge('success')}>Success</span>
        <span style={StyleSystem.badge('danger')}>Danger</span>
        <span style={StyleSystem.badge('warning')}>Warning</span>
      </div>
    </div>
  );
};

// ====================
// 2. HookFactory Usage Examples
// ====================

// User service example
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const userService = new GenericCrudService<User>('/users');

export const HookFactoryExamples = () => {
  // Created hooks using HookFactory
  const useUsersList = HookFactory.createListHook(userService, {
    pageSize: 10,
    onSuccess: (op, data) => console.log(`${op} successful:`, data),
    onError: (op, error) => console.error(`${op} failed:`, error)
  });

  const useUserSubmit = HookFactory.createSubmitHook(
    async (userData: Partial<User>) => {
      return await userService.create(userData);
    },
    {
      onSuccess: (user) => console.log('User created:', user),
      onError: (error) => console.error('Creation failed:', error)
    }
  );

  const useToggleModal = HookFactory.createToggleHook();
  const useLocalSettings = HookFactory.createLocalStorageHook('user-settings', { theme: 'light' });

  // Component using the hooks
  const usersList = useUsersList();
  const userSubmit = useUserSubmit();
  const modalToggle = useToggleModal();
  const { value: settings, setValue: setSettings } = useLocalSettings();

  return (
    <div style={styles.p('6')}>
      <h2 style={styles.text('2xl', 'bold')}>HookFactory Examples</h2>
      
      {/* Toggle example */}
      <div style={styles.mb('4')}>
        <button 
          onClick={modalToggle.toggle}
          style={StyleSystem.button('primary')}
        >
          Toggle Modal: {modalToggle.value ? 'Open' : 'Closed'}
        </button>
      </div>

      {/* Local storage example */}
      <div style={styles.mb('4')}>
        <p>Theme: {settings.theme}</p>
        <button 
          onClick={() => setSettings(prev => ({ 
            ...prev, 
            theme: prev.theme === 'light' ? 'dark' : 'light' 
          }))}
          style={StyleSystem.button('secondary')}
        >
          Toggle Theme
        </button>
      </div>

      {/* List operations example */}
      <div style={styles.mb('4')}>
        <p>Selected users: {usersList.selectedItems.length}</p>
        <p>Total users: {usersList.pagination?.total || 0}</p>
        
        <div style={styles.flex('row', 'center', '2')}>
          <button 
            onClick={usersList.refresh}
            style={StyleSystem.button('secondary')}
          >
            Refresh List
          </button>
          
          <button 
            onClick={usersList.selectAll}
            style={StyleSystem.button('secondary')}
          >
            Select All
          </button>
        </div>
      </div>

      {/* Submit example */}
      <div>
        <button 
          onClick={() => userSubmit.submit({ name: 'Test User', email: 'test@test.com' })}
          disabled={userSubmit.submitting}
          style={StyleSystem.button('primary')}
        >
          {userSubmit.submitting ? 'Creating...' : 'Create User'}
        </button>
        
        {userSubmit.error && (
          <p style={styles.text('sm', 'normal', StyleSystem.tokens.colors.danger[600])}>
            Error: {userSubmit.error}
          </p>
        )}
      </div>
    </div>
  );
};

// ====================
// 3. BaseModal Usage Examples
// ====================

export const BaseModalExamples = () => {
  const { isOpen, open, close } = useModal();
  const confirmModal = useModal();

  return (
    <div style={styles.p('6')}>
      <h2 style={styles.text('2xl', 'bold')}>BaseModal Examples</h2>
      
      <div style={styles.flex('row', 'center', '4')}>
        <button onClick={open} style={StyleSystem.button('primary')}>
          Open Modal
        </button>
        
        <button onClick={confirmModal.open} style={StyleSystem.button('danger')}>
          Delete Item
        </button>
      </div>

      {/* Basic Modal */}
      <BaseModal
        isOpen={isOpen}
        onClose={close}
        title="Example Modal"
        size="md"
        primaryAction={{
          label: 'Save',
          onClick: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            close();
          }
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: close
        }}
      >
        <p style={styles.text('base')}>
          Bu modal BaseModal komponenti ilə yaradılıb.
          StyleSystem design tokens istifadə edir.
        </p>
      </BaseModal>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.close}
        title="Delete Confirmation"
        message="Bu elementi silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={async () => {
          // Simulate delete operation
          await new Promise(resolve => setTimeout(resolve, 500));
          confirmModal.close();
        }}
      />
    </div>
  );
};

// ====================
// 4. BaseListComponent Usage Example
// ====================

export const BaseListExamples = () => {
  return (
    <div style={styles.p('6')}>
      <h2 style={styles.text('2xl', 'bold')}>BaseListComponent Example</h2>
      
      <BaseListComponent<User>
        service={userService}
        columns={[
          {
            key: 'id',
            label: 'ID',
            width: '80px',
            sortable: true
          },
          {
            key: 'name',
            label: 'Ad',
            sortable: true,
            render: (value, item) => (
              <div style={styles.flex('row', 'center', '2')}>
                <div 
                  style={{
                    ...styles.rounded('full'),
                    width: '32px',
                    height: '32px',
                    backgroundColor: StyleSystem.tokens.colors.primary[100],
                    ...styles.center()
                  }}
                >
                  {value.charAt(0).toUpperCase()}
                </div>
                <span style={styles.text('sm', 'medium')}>{value}</span>
              </div>
            )
          },
          {
            key: 'email',
            label: 'Email',
            sortable: true
          },
          {
            key: 'role',
            label: 'Rol',
            render: (value) => (
              <span style={StyleSystem.badge(
                value === 'admin' ? 'danger' : 
                value === 'teacher' ? 'primary' : 'gray'
              )}>
                {value}
              </span>
            )
          }
        ]}
        actions={[
          {
            key: 'edit',
            label: 'Edit',
            icon: '✏️',
            variant: 'secondary',
            onClick: (user) => console.log('Edit user:', user)
          },
          {
            key: 'delete',
            label: 'Delete',
            icon: '🗑️',
            variant: 'danger',
            onClick: (user) => console.log('Delete user:', user)
          }
        ]}
        bulkActions={[
          {
            key: 'bulk-delete',
            label: 'Delete Selected',
            icon: '🗑️',
            variant: 'danger',
            confirmMessage: 'Seçilmiş istifadəçiləri silmək istədiyinizə əminsiniz?',
            onClick: (users) => console.log('Bulk delete:', users)
          },
          {
            key: 'bulk-export',
            label: 'Export Selected',
            icon: '📤',
            variant: 'secondary',
            onClick: (users) => console.log('Export users:', users)
          }
        ]}
        filters={[
          {
            key: 'role',
            label: 'Rol',
            type: 'select',
            options: [
              { value: 'admin', label: 'Admin' },
              { value: 'teacher', label: 'Teacher' },
              { value: 'student', label: 'Student' }
            ]
          },
          {
            key: 'created_at',
            label: 'Yaradılma tarixi',
            type: 'date'
          }
        ]}
        searchable
        selectable
        pagination
        onItemClick={(user) => console.log('Clicked user:', user)}
      />
    </div>
  );
};

// ====================
// 5. BaseForm Usage Example
// ====================

interface CreateUserForm {
  name: string;
  email: string;
  role: string;
  bio?: string;
  isActive: boolean;
  birthDate?: string;
}

export const BaseFormExamples = () => {
  const { isOpen, open, close } = useModal();

  const userFormConfig = {
    fields: [
      {
        name: 'name',
        label: 'Ad Soyad',
        type: 'text' as const,
        required: true,
        placeholder: 'Adınızı daxil edin',
        validation: {
          minLength: 2,
          maxLength: 50
        },
        gridCols: 6
      },
      {
        name: 'email',
        label: 'Email',
        type: 'email' as const,
        required: true,
        placeholder: 'example@domain.com',
        validation: {
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        },
        gridCols: 6
      },
      {
        name: 'role',
        label: 'Rol',
        type: 'select' as const,
        required: true,
        options: [
          { value: 'admin', label: 'Administrator' },
          { value: 'teacher', label: 'Müəllim' },
          { value: 'student', label: 'Şagird' }
        ],
        gridCols: 6
      },
      {
        name: 'birthDate',
        label: 'Doğum tarixi',
        type: 'date' as const,
        gridCols: 6
      },
      {
        name: 'bio',
        label: 'Qısa məlumat',
        type: 'textarea' as const,
        placeholder: 'Özünüz haqqında qısa məlumat',
        validation: {
          maxLength: 500
        },
        gridCols: 12
      },
      {
        name: 'isActive',
        label: 'Aktiv istifadəçi',
        type: 'checkbox' as const,
        gridCols: 12
      }
    ],
    sections: [
      {
        title: 'Şəxsi məlumatlar',
        description: 'İstifadəçinin əsas məlumatları',
        fields: ['name', 'email', 'birthDate']
      },
      {
        title: 'Sistem məlumatları',
        description: 'Rollar və icazələr',
        fields: ['role', 'isActive']
      },
      {
        title: 'Əlavə məlumatlar',
        description: 'İxtiyari sahələr',
        fields: ['bio']
      }
    ],
    submitEndpoint: '/users',
    validationMode: 'onBlur' as const
  };

  return (
    <div style={styles.p('6')}>
      <h2 style={styles.text('2xl', 'bold')}>BaseForm Examples</h2>
      
      <button onClick={open} style={StyleSystem.button('primary')}>
        Open User Form
      </button>

      <BaseModal
        isOpen={isOpen}
        onClose={close}
        title="Create New User"
        size="lg"
      >
        <FormWrapper<CreateUserForm>
          config={userFormConfig}
          variant="sectioned"
          layout="horizontal"
          isModal
          onCancel={close}
          onSuccess={(user) => {
            console.log('User created:', user);
            close();
          }}
          onError={(error) => {
            console.error('Form error:', error);
          }}
        />
      </BaseModal>

      {/* Standalone form example */}
      <div style={styles.mt('8')}>
        <h3 style={styles.text('lg', 'semibold')}>Standalone Form</h3>
        
        <BaseForm<CreateUserForm>
          config={userFormConfig}
          variant="default"
          size="md"
          showResetButton
          onSuccess={(user) => console.log('User created:', user)}
          onError={(error) => console.error('Error:', error)}
        />
      </div>
    </div>
  );
};

// ====================
// Usage in Real Components
// ====================

export const MigrationExample = () => {
  // Köhnə kod (6670+ className istifadəsi):
  // <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
  
  // Yeni kod (StyleSystem istifadəsi):
  const cardStyle = {
    ...StyleSystem.card('default', '6'),
    ...StyleSystem.shadow('md', 'lg'),
    ...StyleSystem.transition()
  };

  return (
    <div style={cardStyle}>
      <h3 style={styles.text('lg', 'semibold')}>Migration Example</h3>
      <p style={styles.text('base', 'normal', StyleSystem.tokens.colors.gray[600])}>
        6670+ className istifadəsi StyleSystem ilə əvəz edildi.
        Artıq consistent design system var.
      </p>
    </div>
  );
};

export default {
  StyleSystemExamples,
  HookFactoryExamples,
  BaseModalExamples,
  BaseListExamples,
  BaseFormExamples,
  MigrationExample
};