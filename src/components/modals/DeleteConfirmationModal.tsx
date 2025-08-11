import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Trash2, Archive } from 'lucide-react';
import { Department } from '@/services/departments';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  department: Department | null;
  onConfirm: (department: Department, deleteType: 'soft' | 'hard') => Promise<void>;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  open,
  onClose,
  department,
  onConfirm,
}) => {
  const [deleteType, setDeleteType] = useState<'soft' | 'hard'>('soft');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!department) return;

    setLoading(true);
    try {
      await onConfirm(department, deleteType);
      onClose();
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDeleteType('soft'); // Reset to default
    onClose();
  };

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Departamenti sil
          </DialogTitle>
          <DialogDescription>
            Bu əməliyyatı necə icra etmək istəyirsiniz?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="font-medium">{department.name}</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Müəssisə: {department.institution?.name}</div>
              <div>Növ: {department.department_type_display || department.department_type}</div>
              <div>Status: {department.is_active ? 'Aktiv' : 'Deaktiv'}</div>
            </div>
          </div>

          <RadioGroup value={deleteType} onValueChange={(value: 'soft' | 'hard') => setDeleteType(value)}>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="soft" id="soft" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="soft" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Archive className="h-4 w-4 text-blue-600" />
                    Soft Delete (Deaktiv et)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Departament deaktiv ediləcək, lakin məlumatlar saxlanılacaq. 
                    Gələcəkdə bərpa etmək mümkün olacaq.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="hard" id="hard" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="hard" className="flex items-center gap-2 font-medium cursor-pointer">
                    <Trash2 className="h-4 w-4 text-destructive" />
                    Hard Delete (Tamamilə sil)
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Departament və bütün məlumatları tamamilə silinəcək. 
                    Bu əməliyyat geri alına bilməz.
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>

          {deleteType === 'hard' && (
            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Diqqət!</span>
              </div>
              <p className="text-sm text-destructive/80 mt-1">
                Bu əməliyyat geri alına bilməz. Departament və bütün əlaqəli məlumatlar 
                tamamilə silinəcək.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            Ləğv et
          </Button>
          <Button 
            type="button" 
            variant={deleteType === 'hard' ? 'destructive' : 'default'}
            onClick={handleConfirm} 
            disabled={loading}
          >
            {loading ? 'Əməliyyat icra olunur...' : (
              deleteType === 'soft' ? 'Deaktiv et' : 'Tamamilə sil'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};