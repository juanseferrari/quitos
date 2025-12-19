// components/AchievementNotificationContainer.jsx - Contenedor para mostrar notificaciones de logros
import React from 'react';
import { useAchievementNotifications } from '../hooks/useAchievementNotifications';
import AchievementNotification from './AchievementNotification';

const AchievementNotificationContainer = () => {
  const {
    activeNotification,
    hasActiveNotification,
    forceHideNotification,
    NotificationContainer
  } = useAchievementNotifications();

  if (!hasActiveNotification || !activeNotification) {
    return null;
  }

  return (
    <NotificationContainer>
      <AchievementNotification
        achievement={activeNotification}
        onDismiss={forceHideNotification}
        autoHide={true}
      />
    </NotificationContainer>
  );
};

export default AchievementNotificationContainer;