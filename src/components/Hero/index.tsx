"use client";

import HeroSlider from "./HeroSlider";

const Hero = () => {
  return (
    <section className="dark:bg-gray-dark relative z-10 overflow-hidden bg-white pt-32 pb-16 md:pt-40 md:pb-32">
      <div className="mx-auto mb-8 max-w-4xl px-4 text-center md:px-8">
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">
          جدیدترین کلکسیون کفش‌های ورزشی و روزمره
        </h1>
      </div>
      <div className="px-4 md:px-8">
        <HeroSlider />
      </div>
    </section>
  );
};

export default Hero;
