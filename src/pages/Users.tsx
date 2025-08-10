import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DataTable, Column } from '@/components/common/DataTable';
import { UserModal } from '@/components/modals/UserModal';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { useCRUD } from '@/hooks/useCRUD';
import { userService, User, CreateUserData, UpdateUserData } from '@/services/users';
import { useToast } from '@/hooks/use-toast';

// Role labels for display
const roleLabels: Record<string, string> = {
  superadmin: 'Super Admin',
  regionadmin: 'Regional Admin', 
  regionoperator: 'Regional Operator',
  sektoradmin: 'Sektor Admin',
  məktəbadmin: 'Məktəb Admin',
  müəllim: 'Müəllim',
  user: 'İstifadəçi',
};



const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Aktiv', variant: 'default' },
  inactive: { label: 'Deaktiv', variant: 'secondary' },
};

export default function Users() {
  const { toast } = useToast();
  
  const {
    data,
    loading,
    selectedItem,
    isModalOpen,
    isDeleteDialogOpen,
    itemToDelete,
    pagination,
    actions: {
      openModal,
      closeModal,
      openDeleteDialog,
      closeDeleteDialog,
      handleCreate,
      handleUpdate,
      handleDelete,
      handleBulkDelete,
      refresh,
    },
  } = useCRUD<User>([], {
    fetchData: async (params) => {
      return await userService.getUsers(params);
    },
    create: async (userData: CreateUserData) => {
      return await userService.createUser(userData);
    },
    update: async (id: number, userData: UpdateUserData) => {
      return await userService.updateUser(id, userData);
    },
    delete: async (id: number) => {
      await userService.deleteUser(id);
    },
    bulkDelete: async (ids: number[]) => {
      await userService.bulkAction({
        user_ids: ids,
        action: 'delete'
      });
    },
    autoLoad: true,
    onSuccess: (action) => {
      if (action === 'create') {
        closeModal();
      }
    },
    onError: (action, error) => {
      console.error(`${action} error:`, error);
    }
  });

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
      key: 'institution',
      title: 'Region/Təşkilat',
      render: (value, row) => (
        <span className="text-sm">
          {row.region?.name || row.institution?.name || '-'}
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
      key: 'created_at',
      title: 'Yaradıldı',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {value ? new Date(value).toLocaleDateString('az-AZ') : '-'}
        </span>
      ),
    },
  ];

  const handleSave = async (userData: any) => {
    if (selectedItem) {
      await handleUpdate(selectedItem.id, userData);
    } else {
      await handleCreate(userData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await handleDelete(itemToDelete.id);
    }
  };

  const handleBulkDeleteConfirm = async (users: User[]) => {
    await handleBulkDelete(users.map(u => Number(u.id)));
  };

  const handleExport = () => {
    // CSV eksport funksiyası
    const csvData = data.map(user => ({
      'Ad və Soyad': user.name,
      'Email': user.email,
      'Rol': roleLabels[user.role] || user.role,
      'Region': user.region?.name || '',
      'Təşkilat': user.institution?.name || '',
      'Telefon': user.phone || '',
      'Status': statusLabels[user.status]?.label || user.status,
      'Yaradıldı': user.created_at || '',
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