"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = (options: ToastOptions) => {
    setToast(options);
    if (!options.action) {
      setTimeout(() => setToast(null), options.duration || 2000);
    }
  };

  const handleCancel = () => setToast(null);
  const handleAction = () => {
    toast?.action?.();
    setToast(null);
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

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-lg px-4 py-3 shadow-lg ${getBgColor(
            toast.type,
          )}`}
        >
          <span className="flex-1 text-sm text-white">{toast.message}</span>
          {toast.action ? (
            <>
              <button
                onClick={handleCancel}
                className="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700 dark:text-white"
              >
                {toast.cancelLabel || "لغو"}
              </button>
              <button
                onClick={handleAction}
                className="rounded bg-red-700 px-2 py-1 text-xs text-white hover:bg-red-800"
              >
                {toast.actionLabel || "تایید"}
              </button>
            </>
          ) : null}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
