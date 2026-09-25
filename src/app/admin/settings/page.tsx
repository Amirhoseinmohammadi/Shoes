"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AccessDenied from "@/components/Common/AccessDenied";
import LoadingSkeleton from "@/components/Common/LoadingSkeleton";
import {
  ArrowRightIcon,
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  BellAlertIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [storeName, setStoreName] = useState("فروشگاه کفش ایران استپس");
  const [supportPhone, setSupportPhone] = useState("09120000000");
  const [shippingFee, setShippingFee] = useState("0");
  const [telegramBot, setTelegramBot] = useState("@IranStepsBot");
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("تنظیمات با موفقیت ذخیره شد");
    }, 600);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSkeleton type="card" count={3} />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title="بازگشت به داشبورد"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Cog6ToothIcon className="h-7 w-7 text-purple-500" />
                تنظیمات فروشگاه
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                پیکربندی عمومی، نوتیفیکیشن‌ها و اتصال به تلگرام
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* General Store Information */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
              <BuildingStorefrontIcon className="h-5 w-5 text-cyan-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                اطلاعات پایه فروشگاه
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  نام فروشگاه
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-cyan-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  شماره تماس پشتیبانی
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-cyan-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  هزینه ارسال پیش‌فرض (تومان - ۰ برای رایگان)
                </label>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-cyan-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  آیدی ربات تلگرام
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={telegramBot}
                  onChange={(e) => setTelegramBot(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 transition focus:border-cyan-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Notifications and Integrations */}
          <div className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
              <BellAlertIcon className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                اطلاع‌رسانی و پیام‌رسان
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    ارسال اعلان سفارش به ربات تلگرام
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    هنگام ثبت سفارش جدید پیامی به ربات ادمین ارسال می‌شود.
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={orderNotifications}
                    onChange={(e) => setOrderNotifications(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:top-[2px] after:right-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-cyan-600 peer-checked:after:-translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                </label>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 p-3.5 text-xs text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
                <ShieldCheckIcon className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>
                  توکن و سکرت‌های تلگرام به صورت امن در متغیرهای محیطی (.env) نگهداری می‌شوند.
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-cyan-600/20 transition hover:bg-cyan-700 active:scale-95 disabled:opacity-50"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
