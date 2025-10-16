"use client";

import SectionTitle from "../Common/SectionTitle";
import SingleShoe from "./SingleShoe";
import { useApi } from "@/hooks/useApi";
import { Shoe } from "@/types/shoe";

interface ShoesProps {
  telegramUser?: any; 
}

const Shoes = ({ telegramUser }: ShoesProps) => {
  // ✅ اضافه کردن prop
  const { data: shoes, error, isLoading } = useApi.useProducts();

  // می‌تونی از telegramUser اینجا استفاده کنی اگر نیاز داری
  console.log("Telegram User in Shoes:", telegramUser);

  if (isLoading)
    return (
      <section className="bg-white py-16 md:py-20 lg:py-28 dark:bg-gray-900">
        <div className="container">
          <SectionTitle
            title="لیست کفش‌ها"
            paragraph="در این بخش می‌توانید جدیدترین مدل‌های کفش ورزشی و روزمره را مشاهده کنید."
            center
          />
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-64 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-4 h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );

  if (error)
    return (
      <section className="bg-white py-16 md:py-20 lg:py-28 dark:bg-gray-900">
        <div className="container text-center">
          <SectionTitle
            title="خطا در بارگذاری"
            paragraph="متاسفانه در دریافت اطلاعات محصولات مشکلی پیش آمده است."
            center
          />
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            تلاش مجدد
          </button>
        </div>
      </section>
    );

  if (!shoes || shoes.length === 0)
    return (
      <section className="bg-white py-16 md:py-20 lg:py-28 dark:bg-gray-900">
        <div className="container text-center">
          <SectionTitle
            title="محصولی یافت نشد"
            paragraph="در حال حاضر هیچ محصولی برای نمایش وجود ندارد."
            center
          />
        </div>
      </section>
    );

  return (
    <section
      id="shoes"
      className="bg-white py-16 md:py-20 lg:py-28 dark:bg-gray-900"
    >
      <div className="container">
        <SectionTitle
          title="لیست کفش‌ها"
          paragraph="در این بخش می‌توانید جدیدترین مدل‌های کفش ورزشی و روزمره را مشاهده کنید."
          center
        />

        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {shoes.map((shoe) => (
            <SingleShoe key={shoe.id} shoe={shoe} telegramUser={telegramUser} /> // ✅ اگر SingleShoe هم نیاز داره
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shoes;
