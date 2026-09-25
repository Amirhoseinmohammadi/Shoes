import React from "react";
import Link from "next/link";
import { ShieldExclamationIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

interface AccessDeniedProps {
  title?: string;
  message?: string;
  backHref?: string;
  backLabel?: string;
}

export default function AccessDenied({
  title = "دسترسی غیرمجاز",
  message = "شما اجازه دسترسی به این بخش را ندارید. لطفاً با حساب کاربری مدیر وارد شوید.",
  backHref = "/",
  backLabel = "بازگشت به صفحه اصلی",
}: AccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-500 ring-8 ring-red-50/50 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-950/20">
        <ShieldExclamationIcon className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h2>
      <p className="mb-8 max-w-md text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {message}
      </p>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-cyan-700 active:scale-95"
      >
        <span>{backLabel}</span>
        <ArrowLeftIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}
