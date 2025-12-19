// hooks/useIOSViewport.js - Hook para detectar y manejar viewport iOS
import { useState, useEffect } from 'react';

export const useIOSViewport = () => {
  const [viewportInfo, setViewportInfo] = useState({
    isIOS: false,
    viewportHeight: window.innerHeight,
    safeAreaInsets: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    contentHeight: window.innerHeight
  });

  useEffect(() => {
    const detectIOS = () => {
      // Detectar iOS usando Capacitor o user agent
      const isCapacitor = window.Capacitor?.isNativePlatform?.() || false;
      const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent);
      return isCapacitor || isIOSUserAgent;
    };

    const getSafeAreaInsets = () => {
      // Obtener safe area insets de CSS variables
      const computedStyle = getComputedStyle(document.documentElement);
      
      return {
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top')?.replace('px', '')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom')?.replace('px', '')) || 0,
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left')?.replace('px', '')) || 0,
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right')?.replace('px', '')) || 0
      };
    };

    const updateViewportInfo = () => {
      const isIOS = detectIOS();
      const safeAreaInsets = getSafeAreaInsets();
      const viewportHeight = window.innerHeight;
      
      // Calcular altura de contenido disponible (descontando tab bar)
      const tabBarHeight = 80; // Altura aproximada del tab bar
      const contentHeight = viewportHeight - safeAreaInsets.top - safeAreaInsets.bottom - tabBarHeight;

      setViewportInfo({
        isIOS,
        viewportHeight,
        safeAreaInsets,
        contentHeight
      });
    };

    // Actualizar al cargar
    updateViewportInfo();

    // Actualizar en cambios de viewport
    const handleResize = () => {
      updateViewportInfo();
    };

    const handleOrientationChange = () => {
      // Delay para que iOS termine la transición
      setTimeout(updateViewportInfo, 300);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return viewportInfo;
};