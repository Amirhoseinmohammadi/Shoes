"use client"; // حتماً برای client component

import { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"; // icons از lucide-react

// Type برای toast
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: () => void;
  actionLabel?: string;
  cancelLabel?: string;
}

// Type برای context
interface ToastContextType {
  showToast: (toast: Omit<Toast, "id">) => void;
}

// Context
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Hook برای استفاده
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
};

// Provider (با explicit children type)
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, "id">) => {
    const id = Date.now().toString(); // unique ID
    const newToast: Toast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove بعد duration
    if (newToast.duration) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, newToast.duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Icon بر اساس type
  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-white" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-white" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-white" />;
      case "info":
        return <Info className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  // Color بر اساس type
  const getColor = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-500 dark:bg-green-600";
      case "error":
        return "bg-red-500 dark:bg-red-600";
      case "warning":
        return "bg-yellow-400 dark:bg-yellow-500";
      case "info":
        return "bg-blue-500 dark:bg-blue-600";
      default:
        return "bg-gray-500 dark:bg-gray-700";
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 flex max-w-sm flex-col space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-slide-in flex items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${getColor(toast.type)}`}
          >
            {getIcon(toast.type)}
            <span className="flex-1 text-sm">{toast.message}</span>
            {toast.action && (
              <div className="flex gap-2">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-white"
                >
                  {toast.cancelLabel || "لغو"}
                </button>
                <button
                  onClick={() => {
                    toast.action?.();
                    removeToast(toast.id);
                  }}
                  className="rounded bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
                >
                  {toast.actionLabel || "تایید"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <style jsx>{`
        .animate-slide-in {
          opacity: 0;
          transform: translateX(100%);
          animation: slideIn 0.3s forwards;
        }
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
