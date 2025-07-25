import React, { useCallback, memo } from 'react';

interface MobileOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const MobileOverlay: React.FC<MobileOverlayProps> = memo(({ isVisible, onClose }) => {
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isVisible) return null;

  return (
    <div 
      className={`sidebar-mobile-overlay md:hidden ${isVisible ? '' : 'hidden'}`}
      onClick={handleOverlayClick}
      aria-hidden="true"
    />
  );
});

MobileOverlay.displayName = 'MobileOverlay';

export default MobileOverlay;