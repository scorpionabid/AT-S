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
      className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ease-in-out"
      onClick={handleOverlayClick}
      aria-hidden="true"
    />
  );
});

MobileOverlay.displayName = 'MobileOverlay';

export default MobileOverlay;