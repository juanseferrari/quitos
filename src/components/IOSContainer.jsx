// components/IOSContainer.jsx - Componente específico para iOS safe areas
import React from 'react';

const IOSContainer = ({ children, className = '' }) => {
  return (
    <div
      className={`ios-app-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        height: '100dvh',
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
      className={`ios-content-area ${className}`}
      style={{
        flex: 1,
        overflowY: noScroll ? 'hidden' : 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        // Leave space for the fixed tab bar at bottom
        paddingBottom: 'calc(85px + env(safe-area-inset-bottom, 20px))',
      }}
    >
      {children}
    </div>
  );
};

export const IOSTabBar = ({ children, className = '' }) => {
  return (
    <nav
      className={`ios-tab-bar ${className}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {children}
    </nav>
  );
};

export default IOSContainer;