// components/IOSContainer.jsx - Componente específico para iOS safe areas
import React from 'react';
import { useIOSViewport } from '../hooks/useIOSViewport';

const IOSContainer = ({ children, className = '' }) => {
  const { isIOS } = useIOSViewport();
  
  return (
    <div className={`
      h-screen-dynamic flex flex-col
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
      flex-1 ${noScroll ? 'overflow-hidden' : 'overflow-y-auto ios-smooth-scroll'}
      ${className}
    `}>
      {children}
    </div>
  );
};

export const IOSTabBar = ({ children, className = '' }) => {
  return (
    <div className={`
      flex-shrink-0 ios-tab-bar safe-area-bottom
      ${className}
    `}>
      {children}
    </div>
  );
};

export default IOSContainer;