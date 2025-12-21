// hooks/useIOSViewport.js - Hook para detectar y manejar viewport iOS
import { useState, useEffect, useCallback, useRef } from 'react';

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
    contentHeight: window.innerHeight,
    isKeyboardOpen: false
  });

  // Store original viewport height to detect keyboard
  const originalHeightRef = useRef(window.innerHeight);

  const detectIOS = useCallback(() => {
    const isCapacitor = window.Capacitor?.isNativePlatform?.() || false;
    const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return isCapacitor || isIOSUserAgent;
  }, []);

  const getSafeAreaInsets = useCallback(() => {
    const computedStyle = getComputedStyle(document.documentElement);

    return {
      top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top')?.replace('px', '')) || 0,
      bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom')?.replace('px', '')) || 0,
      left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left')?.replace('px', '')) || 0,
      right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right')?.replace('px', '')) || 0
    };
  }, []);

  useEffect(() => {
    const isIOS = detectIOS();

    const updateViewportInfo = (forceReset = false) => {
      const safeAreaInsets = getSafeAreaInsets();

      // Use visualViewport if available (better for iOS keyboard handling)
      const viewportHeight = window.visualViewport?.height || window.innerHeight;

      // Detect if keyboard is open (viewport significantly smaller than original)
      const heightDiff = originalHeightRef.current - viewportHeight;
      const isKeyboardOpen = heightDiff > 150; // Keyboard usually takes > 150px

      // If forceReset is true, use original height (keyboard was dismissed)
      const effectiveHeight = forceReset ? originalHeightRef.current : viewportHeight;

      const tabBarHeight = 80;
      const contentHeight = effectiveHeight - safeAreaInsets.top - safeAreaInsets.bottom - tabBarHeight;

      setViewportInfo({
        isIOS,
        viewportHeight: effectiveHeight,
        safeAreaInsets,
        contentHeight,
        isKeyboardOpen
      });

      // Update CSS custom property to force layout recalculation
      document.documentElement.style.setProperty('--viewport-height', `${effectiveHeight}px`);
    };

    // Store original height on load
    originalHeightRef.current = window.visualViewport?.height || window.innerHeight;
    updateViewportInfo();

    const handleResize = () => {
      updateViewportInfo();
    };

    const handleOrientationChange = () => {
      setTimeout(() => {
        originalHeightRef.current = window.visualViewport?.height || window.innerHeight;
        updateViewportInfo();
      }, 300);
    };

    // Handle visualViewport changes (best for iOS keyboard)
    const handleVisualViewportResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = originalHeightRef.current - viewportHeight;

      // If height is back to normal (keyboard dismissed), force reset
      if (Math.abs(heightDiff) < 50) {
        updateViewportInfo(true);
      } else {
        updateViewportInfo(false);
      }
    };

    // Handle focus/blur events on inputs to track keyboard state
    const handleFocusIn = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Keyboard is about to open
        setTimeout(() => updateViewportInfo(), 300);
      }
    };

    const handleFocusOut = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Keyboard is closing - force reset after a delay
        setTimeout(() => {
          // Scroll to top to help iOS reset viewport
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;

          // Force update with original height
          updateViewportInfo(true);
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    // Use visualViewport API if available (modern iOS Safari)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportResize);
      window.visualViewport.addEventListener('scroll', handleVisualViewportResize);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);

      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportResize);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportResize);
      }
    };
  }, [detectIOS, getSafeAreaInsets]);

  return viewportInfo;
};