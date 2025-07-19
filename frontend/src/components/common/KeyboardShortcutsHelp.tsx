import React, { memo } from 'react';
import { FiX, FiCommand, FiZap } from 'react-icons/fi';
import { cn } from '../../utils/cn';
import { useKeyboardShortcutsHelp, useGlobalKeyboardShortcuts } from '../../hooks/useGlobalKeyboardShortcuts';

interface KeyboardShortcutsHelpProps {
  className?: string;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = memo(({ className }) => {
  const { showHelp, closeHelp } = useKeyboardShortcutsHelp();
  const { getShortcutsByCategory, formatShortcut } = useGlobalKeyboardShortcuts();

  if (!showHelp) return null;

  const categories = [
    { key: 'navigation', title: 'Naviqasiya', icon: FiCommand },
    { key: 'sidebar', title: 'Sidebar', icon: FiZap },
    { key: 'actions', title: 'Əməliyyatlar', icon: FiZap },
    { key: 'system', title: 'Sistem', icon: FiCommand },
  ];

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeHelp();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeHelp();
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center',
        'bg-black/50 backdrop-blur-sm',
        'animate-in fade-in duration-200',
        className
      )}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div className={cn(
        'relative w-full max-w-4xl max-h-[90vh] mx-4',
        'bg-white dark:bg-gray-900',
        'rounded-xl shadow-2xl',
        'border border-gray-200 dark:border-gray-700',
        'animate-in zoom-in-95 duration-200'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FiCommand className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                Klaviatura Qısayolları
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Daha sürətli naviqasiya üçün klaviatura qısayollarından istifadə edin
              </p>
            </div>
          </div>
          <button
            onClick={closeHelp}
            className={cn(
              'p-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            )}
            aria-label="Bağla"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map(category => {
              const shortcuts = getShortcutsByCategory(category.key);
              
              if (shortcuts.length === 0) return null;

              return (
                <div key={category.key} className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <category.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {category.title}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {shortcuts.map((shortcut, index) => (
                      <div
                        key={`${category.key}-${index}`}
                        className={cn(
                          'flex items-center justify-between p-3',
                          'bg-gray-50 dark:bg-gray-800/50',
                          'rounded-lg border border-gray-200 dark:border-gray-700',
                          'transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center space-x-1 ml-4">
                          {formatShortcut(shortcut).split(' + ').map((key, keyIndex) => (
                            <React.Fragment key={keyIndex}>
                              {keyIndex > 0 && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 mx-1">+</span>
                              )}
                              <kbd className={cn(
                                'px-2 py-1 text-xs font-mono',
                                'bg-white dark:bg-gray-900',
                                'border border-gray-300 dark:border-gray-600',
                                'rounded shadow-sm',
                                'text-gray-700 dark:text-gray-300'
                              )}>
                                {key}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Tips */}
          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <FiZap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Məsləhətlər
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Klaviatura qısayolları yalnız mətn sahəsində yazmadığınız zaman işləyir</li>
                  <li>• <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-xs">Esc</kbd> düyməsi aktiv mətn sahəsindən çıxmaq üçün istifadə edilir</li>
                  <li>• <kbd className="px-1 py-0.5 bg-white dark:bg-gray-800 rounded text-xs">?</kbd> düyməsi bu yardım pəncərəsini açır/bağlayır</li>
                  <li>• Qısayollar istifadəçi icazələrinə əsasən aktivləşir</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {getShortcutsByCategory('navigation').length + 
                 getShortcutsByCategory('sidebar').length + 
                 getShortcutsByCategory('actions').length + 
                 getShortcutsByCategory('system').length} qısayol mövcuddur
              </span>
              <span>
                Bu pəncərəni bağlamaq üçün <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> basın
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

KeyboardShortcutsHelp.displayName = 'KeyboardShortcutsHelp';

export default KeyboardShortcutsHelp;