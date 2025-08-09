import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable, Column } from '@/components/common/DataTable';
import { UserModal, User } from '@/components/modals/UserModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { useCRUD } from '@/hooks/useCRUD';

// Mock data - bu real API ilə əvəz ediləcək
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sistem Administrator',
    email: 'admin@edu.gov.az',
    role: 'super_admin',
    status: 'active',
    phone: '+994 12 123 45 67',
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Bakı Regional Admin',
    email: 'baki@edu.gov.az',
    role: 'region_admin',
    region: 'baki',
    status: 'active',
    phone: '+994 12 234 56 78',
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    name: 'Şəki Regional Admin',
    email: 'seki@edu.gov.az',
    role: 'region_admin',
    region: 'seki-zaqatala',
    status: 'active',
    phone: '+994 24 123 45 67',
    createdAt: '2024-01-25',
  },
  {
    id: '4',
    name: 'Test Teacher',
    email: 'teacher@school.edu.az',
    role: 'teacher',
    institution: 'Bakı 123 saylı məktəb',
    status: 'inactive',
    phone: '+994 50 123 45 67',
    createdAt: '2024-02-01',
  },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  region_admin: 'Region Admin',
  institution_admin: 'Təşkilat Admin',
  teacher: 'Müəllim',
  observer: 'Müşahidəçi',
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Aktiv', variant: 'default' },
  inactive: { label: 'Deaktiv', variant: 'secondary' },
};

export default function Users() {
  const {
    data,
    loading,
    selectedItem,
    isModalOpen,
    isDeleteDialogOpen,
    itemToDelete,
    actions: {
      setData,
      openModal,
      closeModal,
      openDeleteDialog,
      closeDeleteDialog,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleBulkDelete,
    },
  } = useCRUD<User>(mockUsers);

  const columns: Column<User>[] = [
    {
      key: 'name',
      title: 'Ad və Soyad',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {row.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-sm text-muted-foreground">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Rol',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">
          {roleLabels[value] || value}
        </Badge>
      ),
    },
    {
      key: 'region',
      title: 'Region/Təşkilat',
      render: (value, row) => (
        <span className="text-sm">
          {row.region || row.institution || '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      title: 'Telefon',
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => {
        const config = statusLabels[value];
        return (
          <Badge variant={config.variant}>
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Yaradıldı',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString('az-AZ') : '-'}
        </span>
      ),
    },
  ];

  const handleSave = async (userData: Partial<User>) => {
    if (selectedItem) {
      await handleUpdate(selectedItem.id, userData);
    } else {
      await handleCreate(userData as Omit<User, 'id'>);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete.id);
    }
  };

  const handleBulkDeleteConfirm = async (users: User[]) => {
    await handleBulkDelete(users.map(u => u.id));
  };

  const handleExport = () => {
    // CSV eksport funksiyası
    const csvData = data.map(user => ({
      'Ad və Soyad': user.name,
      'Email': user.email,
      'Rol': roleLabels[user.role] || user.role,
      'Region': user.region || '',
      'Təşkilat': user.institution || '',
      'Telefon': user.phone || '',
      'Status': statusLabels[user.status]?.label || user.status,
      'Yaradıldı': user.createdAt || '',
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'istifadeciler.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">İstifadəçilər</h1>
          <p className="text-muted-foreground">Sistem istifadəçilərinin idarə edilməsi</p>
        </div>
        <Button onClick={() => openModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni İstifadəçi
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>İstifadəçi Siyahısı</CardTitle>
          <CardDescription>
            Sistemdə qeydiyyatdan keçmiş bütün istifadəçilər
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={data}
            columns={columns}
            loading={loading}
            searchable
            selectable
            onRowEdit={(user) => openModal(user)}
            onRowDelete={openDeleteDialog}
            onBulkDelete={handleBulkDeleteConfirm}
            onExport={handleExport}
            emptyState={
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Heç bir istifadəçi tapılmadı</p>
                <Button onClick={() => openModal()}>
                  <Plus className="h-4 w-4 mr-2" />
                  İlk istifadəçini əlavə et
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      <UserModal
        open={isModalOpen}
        onClose={closeModal}
        user={selectedItem}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        title="İstifadəçini sil"
        description={`"${itemToDelete?.name}" istifadəçisini silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.`}
        type="danger"
        loading={loading}
      />
    </div>
  );
}