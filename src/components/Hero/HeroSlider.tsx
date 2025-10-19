"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

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
    }, 6000);

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
      className="relative w-full overflow-hidden bg-blue-700"
      style={{ minHeight: "500px" }}
    >
      <div className="absolute inset-0">
        <Image
          src={slide.image}
          alt={slide.title}
          fill
          className={`object-cover transition-opacity duration-500 ${
            isTransitioning ? "scale-105 opacity-30" : "scale-100 opacity-100"
          }`}
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-700/40 to-transparent"></div>
      </div>

      <div className="relative z-10 flex h-full flex-col items-start justify-center px-6 py-12 md:px-12 md:py-16">
        <div className="w-full text-white md:w-2/3">
          <h1
            className={`mb-4 text-4xl leading-tight font-extrabold transition-all duration-700 md:text-5xl ${
              isTransitioning
                ? "translate-y-4 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {slide.title}
          </h1>

          <p
            className={`mb-8 text-lg text-white/90 transition-all delay-100 duration-700 ${
              isTransitioning
                ? "translate-y-4 opacity-0"
                : "translate-y-0 opacity-100"
            }`}
          >
            {slide.subtitle}
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-3">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-8 bg-yellow-400"
                : "w-3 bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
