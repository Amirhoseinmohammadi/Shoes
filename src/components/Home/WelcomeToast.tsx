import React from "react";

interface WelcomeToastProps {
  show: boolean;
  userName?: string;
}

export default function WelcomeToast({ show, userName }: WelcomeToastProps) {
  if (!show) return null;

  return (
    <div
      className="animate-fade-in fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transform rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-white shadow-2xl backdrop-blur-md"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">
          👋
        </span>
        <div>
          <p className="font-bold text-sm md:text-base">
            خوش آمدید {userName || "کاربر عزیز"}!
          </p>
          <p className="text-xs md:text-sm opacity-90">به فروشگاه ایران استپس خوش آمدید</p>
        </div>
      </div>
    </div>
  );
}
