// components/ScreenContainer.jsx - Wrapper para screens individuales
import React from 'react';

const ScreenContainer = ({ children, className = '', noScroll = false }) => {
  return (
    <div
      className={`
        flex flex-col
        ${noScroll ? 'overflow-hidden' : ''}
        ${className}
      `}
      style={{
        // Use CSS variable for consistent height across all screens
        // This accounts for fixed tab bar + safe area
        height: 'var(--content-height)',
        maxHeight: 'var(--content-height)',
      }}
    >
      {children}
    </div>
  );
};

export default ScreenContainer;