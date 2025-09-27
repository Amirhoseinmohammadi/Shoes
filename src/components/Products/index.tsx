"use client";

import SectionTitle from "../Common/SectionTitle";
import SingleShoe from "./SingleShoe";
import { useEffect, useState } from "react";
import { Shoe } from "@/types/shoe";

const Shoes = () => {
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShoes = async () => {
      try {
        const res = await fetch("/api/shoes");
        const data = await res.json();

        if (Array.isArray(data)) {
          setShoes(data);
        } else {
          console.error("The fetched data is not an array:", data);
        }
      } catch (error) {
        console.error("Failed to fetch shoes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchShoes();
  }, []);
  if (loading) return <p className="py-20 text-center">در حال بارگذاری...</p>;

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
            <SingleShoe key={shoe.id} shoe={shoe} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Shoes;
