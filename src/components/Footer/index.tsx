"use client";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-white py-8 dark:bg-gray-800">
      <div className="container mx-auto text-center text-gray-700 dark:text-gray-300">
        <p className="mb-2">آدرس: زنجان،شهر هیدج،شهرک صنعتی</p>
        <p className="mb-2">
          ایمیل:{" "}
          <Link
            href="mailto:info@example.com"
            className="text-blue-600 hover:underline"
          >
            amirmi951@gmail.com
          </Link>
        </p>
        <p>
          تلفن:{" "}
          <Link
            href="tel:+982100000000"
            className="text-blue-600 hover:underline"
          >
            09190605862
          </Link>
        </p>
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          © 2025 تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
