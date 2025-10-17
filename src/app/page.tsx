"use client";

import Products from "@/components/Products";
import Hero from "@/components/Hero";
import { useTelegram } from "@/hooks/useTelegram";
import { useState, useEffect } from "react";

export default function Home() {
  const { user: telegramUser, loading, isTelegram } = useTelegram();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (telegramUser && !loading) {
      setShowWelcome(true);
      const timer = setTimeout(() => setShowWelcome(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [telegramUser, loading]);

  // بنر خوشامدگویی مدرن
  const WelcomeBanner = () => {
    if (!telegramUser || !showWelcome) return null;

    return (
      <div className="animate-fade-in fixed top-20 left-1/2 z-50 -translate-x-1/2 transform">
        <div className="rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 text-white shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div className="text-right">
              <p className="text-lg font-bold">
                {telegramUser.first_name} عزیز، خوش اومدی!
              </p>
              <p className="mt-1 text-sm text-emerald-100">
                تخفیف ویژه کاربران تلگرام برای شما فعال شد
              </p>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-lg text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  };

  // کارت کاربری شیک
  const UserProfileCard = () => {
    if (!telegramUser || loading) return null;

    return (
      <div className="container mx-auto mb-8 px-4">
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {telegramUser.photo_url && (
                <img
                  src={telegramUser.photo_url}
                  alt={telegramUser.first_name}
                  className="h-16 w-16 rounded-full border-4 border-white/30"
                />
              )}
              <div className="text-right">
                <h2 className="text-2xl font-bold">
                  {telegramUser.first_name} {telegramUser.last_name || ""}
                </h2>
                {telegramUser.username && (
                  <p className="mt-1 text-purple-100">
                    @{telegramUser.username}
                  </p>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                    👑 کاربر ویژه
                  </span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-sm">
                    🏷️ تخفیف فعال
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left">
              <div className="rounded-xl bg-white/20 p-3">
                <p className="text-sm text-purple-100">امتیاز شما</p>
                <p className="text-2xl font-bold">⭐ ۵۰</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // وضعیت اتصال تلگرام
  const TelegramStatus = () => {
    if (!isTelegram) return null;

    return (
      <div className="container mx-auto mb-6 px-4">
        {loading && (
          <div className="rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span className="font-medium">در حال اتصال به تلگرام...</span>
            </div>
          </div>
        )}

        {!loading && !telegramUser && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center text-white shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">کاربر تلگرام شناسایی نشد</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // آمار سریع
  // const QuickStats = () => {
  //   const stats = [
  //     { icon: "🚚", label: "ارسال رایگان", value: "بالای ۱۰۰ هزار تومان" },
  //     { icon: "🔄", label: "بازگشت کالا", value: "۷ روز ضمانت" },
  //     { icon: "💳", label: "پرداخت امن", value: "مطمئن و سریع" },
  //     { icon: "📞", label: "پشتیبانی", value: "۲۴ ساعته" },
  //   ];

  //   return (
  //     <div className="container mx-auto mb-12 px-4">
  //       <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
  //         {stats.map((stat, index) => (
  //           <div
  //             key={index}
  //             className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
  //           >
  //             <div className="mb-2 text-3xl">{stat.icon}</div>
  //             <h3 className="mb-1 text-sm font-bold text-gray-800">
  //               {stat.label}
  //             </h3>
  //             <p className="text-xs text-gray-600">{stat.value}</p>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // بخش محصولات با هدر زیبا
  const ProductsSection = () => (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-800 dark:text-white">
            محصولات ویژه
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            بهترین محصولات با کیفیت عالی و قیمت مناسب را از ما بخواهید
          </p>
        </div>

        <Products telegramUser={telegramUser} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* بنر خوشامدگویی */}
      <WelcomeBanner />

      {/* هیرو سکشن */}
      <Hero />

      {/* وضعیت تلگرام */}
      <TelegramStatus />

      {/* کارت کاربری */}
      {isTelegram && <UserProfileCard />}

      {/* آمار سریع */}
      {/* <QuickStats /> */}

      {/* بخش محصولات */}
      <ProductsSection />

      {/* دکمه شناور تخفیف */}
      {telegramUser && (
        <div className="fixed bottom-24 left-4 z-40">
          <div className="animate-bounce rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-3 text-white shadow-2xl">
            <div className="text-center">
              <div className="text-lg">🏷️</div>
              <div className="mt-1 text-xs font-bold">تخفیف ویژه</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
