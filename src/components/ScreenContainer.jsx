// components/ScreenContainer.jsx - Wrapper para screens individuales
import React from 'react';

const ScreenContainer = ({ children, className = '', noScroll = false }) => {
  return (
    <div
      className={`
        flex flex-col
        ${noScroll ? 'overflow-hidden' : 'overflow-y-auto'}
        ${className}
      `}
      style={{
        // Fill all available space from parent
        height: '100%',
        maxHeight: '100%',
        // Prevent content from overflowing
        ...(noScroll ? {} : { WebkitOverflowScrolling: 'touch' }),
      }}
    >
      {children}
    </div>
  );
};

export default ScreenContainer;
