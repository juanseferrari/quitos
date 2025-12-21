// components/IOSContainer.jsx - Componente específico para iOS safe areas
import React from 'react';
import { useIOSViewport } from '../hooks/useIOSViewport';

const IOSContainer = ({ children, className = '' }) => {
  const { isIOS } = useIOSViewport();

  return (
    <div
      className={`
        h-screen-dynamic flex flex-col
        ${isIOS ? 'ios-safe-container-no-bottom' : 'flex flex-col h-screen'}
        ${className}
      `}
      style={{
        // Don't use overflow: hidden - it clips fixed position children like tab bar
        position: 'relative',
      }}
    >
      {children}
    </div>
  );
};

export const IOSContentArea = ({ children, className = '', noScroll = false }) => {
  return (
    <div
      className={`
        ${noScroll ? 'overflow-hidden' : 'overflow-y-auto ios-smooth-scroll overflow-x-hidden'}
        ${className}
      `}
      style={{
        // Use CSS variable for height - accounts for fixed tab bar
        height: 'var(--content-height)',
        maxHeight: 'var(--content-height)',
      }}
    >
      {children}
    </div>
  );
};

export const IOSTabBar = ({ children, className = '' }) => {
  const { isKeyboardOpen } = useIOSViewport();

  return (
    <div
      className={`ios-tab-bar ${className}`}
      style={{
        // Hide when keyboard is open
        opacity: isKeyboardOpen ? 0 : 1,
        pointerEvents: isKeyboardOpen ? 'none' : 'auto',
        transition: 'opacity 0.15s ease-out'
      }}
    >
      {children}
    </div>
  );
};

export default IOSContainer;