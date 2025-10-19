"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const OnboardingHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-800 to-blue-500 px-4">
        <div className="animate-floating">
          <Image
            src="/images/hero/locatbanner.png"
            alt="کفش ایران استپ"
            width={300}
            height={300}
            className="bg-transparent drop-shadow-2xl transition-all duration-1000 ease-out"
            priority
          />
        </div>

        <div
          className={`text-center text-white transition-all delay-300 duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="mb-4 text-4xl leading-tight font-extrabold md:text-5xl">
            ایران استپ
            <br />
            راحت و بادوام!
          </h1>
          <p className="mb-30 text-lg text-gray-100">
            مجموعه‌ای هوشمند، جذاب و خوش‌استایل برای تو
          </p>
        </div>

        <div className="absolute bottom-10 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute top-20 right-10 h-16 w-16 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute top-1/3 left-1/4 h-12 w-12 rounded-full bg-white/5 blur-lg"></div>
      </div>
    </>
  );
};

export default OnboardingHero;
