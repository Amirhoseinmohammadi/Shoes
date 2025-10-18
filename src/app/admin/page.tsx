import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">پنل مدیریت</h1>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Link
            href="/admin/products"
            className="group rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-6 text-white shadow-lg transition-all hover:from-cyan-600 hover:to-blue-700 hover:shadow-xl"
          >
            <div className="text-center">
              <div className="mb-3 text-3xl">📦</div>
              <h2 className="mb-2 text-xl font-semibold">مدیریت محصولات</h2>
              <p className="text-blue-100">افزودن، ویرایش و حذف محصولات</p>
            </div>
          </Link>

          <Link
            href="/admin/orders"
            className="group rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-lg transition-all hover:from-emerald-600 hover:to-green-700 hover:shadow-xl"
          >
            <div className="text-center">
              <div className="mb-3 text-3xl">📋</div>
              <h2 className="mb-2 text-xl font-semibold">مدیریت سفارشات</h2>
              <p className="text-green-100">مدیریت سفارشات مشتریان</p>
            </div>
          </Link>
        </div>

        {/* اطلاعات آماری */}
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">۰</div>
              <div className="mt-2 text-sm text-gray-600">محصول فعال</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">۰</div>
              <div className="mt-2 text-sm text-gray-600">سفارش جدید</div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">۰</div>
              <div className="mt-2 text-sm text-gray-600">کاربر آنلاین</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
