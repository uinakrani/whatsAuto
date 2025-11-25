'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface NotificationProps {
  notification: Notification | null;
  onClose: () => void;
}

export default function NotificationComponent({ notification, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setIsVisible(true);
      const duration = notification.duration || 3000;
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-6 h-6 text-white" />,
    error: <XCircle className="w-6 h-6 text-white" />,
    warning: <AlertCircle className="w-6 h-6 text-white" />,
    info: <Info className="w-6 h-6 text-white" />,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-blue-500',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 left-0 right-0 z-50 px-4 pointer-events-none"
        >
          <div className="max-w-md mx-auto">
            <motion.div
              className={`${colors[notification.type]} rounded-2xl shadow-2xl p-4 flex items-center gap-3 pointer-events-auto`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex-shrink-0">{icons[notification.type]}</div>
              <p className="flex-1 text-white font-medium text-sm leading-tight">
                {notification.message}
              </p>
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

