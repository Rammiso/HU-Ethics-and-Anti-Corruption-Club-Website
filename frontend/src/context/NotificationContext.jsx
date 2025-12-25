import React, { createContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback(({ type = 'info', title, message, duration = 5000, persistent = false }) => {
    const id = Date.now() + Math.random();
    const notification = {
      id,
      type,
      title,
      message,
      timestamp: new Date(),
      duration: persistent ? 0 : duration
    };
    
    setNotifications(prev => [...prev, notification]);
    
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'success', title, message, ...options });
  }, [showNotification]);

  const error = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'error', title, message, duration: 0, ...options });
  }, [showNotification]);

  const warning = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'warning', title, message, ...options });
  }, [showNotification]);

  const info = useCallback((title, message, options = {}) => {
    return showNotification({ type: 'info', title, message, ...options });
  }, [showNotification]);

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <Toast
              key={notification.id}
              id={notification.id}
              type={notification.type}
              title={notification.title}
              message={notification.message}
              duration={notification.duration}
              onRemove={removeNotification}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};
