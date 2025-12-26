// components/IOSContainer.jsx - Componente específico para iOS safe areas
import React from 'react';

const IOSContainer = ({ children, className = '' }) => {
  return (
    <div
      className={`ios-app-container ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
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
        // Tab bar is fixed, so we need padding to not overlap content
        // Use CSS variable for consistency
        paddingBottom: 'var(--tab-bar-total-height, 100px)',
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
