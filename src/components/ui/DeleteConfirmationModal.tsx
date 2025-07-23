import React, { useState } from 'react';
import { AlertTriangle, Trash2, Archive, Info, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';

export type DeleteType = 'soft' | 'hard';

interface DeleteItem {
  id: number | string;
  name: string;
  type?: string;
  email?: string;
  additional_info?: Record<string, any>;
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (deleteType: DeleteType) => Promise<void>;
  item: DeleteItem;
  itemType: 'user' | 'department' | 'institution' | 'task' | 'survey' | 'document' | 'generic';
  title?: string;
  loading?: boolean;
  canHardDelete?: boolean;
  showBothOptions?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  item,
  itemType,
  title,
  loading = false,
  canHardDelete = true,
  showBothOptions = true
}) => {
  const [selectedDeleteType, setSelectedDeleteType] = useState<DeleteType>('soft');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const getItemTypeDisplay = () => {
    const types = {
      'user': 'İstifadəçi',
      'department': 'Şöbə',
      'institution': 'Təşkilat',
      'task': 'Tapşırıq',
      'survey': 'Sorğu',
      'document': 'Sənəd',
      'generic': 'Element'
    };
    return types[itemType] || 'Element';
  };

  const getSoftDeleteDescription = () => {
    const descriptions = {
      'user': 'İstifadəçi deaktiv ediləcək və sistemi istifadə edə bilməyəcək, lakin məlumatları qalacaq.',
      'department': 'Şöbə deaktiv ediləcək və yeni təyinatlar edilə bilməyəcək, lakin mövcud məlumatlar qalacaq.',
      'institution': 'Təşkilat deaktiv ediləcək və yeni fəaliyyətlər dayandırılacaq, lakin məlumatları qalacaq.',
      'task': 'Tapşırıq arxivlənəcək və aktiv siyahıdan çıxarılacaq, lakin tarixçə qalacaq.',
      'survey': 'Sorğu arxivlənəcək və yeni cavablar qəbul edilməyəcək, lakin mövcud cavablar qalacaq.',
      'document': 'Sənəd arxivlənəcək və aktiv siyahıdan çıxarılacaq, lakin faylda qalacaq.',
      'generic': 'Element deaktiv ediləcək, lakin məlumatları qalacaq.'
    };
    return descriptions[itemType] || descriptions.generic;
  };

  const getHardDeleteDescription = () => {
    const descriptions = {
      'user': 'İstifadəçi və onunla bağlı bütün məlumatlar tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.',
      'department': 'Şöbə və ona aid bütün məlumatlar tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.',
      'institution': 'Təşkilat və ona aid bütün məlumatlar tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.',
      'task': 'Tapşırıq və ona aid bütün məlumatlar tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.',
      'survey': 'Sorğu və bütün cavabları tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.',
      'document': 'Sənəd və fayl tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.',
      'generic': 'Element və ona aid bütün məlumatlar tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.'
    };
    return descriptions[itemType] || descriptions.generic;
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm(selectedDeleteType);
      onClose();
    } catch (error) {
      console.error('Delete operation failed:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const isProcessing = loading || isConfirming;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-2xl w-full m-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {title || `${getItemTypeDisplay()} Sil`}
                </h2>
                <p className="text-sm text-gray-600">Silmə əməliyyatının növünü seçin</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isProcessing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Item Information */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Silinəcək element:</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-20">Ad:</span>
                <span className="text-sm text-gray-900">{item.name}</span>
              </div>
              {item.email && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-20">Email:</span>
                  <span className="text-sm text-gray-900">{item.email}</span>
                </div>
              )}
              {item.type && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-20">Növ:</span>
                  <span className="text-sm text-gray-900">{item.type}</span>
                </div>
              )}
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-600 w-20">ID:</span>
                <span className="text-sm text-gray-900">{item.id}</span>
              </div>
            </div>
          </div>

          {/* Delete Type Selection */}
          {showBothOptions ? (
            <div className="space-y-4 mb-6">
              <h3 className="font-medium text-gray-900">Silmə növünü seçin:</h3>
              
              {/* Soft Delete Option */}
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedDeleteType === 'soft' 
                    ? 'border-orange-300 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-200'
                }`}
                onClick={() => setSelectedDeleteType('soft')}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    checked={selectedDeleteType === 'soft'}
                    onChange={() => setSelectedDeleteType('soft')}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Archive className="w-5 h-5 text-orange-600 mr-2" />
                      <h4 className="font-medium text-gray-900">Soft Delete (Arxivləşdirmə)</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {getSoftDeleteDescription()}
                    </p>
                    <div className="mt-2 flex items-center text-xs text-orange-600">
                      <Info className="w-3 h-3 mr-1" />
                      Tövsiyə edilən seçim - məlumatlar bərpa edilə bilər
                    </div>
                  </div>
                </div>
              </div>

              {/* Hard Delete Option */}
              {canHardDelete && (
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedDeleteType === 'hard' 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-gray-200 hover:border-red-200'
                  }`}
                  onClick={() => setSelectedDeleteType('hard')}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      checked={selectedDeleteType === 'hard'}
                      onChange={() => setSelectedDeleteType('hard')}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Trash2 className="w-5 h-5 text-red-600 mr-2" />
                        <h4 className="font-medium text-gray-900">Hard Delete (Tam Silmə)</h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        {getHardDeleteDescription()}
                      </p>
                      <div className="mt-2 flex items-center text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Diqqətli olun - bu əməliyyat geri qaytarıla bilməz
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">
                      {canHardDelete ? 'Tam silmə' : 'Arxivləşdirmə'}
                    </h4>
                    <p className="text-sm text-yellow-700">
                      {canHardDelete ? getHardDeleteDescription() : getSoftDeleteDescription()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warning for Hard Delete */}
          {selectedDeleteType === 'hard' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Son Xəbərdarlıq</h4>
                  <p className="text-sm text-red-700">
                    Bu əməliyyat geri alına bilməz. Bütün əlaqəli məlumatlar da silinəcək. 
                    Əgər əmin deyilsinizsə, "Soft Delete" seçimini istifadə edin.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Ləğv et
            </Button>
            <Button
              variant={selectedDeleteType === 'hard' ? 'destructive' : 'warning'}
              onClick={handleConfirm}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {selectedDeleteType === 'hard' ? 'Silinir...' : 'Arxivləşdirilir...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {selectedDeleteType === 'hard' ? (
                    <Trash2 className="w-4 h-4 mr-2" />
                  ) : (
                    <Archive className="w-4 h-4 mr-2" />
                  )}
                  {selectedDeleteType === 'hard' ? 'Tam Sil' : 'Arxivləşdir'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeleteConfirmationModal;