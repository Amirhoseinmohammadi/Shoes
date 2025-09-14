"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const slides = [
  {
    title: "Discover New Horizons",
    description: "Life-changing travel experiences await.",
    buttonText: "Book Now",
    buttonUrl: "#",
    image: "/images/products/doKhat/doKhat-sefid-kerem.png",
  },
  {
    title: "Natural Beauty",
    description: "Stunning views and pure nature.",
    buttonText: "View Offers",
    buttonUrl: "#",
    image: "/images/products/jordan/jordan-tosi.png",
  },
  {
    title: "Urban Adventure",
    description: "Modern cities full of life and culture.",
    buttonText: "More Info",
    buttonUrl: "#",
    image: "/images/products/lacoste/lacoste-sefid-abi.png",
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    let interval;
    if (autoplay) {
      interval = setInterval(() => {
        nextSlide();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
    >
      <div className="relative h-[80vh] min-h-[500px]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`className="absolute hover:bg-blue-700" bottom-10 left-10 rounded-lg bg-blue-600 px-6 py-2 text-lg font-semibold text-white ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="dark:bg-gray-dark absolute inset-0 bg-white">
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                className="rounded-b-lg object-cover opacity-80"
                priority={index === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            {/* <div className="container mx-auto flex h-full items-center px-6">
              <div
                className={`max-w-2xl text-white transition-all delay-300 duration-600 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                  currentSlide === index
                    ? "translate-x-0 opacity-100"
                    : "translate-x-10 opacity-0"
                }`}
              >
                <h2 className="mb-4 text-4xl font-bold md:text-5xl">
                  {slide.title}
                </h2>
                <p className="mb-8 text-xl md:text-2xl">{slide.description}</p>
                <a
                  href={slide.buttonUrl}
                  className="animate-fadeIn inline-block rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  {slide.buttonText}
                </a>
              </div>
            </div> */}
          </div>
        ))}
        <button
          onClick={prevSlide}
          className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 md:h-12 md:w-12"
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
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white transition-all hover:bg-black/70 md:h-12 md:w-12"
          aria-label="Next slide"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 md:h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full transition-all md:h-3 md:w-3 ${
                currentSlide === index ? "w-4 bg-white md:w-6" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSlider;
