"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  gradient: string;
}

const slides: Slide[] = [
  {
    image: "/images/products/doKhat/doKhat-sefid-kerem.webp",
    title: "کفش‌های ورزشی مدرن",
    subtitle: "طراحی شده برای راحتی و سبکی",
    cta: "مشاهده محصولات",
    gradient: "from-blue-500/20 to-purple-600/20",
  },
  {
    image: "/images/products/jordan/jordan-tosi.webp",
    title: "کلکسیون جردن",
    subtitle: "اصالت و کیفیت در هر قدم",
    cta: "خرید آنلاین",
    gradient: "from-red-500/20 to-orange-600/20",
  },
  {
    image: "/images/products/lacoste/lacoste-sefid-abi.webp",
    title: "لاکوست اورجینال",
    subtitle: "شیک و مدرن برای هر موقعیت",
    cta: "مشاهده مدل‌ها",
    gradient: "from-green-500/20 to-teal-600/20",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    setIsVisible(true);
    if (autoplay) intervalRef.current = setInterval(nextSlide, 5000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [autoplay]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.1)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Main Content */}
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text Content */}
          <div
            className={`text-center transition-all duration-1000 lg:text-right ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="mb-6 inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-300">
              🎉 تخفیف ویژه کاربران جدید
            </div>

            <h1 className="mb-6 text-4xl leading-tight font-bold text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
              <span className="block">کفش‌های شیک و</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                با کیفیت
              </span>
            </h1>

            <p className="mb-8 text-lg leading-relaxed text-gray-600 md:text-xl dark:text-gray-300">
              جدیدترین مدل‌های کفش ورزشی، روزمره و اسپرت با بهترین کیفیت و
              مناسب‌ترین قیمت
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/products"
                className="group hover:shadow-3xl relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-4 font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <span className="relative z-10">مشاهده محصولات</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
              </Link>

              <Link
                href="/about"
                className="rounded-2xl border-2 border-gray-300 bg-white/80 px-8 py-4 font-bold text-gray-700 backdrop-blur-sm transition-all duration-300 hover:border-blue-500 hover:bg-white hover:text-blue-600 dark:border-gray-600 dark:bg-gray-800/80 dark:text-gray-300 dark:hover:border-blue-400 dark:hover:text-blue-300"
              >
                درباره ما
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6">
              {[
                { number: "۵۰۰+", label: "محصول" },
                { number: "۱۰۰۰+", label: "مشتری راضی" },
                { number: "۹۸٪", label: "رضایت" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 md:text-3xl dark:text-white">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div
            className={`relative transition-all delay-300 duration-1000 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <HeroSlider />
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="animate-float absolute bottom-10 left-10">
        <div className="h-20 w-20 rounded-full bg-blue-200/30 blur-xl"></div>
      </div>
      <div className="animate-float absolute top-20 right-20 delay-1000">
        <div className="h-16 w-16 rounded-full bg-purple-200/30 blur-xl"></div>
      </div>
    </section>
  );
};

// HeroSlider کامپوننت با طراحی مدرن
const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    if (autoplay) intervalRef.current = setInterval(nextSlide, 5000);
    return () => intervalRef.current && clearInterval(intervalRef.current);
  }, [autoplay]);

  return (
    <div
      className="group relative overflow-hidden rounded-3xl shadow-2xl"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
      style={{ minHeight: "500px", height: "600px" }}
    >
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide
              ? "scale-100 opacity-100"
              : "scale-105 opacity-0"
          }`}
        >
          {/* Background Image */}
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`}
          ></div>

          {/* Content Overlay */}
          <div className="absolute right-8 bottom-8 left-8 text-white">
            <h3 className="mb-2 text-2xl font-bold">{slide.title}</h3>
            <p className="mb-4 text-white/90">{slide.subtitle}</p>
            {/* <button className="rounded-xl bg-white/20 px-6 py-2 font-medium backdrop-blur-sm transition-all hover:bg-white/30">
              {slide.cta}
            </button> */}
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110 hover:bg-white/30"
        aria-label="Previous slide"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:scale-110 hover:bg-white/30"
        aria-label="Next slide"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-8 bg-white"
                : "w-3 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Hero;
