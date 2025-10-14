// src/app/admin/page.tsx
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">پنل مدیریت</h1>

      <div className="grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href="/admin/products"
          className="rounded-lg bg-blue-600 p-6 text-center text-white transition-colors hover:bg-blue-700"
        >
          <h2 className="mb-2 text-xl font-semibold">📦 مدیریت محصولات</h2>
          <p>افزودن، ویرایش و حذف محصولات</p>
        </Link>

        <Link
          href="/admin/orders"
          className="rounded-lg bg-green-600 p-6 text-center text-white transition-colors hover:bg-green-700"
        >
          <h2 className="mb-2 text-xl font-semibold">📋 مدیریت سفارشات</h2>
          <p>مدیریت سفارشات مشتریان</p>
        </Link>
      </div>
    </div>
  );
}
