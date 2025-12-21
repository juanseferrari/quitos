// components/IOSContainer.jsx - Componente específico para iOS safe areas
import React, { useEffect } from 'react';
import { useIOSViewport } from '../hooks/useIOSViewport';

const IOSContainer = ({ children, className = '' }) => {
  const { isIOS, isKeyboardOpen } = useIOSViewport();

  // Force layout recalculation when keyboard state changes
  useEffect(() => {
    if (!isKeyboardOpen) {
      // Small delay to ensure DOM is updated
      const timer = setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isKeyboardOpen]);

  return (
    <div className={`
      h-screen-dynamic flex flex-col overflow-hidden
      ${isIOS ? 'ios-safe-container-no-bottom' : 'flex flex-col h-screen'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const IOSContentArea = ({ children, className = '', noScroll = false }) => {
  return (
    <div className={`
      flex-1 min-h-0 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto ios-smooth-scroll overflow-x-hidden'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const IOSTabBar = ({ children, className = '' }) => {
  const { isKeyboardOpen } = useIOSViewport();

  return (
    <div
      className={`
        flex-shrink-0 ios-tab-bar
        ${isKeyboardOpen ? 'ios-tab-bar-keyboard-open' : ''}
        ${className}
      `}
      style={{
        // Force tab bar to bottom when keyboard closes
        transform: isKeyboardOpen ? 'translateY(100%)' : 'translateY(0)',
        transition: 'transform 0.2s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default IOSContainer;