// components/IOSContainer.jsx - Componente específico para iOS safe areas
import React from 'react';
import { useIOSViewport } from '../hooks/useIOSViewport';

const IOSContainer = ({ children, className = '' }) => {
  const { isIOS } = useIOSViewport();

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
  return (
    <div className={`
      flex-shrink-0 ios-tab-bar
      ${className}
    `}>
      {children}
    </div>
  );
};

export default IOSContainer;