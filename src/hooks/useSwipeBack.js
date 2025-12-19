// src/hooks/useSwipeBack.js
import { useEffect } from 'react';

const useSwipeBack = (onSwipeBack, enabled = true) => {
  useEffect(() => {
    if (!enabled || !onSwipeBack) return;

    let startX = 0;
    let startY = 0;
    let startTime = 0;
    let isEdgeSwipe = false;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      
      // Detectar si el swipe inicia desde el borde izquierdo (primeros 20px)
      isEdgeSwipe = startX <= 20;
    };

    const handleTouchMove = (e) => {
      if (!isEdgeSwipe) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      
      // Prevenir scroll vertical durante swipe horizontal
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isEdgeSwipe) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      const deltaTime = Date.now() - startTime;
      
      // Condiciones para activar swipe back:
      // 1. Movimiento horizontal > 100px
      // 2. Tiempo < 500ms (gesto rápido)
      // 3. Más horizontal que vertical
      // 4. Dirección hacia la derecha
      if (
        deltaX > 100 &&
        deltaTime < 500 &&
        Math.abs(deltaX) > Math.abs(deltaY) &&
        deltaX > 0
      ) {
        onSwipeBack();
      }
      
      // Reset
      isEdgeSwipe = false;
    };

    // Event listeners con passive: false para preventDefault
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeBack, enabled]);
};

export default useSwipeBack;