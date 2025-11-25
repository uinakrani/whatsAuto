'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationComponent, { Notification, NotificationType } from '@/components/Notification';

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback(
    (message: string, type: NotificationType, duration?: number) => {
      const id = Math.random().toString(36).substring(7);
      setNotification({ id, message, type, duration });
    },
    []
  );

  const success = useCallback(
    (message: string, duration?: number) => showNotification(message, 'success', duration),
    [showNotification]
  );

  const error = useCallback(
    (message: string, duration?: number) => showNotification(message, 'error', duration),
    [showNotification]
  );

  const warning = useCallback(
    (message: string, duration?: number) => showNotification(message, 'warning', duration),
    [showNotification]
  );

  const info = useCallback(
    (message: string, duration?: number) => showNotification(message, 'info', duration),
    [showNotification]
  );

  return (
    <NotificationContext.Provider value={{ showNotification, success, error, warning, info }}>
      {children}
      <NotificationComponent
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

