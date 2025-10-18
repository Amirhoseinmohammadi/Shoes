"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HeroSlider from "./HeroSlider";

const OnboardingHero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <>
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cyan-400 px-4">
        {/* Main Content */}
        <div
          className={`text-center text-white transition-all delay-300 duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          {/* Main Title */}
          <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl">
            ایران استپ
            <br />
            راحت و بادوام !
          </h1>

          {/* CTA Button */}
          <Link
            href="/"
            className="mt-8 inline-block rounded-2xl bg-white px-12 py-4 text-lg font-bold text-cyan-500 shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-gray-100"
          >
            همین الان خرید کنید
          </Link>
        </div>
        {/* Background decorative elements */}
        <div className="absolute bottom-10 left-10 h-20 w-20 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute top-20 right-10 h-16 w-16 rounded-full bg-white/10 blur-xl"></div>
        <div className="absolute top-1/3 left-1/4 h-12 w-12 rounded-full bg-white/5 blur-lg"></div>
      </div>
      <HeroSlider />
    </>
  );
};

export default OnboardingHero;
