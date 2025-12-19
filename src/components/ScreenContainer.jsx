// components/ScreenContainer.jsx - Wrapper para screens individuales
import React from 'react';

const ScreenContainer = ({ children, className = '', noScroll = false }) => {
  return (
    <div className={`
      ${noScroll ? 'h-full' : 'h-content-safe'} flex flex-col
      ${noScroll ? 'overflow-hidden' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default ScreenContainer;