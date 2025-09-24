"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastOptions {
  message: string;
  type?: ToastType;
  action?: () => void;
  actionLabel?: string;
  cancelLabel?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const showToast = (options: ToastOptions) => {
    setToasts((prev) => [...prev, options]);
    if (!options.action) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t !== options));
      }, options.duration || 3000);
    }
  };

  const removeToast = (toast: ToastOptions) => {
    setToasts((prev) => prev.filter((t) => t !== toast));
  };

  const getBgColor = (type?: ToastType) => {
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

  const getIcon = (type?: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-white" />;
      case "error":
        return <XCircleIcon className="h-5 w-5 text-white" />;
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-white" />;
      case "info":
        return <InformationCircleIcon className="h-5 w-5 text-white" />;
      default:
        return null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
        {toasts.map((toast, idx) => (
          <div
            key={idx}
            className={`flex transform items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg transition-all duration-300 ease-in-out ${getBgColor(
              toast.type,
            )} animate-slide-in`}
          >
            {getIcon(toast.type)}
            <span className="flex-1 text-sm">{toast.message}</span>
            {toast.action && (
              <>
                <button
                  onClick={() => removeToast(toast)}
                  className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700 dark:text-white"
                >
                  {toast.cancelLabel || "لغو"}
                </button>
                <button
                  onClick={() => {
                    toast.action?.();
                    removeToast(toast);
                  }}
                  className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-800"
                >
                  {toast.actionLabel || "تایید"}
                </button>
              </>
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

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
