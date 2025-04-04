"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "error" | "info";

interface NotificationBarProps {
  message: string;
  description?: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
}

export function NotificationBar({
  message,
  description,
  type = "info",
  duration = 5000,
  onClose
}: NotificationBarProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFading(true);
      
      // Attendre la fin de l'animation avant de masquer complètement
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!isVisible) return null;

  const icon = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  }[type];

  const bgColor = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200"
  }[type];

  return (
    <div 
      className={cn(
        "fixed top-16 right-4 left-4 md:left-auto md:right-4 md:max-w-md z-50 p-4 border shadow-sm rounded-md transition-opacity duration-300",
        bgColor,
        isFading ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <button
          onClick={() => {
            setIsFading(true);
            setTimeout(() => {
              setIsVisible(false);
              if (onClose) onClose();
            }, 300);
          }}
          className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black/5"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

interface NotificationManagerProps {
  children: React.ReactNode;
}

interface Notification {
  id: string;
  message: string;
  description?: string;
  type: NotificationType;
  duration?: number;
}

type NotificationContextType = {
  showNotification: (
    message: string,
    description?: string,
    type?: NotificationType,
    duration?: number
  ) => void;
};

import { createContext, useContext } from "react";

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = (
    message: string,
    description?: string,
    type: NotificationType = "info",
    duration: number = 5000
  ) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    setNotifications(prev => [
      ...prev,
      { id, message, description, type, duration }
    ]);
  };

  const handleCloseNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      <div className="notification-container">
        {notifications.map(notification => (
          <NotificationBar
            key={notification.id}
            message={notification.message}
            description={notification.description}
            type={notification.type}
            duration={notification.duration}
            onClose={() => handleCloseNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
} 