import ScrollUp from "@/components/Common/ScrollUp";
import Products from "@/components/Products";
import Hero from "@/components/Hero";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iran Steps",
  description: "This is Home for kids shoes",
};

export default function Home() {
  return (
    <>
      <ScrollUp />
      <Hero />
      <Products />
    </>
  );
}
