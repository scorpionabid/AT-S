import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiUsers, 
  FiFileText, 
  FiGrid, 
  FiShield, 
  FiFolder,
  FiClipboard,
  FiCalendar,
  FiBarChart,
  FiSettings,
  FiZap,
  FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getQuickActions } from '../../utils/navigation/navigationPermissions';
import { canAccessMenuItem } from '../../utils/navigation/menuConfig';
import { cn } from '../../utils/cn';

interface QuickActionsProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  color: string;
  category: string;
  shortcut?: string;
  requiredRoles?: string[];
}

const QuickActionsPanel: React.FC<QuickActionsProps> = ({
  isOpen,
  onClose,
  className = ''
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Define quick actions
  const quickActions: QuickAction[] = [
    // User Management
    {
      id: 'create-user',
      title: 'Yeni İstifadəçi',
      description: 'Sistemə yeni istifadəçi əlavə edin',
      path: '/users/create',
      icon: FiUsers,
      color: 'blue',
      category: 'İstifadəçi İdarəetməsi',
      shortcut: 'U',
      requiredRoles: ['superadmin', 'regionadmin']
    },
    {
      id: 'create-institution',
      title: 'Yeni Müəssisə',
      description: 'Təhsil müəssisəsi yaradın',
      path: '/institutions/create',
      icon: FiGrid,
      color: 'indigo',
      category: 'Müəssisə İdarəetməsi',
      shortcut: 'I',
      requiredRoles: ['superadmin']
    },
    // Content Creation
    {
      id: 'create-survey',
      title: 'Yeni Sorğu',
      description: 'Anket və sorğu yaradın',
      path: '/surveys/create',
      icon: FiFileText,
      color: 'green',
      category: 'Məzmun Yaratma',
      shortcut: 'S'
    },
    {
      id: 'create-task',
      title: 'Yeni Tapşırıq',
      description: 'İş tapşırığı təyin edin',
      path: '/tasks/create',
      icon: FiClipboard,
      color: 'orange',
      category: 'Tapşırıq İdarəetməsi',
      shortcut: 'T',
      requiredRoles: ['superadmin', 'regionadmin', 'sektoradmin']
    },
    // Documents & Files
    {
      id: 'upload-document',
      title: 'Sənəd Yüklə',
      description: 'Fayl və sənəd paylaşın',
      path: '/documents/upload',
      icon: FiFolder,
      color: 'purple',
      category: 'Sənəd İdarəetməsi',
      shortcut: 'D'
    },
    // Academic Management
    {
      id: 'create-schedule',
      title: 'Cədvəl Yarat',
      description: 'Dərs cədvəli hazırlayın',
      path: '/schedules/create',
      icon: FiCalendar,
      color: 'teal',
      category: 'Akademik İdarəetmə',
      shortcut: 'C',
      requiredRoles: ['superadmin', 'schooladmin', 'muavin_mudir']
    },
    {
      id: 'track-attendance',
      title: 'Davamiyyət Qeyd Et',
      description: 'Sinif davamiyyətini qeydə alın',
      path: '/attendance',
      icon: FiUsers,
      color: 'pink',
      category: 'Akademik İdarəetmə',
      shortcut: 'A',
      requiredRoles: ['superadmin', 'schooladmin', 'muavin_mudir', 'muellim']
    },
    // Reports & Analytics
    {
      id: 'generate-report',
      title: 'Hesabat Hazırla',
      description: 'Sistemin hesabatını çıxarın',
      path: '/reports',
      icon: FiBarChart,
      color: 'red',
      category: 'Hesabat və Analitika',
      shortcut: 'R'
    },
    // System Administration
    {
      id: 'create-role',
      title: 'Yeni Rol',
      description: 'Sistem rolu yaradın',
      path: '/roles/create',
      icon: FiShield,
      color: 'gray',
      category: 'Sistem İdarəetməsi',
      shortcut: 'O',
      requiredRoles: ['superadmin']
    },
    {
      id: 'system-settings',
      title: 'Sistem Tənzimləri',
      description: 'Sistem parametrlərini dəyişin',
      path: '/settings',
      icon: FiSettings,
      color: 'slate',
      category: 'Sistem İdarəetməsi',
      requiredRoles: ['superadmin', 'regionadmin']
    }
  ];

  // Filter actions based on user permissions
  const availableActions = quickActions.filter(action => {
    if (!action.requiredRoles) return true;
    return action.requiredRoles.some(role => 
      user?.role === role || user?.roles?.includes(role)
    );
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(availableActions.map(action => action.category)))];

  // Filter actions by selected category
  const filteredActions = selectedCategory === 'all' 
    ? availableActions 
    : availableActions.filter(action => action.category === selectedCategory);

  // Handle action selection
  const handleActionSelect = (action: QuickAction) => {
    navigate(action.path);
    onClose();
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Handle number keys for quick access
      const numberPressed = parseInt(e.key);
      if (numberPressed >= 1 && numberPressed <= filteredActions.length) {
        e.preventDefault();
        handleActionSelect(filteredActions[numberPressed - 1]);
        return;
      }

      // Handle letter shortcuts
      const action = availableActions.find(a => 
        a.shortcut?.toLowerCase() === e.key.toLowerCase()
      );
      if (action && e.altKey) {
        e.preventDefault();
        handleActionSelect(action);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredActions, availableActions, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      {/* Panel */}
      <div className="flex min-h-full items-start justify-center p-4 pt-[10vh]">
        <div className={cn(
          "w-full max-w-screen-lg bg-white rounded-xl shadow-2xl overflow-hidden",
          "border border-gray-200",
          className
        )}>
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FiZap className="w-5 h-5 mr-2 text-yellow-500" />
                  Tez Əməliyyatlar
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sürətli naviqasiya və tez-tez istifadə olunan əməliyyatlar
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                    selectedCategory === category
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {category === 'all' ? 'Hamısı' : category}
                  <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
                    {category === 'all' 
                      ? availableActions.length 
                      : availableActions.filter(a => a.category === category).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionSelect(action)}
                    className="group p-4 text-left border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        `bg-${action.color}-100`
                      )}>
                        <Icon className={cn("w-5 h-5", `text-${action.color}-600`)} />
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        {action.shortcut && (
                          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600">
                            Alt+{action.shortcut}
                          </kbd>
                        )}
                        <span className="text-gray-300">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {action.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {action.category}
                      </span>
                      <FiChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredActions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FiZap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Bu kateqoriyada heç bir əməliyyat yoxdur</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                <span>1-9: Sürətli seçim</span>
                <span>Alt+Hərf: Qısayol</span>
                <span>Esc: Bağla</span>
              </div>
              <div>
                {filteredActions.length} əməliyyat mövcuddur
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;