"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Slide {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  image: string;
}

const slides: Slide[] = [
  {
    title: "جدیدترین کلکسیون کفش‌های ورزشی و روزمره",
    description:
      "فروش فقط به صورت کارتن (۱۰ جفتی) بهترین قیمت عمده برای مدل‌های جدید و متنوع",
    buttonText: "مشاهده محصولات",
    buttonUrl: "#",
    image: "/images/products/doKhat/doKhat-sefid-kerem.webp",
  },
  {
    title: "کفش‌های مد روز",
    description: "کیفیت و استایل برتر برای همه سنین",
    buttonText: "مشاهده جزئیات",
    buttonUrl: "#",
    image: "/images/products/jordan/jordan-tosi.webp",
  },
  {
    title: "کفش‌های ورزشی حرفه‌ای",
    description: "راحتی و دوام برای ورزش و فعالیت روزمره",
    buttonText: "خرید آنلاین",
    buttonUrl: "#",
    image: "/images/products/lacoste/lacoste-sefid-abi.webp",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

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
      className="relative overflow-hidden rounded-lg"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
      style={{ minHeight: "500px", height: "80vh" }}
    >
      {slides.map(
        (slide, index) =>
          index === currentSlide && (
            <div
              key={index}
              className="absolute inset-0 transition-opacity duration-700"
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 text-center md:px-8">
                {/* <h2 className="mb-4 text-3xl font-bold text-white sm:text-4xl md:text-5xl">
                  {slide.title}
                </h2> */}
                <p className="mb-6 text-base text-white sm:text-lg md:text-xl">
                  {slide.description}
                </p>
                {/* <Link
                  href={slide.buttonUrl}
                  className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {slide.buttonText}
                </Link> */}
              </div>
            </div>
          ),
      )}

      {/* Navigation */}
      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 md:h-12 md:w-12"
        aria-label="Previous slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
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
        className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 md:h-12 md:w-12"
        aria-label="Next slide"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 md:h-6 md:w-6"
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

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 w-2 rounded-full transition-all md:h-3 md:w-3 ${currentSlide === index ? "w-4 bg-white md:w-6" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
