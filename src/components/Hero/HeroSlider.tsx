"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaLink: string;
}

const heroSlides: HeroSlide[] = [
  {
    image: "/images/products/doKhat/doKhat-sefid-kerem.webp",
    title: "کفش‌های ورزشی مدرن",
    subtitle: "طراحی شده برای راحتی و سبکی",
    cta: "مشاهده محصولات",
    ctaLink: "/products",
  },
  {
    image: "/images/products/jordan/jordan-tosi.webp",
    title: "کلکسیون جردن",
    subtitle: "اصالت و کیفیت در هر قدم",
    cta: "خرید آنلاین",
    ctaLink: "/products?brand=jordan",
  },
  {
    image: "/images/products/lacoste/lacoste-sefid-abi.webp",
    title: "لاکوست اورجینال",
    subtitle: "شیک و مدرن برای هر موقعیت",
    cta: "مشاهده مدل‌ها",
    ctaLink: "/products?brand=lacoste",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        setIsTransitioning(false);
      }, 500);
    }, 6000); // تغییر هر 6 ثانیه

    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 500);
  };

  const slide = heroSlides[currentSlide];

  return (
    <div
      className="relative w-full overflow-hidden bg-cyan-500"
      style={{ minHeight: "500px" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className={`object-cover transition-opacity duration-500 ${
            isTransitioning ? "opacity-30" : "opacity-100"
          }`}
          priority
          sizes="100vw"
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-end justify-end px-6 py-12 md:px-12 md:py-16">
        <div className="w-full text-white md:w-1/2">
          {/* Title */}
          <h1
            className={`mb-4 text-4xl leading-tight font-bold transition-all duration-700 md:text-5xl ${
              isTransitioning
                ? "translate-y-4 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <p
            className={`mb-8 text-lg text-white/90 transition-all delay-100 duration-700 ${
              isTransitioning
                ? "translate-y-4 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {slide.subtitle}
          </p>

          {/* CTA Button */}
          <div
            className={`transition-all delay-200 duration-700 ${
              isTransitioning
                ? "translate-y-4 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            <Link
              href={slide.ctaLink}
              className="inline-block rounded-full bg-cyan-500 px-8 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-cyan-600"
            >
              {slide.cta}
            </Link>
          </div>
        </div>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-8 bg-cyan-400"
                : "w-3 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-20 text-sm font-medium text-white/80">
        {currentSlide + 1} / {heroSlides.length}
      </div>
    </div>
  );
};

export default HeroSlider;
